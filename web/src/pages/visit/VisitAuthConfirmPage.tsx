import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IdCard, CalendarClock, Timer, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { ApiError } from "../../api/client";
import {
  approveVerification,
  getVisitVerification,
  rejectVerification,
  type VisitVerificationDetail,
} from "../../api/visitVerifications";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import "./VisitAuthConfirmPage.css";

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

export default function VisitAuthConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [detail, setDetail] = useState<VisitVerificationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showSkeleton = useDelayedLoading(!detail && !error);
  const [now, setNow] = useState(() => Date.now());
  const [resultOpen, setResultOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    const numericId = Number(id);
    if (!numericId) {
      setError("잘못된 접근입니다.");
      return;
    }
    getVisitVerification(numericId)
      .then(setDetail)
      .catch((err) => setError(err instanceof ApiError ? err.message : "정보를 불러오지 못했습니다."));
  };

  useEffect(load, [id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return (
      <>
        <PageHeader title="방문 인증 상세" />
        <section className="panel">
          <p>{error}</p>
        </section>
      </>
    );
  }

  if (!detail) {
    if (!showSkeleton) return null;
    return (
      <>
        <PageHeader title="방문 인증 상세" />
        <section className="panel">
          <Skeleton height={80} />
        </section>
      </>
    );
  }

  const completed = detail.status === "VERIFIED";
  const failed = detail.status === "FAILED";
  const remainingSeconds = Math.max(0, Math.floor((new Date(detail.expiresAt).getTime() - now) / 1000));
  const expired = detail.status === "EXPIRED" || (detail.status === "ISSUED" && remainingSeconds <= 0);
  const actionable = detail.status === "ISSUED" && !expired;

  const handleApprove = async () => {
    setBusy(true);
    try {
      await approveVerification(detail.id);
      showToast("방문 인증이 완료되었습니다.", "success");
      setResultOpen(true);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "인증 승인에 실패했습니다.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast("거절 사유를 입력해주세요.", "info");
      return;
    }
    setBusy(true);
    try {
      await rejectVerification(detail.id, rejectReason.trim());
      showToast("방문 인증을 거절했습니다.", "success");
      setRejecting(false);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "인증 거절에 실패했습니다.", "error");
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = completed
    ? "인증 완료"
    : failed
      ? "거절됨"
      : expired
        ? "시간 만료"
        : "방문 예정";
  const statusTone = completed ? "success" : failed || expired ? "danger" : "primary";

  return (
    <>
      <PageHeader title="방문 인증 상세" />

      <section className="panel visit-detail-strip">
        <div>
          <span className="strip-icon">
            <IdCard size={16} />
          </span>
          <div>
            <p className="strip-label">인증 번호</p>
            <p className="strip-value">{detail.verificationCode}</p>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="strip-label">현재 상태</p>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="strip-label">방문 예정 시간</p>
            <p className="strip-value">{formatDateTime(detail.expectedArrivalAt ?? detail.issuedAt)}</p>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <Timer size={16} />
          </span>
          <div>
            <p className="strip-label">남은 시간</p>
            <p className={`strip-value ${expired ? "text-danger" : "text-warning"}`}>
              {actionable ? formatCountdown(remainingSeconds) : expired ? "만료됨" : "-"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-2" style={{ margin: "20px 0", alignItems: "start" }}>
        <section className="panel">
          <p className="panel-title">방문 인증 세션 정보</p>
          <dl className="kv-list">
            <div>
              <dt>고객 제시 인증 번호</dt>
              <dd>{detail.verificationCode}</dd>
            </div>
            <div>
              <dt>고객명</dt>
              <dd>{detail.user.realName ?? "-"}</dd>
            </div>
            <div>
              <dt>방문 장소</dt>
              <dd>{detail.place.name}</dd>
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
              <dt>만료 예정 시각</dt>
              <dd>{formatDateTime(detail.expiresAt)}</dd>
            </div>
            {detail.failReason && (
              <div>
                <dt>거절 사유</dt>
                <dd>{detail.failReason}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="panel">
          <p className="panel-title">
            <Info size={15} /> 처리 안내
          </p>
          <ul className="guide-bullets">
            <li>고객이 보여준 인증 번호와 동일한지 확인하세요.</li>
            <li>인증 완료 시 사용자 방문 상태가 즉시 반영됩니다.</li>
            <li>완료 처리된 세션은 관리자 목록에서 '인증 완료' 상태로 이동합니다.</li>
            <li>잘못 처리한 경우 운영자에게 문의하세요.</li>
          </ul>
        </section>
      </div>

      <section className="panel confirm-box">
        <span className="confirm-box-icon">
          <ShieldCheck size={20} />
        </span>
        <div className="confirm-box-text">
          <p className="confirm-box-title">
            {completed
              ? "방문 인증이 완료되었습니다"
              : failed
                ? "방문 인증이 거절되었습니다"
                : expired
                  ? "인증 가능 시간이 만료되었습니다"
                  : "방문 인증 하시겠습니까?"}
          </p>
          <p className="confirm-box-desc">
            {completed
              ? "해당 세션은 완료된 인증 목록으로 이동했습니다."
              : failed
                ? "해당 세션은 거절 처리되었습니다."
                : expired
                  ? "인증번호 유효시간이 지나 더 이상 인증할 수 없어요. 고객에게 다시 방문 인증을 요청해주세요."
                  : "인증을 완료하면 사용자의 방문 상태가 '인증 완료'로 변경되며, 해당 세션은 완료된 인증 목록으로 이동합니다."}
          </p>
        </div>
        <div className="confirm-box-actions">
          <Button variant="secondary" disabled={!actionable || busy} onClick={() => setRejecting(true)}>
            거절
          </Button>
          <Button onClick={handleApprove} disabled={!actionable || busy}>
            {completed ? "처리 완료" : expired ? "만료됨" : failed ? "거절됨" : "방문 인증 완료"}
          </Button>
        </div>
      </section>

      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        title="방문 인증을 거절할까요?"
        description="거절 사유를 입력해주세요."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(false)} disabled={busy}>
              취소
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={busy}>
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

      <Modal
        open={resultOpen}
        onClose={() => navigate("/visit-auth")}
        title="방문 인증이 완료되었습니다"
        description={`인증 번호 ${detail.verificationCode}의 방문 상태가 '인증 완료'로 변경되었습니다.`}
        footer={<Button onClick={() => navigate("/visit-auth")}>확인</Button>}
      >
        <div className="confirm-result">
          <CheckCircle2 size={40} className="confirm-result-icon" />
        </div>
      </Modal>
    </>
  );
}
