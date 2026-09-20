import { useEffect, useState } from "react";
import { CalendarDays, Clock, CalendarPlus, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/ui/Toggle";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { ApiError } from "../../api/client";
import {
  createTemporaryClosure,
  deleteSpecialHour,
  getOperatingHours,
  getSpecialHours,
  updateOperatingHours,
  upsertSpecialHour,
  type OperatingHourItem,
  type SpecialHourItem,
  type SpecialScheduleType,
} from "../../api/place";
import {
  getVerificationHours,
  updateVerificationHours,
  type VerificationHourItem,
} from "../../api/visitVerifications";
import "./OperatingHoursPage.css";

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const DAY_LABEL: Record<number, string> = { 1: "월요일", 2: "화요일", 3: "수요일", 4: "목요일", 5: "금요일", 6: "토요일", 7: "일요일" };
const DAY_SHORT: Record<number, string> = { 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토", 7: "일" };

function defaultOperatingHours(): OperatingHourItem[] {
  return DAYS.map((dayOfWeek) => ({
    dayOfWeek,
    isClosed: false,
    openTime: "09:00",
    closeTime: "18:00",
    breakStartTime: null,
    breakEndTime: null,
  }));
}

function defaultVerificationHours(): VerificationHourItem[] {
  return DAYS.map((dayOfWeek) => ({ dayOfWeek, enabled: true, startTime: "09:00", endTime: "18:00" }));
}

const emptySpecialForm = {
  targetDate: "",
  scheduleType: "CLOSED" as SpecialScheduleType,
  openTime: "09:00",
  closeTime: "18:00",
  reason: "",
};

interface SpecialHourGroup {
  dates: string[];
  sample: SpecialHourItem;
}

// 연속된 날짜가 같은 유형/시간/사유를 공유하면 한 줄(범위)로 묶어서 보여준다.
function groupSpecialHours(items: SpecialHourItem[]): SpecialHourGroup[] {
  const sorted = [...items].sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  const groups: SpecialHourGroup[] = [];
  for (const item of sorted) {
    const last = groups[groups.length - 1];
    if (last) {
      const prevTime = new Date(last.dates[last.dates.length - 1]).getTime();
      const curTime = new Date(item.targetDate).getTime();
      const isConsecutive = curTime - prevTime === 24 * 60 * 60 * 1000;
      const sameContent =
        last.sample.scheduleType === item.scheduleType &&
        last.sample.openTime === item.openTime &&
        last.sample.closeTime === item.closeTime &&
        last.sample.reason === item.reason;
      if (isConsecutive && sameContent) {
        last.dates.push(item.targetDate);
        continue;
      }
    }
    groups.push({ dates: [item.targetDate], sample: item });
  }
  return groups;
}

export default function OperatingHoursPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [hours, setHours] = useState<OperatingHourItem[]>(defaultOperatingHours());
  const [savingHours, setSavingHours] = useState(false);

  const [specialHours, setSpecialHours] = useState<SpecialHourItem[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [deleteTargetDates, setDeleteTargetDates] = useState<string[] | null>(null);
  const [form, setForm] = useState(emptySpecialForm);

  const [closureRange, setClosureRange] = useState({ startDate: "", endDate: "", reason: "" });
  const [savingClosure, setSavingClosure] = useState(false);

  const [hoursMode, setHoursMode] = useState<"SAME_AS_OPERATING" | "CUSTOM">("SAME_AS_OPERATING");
  const [verificationHours, setVerificationHours] = useState<VerificationHourItem[]>(defaultVerificationHours());
  const [savingVerification, setSavingVerification] = useState(false);

  const [breakEnabled, setBreakEnabled] = useState(false);
  const [breakRange, setBreakRange] = useState({ start: "15:00", end: "16:00" });

  useEffect(() => {
    Promise.all([getOperatingHours(), getSpecialHours(), getVerificationHours()])
      .then(([opRes, specialRes, verificationRes]) => {
        if (opRes.hours.length > 0) {
          const loaded = DAYS.map((d) => opRes.hours.find((h) => h.dayOfWeek === d) ?? defaultOperatingHours()[d - 1]);
          setHours(loaded);
          const withBreak = loaded.find((h) => h.breakStartTime && h.breakEndTime);
          if (withBreak) {
            setBreakEnabled(true);
            setBreakRange({ start: withBreak.breakStartTime!, end: withBreak.breakEndTime! });
          }
        }
        setSpecialHours(specialRes.specialHours);
        setHoursMode(verificationRes.hoursMode);
        if (verificationRes.hours.length > 0) {
          setVerificationHours(
            DAYS.map((d) => verificationRes.hours.find((h) => h.dayOfWeek === d) ?? defaultVerificationHours()[d - 1])
          );
        }
      })
      .catch((err) => showToast(err instanceof ApiError ? err.message : "운영시간을 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDayField = (dayOfWeek: number, patch: Partial<OperatingHourItem>) => {
    setHours((prev) => prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)));
  };

  const applyBreakToAllDays = (patch: { enabled?: boolean; start?: string; end?: string }) => {
    const nextEnabled = patch.enabled ?? breakEnabled;
    const nextStart = patch.start ?? breakRange.start;
    const nextEnd = patch.end ?? breakRange.end;
    setBreakEnabled(nextEnabled);
    setBreakRange({ start: nextStart, end: nextEnd });
    setHours((prev) =>
      prev.map((h) => ({
        ...h,
        breakStartTime: nextEnabled ? nextStart : null,
        breakEndTime: nextEnabled ? nextEnd : null,
      }))
    );
  };

  const updateVerificationDay = (dayOfWeek: number, patch: Partial<VerificationHourItem>) => {
    setVerificationHours((prev) => prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)));
  };

  const saveOperatingHours = async () => {
    setSavingHours(true);
    try {
      const res = await updateOperatingHours(hours);
      setHours(res.hours);
      showToast("운영시간이 저장되었습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "운영시간 저장에 실패했습니다.", "error");
    } finally {
      setSavingHours(false);
    }
  };

  const saveVerificationHours = async () => {
    setSavingVerification(true);
    try {
      const res = await updateVerificationHours({
        hoursMode,
        hours: hoursMode === "CUSTOM" ? verificationHours : undefined,
      });
      setHoursMode(res.hoursMode);
      if (res.hours.length > 0) setVerificationHours(DAYS.map((d) => res.hours.find((h) => h.dayOfWeek === d) ?? defaultVerificationHours()[d - 1]));
      showToast("방문 인증시간이 저장되었습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "저장에 실패했습니다.", "error");
    } finally {
      setSavingVerification(false);
    }
  };

  const openAddModal = () => {
    setEditingDate(null);
    setForm(emptySpecialForm);
    setScheduleModalOpen(true);
  };

  const openEditModal = (s: SpecialHourItem) => {
    setEditingDate(s.targetDate);
    setForm({
      targetDate: s.targetDate,
      scheduleType: s.scheduleType,
      openTime: s.openTime ?? "09:00",
      closeTime: s.closeTime ?? "18:00",
      reason: s.reason ?? "",
    });
    setScheduleModalOpen(true);
  };

  const saveSchedule = async () => {
    if (!form.targetDate.trim()) {
      showToast("날짜를 입력해주세요.", "info");
      return;
    }
    // upsertSpecialHour는 targetDate를 키로 upsert하기 때문에, 수정 중 날짜 자체를
    // 바꾼 경우 새 날짜에 새로 만들어주고 예전 날짜의 일정은 따로 지워줘야 한다.
    const dateChanged = !!editingDate && editingDate !== form.targetDate;
    try {
      await upsertSpecialHour({
        targetDate: form.targetDate,
        scheduleType: form.scheduleType,
        openTime: form.scheduleType === "SPECIAL_OPEN" ? form.openTime : null,
        closeTime: form.scheduleType === "SPECIAL_OPEN" ? form.closeTime : null,
        reason: form.reason.trim() || null,
      });
      if (dateChanged) {
        await deleteSpecialHour(editingDate);
      }
      const refreshed = await getSpecialHours();
      setSpecialHours(refreshed.specialHours);
      showToast(editingDate ? "특별운영 일정이 수정되었습니다." : "특별운영 일정이 추가되었습니다.", "success");
      setScheduleModalOpen(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "저장에 실패했습니다.", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetDates) return;
    try {
      await Promise.all(deleteTargetDates.map((date) => deleteSpecialHour(date)));
      setSpecialHours((prev) => prev.filter((s) => !deleteTargetDates.includes(s.targetDate)));
      showToast("특별운영 일정이 삭제되었습니다.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "삭제에 실패했습니다.", "error");
    } finally {
      setDeleteTargetDates(null);
    }
  };

  const registerClosure = async () => {
    if (!closureRange.startDate || !closureRange.endDate) {
      showToast("임시휴무 기간을 입력해주세요.", "info");
      return;
    }
    setSavingClosure(true);
    try {
      const res = await createTemporaryClosure(closureRange.startDate, closureRange.endDate, closureRange.reason || null);
      showToast(`${res.closedDays}일간 임시휴무로 등록되었습니다.`, "success");
      const refreshed = await getSpecialHours();
      setSpecialHours(refreshed.specialHours);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "임시휴무 등록에 실패했습니다.", "error");
    } finally {
      setSavingClosure(false);
    }
  };

  if (loading) {
    if (!showSkeleton) return null;
    return (
      <>
        <PageHeader
          title="운영시간 관리"
          icon={<img src="/assets/operating-hours.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
          iconPlain
          hideSettings
        />
        <Skeleton height={240} />
      </>
    );
  }

  return (
    <div className="operating-hours-page">
      <PageHeader
        title="운영시간 관리"
        icon={<img src="/assets/operating-hours.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
        iconPlain
        hideSettings
      />

      <div className="grid grid-2">
        <div className="stack">
          <section className="panel">
            <p className="panel-title">
              <CalendarDays size={15} /> 요일별 매장 운영시간
            </p>
            <p className="funnel-desc" style={{ marginBottom: 12 }}>
              기본 매장 운영시간을 요일별로 설정합니다.
            </p>
            <div className="table-wrap">
              <table className="hours-table">
                <thead>
                  <tr>
                    <th>요일</th>
                    <th>운영</th>
                    <th>운영 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {hours.map((h) => (
                    <tr key={h.dayOfWeek} className={h.isClosed ? "hours-row-closed" : ""}>
                      <td className="hours-table-day">{DAY_LABEL[h.dayOfWeek]}</td>
                      <td>
                        <Toggle
                          checked={!h.isClosed}
                          onChange={(on) => updateDayField(h.dayOfWeek, { isClosed: !on })}
                          size="sm"
                        />
                      </td>
                      <td>
                        <div className="time-range">
                          <input
                            type="time"
                            disabled={h.isClosed}
                            value={h.openTime ?? ""}
                            onChange={(e) => updateDayField(h.dayOfWeek, { openTime: e.target.value })}
                          />
                          <span className="time-range-sep">~</span>
                          <input
                            type="time"
                            disabled={h.isClosed}
                            value={h.closeTime ?? ""}
                            onChange={(e) => updateDayField(h.dayOfWeek, { closeTime: e.target.value })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="hours-footnote">위 설정은 기본 매장 운영시간으로 적용됩니다.</p>
            <div className="report-actions" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <Button onClick={saveOperatingHours} disabled={savingHours}>
                {savingHours ? "저장 중..." : "운영시간 저장"}
              </Button>
            </div>
          </section>

          <section className="panel">
            <p className="panel-title">
              <CheckCircle2 size={15} /> 방문 인증시간 설정
            </p>
            <p className="funnel-desc" style={{ marginBottom: 14 }}>
              기본적으로 매장 운영시간과 동일하게 설정됩니다. 필요 시 별도로 설정할 수 있습니다.
            </p>

            <div className="radio-options">
              <label className="radio-option">
                <input
                  type="radio"
                  checked={hoursMode === "SAME_AS_OPERATING"}
                  onChange={() => setHoursMode("SAME_AS_OPERATING")}
                />
                매장 운영시간과 동일하게 사용 
              </label>
              <label className="radio-option">
                <input type="radio" checked={hoursMode === "CUSTOM"} onChange={() => setHoursMode("CUSTOM")} />
                별도 시간 설정
              </label>
            </div>

            {hoursMode === "SAME_AS_OPERATING" ? (
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table className="hours-table">
                  <thead>
                    <tr>
                      {DAYS.map((d) => (
                        <th key={d} style={{ textAlign: "center" }}>
                          {DAY_SHORT[d]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {hours.map((h) => (
                        <td key={h.dayOfWeek} className="hours-summary-td">
                          {h.isClosed ? (
                            "휴무"
                          ) : (
                            <>
                              <div>{h.openTime ?? "-"}</div>
                              <div className="hours-summary-sep">~</div>
                              <div>{h.closeTime ?? "-"}</div>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table className="hours-table">
                  <thead>
                    <tr>
                      <th>요일</th>
                      <th>사용 여부</th>
                      <th>인증 가능 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationHours.map((h) => (
                      <tr key={h.dayOfWeek} className={!h.enabled ? "hours-row-closed" : ""}>
                        <td className="hours-table-day">{DAY_LABEL[h.dayOfWeek]}</td>
                        <td>
                          <Toggle
                            checked={h.enabled}
                            onChange={(on) => updateVerificationDay(h.dayOfWeek, { enabled: on })}
                            size="sm"
                          />
                        </td>
                        <td>
                          <div className="time-range">
                            <input
                              type="time"
                              disabled={!h.enabled}
                              value={h.startTime ?? ""}
                              onChange={(e) => updateVerificationDay(h.dayOfWeek, { startTime: e.target.value })}
                            />
                            <span className="time-range-sep">~</span>
                            <input
                              type="time"
                              disabled={!h.enabled}
                              value={h.endTime ?? ""}
                              onChange={(e) => updateVerificationDay(h.dayOfWeek, { endTime: e.target.value })}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="report-actions" style={{ justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border-soft)" }}>
              <Button onClick={saveVerificationHours} disabled={savingVerification}>
                {savingVerification ? "저장 중..." : "방문 인증시간 저장"}
              </Button>
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="panel">
            <p className="panel-title">
              <Clock size={15} /> 브레이크타임
            </p>
            <p className="funnel-desc" style={{ marginBottom: 14 }}>
              필요할 경우 브레이크타임을 설정할 수 있습니다. 모든 요일에 동일하게 적용됩니다.
            </p>

            <div className="break-toggle-row">
              <span>브레이크타임 사용</span>
              <Toggle checked={breakEnabled} onChange={(on) => applyBreakToAllDays({ enabled: on })} size="sm" />
            </div>
            <div className="time-range">
              <input
                type="time"
                disabled={!breakEnabled}
                value={breakRange.start}
                onChange={(e) => applyBreakToAllDays({ start: e.target.value })}
              />
              <span className="time-range-sep">~</span>
              <input
                type="time"
                disabled={!breakEnabled}
                value={breakRange.end}
                onChange={(e) => applyBreakToAllDays({ end: e.target.value })}
              />
            </div>
            <div className="report-actions" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <Button onClick={saveOperatingHours} disabled={savingHours}>
                {savingHours ? "등록 중..." : "브레이크타임 등록"}
              </Button>
            </div>
          </section>

          <section className="panel">
            <p className="panel-title">
              <Clock size={15} /> 임시휴무
            </p>
            <p className="funnel-desc" style={{ marginBottom: 14 }}>
              기간을 지정해 여러 날을 한 번에 휴무로 등록할 수 있습니다.
            </p>

            <div className="form-row">
              <label>임시휴무 기간</label>
              <div className="time-range">
                <input
                  type="date"
                  value={closureRange.startDate}
                  onChange={(e) => setClosureRange((c) => ({ ...c, startDate: e.target.value }))}
                />
                <span className="time-range-sep">~</span>
                <input
                  type="date"
                  value={closureRange.endDate}
                  onChange={(e) => setClosureRange((c) => ({ ...c, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 14 }}>
              <label>사유 / 메모</label>
              <textarea
                className="textarea-input"
                value={closureRange.reason}
                onChange={(e) => setClosureRange((c) => ({ ...c, reason: e.target.value }))}
                placeholder="예: 시설 점검으로 인한 임시 휴무입니다."
              />
            </div>

            <div className="report-actions" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <Button onClick={registerClosure} disabled={savingClosure}>
                {savingClosure ? "등록 중..." : "임시휴무 등록"}
              </Button>
            </div>
          </section>

          <section className="panel hours-fill-panel">
            <div className="panel-header">
              <p className="panel-title">
                <CalendarPlus size={15} /> 특별운영 일정 추가
              </p>
              <button type="button" className="panel-action" onClick={openAddModal}>
                <Plus size={13} /> 일정 추가
              </button>
            </div>
            <p className="funnel-desc" style={{ marginBottom: 12 }}>
              필요할 때 특별운영 일정을 추가할 수 있습니다.
            </p>
            <div className={`hours-fill-body ${specialHours.length === 0 ? "hours-fill-body-center" : ""}`}>
              {specialHours.length === 0 ? (
                <EmptyState icon={<CalendarPlus size={18} />} title="등록된 특별운영 일정이 없습니다." />
              ) : (
                <ul className="special-schedule-list">
                  {groupSpecialHours(specialHours).map((g) => {
                    const s = g.sample;
                    const rangeLabel = g.dates.length > 1 ? `${g.dates[0]} ~ ${g.dates[g.dates.length - 1]}` : g.dates[0];
                    return (
                      <li key={g.dates[0]}>
                        <div>
                          <p className="special-schedule-date">{rangeLabel}</p>
                          <p className="special-schedule-name">{s.reason || (s.scheduleType === "CLOSED" ? "휴무" : "특별 영업")}</p>
                          <Badge tone={s.scheduleType === "CLOSED" ? "danger" : "success"}>
                            {s.scheduleType === "CLOSED" ? "휴무" : "특별 영업"}
                          </Badge>
                        </div>
                        <span className="special-schedule-hours">
                          {s.scheduleType === "CLOSED" ? "휴무" : `${s.openTime ?? "-"} ~ ${s.closeTime ?? "-"}`}
                        </span>
                        <div className="special-schedule-actions">
                          {g.dates.length === 1 && (
                            <button type="button" aria-label="수정" onClick={() => openEditModal(s)}>
                              <Pencil size={14} />
                            </button>
                          )}
                          <button type="button" aria-label="삭제" onClick={() => setDeleteTargetDates(g.dates)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={editingDate ? "특별운영 일정 수정" : "특별운영 일정 추가"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setScheduleModalOpen(false)}>
              취소
            </Button>
            <Button onClick={saveSchedule}>{editingDate ? "수정" : "추가"}</Button>
          </>
        }
      >
        <div className="stack" style={{ gap: 14 }}>
          <div className="form-row">
            <label>날짜</label>
            <input
              className="text-input"
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label>구분</label>
            <select
              className="select-input"
              value={form.scheduleType}
              onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value as SpecialScheduleType }))}
            >
              <option value="CLOSED">휴무</option>
              <option value="SPECIAL_OPEN">특별 영업</option>
            </select>
          </div>
          {form.scheduleType === "SPECIAL_OPEN" && (
            <div className="time-range">
              <input
                type="time"
                value={form.openTime}
                onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
              />
              <span className="time-range-sep">~</span>
              <input
                type="time"
                value={form.closeTime}
                onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
              />
            </div>
          )}
          <div className="form-row">
            <label>사유 / 메모</label>
            <input
              className="text-input"
              placeholder="예: 추석 전날 조기 마감"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteTargetDates !== null}
        onClose={() => setDeleteTargetDates(null)}
        title="특별운영 일정을 삭제할까요?"
        description="삭제한 일정은 복구할 수 없습니다. 계속 진행하시겠습니까?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTargetDates(null)}>
              취소
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
