import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Clock, Search, Zap } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import Toggle from "../../components/ui/Toggle";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import "./VisitAuthManagePage.css";

type SessionTone = "info" | "success" | "danger";

interface Session {
  code: string;
  expiresAt: string;
  countdown: string;
  remaining: number | null;
  scheduled: string;
  status: string;
  tone: SessionTone;
}

const initialSessions: Session[] = [
  { code: "482915", expiresAt: "2025-05-20 14:05:43", countdown: "만료까지 01:12", remaining: 72, scheduled: "2025-05-20 14:02:18", status: "방문 예정", tone: "info" },
  { code: "731069", expiresAt: "2025-05-20 14:12:07", countdown: "만료까지 -", remaining: null, scheduled: "2025-05-20 13:12:07", status: "인증 완료", tone: "success" },
  { code: "260384", expiresAt: "2025-05-20 13:48:55", countdown: "만료까지 -", remaining: null, scheduled: "2025-05-20 12:48:55", status: "인증 완료", tone: "success" },
  { code: "598742", expiresAt: "2025-05-20 13:40:21", countdown: "만료까지 04:58", remaining: 298, scheduled: "2025-05-20 13:40:21", status: "방문 예정", tone: "info" },
  { code: "914628", expiresAt: "2025-05-20 13:12:07", countdown: "만료됨", remaining: null, scheduled: "2025-05-20 12:57:07", status: "시간 만료", tone: "danger" },
  { code: "305871", expiresAt: "2025-05-20 12:03:33", countdown: "만료됨", remaining: null, scheduled: "2025-05-20 11:48:33", status: "시간 만료", tone: "danger" },
  { code: "148236", expiresAt: "2025-05-20 11:42:08", countdown: "만료까지 -", remaining: null, scheduled: "2025-05-20 11:12:08", status: "인증 완료", tone: "success" },
  { code: "673920", expiresAt: "2025-05-20 11:20:15", countdown: "만료까지 09:44", remaining: 584, scheduled: "2025-05-20 11:18:15", status: "방문 예정", tone: "info" },
  { code: "502187", expiresAt: "2025-05-20 10:55:47", countdown: "만료됨", remaining: null, scheduled: "2025-05-20 10:40:47", status: "시간 만료", tone: "danger" },
  { code: "817364", expiresAt: "2025-05-20 10:31:29", countdown: "만료까지 -", remaining: null, scheduled: "2025-05-20 10:05:29", status: "인증 완료", tone: "success" },
];

