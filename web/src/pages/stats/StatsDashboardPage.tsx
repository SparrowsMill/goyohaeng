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
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import ComboChart from "../../components/charts/ComboChart";
import "./StatsDashboardPage.css";

const gapTrend = [
  { label: "05/14 (수)", value: 58 },
  { label: "05/15 (목)", value: 61 },
  { label: "05/16 (금)", value: 64 },
  { label: "05/17 (토)", value: 67 },
  { label: "05/18 (일)", value: 69 },
  { label: "05/19 (월)", value: 72 },
  { label: "05/20 (화)", value: 72 },
];

const visitTrend = [
  { label: "05/14 (수)", bar: 189, line: 6 },
  { label: "05/15 (목)", bar: 201, line: 7 },
  { label: "05/16 (금)", bar: 214, line: 5 },
  { label: "05/17 (토)", bar: 186, line: 8 },
  { label: "05/18 (일)", bar: 225, line: 9 },
  { label: "05/19 (월)", bar: 238, line: 11 },
  { label: "05/20 (화)", bar: 251, line: 12 },
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

export default function StatsDashboardPage() {
  const [period, setPeriod] = useState<"7d" | "1m" | "3m">("7d");

  return (
    <>
      <PageHeader title="통계 데이터 보드" subtitle="전주 한옥마을 운영 데이터를 한눈에 확인하세요." showVisitToggle />

      <div className="gap-row">
        <section className="panel gap-score-panel">
          <p className="panel-title">현재 GAP Score</p>
          <p className="gap-score-value">72</p>
          <Badge tone="success">양호</Badge>
          <p className="gap-score-caption">최근 7일 기준</p>
        </section>

        <section className="panel">
          <p className="panel-title" style={{ marginBottom: 4 }}>
            산출 근거
          </p>
          <p className="gap-basis-desc">
            GAP Score는 검색 관심도와 실제 방문 데이터를 종합해 산출하였어요. 두 지표의 균형이 원활하며 집수가 높아지면, 해당 상소이 실현여면 의미합니다.
          </p>
          <div className="gap-metric">
            <div className="gap-metric-label">검색 관심도 <span>68</span></div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "68%" }} />
            </div>
          </div>
          <div className="gap-metric">
            <div className="gap-metric-label">실제 방문 집중도 <span>76</span></div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "76%" }} />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">GAP Score 추세</p>
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
          <ComboChart data={gapTrend.map((d) => ({ label: d.label, line: d.value }))} height={150} />
        </section>
      </div>

      <div className="grid grid-3" style={{ margin: "20px 0" }}>
        <StatCard icon={<CalendarCheck size={19} />} tone="primary" label="전체 방문 인증 횟수" value="1,246 건" />
        <StatCard icon={<RotateCcw size={19} />} tone="primary" label="재방문 수" value="312 건" />
        <StatCard icon={<AlertTriangle size={19} />} tone="warning" label="인증 실패/만료 수" value="58 건" valueTone="warning" />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">방문 인증 추이</p>
            <button className="panel-action">
              전체 보기 <ChevronRight size={13} />
            </button>
          </div>
          <ComboChart data={visitTrend} height={140} lineColor="var(--color-danger)" />
        </section>
        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">재방문 추이</p>
            <button className="panel-action">
              전체 보기 <ChevronRight size={13} />
            </button>
          </div>
          <ComboChart data={revisitTrend} height={140} />
        </section>
        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">인증 실패/만료 추이</p>
          </div>
          <ComboChart data={failTrend} height={140} barColor="var(--color-danger-soft)" />
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div>
            <p className="panel-title">방문 인증 현황</p>
            <p className="funnel-desc">상세페이지 조회부터 방문인증 완료까지의 전환 흐름을 확인하세요.</p>
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
                <p className="funnel-step-value">5,842 건</p>
              </div>
            </div>
            <ArrowRight size={18} className="funnel-arrow" />
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <MousePointerClick size={16} />
              </span>
              <div>
                <p className="funnel-step-label">2 방문인증 페이지 진입</p>
                <p className="funnel-step-value">1,762 건</p>
              </div>
            </div>
            <ArrowRight size={18} className="funnel-arrow" />
            <div className="funnel-step">
              <span className="funnel-step-icon">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <p className="funnel-step-label">3 방문인증 완료 수</p>
                <p className="funnel-step-value">1,246 건</p>
              </div>
            </div>
          </div>
          <div className="funnel-rate">
            <p>방문 전환율</p>
            <p className="funnel-rate-value">21.3%</p>
            <p className="funnel-rate-sub">(1,246 / 5,842)</p>
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
        <div className="keyword-pills">
          {keywords.map((k) => (
            <Link to="/monitoring" key={k} className="keyword-pill">
              <Hash size={12} /> {k}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
