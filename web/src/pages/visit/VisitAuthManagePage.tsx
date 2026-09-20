import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Clock,
  Search,
  Zap,
  Ban,
  IdCard,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge, { type BadgeTone } from "../../components/ui/Badge";
import Toggle from "../../components/ui/Toggle";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { ApiError } from "../../api/client";
import {
  approveVerification,
  getCustomerVerifiedVisitCount,
  getIntakeSetting,
  getVerificationHours,
  getVisitVerification,
  getVisitVerificationSummary,
  getVisitVerifications,
  rejectVerification,
  updateIntakeSetting,
  type VerificationHourItem,
  type VisitVerificationDetail,
  type VisitVerificationListItem,
  type VisitVerificationSummary,
} from "../../api/visitVerifications";
import type { VerificationStatus } from "../../api/dashboard";
import "./VisitAuthManagePage.css";

const STATUS_META: Record<VerificationStatus, { label: string; tone: BadgeTone; icon: typeof Clock }> = {
  ISSUED: { label: "방문 예정", tone: "info", icon: Clock },
  VERIFIED: { label: "인증 완료", tone: "success", icon: CheckCircle2 },
  EXPIRED: { label: "시간 만료", tone: "danger", icon: AlertTriangle },
  FAILED: { label: "거절됨", tone: "danger", icon: Ban },
  CANCELLED: { label: "취소됨", tone: "neutral", icon: Ban },
};

const FILTERS: { label: string; status?: VerificationStatus; statuses?: VerificationStatus[] }[] = [
  { label: "전체" },
  { label: "방문예정", status: "ISSUED" },
  { label: "인증완료", status: "VERIFIED" },
  { label: "인증실패", statuses: ["EXPIRED", "CANCELLED", "FAILED"] },
];

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const POPOVER_WIDTH = 300;
const PAGE_SIZE = 5;

function todayDayOfWeek() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** "인증 완료 / 만료 시간" 칸(데스크톱 표 컬럼·모바일 상세보기 팝오버 공용). */
function renderExpiryInfo(s: VisitVerificationListItem, now: number) {
  if (s.status === "VERIFIED") return formatDateTime(s.verifiedAt);
  if (s.status !== "ISSUED") return formatDateTime(s.expiresAt);
  const remaining = Math.max(0, Math.floor((new Date(s.expiresAt).getTime() - now) / 1000));
  return (
    <>
      {formatDateTime(s.expiresAt)}
      <br />
      <span className="table-subtext">
        {remaining > 0 ? `만료까지 ${formatCountdown(remaining)}` : "만료됨"}
      </span>
    </>
  );
}

