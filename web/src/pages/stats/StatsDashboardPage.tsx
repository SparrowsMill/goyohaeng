import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Eye,
  MousePointerClick,
  CheckCircle2,
  ArrowRight,
  Hash,
  Info,
  Calendar,
  TrendingUp,
  Percent,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import ComboChart from "../../components/charts/ComboChart";
import Modal from "../../components/ui/Modal";
import "./StatsDashboardPage.css";

const gapTrendByPeriod = {
  "7d": [
    { label: "05/14 (수)", value: 58 },
    { label: "05/15 (목)", value: 61 },
    { label: "05/16 (금)", value: 64 },
    { label: "05/17 (토)", value: 67 },
    { label: "05/18 (일)", value: 69 },
    { label: "05/19 (월)", value: 72 },
    { label: "05/20 (화)", value: 72 },
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

const visitTrend = [
  { label: "05/14 (수)", bar: 189 },
  { label: "05/15 (목)", bar: 201 },
  { label: "05/16 (금)", bar: 214 },
  { label: "05/17 (토)", bar: 186 },
  { label: "05/18 (일)", bar: 225 },
  { label: "05/19 (월)", bar: 238 },
  { label: "05/20 (화)", bar: 251 },
];

const visitHistory = [
  { label: "04/23", bar: 130 }, { label: "04/24", bar: 145 }, { label: "04/25", bar: 152 },
  { label: "04/26", bar: 128 }, { label: "04/27", bar: 158 }, { label: "04/28", bar: 171 }, { label: "04/29", bar: 179 },
  { label: "04/30", bar: 142 }, { label: "05/01", bar: 156 }, { label: "05/02", bar: 163 },
  { label: "05/03", bar: 139 }, { label: "05/04", bar: 168 }, { label: "05/05", bar: 182 }, { label: "05/06", bar: 191 },
  { label: "05/07", bar: 155 }, { label: "05/08", bar: 169 }, { label: "05/09", bar: 176 },
  { label: "05/10", bar: 151 }, { label: "05/11", bar: 181 }, { label: "05/12", bar: 196 }, { label: "05/13", bar: 205 },
  { label: "05/14", bar: 189 }, { label: "05/15", bar: 201 }, { label: "05/16", bar: 214 },
  { label: "05/17", bar: 186 }, { label: "05/18", bar: 225 }, { label: "05/19", bar: 238 }, { label: "05/20", bar: 251 },
];

const revisitHistory = [
  { label: "04/23", bar: 22 }, { label: "04/24", bar: 25 }, { label: "04/25", bar: 27 },
  { label: "04/26", bar: 23 }, { label: "04/27", bar: 28 }, { label: "04/28", bar: 31 }, { label: "04/29", bar: 33 },
  { label: "04/30", bar: 24 }, { label: "05/01", bar: 27 }, { label: "05/02", bar: 29 },
  { label: "05/03", bar: 25 }, { label: "05/04", bar: 30 }, { label: "05/05", bar: 33 }, { label: "05/06", bar: 35 },
  { label: "05/07", bar: 27 }, { label: "05/08", bar: 30 }, { label: "05/09", bar: 32 },
  { label: "05/10", bar: 28 }, { label: "05/11", bar: 33 }, { label: "05/12", bar: 36 }, { label: "05/13", bar: 38 },
  { label: "05/14", bar: 38 }, { label: "05/15", bar: 42 }, { label: "05/16", bar: 45 },
  { label: "05/17", bar: 39 }, { label: "05/18", bar: 47 }, { label: "05/19", bar: 50 }, { label: "05/20", bar: 51 },
];

const revisitTrend = [
  { label: "05/14", bar: 38 },
  { label: "05/15", bar: 42 },
  { label: "05/16", bar: 45 },
  { label: "05/17", bar: 39 },
  { label: "05/18", bar: 47 },
  { label: "05/19", bar: 50 },
  { label: "05/20", bar: 51 },
];

const failTrend = [
  { label: "05/14", bar: 6 },
  { label: "05/15", bar: 7 },
  { label: "05/16", bar: 6 },
  { label: "05/17", bar: 8 },
  { label: "05/18", bar: 10 },
  { label: "05/19", bar: 9 },
  { label: "05/20", bar: 10 },
];

const keywords = ["한옥마을", "전주여행", "전통체험", "비빔밥", "한복체험", "야경명소", "로컬맛집", "고즈넉한"];

function dayOverDayPct(trend: { bar?: number }[]) {
  const last = trend[trend.length - 1].bar ?? 0;
  const prev = trend[trend.length - 2].bar ?? 0;
  return Math.round(((last - prev) / prev) * 1000) / 10;
}

const visitDeltaPct = dayOverDayPct(visitTrend);
const revisitDeltaPct = dayOverDayPct(revisitTrend);
const failDeltaPct = dayOverDayPct(failTrend);

export default function StatsDashboardPage() {
  const [period, setPeriod] = useState<"7d" | "1m" | "3m">("7d");
  const [expandedChart, setExpandedChart] = useState<null | "visit" | "revisit">(null);

  const gapTrend = gapTrendByPeriod[period];
  const gapMax = Math.max(...gapTrend.map((d) => d.value));
  const gapMin = Math.min(...gapTrend.map((d) => d.value));
  const gapAvg = Math.round(gapTrend.reduce((sum, d) => sum + d.value, 0) / gapTrend.length);

  return (
    <div className="stats-page">
      <PageHeader title="통계 데이터 보드" hideSettings />

      <div className="gap-row">
        <section className="panel gap-score-panel">
          <p className="panel-title">
            현재 GAP Score{" "}
            <span title="같은 시군구·같은 고요행 카테고리 장소들과 비교해, 온라인 관심도 대비 지역 오프라인 활동도가 얼마나 낮은지로 산출한 지표예요.">
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
            <Calendar size={11} /> 최근 7일 기준
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
              <span title="선택한 기간 동안의 GAP Score 변화예요.">
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
          <ComboChart data={gapTrend.map((d) => ({ label: d.label, line: d.value }))} detailed area height={150} />
          <div className="gap-trend-stats">
            <div className="gap-trend-stat">
              <p className="gap-trend-stat-label">최고</p>
              <p className="gap-trend-stat-value">{gapMax}</p>
            </div>
            <div className="gap-trend-stat">
              <p className="gap-trend-stat-label">최저</p>
              <p className="gap-trend-stat-value">{gapMin}</p>
            </div>
            <div className="gap-trend-stat">
              <p className="gap-trend-stat-label">평균</p>
              <p className="gap-trend-stat-value">{gapAvg}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-4" style={{ margin: "10px 0" }}>
        <StatCard
          compact
          icon={<CalendarCheck size={17} />}
          tone="primary"
          label="전체 방문 인증 횟수"
          hint="최근 7일간 누적된 방문 인증 완료 건수예요."
          value="1,246 건"
          delta={{ text: `${visitDeltaPct > 0 ? "+" : ""}${visitDeltaPct}% 전일 대비`, direction: "up" }}
        />
        <StatCard
          compact
          icon={<RotateCcw size={17} />}
          tone="primary"
          label="재방문 수"
          hint="같은 방문자가 다시 방문 인증한 건수예요."
          value="312 건"
          delta={{ text: `${revisitDeltaPct > 0 ? "+" : ""}${revisitDeltaPct}% 전일 대비`, direction: "up" }}
        />
        <StatCard
          compact
          icon={<Percent size={17} />}
          tone="success"
          label="재방문율"
          hint="전체 방문 인증 횟수 대비 재방문 수 비율이에요."
          value="25.0%"
        />
        <StatCard
          compact
          icon={<AlertTriangle size={17} />}
          tone="warning"
          label="인증 실패/만료 수"
          hint="인증에 실패했거나 시간이 만료된 건수예요."
          value="58 건"
          valueTone="warning"
          delta={{ text: `${failDeltaPct > 0 ? "+" : ""}${failDeltaPct}% 전일 대비`, direction: "down" }}
        />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <section className="panel trend-panel">
          <div className="panel-header">
            <p className="panel-title">방문 인증 추이</p>
            <button className="panel-action" onClick={() => setExpandedChart("visit")}>
              전체 보기 <ChevronRight size={13} />
            </button>
          </div>
          <ComboChart data={visitTrend} detailed height={140} />
          <p className="trend-panel-summary">
            최근 7일 ·{" "}
            <span className={visitDeltaPct >= 0 ? "up" : "down"}>
              {visitDeltaPct > 0 ? "+" : ""}
              {visitDeltaPct}% 전일 대비
            </span>
          </p>
        </section>
        <section className="panel trend-panel">
          <div className="panel-header">
            <p className="panel-title">재방문 추이</p>
            <button className="panel-action" onClick={() => setExpandedChart("revisit")}>
              전체 보기 <ChevronRight size={13} />
            </button>
          </div>
          <ComboChart
            data={revisitTrend}
            detailed
            height={140}
            barColor="color-mix(in srgb, var(--color-text-faint) 55%, white)"
          />
          <p className="trend-panel-summary">
            최근 7일 ·{" "}
            <span className={revisitDeltaPct >= 0 ? "up" : "down"}>
              {revisitDeltaPct > 0 ? "+" : ""}
              {revisitDeltaPct}% 전일 대비
            </span>
          </p>
        </section>
        <section className="panel trend-panel">
          <div className="panel-header">
            <p className="panel-title">인증 실패/만료 추이</p>
          </div>
          <ComboChart data={failTrend} detailed height={140} barColor="var(--color-danger-soft)" />
          <p className="trend-panel-summary">
            최근 7일 ·{" "}
            <span className={failDeltaPct <= 0 ? "up" : "down"}>
              {failDeltaPct > 0 ? "+" : ""}
              {failDeltaPct}% 전일 대비
            </span>
          </p>
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div>
            <p className="panel-title">방문 인증 현황</p>
            <p className="funnel-desc">상세페이지 조회부터 방문인증 완료까지의 전환 흐름을 확인하세요.</p>
          </div>
        </div>
        <div className="funnel-flow">
          <div className="funnel-node">
            <span className="funnel-node-icon">
              <Eye size={15} />
            </span>
            <p className="funnel-node-label">상세페이지 조회</p>
            <p className="funnel-node-value">5,842</p>
          </div>
          <div className="funnel-link">
            <ArrowRight size={15} />
            <span>30.2%</span>
          </div>
          <div className="funnel-node">
            <span className="funnel-node-icon">
              <MousePointerClick size={15} />
            </span>
            <p className="funnel-node-label">방문인증 페이지 진입</p>
            <p className="funnel-node-value">1,762</p>
          </div>
          <div className="funnel-link">
            <ArrowRight size={15} />
            <span>70.7%</span>
          </div>
          <div className="funnel-node">
            <span className="funnel-node-icon">
              <CheckCircle2 size={15} />
            </span>
            <p className="funnel-node-label">방문인증 완료</p>
            <p className="funnel-node-value">1,246</p>
          </div>
          <div className="funnel-total">
            <p className="funnel-total-label">방문 전환율</p>
            <p className="funnel-total-value">21.3%</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">관련 키워드</p>
            <p className="funnel-desc">키워드를 누르면 추가 모니터링 페이지로 이동합니다.</p>
          </div>
          <Link to="/monitoring" className="panel-action">
            전체 키워드 보기 <ChevronRight size={13} />
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

      <Modal
        open={expandedChart !== null}
        onClose={() => setExpandedChart(null)}
        title={expandedChart === "visit" ? "방문 인증 추이 · 전체 보기" : "재방문 추이 · 전체 보기"}
        description="최근 4주간 일별 추이예요."
        maxWidth={820}
      >
        <ComboChart
          data={expandedChart === "visit" ? visitHistory : revisitHistory}
          detailed
          height={260}
          labelStep={7}
          barColor={
            expandedChart === "visit"
              ? undefined
              : "color-mix(in srgb, var(--color-text-faint) 55%, white)"
          }
        />
      </Modal>
    </div>
  );
}
