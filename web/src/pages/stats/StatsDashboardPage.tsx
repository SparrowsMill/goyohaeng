import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Hash,
  Info,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Ticket,
  ListChecks,
  CheckCircle2,
  ArrowRight,
  Users,
  RotateCcw,
  Target,
  Award,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import ComboChart from "../../components/charts/ComboChart";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { ApiError } from "../../api/client";
import { getVisitVerifications, type VisitVerificationListItem } from "../../api/visitVerifications";
import { getVerificationFunnel, type VerificationFunnel } from "../../api/analytics";
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

// GAP Score 관련 수치는 백엔드에 아직 계산/조회 API가 없어(스펙 20장 참고) 목업으로 유지한다.
const gapTrendByPeriod = {
  "7d": [
    { label: "05/14\n(수)", value: 58 },
    { label: "05/15\n(목)", value: 61 },
    { label: "05/16\n(금)", value: 64 },
    { label: "05/17\n(토)", value: 67 },
    { label: "05/18\n(일)", value: 69 },
    { label: "05/19\n(월)", value: 72 },
    { label: "05/20\n(화)", value: 72 },
  ],
  "1m": [
    { label: "1주차", value: 52 },
    { label: "2주차", value: 58 },
    { label: "3주차", value: 63 },
    { label: "4주차", value: 72 },
  ],
  "3m": [
    { label: "3월", value: 45 },
    { label: "4월", value: 61 },
    { label: "5월", value: 72 },
  ],
};

const keywords = ["한옥마을", "전주여행", "전통체험", "비빔밥", "한복체험", "야경명소", "로컬맛집", "고즈넉한"];

const MAX_WEEK_OFFSET = TREND_DAYS / 7 - 1;