export default function VisitAuthManagePage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<VisitVerificationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [visitOn, setVisitOn] = useState(false);
  const [intakeLoaded, setIntakeLoaded] = useState(false);
  const [verificationHours, setVerificationHours] = useState<VerificationHourItem[] | null>(null);
  const [summary, setSummary] = useState<VisitVerificationSummary | null>(null);
  const [todayFailureCount, setTodayFailureCount] = useState<number | null>(null);
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());
  const [approveTarget, setApproveTarget] = useState<VisitVerificationListItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<VisitVerificationListItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [detailInfo, setDetailInfo] = useState<
    { id: number; bottom: number; left: number; item: VisitVerificationListItem } | null
  >(null);
  const [detail, setDetail] = useState<VisitVerificationDetail | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  const loadList = useCallback(() => {
    setLoading(true);
    const activeFilter = FILTERS[filterIndex];
    const code = search.trim() || undefined;
    const statuses = activeFilter.statuses ?? [activeFilter.status];

    Promise.all(statuses.map((status) => getVisitVerifications({ status, code, limit: 100 })))
      .then((results) => {
        const merged = results.flatMap((r) => r.items);
        merged.sort((a, b) => {
          const at = new Date(a.expectedArrivalAt ?? a.issuedAt).getTime();
          const bt = new Date(b.expectedArrivalAt ?? b.issuedAt).getTime();
          return bt - at;
        });
        setItems(merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
        setTotal(merged.length);
        setTotalPages(Math.max(1, Math.ceil(merged.length / PAGE_SIZE)));
      })
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : "목록을 불러오지 못했습니다.", "error");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterIndex, search, page]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    getVisitVerificationSummary()
      .then((res) => {
        setSummary(res);
        const today = todayDateString();
        Promise.all([
          getVisitVerifications({ status: "FAILED", startDate: today, endDate: today, limit: 1 }),
          getVisitVerifications({ status: "CANCELLED", startDate: today, endDate: today, limit: 1 }),
        ])
          .then(([failedRes, cancelledRes]) => {
            setTodayFailureCount(res.todayExpiredCount + failedRes.total + cancelledRes.total);
          })
          .catch(() => setTodayFailureCount(null));
      })
      .catch(() => {});
    getIntakeSetting()
      .then((res) => {
        setVisitOn(res.enabled);
        setIntakeLoaded(true);
      })
      .catch(() => setIntakeLoaded(true));
    getVerificationHours()
      .then((res) => setVerificationHours(res.hours))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateFilter = (index: number) => {
    setFilterIndex(index);
    setPage(1);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const requestToggleVisit = (next: boolean) => setPendingToggle(next);
  const cancelToggleVisit = () => setPendingToggle(null);

  const confirmToggleVisit = async () => {
    if (pendingToggle === null) return;
    try {
      const res = await updateIntakeSetting(pendingToggle);
      setVisitOn(res.enabled);
      showToast(res.enabled ? "방문 인증을 켰습니다." : "방문 인증을 껐습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "설정 변경에 실패했습니다.", "error");
    } finally {
      setPendingToggle(null);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionBusy(true);
    try {
      await approveVerification(approveTarget.id);
      showToast(`인증번호 ${approveTarget.verificationCode}의 방문 인증이 완료되었습니다.`, "success");
      loadList();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "인증 승인에 실패했습니다.", "error");
    } finally {
      setActionBusy(false);
      setApproveTarget(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      showToast("거절 사유를 입력해주세요.", "info");
      return;
    }
    setActionBusy(true);
    try {
      await rejectVerification(rejectTarget.id, rejectReason.trim());
      showToast(`인증번호 ${rejectTarget.verificationCode}의 방문 인증을 거절했습니다.`, "success");
      loadList();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "인증 거절에 실패했습니다.", "error");
    } finally {
      setActionBusy(false);
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const toggleDetail = (item: VisitVerificationListItem) => (e: React.MouseEvent<HTMLElement>) => {
    if (detailInfo && detailInfo.id === item.id) {
      setDetailInfo(null);
      setDetail(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDetailInfo({
      id: item.id,
      bottom: window.innerHeight - rect.top + 10,
      left: Math.min(Math.max(12, rect.right - POPOVER_WIDTH), window.innerWidth - POPOVER_WIDTH - 12),
      item,
    });
    setDetail(null);
    setVisitCount(null);
    getVisitVerification(item.id)
      .then((res) => {
        setDetail(res);
        getCustomerVerifiedVisitCount(res.user.id)
          .then(setVisitCount)
          .catch(() => setVisitCount(null));
      })
      .catch(() => setDetail(null));
  };

  useEffect(() => {
    if (!detailInfo) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".session-detail-popover") || target.closest(".session-detail-trigger")) return;
      setDetailInfo(null);
      setDetail(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [detailInfo]);

  const todayHours = verificationHours?.find((h) => h.dayOfWeek === todayDayOfWeek());

  return (
    <div className="visit-auth-page">
      <PageHeader
        title="방문 인증 관리"
        icon={<img src="/assets/visit-auth.png" alt="" className="page-title-icon-img" />}
        iconPlain
        hideSettings
        right={
          <div className="visit-stat-cards">
            <span className="today-tag">TODAY</span>
            <div className="visit-stat-card tone-success">
              <span className="visit-stat-card-icon visit-stat-card-icon-plain">
                <img src="/assets/calander.png" alt="" className="visit-stat-card-icon-img" />
              </span>
              <div>
                <p className="visit-stat-card-value">{summary?.activeSessionCount ?? "-"}</p>
                <p className="visit-stat-card-label">방문 예정</p>
              </div>
            </div>
            <div className="visit-stat-card-divider" />
            <div className="visit-stat-card tone-success">
              <span className="visit-stat-card-icon visit-stat-card-icon-plain">
                <img src="/assets/success.png" alt="" className="visit-stat-card-icon-img" />
              </span>
              <div>
                <p className="visit-stat-card-value">{summary?.todayVerifiedCount ?? "-"}</p>
                <p className="visit-stat-card-label">인증 완료</p>
              </div>
            </div>
            <div className="visit-stat-card-divider" />
            <div className="visit-stat-card tone-warning">
              <span className="visit-stat-card-icon visit-stat-card-icon-plain">
                <img src="/assets/failed.png" alt="" className="visit-stat-card-icon-img" />
              </span>
              <div>
                <p className="visit-stat-card-value">{todayFailureCount ?? "-"}</p>
                <p className="visit-stat-card-label">인증 실패</p>
              </div>
            </div>
          </div>
        }
      />

      <div className="visit-status-bar">
        <div className="visit-status-toggle">
          <Toggle checked={visitOn} onChange={requestToggleVisit} />
          <span className="visit-toggle-state">{intakeLoaded ? (visitOn ? "ON" : "OFF") : "-"}</span>
          <span>방문 인증</span>
        </div>

        <div className="visit-status-divider" />

        <div className="visit-status-hours">
          <Clock size={14} />
          <span>
            {todayHours
              ? todayHours.enabled
                ? `오늘(${DAY_LABELS[todayHours.dayOfWeek - 1]}) ${todayHours.startTime ?? "-"} ~ ${todayHours.endTime ?? "-"}`
                : "오늘은 인증 불가"
              : "매장 운영시간과 동일"}
          </span>
          <Link to="/places/hours">수정</Link>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">방문 인증 세션 목록</p>
            <p className="funnel-desc">현재 내 장소에 방문 예정이거나 처리 중인 인증 세션을 확인하세요.</p>
          </div>
        </div>

        <div className="session-toolbar">
          <div className="session-filter-tabs">
            {FILTERS.map((f, i) => (
              <button key={f.label} className={filterIndex === i ? "active" : ""} onClick={() => updateFilter(i)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="field-input-wrap session-search">
            <span className="field-icon">
              <Search size={14} />
            </span>
            <input
              className="field-input"
              placeholder="인증번호 검색"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="visit-desktop-table">
        <Table
          rowKey={(s) => s.id}
          data={loading ? [] : items}
          emptyMessage={
            loading ? (
              <EmptyState icon={<Search size={18} />} title="불러오는 중..." />
            ) : (
              <EmptyState
                icon={<Search size={18} />}
                title="조건에 맞는 인증 세션이 없습니다."
                description="필터나 검색어를 변경해보세요."
              />
            )
          }
          columns={[
            {
              key: "code",
              header: "6자리 인증번호",
              render: (s) => <span className="mono">{s.verificationCode}</span>,
            },
            {
              key: "action-buttons",
              header: "작업",
              render: (s) =>
                s.status === "ISSUED" ? (
                  <div className="session-action-buttons">
                    <button type="button" className="session-confirm-btn" onClick={() => setApproveTarget(s)}>
                      <Zap size={11} /> 인증하기
                    </button>
                    <button
                      type="button"
                      className="session-confirm-btn danger"
                      onClick={() => setRejectTarget(s)}
                    >
                      <Ban size={11} /> 거절
                    </button>
                  </div>
                ) : (
                  <span className="table-subtext">-</span>
                ),
            },
            {
              key: "status",
              header: "상태",
              render: (s) => {
                const meta = STATUS_META[s.status];
                const StatusIcon = meta.icon;
                return (
                  <Badge tone={meta.tone} icon={<StatusIcon size={12} />}>
                    {meta.label}
                  </Badge>
                );
              },
            },
            {
              key: "scheduled",
              header: "방문 예정 시간",
              render: (s) => formatDateTime(s.expectedArrivalAt ?? s.issuedAt),
            },
            {
              key: "expiresAt",
              header: "인증 완료 / 만료 시간",
              render: (s) => renderExpiryInfo(s, now),
            },
            {
              key: "actions",
              header: "",
              render: (s) => (
                <button type="button" className="session-detail-trigger" onClick={toggleDetail(s)}>
                  상세보기 <ChevronRight size={14} />
                </button>
              ),
            },
          ]}
        />
        </div>

        <div className="visit-session-cards">
          {loading ? (
            <EmptyState icon={<Search size={18} />} title="불러오는 중..." />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Search size={18} />}
              title="조건에 맞는 인증 세션이 없습니다."
              description="필터나 검색어를 변경해보세요."
            />
          ) : (
            items.map((s) => {
              const meta = STATUS_META[s.status];
              const StatusIcon = meta.icon;
              return (
                <div key={s.id} className="session-card">
                  <div className="session-card-row">
                    <Badge tone={meta.tone} icon={<StatusIcon size={12} />}>
                      {meta.label}
                    </Badge>
                    <div className="session-card-code-slot">
                      <span className="mono session-card-code">{s.verificationCode}</span>
                    </div>
                    <button type="button" className="session-detail-trigger" onClick={toggleDetail(s)}>
                      상세보기 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="session-card-row">
                    <span className="session-card-time">
                      {formatDateTime(s.expectedArrivalAt ?? s.issuedAt)}
                    </span>
                    {s.status === "ISSUED" && (
                      <div className="session-action-buttons">
                        <button type="button" className="session-confirm-btn" onClick={() => setApproveTarget(s)}>
                          <Zap size={11} /> 인증하기
                        </button>
                        <button
                          type="button"
                          className="session-confirm-btn danger"
                          onClick={() => setRejectTarget(s)}
                        >
                          <Ban size={11} /> 거절
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="visit-pagination">
          <button
            type="button"
            className="visit-pagination-arrow"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="이전 페이지"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`visit-pagination-page ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="visit-pagination-arrow"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="다음 페이지"
          >
            <ChevronRight size={16} />
          </button>
          <span className="visit-pagination-count">
            {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
        </div>
      </section>

      <Modal
        className="visit-modal"
        open={pendingToggle !== null}
        onClose={cancelToggleVisit}
        title={pendingToggle ? "방문 인증을 켤까요?" : "방문 인증을 끌까요?"}
        description={
          pendingToggle
            ? "방문 인증이 켜지면 고객이 인증번호를 발급받아 방문 인증을 진행할 수 있어요."
            : "방문 인증이 꺼지면 새로운 인증번호는 발급되지 않아요. 이미 발급된 번호는 계속 유효해요."
        }
        footer={
          <>
            <Button variant="secondary" onClick={cancelToggleVisit}>
              취소
            </Button>
            <Button onClick={confirmToggleVisit}>확인</Button>
          </>
        }
      />

      <Modal
        className="visit-modal"
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        title="바로 인증 처리할까요?"
        description={approveTarget ? `인증번호 ${approveTarget.verificationCode}의 방문을 인증 완료로 처리해요.` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveTarget(null)} disabled={actionBusy}>
              취소
            </Button>
            <Button onClick={handleApprove} disabled={actionBusy}>
              확인
            </Button>
          </>
        }
      />

      <Modal
        className="visit-modal"
        open={rejectTarget !== null}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        title="방문 인증을 거절할까요?"
        description={rejectTarget ? `인증번호 ${rejectTarget.verificationCode}의 방문 인증을 거절 처리해요.` : undefined}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
              disabled={actionBusy}
            >
              취소
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={actionBusy}>
              거절
            </Button>
          </>
        }
      >
        <textarea
          className="textarea-input"
          style={{ minHeight: 90 }}
          placeholder="거절 사유를 입력해주세요."
          maxLength={500}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {detailInfo &&
        createPortal(
          <div className="session-detail-popover" style={{ bottom: detailInfo.bottom, left: detailInfo.left }}>
            <p className="session-detail-popover-title">
              <IdCard size={14} /> 방문 인증 세션 정보
            </p>
            {!detail ? (
              <p className="hours-footnote">불러오는 중...</p>
            ) : (
              <dl className="session-detail-kv">
                <div>
                  <dt>고객명</dt>
                  <dd>{detail.user.realName ?? "-"}</dd>
                </div>
                <div>
                  <dt>방문 횟수</dt>
                  <dd>{visitCount === null ? "-" : `${visitCount}회`}</dd>
                </div>
                <div>
                  <dt>도착 예정 옵션</dt>
                  <dd>{detail.arrivalOptionMinutes ? `${detail.arrivalOptionMinutes}분 이내` : "-"}</dd>
                </div>
                <div>
                  <dt>발급 시각</dt>
                  <dd>{formatDateTime(detail.issuedAt)}</dd>
                </div>
                <div>
                  <dt>인증 완료 / 만료</dt>
                  <dd>{renderExpiryInfo(detailInfo.item, now)}</dd>
                </div>
                {detail.status === "FAILED" && (
                  <div className="session-detail-fail-reason">
                    <dt>거절 사유</dt>
                    <dd>{detail.failReason ?? "-"}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
