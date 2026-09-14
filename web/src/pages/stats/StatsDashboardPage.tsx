import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Hash,
  Info,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Users,
  RotateCcw,
  Target,
  Award,
  Eye,
  LogIn,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge, { type BadgeTone } from "../../components/ui/Badge";
import ComboChart from "../../components/charts/ComboChart";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { ApiError } from "../../api/client";
import { getVisitVerifications, type VisitVerificationListItem } from "../../api/visitVerifications";
import { getPageFunnel, type PageFunnel } from "../../api/analytics";
import {
  getPlaceGapHistory,
  getPlaceGapScore,
  type GapHistoryPeriod,
  type PlaceGapHistory,
  type PlaceGapScore,
} from "../../api/place";
import { useAuth } from "../../auth/AuthContext";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import type { VerificationStatus } from "../../api/dashboard";
import "./StatsDashboardPage.css";

const TREND_DAYS = 28;

interface DayBucket {
  date: string;
  label: string;
  count: number;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgoDate(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dayLabel(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function formatGapDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

function bucketByDay(items: { dateValue: string }[], days: { date: string; label: string }[]): DayBucket[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = dateKey(new Date(item.dateValue));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return days.map((d) => ({ date: d.date, label: d.label, count: counts.get(d.date) ?? 0 }));
}

async function fetchAllByStatus(status: VerificationStatus, query: { startDate?: string; endDate?: string } = {}) {
  const items: VisitVerificationListItem[] = [];
  const limit = 100;
  const MAX_PAGES = 10;
  let page = 1;
  while (page <= MAX_PAGES) {
    const res = await getVisitVerifications({ status, page, limit, ...query });
    items.push(...res.items);
    if (page >= res.totalPages) break;
    page += 1;
  }
  return items;
}

// 재방문/인증실패 추이는 백엔드에 날짜별 집계 API가 없어서, 목록 API로 받아온 원본
// 데이터를 프론트에서 직접 날짜별로 묶어 계산한다(스펙 20장 범위 밖 — 실제 데이터 기반 근사치).
// 재방문 여부는 전체 방문 이력(날짜 제한 없음) 기준으로 판단해야 정확하므로 VERIFIED는 전체를 가져온다.
async function loadTrendSeries() {
  const today = dateKey(new Date());
  const start = dateKey(daysAgoDate(TREND_DAYS - 1));

  const [verifiedItems, failedItems, expiredItems, cancelledItems] = await Promise.all([
    fetchAllByStatus("VERIFIED"),
    fetchAllByStatus("FAILED", { startDate: start, endDate: today }),
    fetchAllByStatus("EXPIRED", { startDate: start, endDate: today }),
    fetchAllByStatus("CANCELLED", { startDate: start, endDate: today }),
  ]);

  const days = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = daysAgoDate(TREND_DAYS - 1 - i);
    return { date: dateKey(d), label: dayLabel(d) };
  });

  // 사용자별로 정렬해 두 번째 이후 방문(=재방문)만 추려낸다.
  const byUser = new Map<number, VisitVerificationListItem[]>();
  for (const item of verifiedItems) {
    const arr = byUser.get(item.user.id) ?? [];
    arr.push(item);
    byUser.set(item.user.id, arr);
  }
  const revisitItems: VisitVerificationListItem[] = [];
  for (const arr of byUser.values()) {
    arr.sort((a, b) => new Date(a.verifiedAt ?? a.issuedAt).getTime() - new Date(b.verifiedAt ?? b.issuedAt).getTime());
    revisitItems.push(...arr.slice(1));
  }

  const verifiedDaily = bucketByDay(
    verifiedItems.map((i) => ({ dateValue: i.verifiedAt ?? i.issuedAt })),
    days
  );
  const revisitDaily = bucketByDay(
    revisitItems.map((i) => ({ dateValue: i.verifiedAt ?? i.issuedAt })),
    days
  );
  const failDaily = bucketByDay(
    [...failedItems, ...expiredItems, ...cancelledItems].map((i) => ({ dateValue: i.issuedAt })),
    days
  );

  return { verifiedDaily, revisitDaily, failDaily };
}

interface TrendSeries {
  verifiedDaily: DayBucket[];
  revisitDaily: DayBucket[];
  failDaily: DayBucket[];
}

function sum(buckets: DayBucket[]) {
  return buckets.reduce((total, b) => total + b.count, 0);
}

const keywords = ["한옥마을", "전주여행", "전통체험", "비빔밥", "한복체험", "야경명소", "로컬맛집", "고즈넉한"];

const MAX_WEEK_OFFSET = TREND_DAYS / 7 - 1;

// 백엔드에 등급 기준이 따로 없어서 프론트에서 임의로 나눈 구간이다.
// 실제 기준이 정해지면 여기만 바꾸면 된다.
function gapScoreGrade(score: number): { label: string; tone: BadgeTone } {
  if (score >= 60) return { label: "양호", tone: "success" };
  if (score >= 40) return { label: "보통", tone: "warning" };
  return { label: "주의", tone: "danger" };
}

export default function StatsDashboardPage() {
  const { showToast } = useToast();
  const { businessAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [pageFunnel, setPageFunnel] = useState<PageFunnel | null>(null);
  const [gapScore, setGapScore] = useState<PlaceGapScore | null>(null);
  const [gapPeriod, setGapPeriod] = useState<GapHistoryPeriod>("7d");
  const [gapHistory, setGapHistory] = useState<PlaceGapHistory | null>(null);
  const [trend, setTrend] = useState<TrendSeries | null>(null);
  const [weekOffset, setWeekOffset] = useState<Record<keyof TrendSeries, number>>({
    verifiedDaily: 0,
    revisitDaily: 0,
    failDaily: 0,
  });

  const placeId = businessAccount?.place?.id;

  useEffect(() => {
    Promise.all([getPageFunnel(), loadTrendSeries(), placeId ? getPlaceGapScore(placeId) : Promise.resolve(null)])
      .then(([pageFunnelRes, trendRes, gapScoreRes]) => {
        setPageFunnel(pageFunnelRes);
        setTrend(trendRes);
        setGapScore(gapScoreRes);
      })
      .catch((err) => showToast(err instanceof ApiError ? err.message : "통계를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  useEffect(() => {
    if (!placeId) return;
    getPlaceGapHistory(placeId, gapPeriod)
      .then(setGapHistory)
      .catch((err) => showToast(err instanceof ApiError ? err.message : "고요지수 추세를 불러오지 못했습니다.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, gapPeriod]);

  const weekWindow = (key: keyof TrendSeries) => {
    const daily = trend?.[key] ?? [];
    const offset = weekOffset[key];
    const end = daily.length - offset * 7;
    return daily.slice(Math.max(0, end - 7), end);
  };
  const shiftWeek = (key: keyof TrendSeries, delta: number) =>
    setWeekOffset((prev) => ({
      ...prev,
      [key]: Math.min(MAX_WEEK_OFFSET, Math.max(0, prev[key] + delta)),
    }));

  const verified7 = weekWindow("verifiedDaily");
  const revisit7 = weekWindow("revisitDaily");
  const fail7 = weekWindow("failDaily");

  if (loading) {
    if (!showSkeleton) return null;
    return (
      <div className="stats-page">
        <PageHeader
          title="통계 데이터 보드"
          icon={<img src="/assets/stats-dashboard.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
          iconPlain
          hideSettings
        />
        <Skeleton height={280} />
      </div>
    );
  }

  const gapReady = gapScore && gapScore.available ? gapScore : null;
  const grade = gapReady ? gapScoreGrade(gapReady.gapScore) : null;

  return (
    <div className="stats-page">
      <PageHeader
        title="통계 데이터 보드"
        icon={<img src="/assets/stats-dashboard.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
        iconPlain
        hideSettings
        right={
          <div className="stats-date-badge">
            <Calendar size={14} /> 최근 7일 기준
            <span className="stats-date-badge-divider" />
            {verified7[0]?.label} - {verified7[verified7.length - 1]?.label}
          </div>
        }
      />

      <div className="gap-row">
        <section className="panel gap-score-panel">
          <p className="panel-title">
            <Award size={15} className="gap-score-title-icon" />
            현재 고요지수
          </p>
          {gapReady ? (
            <>
              <p className="gap-score-value">{Math.round(gapReady.gapScore)}</p>
              {grade && <Badge tone={grade.tone}>{grade.label}</Badge>}
              {gapReady.regionCategoryAverageGapScore !== null && (
                <p className="gap-score-compare">
                  <TrendingUp size={12} />
                  같은 시군구·카테고리 평균({Math.round(gapReady.regionCategoryAverageGapScore)}) 대비{" "}
                  <strong>
                    {gapReady.gapScore - gapReady.regionCategoryAverageGapScore >= 0 ? "+" : ""}
                    {Math.round(gapReady.gapScore - gapReady.regionCategoryAverageGapScore)}
                  </strong>
                </p>
              )}
              <p className="gap-score-caption">
                <Calendar size={11} /> {formatGapDate(gapReady.calculatedAt)} 산출
              </p>
            </>
          ) : (
            <p className="gap-basis-desc" style={{ marginTop: 8 }}>
              아직 산출된 고요지수가 없어요.
            </p>
          )}
        </section>

        <section className="panel">
          <p className="panel-title" style={{ marginBottom: 4 }}>
            산출 근거
          </p>
          <p className="gap-basis-desc">
            검색은 많이 되지만 실제 방문은 아직 적은 곳을 찾아내는 지표예요. 관심은 큰데 방문이 적을수록 고요지수가 커져요.
          </p>

          {gapReady ? (
            <>
              <div className="gap-metric">
                <div className="gap-metric-label">
                  <span className="gap-metric-label-text">
                    온라인 관심도
                    <span title="장소 자체 검색 관심(60%), 지역·카테고리 SNS 수요(20%), 내비게이션 검색 수요(20%)를 합산한 지수예요.">
                      <Info size={11} className="info-icon" />
                    </span>
                  </span>
                  <span>{gapReady.onlineScore ?? "-"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${gapReady.onlineScore ?? 0}%` }} />
                </div>
              </div>

              <div className="gap-metric gap-metric-sub">
                <div className="gap-metric-label">
                  <span className="gap-metric-label-text">네이버 검색 관심 (60%)</span>
                  <span>{gapReady.percentiles.naver ?? "-"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${gapReady.percentiles.naver ?? 0}%` }} />
                </div>
              </div>
              <div className="gap-metric gap-metric-sub">
                <div className="gap-metric-label">
                  <span className="gap-metric-label-text">SNS 수요 (20%)</span>
                  <span>{gapReady.percentiles.sns ?? "-"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${gapReady.percentiles.sns ?? 0}%` }} />
                </div>
              </div>
              <div className="gap-metric gap-metric-sub">
                <div className="gap-metric-label">
                  <span className="gap-metric-label-text">내비게이션 검색 수요 (20%)</span>
                  <span>{gapReady.percentiles.navigation ?? "-"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${gapReady.percentiles.navigation ?? 0}%` }} />
                </div>
              </div>

              <div className="gap-metric" style={{ marginTop: 12 }}>
                <div className="gap-metric-label">
                  <span className="gap-metric-label-text">지역 오프라인 활동도</span>
                  <span>{gapReady.offlineScore ?? "-"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${gapReady.offlineScore ?? 0}%` }} />
                </div>
                <div className="progress-range">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </>
          ) : (
            <p className="gap-basis-desc" style={{ marginTop: 8 }}>
              장소에 대한 고요지수가 산출되면 세부 내역이 여기 표시돼요.
            </p>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">고요지수 추세</p>
            <div className="period-tabs">
              {(
                [
                  { key: "7d", label: "최근 7일" },
                  { key: "1m", label: "1개월" },
                  { key: "3m", label: "3개월" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  className={gapPeriod === t.key ? "active" : ""}
                  onClick={() => setGapPeriod(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {gapHistory && gapHistory.items.length > 0 ? (
            <div className="gap-trend-chart-wrap">
              {gapHistory.items.length > 1 &&
                (() => {
                  const gapDelta = Math.round(
                    gapHistory.items[gapHistory.items.length - 1].gapScore - gapHistory.items[0].gapScore
                  );
                  return (
                    <span className={`gap-trend-delta-badge ${gapDelta >= 0 ? "up" : "down"}`}>
                      {gapDelta >= 0 ? "+" : ""}
                      {gapDelta}
                      <TrendingUp size={12} />
                    </span>
                  );
                })()}
              <ComboChart
                data={gapHistory.items.map((d) => ({ label: formatGapDate(d.calculatedAt), line: d.gapScore }))}
                detailed
                area
                height={150}
              />
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp size={18} />}
              title="이 기간엔 산출된 고요지수가 없어요"
              description="고요지수가 계산되는 대로 이 그래프에 자동으로 표시돼요."
            />
          )}
        </section>
      </div>

      <div className="grid grid-3" style={{ margin: "10px 0 24px" }}>
        <section className="panel trend-panel">
          <div className="panel-header">
            <div className="trend-title-group">
              <span className="trend-icon-badge trend-icon-badge-primary">
                <Users size={14} />
              </span>
              <p className="panel-title">방문 인증 추이</p>
              <Badge tone="primary" pill>
                {sum(verified7)}건
              </Badge>
            </div>
            <div className="trend-pager">
              <button
                type="button"
                className="trend-pager-btn"
                aria-label="이전 주"
                disabled={weekOffset.verifiedDaily >= MAX_WEEK_OFFSET}
                onClick={() => shiftWeek("verifiedDaily", 1)}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="trend-pager-range">
                {verified7[0]?.label}-{verified7[verified7.length - 1]?.label}
              </span>
              <button
                type="button"
                className="trend-pager-btn"
                aria-label="다음 주"
                disabled={weekOffset.verifiedDaily <= 0}
                onClick={() => shiftWeek("verifiedDaily", -1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <ComboChart data={verified7.map((d) => ({ label: d.label, bar: d.count }))} detailed height={160} />
        </section>
        <section className="panel trend-panel">
          <div className="panel-header">
            <div className="trend-title-group">
              <span className="trend-icon-badge trend-icon-badge-accent">
                <RotateCcw size={14} />
              </span>
              <p className="panel-title">재방문 추이</p>
              <Badge tone="accent" pill>
                {sum(revisit7)}건
              </Badge>
            </div>
            <div className="trend-pager">
              <button
                type="button"
                className="trend-pager-btn"
                aria-label="이전 주"
                disabled={weekOffset.revisitDaily >= MAX_WEEK_OFFSET}
                onClick={() => shiftWeek("revisitDaily", 1)}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="trend-pager-range">
                {revisit7[0]?.label}-{revisit7[revisit7.length - 1]?.label}
              </span>
              <button
                type="button"
                className="trend-pager-btn"
                aria-label="다음 주"
                disabled={weekOffset.revisitDaily <= 0}
                onClick={() => shiftWeek("revisitDaily", -1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <ComboChart data={revisit7.map((d) => ({ label: d.label, bar: d.count }))} detailed height={160} barColor="color-mix(in srgb, var(--color-accent) 45%, white)" />
        </section>
        <section className="panel trend-panel">
          <div className="panel-header">
            <div className="trend-title-group">
              <span className="trend-icon-badge trend-icon-badge-danger">
                <Target size={14} />
              </span>
              <p className="panel-title">인증 실패 추이</p>
              <Badge tone="danger" pill>
                {sum(fail7)}건
              </Badge>
            </div>
            <div className="trend-pager">
              <button
                type="button"
                className="trend-pager-btn"
                aria-label="이전 주"
                disabled={weekOffset.failDaily >= MAX_WEEK_OFFSET}
                onClick={() => shiftWeek("failDaily", 1)}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="trend-pager-range">
                {fail7[0]?.label}-{fail7[fail7.length - 1]?.label}
              </span>
              <button
                type="button"
                className="trend-pager-btn"
                aria-label="다음 주"
                disabled={weekOffset.failDaily <= 0}
                onClick={() => shiftWeek("failDaily", -1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <ComboChart data={fail7.map((d) => ({ label: d.label, bar: d.count }))} detailed height={160} barColor="color-mix(in srgb, var(--color-danger) 45%, white)" />
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div>
            <p className="panel-title">장소 조회 → 방문인증 전환</p>
            <p className="funnel-desc">앱 화면 진입부터 실제 방문 완료까지의 전환 흐름을 확인하세요.</p>
          </div>
        </div>
        <div className="funnel-row">
          <div className="funnel-steps">
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <Eye size={16} />
              </span>
              <div>
                <p className="funnel-step-label">1 상세페이지 조회</p>
                <p className="funnel-step-value">{pageFunnel?.funnel.placeDetailView.count ?? 0} 건</p>
              </div>
            </div>
            <ArrowRight size={18} className="funnel-arrow" />
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <LogIn size={16} />
              </span>
              <div>
                <p className="funnel-step-label">2 방문인증 페이지 진입</p>
                <p className="funnel-step-value">{pageFunnel?.funnel.visitAuthPageEnter.count ?? 0} 건</p>
                <p className="funnel-step-subrate">전환 {pageFunnel?.funnel.visitAuthPageEnter.conversionRate ?? 0}%</p>
              </div>
            </div>
            <ArrowRight size={18} className="funnel-arrow" />
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <p className="funnel-step-label">3 방문인증 완료</p>
                <p className="funnel-step-value">{pageFunnel?.funnel.verifiedVisit.count ?? 0} 건</p>
                <p className="funnel-step-subrate">전환 {pageFunnel?.funnel.verifiedVisit.conversionRate ?? 0}%</p>
              </div>
            </div>
          </div>
          <div className="funnel-rate">
            <p>전체 전환율</p>
            <p className="funnel-rate-value">{pageFunnel?.overallConversionRate ?? 0}%</p>
            <p className="funnel-rate-sub">
              ({pageFunnel?.funnel.verifiedVisit.count ?? 0} / {pageFunnel?.funnel.placeDetailView.count ?? 0})
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">관련 키워드</p>
            <p className="funnel-desc">키워드를 누르면 추가 모니터링 페이지로 이동합니다. (목업 데이터)</p>
          </div>
          <Link to="/monitoring" className="panel-action">
            전체 키워드 보기
          </Link>
        </div>
        <div className="keyword-chips">
          {keywords.map((k) => (
            <Link to="/monitoring" key={k} className="keyword-chip">
              <Hash size={11} /> {k}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