export default function StatsDashboardPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<"7d" | "1m" | "3m">("7d");
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<VerificationFunnel | null>(null);
  const [trend, setTrend] = useState<TrendSeries | null>(null);
  const [weekOffset, setWeekOffset] = useState<Record<keyof TrendSeries, number>>({
    verifiedDaily: 0,
    revisitDaily: 0,
    failDaily: 0,
  });

  useEffect(() => {
    Promise.all([getVerificationFunnel(), loadTrendSeries()])
      .then(([funnelRes, trendRes]) => {
        setFunnel(funnelRes);
        setTrend(trendRes);
      })
      .catch((err) => showToast(err instanceof ApiError ? err.message : "통계를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const gapTrend = gapTrendByPeriod[period];

  if (loading) {
    return (
      <div className="stats-page">
        <PageHeader
          title="통계 데이터 보드"
          icon={<img src="/assets/통계 데이터 보드.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
          iconPlain
          hideSettings
        />
        <Skeleton height={280} />
      </div>
    );
  }

  const gapDelta = gapTrend[gapTrend.length - 1].value - gapTrend[0].value;

  return (
    <div className="stats-page">
      <PageHeader
        title="통계 데이터 보드"
        icon={<img src="/assets/통계 데이터 보드.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
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
            현재 GAP Score{" "}
            <span title="같은 시군구·같은 고요행 카테고리 장소들과 비교해, 온라인 관심도 대비 지역 오프라인 활동도가 얼마나 낮은지로 산출한 지표예요. (백엔드 산출 API 준비 중 — 목업 표시)">
              <Info size={12} className="info-icon" />
            </span>
          </p>
          <p className="gap-score-value">72</p>
          <Badge tone="success">양호</Badge>
          <p className="gap-score-compare">
            <TrendingUp size={12} />
            같은 시군구·카테고리 평균(57) 대비 <strong>+15</strong>
          </p>
          <p className="gap-score-caption">
            <Calendar size={11} /> 목업 데이터
          </p>
        </section>

        <section className="panel">
          <p className="panel-title" style={{ marginBottom: 4 }}>
            산출 근거
          </p>
          <p className="gap-basis-desc">
            온라인 관심도가 지역의 실제 오프라인 관광 활동보다 얼마나 앞서는지를 나타내요. 격차가 클수록 온라인 관심 대비 방문이 저조하다는 뜻이에요.
          </p>

          <div className="gap-metric">
            <div className="gap-metric-label">
              <span className="gap-metric-label-text">
                온라인 관심도
                <span title="장소 자체 검색 관심(60%), 지역·카테고리 SNS 수요(20%), 내비게이션 검색 수요(20%)를 합산한 지수예요.">
                  <Info size={11} className="info-icon" />
                </span>
              </span>
              <span>68</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "68%" }} />
            </div>
          </div>

          <div className="gap-metric gap-metric-sub">
            <div className="gap-metric-label">
              <span className="gap-metric-label-text">네이버 검색 관심 (60%)</span>
              <span>68</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "68%" }} />
            </div>
          </div>
          <div className="gap-metric gap-metric-sub">
            <div className="gap-metric-label">
              <span className="gap-metric-label-text">SNS 수요 (20%)</span>
              <span>74</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "74%" }} />
            </div>
          </div>
          <div className="gap-metric gap-metric-sub">
            <div className="gap-metric-label">
              <span className="gap-metric-label-text">내비게이션 검색 수요 (20%)</span>
              <span>61</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "61%" }} />
            </div>
          </div>

          <div className="gap-metric" style={{ marginTop: 12 }}>
            <div className="gap-metric-label">
              <span className="gap-metric-label-text">
                지역 오프라인 활동도
                <span title="우리 가게 방문인증 실적이 아니라, 같은 시군구의 외지인·외국인 방문량(60%), 관광 소비강도(25%), 타권역 방문자 비중(15%)을 합산한 지역 단위 지수예요.">
                  <Info size={11} className="info-icon" />
                </span>
              </span>
              <span>76</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "76%" }} />
            </div>
            <div className="progress-range">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">
              GAP Score 추세{" "}
              <span title="선택한 기간 동안의 GAP Score 변화예요. (목업 데이터)">
                <Info size={12} className="info-icon" />
              </span>
            </p>
            <div className="period-tabs">
              {[
                { key: "7d", label: "최근 7일" },
                { key: "1m", label: "1개월" },
                { key: "3m", label: "3개월" },
              ].map((t) => (
                <button
                  key={t.key}
                  className={period === t.key ? "active" : ""}
                  onClick={() => setPeriod(t.key as typeof period)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="gap-trend-chart-wrap">
            <span className={`gap-trend-delta-badge ${gapDelta >= 0 ? "up" : "down"}`}>
              {gapDelta >= 0 ? "+" : ""}
              {gapDelta}
              <TrendingUp size={12} />
            </span>
            <ComboChart data={gapTrend.map((d) => ({ label: d.label, line: d.value }))} detailed area height={150} />
          </div>
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
            <p className="panel-title">방문 인증 현황</p>
            <p className="funnel-desc">인증번호 발급부터 방문 인증 완료까지의 전환 흐름을 확인하세요.</p>
          </div>
        </div>
        <div className="funnel-row">
          <div className="funnel-steps">
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <Ticket size={16} />
              </span>
              <div>
                <p className="funnel-step-label">1 인증번호 발급</p>
                <p className="funnel-step-value">{funnel?.totalRequestedCount ?? 0} 건</p>
              </div>
            </div>
            <ArrowRight size={18} className="funnel-arrow" />
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <ListChecks size={16} />
              </span>
              <div>
                <p className="funnel-step-label">2 처리 완료</p>
                <p className="funnel-step-value">{funnel?.resolvedCount ?? 0} 건</p>
              </div>
            </div>
            <ArrowRight size={18} className="funnel-arrow" />
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <p className="funnel-step-label">3 방문 인증 완료</p>
                <p className="funnel-step-value">{funnel?.funnel.verified.count ?? 0} 건</p>
              </div>
            </div>
          </div>
          <div className="funnel-rate">
            <p>인증 전환율</p>
            <p className="funnel-rate-value">{funnel?.verificationRate ?? 0}%</p>
            <p className="funnel-rate-sub">
              ({funnel?.funnel.verified.count ?? 0} / {funnel?.totalRequestedCount ?? 0})
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
