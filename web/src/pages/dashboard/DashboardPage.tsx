import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, AlertTriangle, Star, Pencil, ChevronRight, Bell, ExternalLink } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Skeleton from "../../components/ui/Skeleton";
import ComboChart from "../../components/charts/ComboChart";
import "./DashboardPage.css";

const recentActivity = [
  { time: "2025-05-20 14:32:18", session: "SESSION-0520-0012", status: "방문 완료", tone: "success" as const },
  { time: "2025-05-20 14:05:43", session: "SESSION-0520-0011", status: "인증 완료", tone: "success" as const },
  { time: "2025-05-20 13:40:21", session: "SESSION-0520-0010", status: "대기 중", tone: "warning" as const },
  { time: "2025-05-20 13:12:07", session: "SESSION-0520-0009", status: "인증 완료", tone: "success" as const },
  { time: "2025-05-20 12:48:55", session: "SESSION-0520-0008", status: "만료", tone: "danger" as const },
  { time: "2025-05-20 12:03:33", session: "SESSION-0520-0007", status: "인증 실패", tone: "danger" as const },
];

const upcoming = [
  { session: "SESSION-0520-0015", remaining: "2시간 15분", window: "15:00 ~ 17:00" },
  { session: "SESSION-0520-0014", remaining: "3시간 05분", window: "16:00 ~ 18:00" },
  { session: "SESSION-0520-0013", remaining: "4시간 40분", window: "17:00 ~ 19:00" },
  { session: "SESSION-0520-0012", remaining: "5시간 20분", window: "18:00 ~ 20:00" },
];

const notices = [
  { text: "5월 전통차 체험 프로그램이 승인되었습니다.", time: "09:00" },
  { text: "방문 인증 완료 알림이 5건 발생했습니다.", time: "08:45" },
  { text: "GAP Score가 전일 대비 3점 상승했습니다.", time: "08:30" },
  { text: "새 리뷰가 1건 등록되었습니다.", time: "07:52" },
];

const trend = [
  { label: "05/14 (수)", bar: 18, line: 8 },
  { label: "05/15 (목)", bar: 24, line: 10 },
  { label: "05/16 (금)", bar: 27, line: 13 },
  { label: "05/17 (토)", bar: 19, line: 9 },
  { label: "05/18 (일)", bar: 22, line: 11 },
  { label: "05/19 (월)", bar: 29, line: 14 },
  { label: "05/20 (화)", bar: 31, line: 12 },
];

const gapTrend = [
  { label: "05/14 (수)", value: 58 },
  { label: "05/15 (목)", value: 61 },
  { label: "05/16 (금)", value: 64 },
  { label: "05/17 (토)", value: 67 },
  { label: "05/18 (일)", value: 69 },
  { label: "05/19 (월)", value: 72 },
  { label: "05/20 (화)", value: 72 },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "1m" | "3m">("7d");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PageHeader
        title="전주 한옥마을 관리자 대시보드"
        subtitle="내 장소의 오늘 운영 현황을 한눈에 확인하세요."
        showVisitToggle
      />

      <div className="dashboard-columns">
        <div className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">최근 방문 인증 활동</h2>
              <button className="panel-action">
                전체 보기 <ChevronRight size={13} />
              </button>
            </div>
            {isLoading ? (
              <div className="stack" style={{ gap: 10 }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : (
              <Table
                rowKey={(row) => row.session}
                data={recentActivity}
                columns={[
                  { key: "time", header: "시간", render: (row) => row.time },
                  { key: "session", header: "세션 ID", render: (row) => row.session },
                  { key: "status", header: "상태", render: (row) => <Badge tone={row.tone}>{row.status}</Badge> },
                ]}
              />
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">방문 예정 현황 (현재 세션)</h2>
              <button className="panel-action">
                전체 보기 <ChevronRight size={13} />
              </button>
            </div>
            {isLoading ? (
              <div className="stack" style={{ gap: 10 }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : (
              <Table
                rowKey={(row) => row.session}
                data={upcoming}
                columns={[
                  { key: "session", header: "세션", render: (row) => row.session },
                  { key: "remaining", header: "남은 시간", render: (row) => row.remaining },
                  { key: "window", header: "예정 방문 시간", render: (row) => row.window },
                ]}
              />
            )}
          </section>
        </div>

        <div className="stack">
          <div className="grid grid-2" style={{ gap: 12 }}>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={78} radius="var(--radius-md)" />)
            ) : (
              <>
                <StatCard
                  compact
                  icon={<CalendarClock size={14} />}
                  tone="primary"
                  label="방문 예정 현황"
                  value="12 건"
                />
                <StatCard compact icon={<CheckCircle2 size={14} />} tone="success" label="방문 인증 완료 수" value="31 건" />
                <StatCard compact icon={<AlertTriangle size={14} />} tone="warning" label="인증 실패/만료 수" value="5 건" valueTone="warning" />
                <StatCard compact icon={<Star size={14} />} tone="primary" label="현재 GAP Score" value="72" />
              </>
            )}
          </div>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <Bell size={15} /> 오늘 알림
              </h2>
            </div>
            <ul className="notice-list">
              {notices.map((n) => (
                <li key={n.text}>
                  <span>{n.text}</span>
                  <time>{n.time}</time>
                </li>
              ))}
            </ul>
            <button className="place-summary-cta" style={{ background: "none", border: "none", width: "100%", cursor: "pointer" }}>
              모든 알림 보기 <ChevronRight size={14} />
            </button>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">내 장소 정보 요약</h2>
              <button className="panel-action">
                <Pencil size={12} /> 수정
              </button>
            </div>
            <dl className="place-summary">
              <div>
                <dt>장소 이름</dt>
                <dd>전주 한옥마을</dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>전북 전주시 완산구 풍남동3가</dd>
              </div>
              <div>
                <dt>카테고리</dt>
                <dd>관광지</dd>
              </div>
              <div>
                <dt>전화번호</dt>
                <dd>063-123-4567</dd>
              </div>
              <div>
                <dt>공식 홈페이지</dt>
                <dd>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    jeonju-hanok.kr <ExternalLink size={11} />
                  </a>
                </dd>
              </div>
              <div>
                <dt>운영 상태</dt>
                <dd>
                  <Badge tone="success">운영 중 · 실명제 방문 인증 제공</Badge>
                </dd>
              </div>
            </dl>
            <Link to="/places" className="place-summary-cta" style={{ height: 36 }}>
              장소 관리로 이동 <ChevronRight size={14} />
            </Link>
          </section>
        </div>
      </div>

      <div className="grid dashboard-charts-row" style={{ gap: 20, marginTop: 20 }}>
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">최근 7일 방문 인증 추이</h2>
          </div>
          <ComboChart
            data={trend}
            detailed
            barLegend="방문 인증 완료 수"
            lineLegend="방문 예정 (현재 활성 세션)"
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">GAP Score 추세</h2>
            <div className="period-tabs">
              {[
                { key: "7d", label: "7일" },
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
          <ComboChart
            data={gapTrend.map((d) => ({ label: d.label, line: d.value }))}
            detailed
            area
            height={197}
          />
        </section>
      </div>
    </>
  );
}