const filters = ["전체", "방문 예정", "인증 완료", "시간 만료"];
const POPOVER_WIDTH = 300;

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VisitAuthManagePage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState(initialSessions);
  const [visitOn, setVisitOn] = useState(true);
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmCode, setConfirmCode] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [detailInfo, setDetailInfo] = useState<{ code: string; top: number; left: number } | null>(null);
  const pageSize = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.remaining === null) return s;
          const next = s.remaining - 1;
          if (next <= 0) {
            return { ...s, remaining: null, countdown: "만료됨", status: "시간 만료", tone: "danger" as const };
          }
          return { ...s, remaining: next, countdown: `만료까지 ${formatCountdown(next)}` };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filter === "전체" || s.status === filter;
    const matchesSearch = search.trim() === "" || s.code.includes(search);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateFilter = (f: string) => {
    setFilter(f);
    setPage(1);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const requestToggleVisit = (next: boolean) => setPendingToggle(next);

  const cancelToggleVisit = () => setPendingToggle(null);

  const confirmToggleVisit = () => {
    if (pendingToggle === null) return;
    setVisitOn(pendingToggle);
    setPendingToggle(null);
  };

  const handleConfirmVisit = () => {
    if (!confirmCode) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.code === confirmCode
          ? { ...s, status: "인증 완료", tone: "success" as const, remaining: null, countdown: "만료까지 -" }
          : s
      )
    );
    showToast(`인증번호 ${confirmCode}의 방문 인증이 완료되었습니다.`, "success");
    setConfirmCode(null);
  };

  const toggleDetail = (code: string) => (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDetailInfo((prev) =>
      prev && prev.code === code
        ? null
        : { code, top: rect.bottom + 8, left: Math.max(12, rect.right - POPOVER_WIDTH) }
    );
  };

  useEffect(() => {
    if (!detailInfo) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".session-detail-popover") || target.closest(".session-detail-trigger")) return;
      setDetailInfo(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [detailInfo]);

  return (
    <>
      <PageHeader title="방문 인증 관리" hideSettings />

      <div className="visit-status-bar">
        <div className="visit-status-toggle">
          <Toggle checked={visitOn} onChange={requestToggleVisit} />
          <span className="visit-toggle-state">{visitOn ? "ON" : "OFF"}</span>
          <span>방문 인증</span>
        </div>

        <div className="visit-status-divider" />

        <div className="visit-status-hours">
          <Clock size={14} />
          <span>10:00 - 13:00 / 15:00 - 18:00</span>
          <Link to="/places/hours">수정</Link>
        </div>

        <div className="visit-status-metrics">
          <div className="visit-status-metric">
            <p className="visit-status-metric-value">8</p>
            <p className="visit-status-metric-label">방문 예정</p>
          </div>
          <div className="visit-status-divider" />
          <div className="visit-status-metric">
            <p className="visit-status-metric-value">27</p>
            <p className="visit-status-metric-label">오늘 인증 완료</p>
          </div>
          <div className="visit-status-divider" />
          <div className="visit-status-metric warning">
            <p className="visit-status-metric-value">9</p>
            <p className="visit-status-metric-label">시간 만료</p>
          </div>
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
            {filters.map((f) => (
              <button key={f} className={filter === f ? "active" : ""} onClick={() => updateFilter(f)}>
                {f}
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

        <Table
          rowKey={(s) => s.code}
          data={pagedSessions}
          emptyMessage={
            <EmptyState
              icon={<Search size={18} />}
              title="조건에 맞는 인증 세션이 없습니다."
              description="필터나 검색어를 변경해보세요."
            />
          }
          columns={[
            {
              key: "code",
              header: "6자리 인증번호",
              render: (s) => (
                <div className="session-code-cell">
                  <span className="mono">{s.code}</span>
                  {s.status === "방문 예정" && (
                    <button type="button" className="session-confirm-btn" onClick={() => setConfirmCode(s.code)}>
                      <Zap size={11} /> 인증하기
                    </button>
                  )}
                </div>
              ),
            },
            { key: "status", header: "상태", render: (s) => <Badge tone={s.tone}>{s.status}</Badge> },
            { key: "scheduled", header: "정상/방문 예정 시간", render: (s) => s.scheduled },
            {
              key: "expiresAt",
              header: "인증 완료 시간",
              render: (s) => (
                <>
                  {s.expiresAt}
                  <br />
                  <span className="table-subtext">{s.countdown}</span>
                </>
              ),
            },
            {
              key: "actions",
              header: "작업",
              render: (s) => (
                <button
                  type="button"
                  className="link-btn session-detail-trigger"
                  onClick={toggleDetail(s.code)}
                >
                  상세보기
                </button>
              ),
            },
          ]}
        />

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalCount={filteredSessions.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </section>

      <Modal
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
        open={confirmCode !== null}
        onClose={() => setConfirmCode(null)}
        title="바로 인증 처리할까요?"
        description={confirmCode ? `인증번호 ${confirmCode}의 방문을 지금 바로 인증 완료로 처리해요.` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCode(null)}>
              취소
            </Button>
            <Button onClick={handleConfirmVisit}>확인</Button>
          </>
        }
      />

      {detailInfo &&
        createPortal(
          <div className="session-detail-popover" style={{ top: detailInfo.top, left: detailInfo.left }}>
            <p className="session-detail-popover-title">방문 인증 세션 정보</p>
            <dl className="session-detail-kv">
              <div>
                <dt>고객 제시 인증 번호</dt>
                <dd>{detailInfo.code}</dd>
              </div>
              <div>
                <dt>세션 번호</dt>
                <dd>SESSION-0520-0015</dd>
              </div>
              <div>
                <dt>방문자 닉네임</dt>
                <dd>yejin_travel</dd>
              </div>
              <div>
                <dt>방문 장소</dt>
                <dd>전주 한옥마을</dd>
              </div>
              <div>
                <dt>방문 인원</dt>
                <dd>2명</dd>
              </div>
            </dl>
          </div>,
          document.body
        )}
    </>
  );
}
