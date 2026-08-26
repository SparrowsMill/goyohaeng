import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CalendarPlus, Plus, Pencil, Trash2, CheckCircle2, Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/ui/Toggle";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InfoBox from "../../components/ui/InfoBox";
import Table from "../../components/ui/Table";
import "./OperatingHoursPage.css";

const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일", "공휴일"];
const dayShort = ["월", "화", "수", "목", "금", "토", "일", "공휴일"];

const defaultHours: Record<string, { open: string; close: string }> = {
  월요일: { open: "09:00", close: "18:00" },
  화요일: { open: "09:00", close: "18:00" },
  수요일: { open: "09:00", close: "18:00" },
  목요일: { open: "09:00", close: "18:00" },
  금요일: { open: "09:00", close: "20:00" },
  토요일: { open: "09:00", close: "20:00" },
  일요일: { open: "09:00", close: "18:00" },
  공휴일: { open: "09:00", close: "18:00" },
};

const customHours: Record<string, { open: string; close: string }> = {
  월요일: { open: "10:00", close: "17:00" },
  화요일: { open: "10:00", close: "17:00" },
  수요일: { open: "10:00", close: "17:00" },
  목요일: { open: "10:00", close: "17:00" },
  금요일: { open: "10:00", close: "17:00" },
  토요일: { open: "11:00", close: "18:00" },
  일요일: { open: "11:00", close: "18:00" },
  공휴일: { open: "11:00", close: "17:00" },
};

const specialSchedules = [
  { date: "2025-09-30 (화)", name: "추석 전날", tag: "조기 마감", hours: "09:00 ~ 15:00" },
  { date: "2025-10-05 (일)", name: "한산의날 맞은 운영", tag: "연장 운영", hours: "09:00 ~ 21:00" },
  { date: "2025-11-03 (월)", name: "임시 휴무", tag: "휴무", hours: "휴무" },
];

export default function OperatingHoursPage() {
  const [useSeparate, setUseSeparate] = useState(false);

  return (
    <>
      <PageHeader
        title="운영시간 관리"
        subtitle="매장 운영시간, 브레이크타임, 임시휴무, 특별운영 일정 및 방문인증 가능시간을 설정합니다."
        right={
          <Link to="/places" className="page-back-btn">
            기본 장소 관리로 돌아가기
          </Link>
        }
      />

      <div className="grid grid-3" style={{ alignItems: "start" }}>
        <section className="panel">
          <p className="panel-title">
            <CalendarDays size={15} /> 요일별 매장 운영시간
          </p>
          <p className="funnel-desc" style={{ marginBottom: 12 }}>
            기본 매장 운영시간을 요일별로 설정합니다.
          </p>
          <table className="hours-table">
            <thead>
              <tr>
                <th>요일</th>
                <th>운영</th>
                <th>오픈</th>
                <th>마감</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d}>
                  <td>{d}</td>
                  <td>
                    <Toggle checked size="sm" />
                  </td>
                  <td>{defaultHours[d].open}</td>
                  <td>{defaultHours[d].close}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hours-footnote">위 설정은 기본 매장 운영시간으로 적용됩니다.</p>
        </section>

        <section className="panel">
          <p className="panel-title">
            <Clock size={15} /> 브레이크타임 및 임시휴무
          </p>
          <p className="funnel-desc" style={{ marginBottom: 14 }}>
            필요할 경우 브레이크타임과 임시휴무를 설정할 수 있습니다.
          </p>

          <div className="break-toggle-row">
            <span>브레이크타임 사용</span>
            <Toggle checked size="sm" />
            <span className="text-success" style={{ fontSize: 12, fontWeight: 700 }}>
              사용
            </span>
          </div>
          <div className="break-time-inputs">
            <input className="text-input" defaultValue="15:00" />
            <span>~</span>
            <input className="text-input" defaultValue="16:00" />
          </div>

          <div className="form-row" style={{ marginTop: 18 }}>
            <label>임시휴무 기간</label>
            <div className="break-time-inputs">
              <input className="text-input" type="date" defaultValue="2025-06-15" />
              <span>~</span>
              <input className="text-input" type="date" defaultValue="2025-06-16" />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 14 }}>
            <label>사유 / 메모</label>
            <textarea className="textarea-input" defaultValue="시설 점검으로 인한 임시 휴무입니다." />
            <p className="hours-footnote">해당 기간 동안 매장 운영이 중지됩니다.</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-title">
              <CalendarPlus size={15} /> 특별운영 일정 추가
            </p>
            <button className="panel-action">
              <Plus size={13} /> 일정 추가
            </button>
          </div>
          <p className="funnel-desc" style={{ marginBottom: 12 }}>
            필요할 때 특별운영 일정을 추가할 수 있습니다.
          </p>
          <ul className="special-schedule-list">
            {specialSchedules.map((s) => (
              <li key={s.date}>
                <div>
                  <p className="special-schedule-date">{s.date}</p>
                  <p className="special-schedule-name">{s.name}</p>
                  <Badge tone={s.tag === "휴무" ? "danger" : s.tag === "조기 마감" ? "warning" : "success"}>
                    {s.tag}
                  </Badge>
                </div>
                <span className="special-schedule-hours">{s.hours}</span>
                <div className="special-schedule-actions">
                  <button aria-label="수정">
                    <Pencil size={14} />
                  </button>
                  <button aria-label="삭제">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="hours-footnote">특별운영 일정은 기본 운영시간보다 우선 적용됩니다.</p>
        </section>
      </div>

      <section className="panel" style={{ margin: "20px 0" }}>
        <p className="panel-title">
          <CheckCircle2 size={15} /> 방문 인증 가능시간 설정
        </p>
        <p className="funnel-desc" style={{ marginBottom: 14 }}>
          방문인증 가능시간은 기본적으로 매장 운영시간과 동일하게 설정됩니다. 필요 시 별도로 설정할 수 있습니다.
        </p>

        <div className="radio-options">
          <label className="radio-option">
            <input type="radio" checked={!useSeparate} onChange={() => setUseSeparate(false)} />
            매장 운영시간과 동일하게 사용 (기본 설정)
          </label>
          <label className="radio-option">
            <input type="radio" checked={useSeparate} onChange={() => setUseSeparate(true)} />
            별도 시간 설정
          </label>
        </div>

        {!useSeparate ? (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  {dayShort.map((d) => (
                    <th key={d} style={{ textAlign: "center" }}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {days.map((d) => (
                    <td key={d} style={{ textAlign: "center" }}>
                      {defaultHours[d].open} ~ {defaultHours[d].close}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <Table
              rowKey={(d) => d}
              data={days}
              columns={[
                { key: "day", header: "요일", render: (d) => d },
                { key: "enabled", header: "사용 여부", render: () => <Toggle checked size="sm" /> },
                { key: "open", header: "시작 시간", render: (d) => customHours[d].open },
                { key: "close", header: "종료 시간", render: (d) => customHours[d].close },
              ]}
            />
          </div>
        )}
      </section>

      <InfoBox
        tone="primary"
        icon={<Info size={16} />}
        title="저장 시 반영"
        description="저장한 방문인증 가능시간은 방문인증 자동 ON/OFF에 반영됩니다. 방문객이 설정된 가능시간 내에 방문했을 때만 방문인증이 활성화됩니다."
      />

      <div className="report-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
        <Button variant="secondary">취소</Button>
        <Button>저장</Button>
      </div>
    </>
  );
}
