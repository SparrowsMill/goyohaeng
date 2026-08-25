import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Info, Users, CheckCircle2, Timer, RefreshCcw, BookOpen, ChevronRight, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import Toggle from "../../components/ui/Toggle";
import DonutChart from "../../components/charts/DonutChart";
import "./VisitAuthManagePage.css";

const sessions = [
  { code: "482915", expiresAt: "2025-05-20 14:05:43", countdown: "만료까지 01:12", scheduled: "2025-05-20 14:02:18", status: "방문 예정", tone: "primary" as const },
  { code: "731069", expiresAt: "2025-05-20 14:12:07", countdown: "만료까지 07:36", scheduled: "2025-05-20 13:12:07", status: "인증 완료", tone: "success" as const },
  { code: "260384", expiresAt: "2025-05-20 13:48:55", countdown: "만료까지 -", scheduled: "2025-05-20 12:48:55", status: "인증 완료", tone: "success" as const },
  { code: "598742", expiresAt: "2025-05-20 13:40:21", countdown: "만료까지 -", scheduled: "2025-05-20 13:40:21", status: "대기 중", tone: "warning" as const },
  { code: "914628", expiresAt: "2025-05-20 13:12:07", countdown: "만료됨 00:35", scheduled: "2025-05-20 12:57:07", status: "시간 만료", tone: "danger" as const },
  { code: "305871", expiresAt: "2025-05-20 12:03:33", countdown: "만료됨 02:12", scheduled: "2025-05-20 11:48:33", status: "시간 만료", tone: "danger" as const },
];

const filters = ["전체", "방문 예정", "인증 완료", "시간 만료"];

const flowSegments = [
  { label: "방문 예정", value: 27, color: "var(--color-primary)" },
  { label: "인증 완료", value: 8, color: "#c98a4f" },
  { label: "시간 만료", value: 9, color: "#c9a08a" },
  { label: "대기 중", value: 2, color: "#d9c368" },
];

export default function VisitAuthManagePage() {
  const [visitOn, setVisitOn] = useState(true);
  const [filter, setFilter] = useState("전체");

  return (
    <>
      <PageHeader title="방문 인증 관리" subtitle="방문 인증 상태와 실시간 인증 세션을 관리해요." />

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="visit-toggle-row">
          <div className="visit-toggle-block">
            <p className="panel-title">방문 인증</p>
            <div className="visit-toggle-main">
              <Toggle checked={visitOn} onChange={setVisitOn} />
              <span className="visit-toggle-state">{visitOn ? "ON" : "OFF"}</span>
            </div>
            <Badge tone="neutral">자동</Badge>
            <p className="visit-toggle-hint">설정된 인증 가능 시간에 따라 자동으로 인증이 활성화됩니다.</p>
          </div>

          <div className="visit-toggle-block">
            <p className="panel-title">
              <Clock size={14} /> 인증 가능 시간
            </p>
            <p className="visit-hours-value">10:00 - 13:00 / 15:00 - 18:00</p>
            <Link to="/visit-auth/hours" className="page-back-btn" style={{ marginTop: 10 }}>
              <Clock size={14} /> 운영시간 수정
            </Link>
          </div>

          <div className="visit-toggle-note">
            <Info size={14} />
            토글을 직접 클릭하면 수동 모드로 전환됩니다. 수동 전환 시 모드가 '자동'에서 변경됩니다.
          </div>
        </div>
      </section>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard icon={<Users size={18} />} tone="neutral" label="현재 유효 세션 수" value="8 건" />
        <StatCard icon={<CheckCircle2 size={18} />} tone="success" label="오늘 인증 완료" value="27 건" />
        <StatCard icon={<Timer size={18} />} tone="warning" label="시간 만료" value="9 건" valueTone="warning" />
        <StatCard icon={<RefreshCcw size={18} />} tone="neutral" label="수동 전환 여부" value="아니오" />
      </div>

      <div className="dashboard-columns">
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
                <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div className="field-input-wrap session-search">
              <span className="field-icon">
                <Search size={14} />
              </span>
              <input className="field-input" placeholder="인증번호 또는 상태 검색" />
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>6자리 인증번호</th>
                  <th>인증 완료 시간</th>
                  <th>상태</th>
                  <th>정상/방문 예정 시간</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.code}>
                    <td className="mono">{s.code}</td>
                    <td>
                      {s.expiresAt}
                      <br />
                      <span className="table-subtext">{s.countdown}</span>
                    </td>
                    <td>
                      <Badge tone={s.tone}>{s.status}</Badge>
                    </td>
                    <td>{s.scheduled}</td>
                    <td>
                      <Link to={`/visit-auth/${s.code}`} className="link-btn">
                        상세보기 <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {[1, 2, 3, 4].map((p) => (
              <button key={p} className={p === 1 ? "active" : ""}>
                {p}
              </button>
            ))}
            <span className="pagination-count">1-6 of 6</span>
          </div>
        </section>

        <div className="stack">
          <section className="panel">
            <p className="panel-title">
              <BookOpen size={15} /> 방문 인증 안내
            </p>
            <ul className="guide-bullets">
              <li>6자리 인증번호, 인증 완료 시간, 상태(방문 예정/인증 완료/시간 만료)를 확인할 수 있어요.</li>
              <li>리스트 클릭 시 방문 인증 상세로 이동해요.</li>
              <li>토글 OFF 시 현재 시간과 무관하게 인증이 비활성화돼요.</li>
            </ul>
          </section>

          <section className="panel">
            <p className="panel-title">오늘 방문 인증 흐름</p>
            <DonutChart segments={flowSegments} centerLabel="46건" />
          </section>
        </div>
      </div>
    </>
  );
}
