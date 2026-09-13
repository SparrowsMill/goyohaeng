import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IdCard, CalendarClock, Timer, ShieldCheck, Gift, Info, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import "./VisitAuthConfirmPage.css";

const INITIAL_REMAINING_SECONDS = 72; // 01:12

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VisitAuthConfirmPage() {
  const { id } = useParams();
  const code = id ?? "482915";
  const { showToast } = useToast();
  const [completed, setCompleted] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(INITIAL_REMAINING_SECONDS);

  useEffect(() => {
    if (completed || remainingSeconds <= 0) return;
    const timer = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingSeconds, completed]);

  const expired = remainingSeconds <= 0 && !completed;

  const handleConfirm = () => {
    setCompleted(true);
    setResultOpen(true);
    showToast("방문 인증이 완료되었습니다.", "success");
  };

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
            <p className="strip-value">{code}</p>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="strip-label">현재 상태</p>
            <Badge tone={completed ? "success" : expired ? "danger" : "primary"}>
              {completed ? "인증 완료" : expired ? "시간 만료" : "방문 예정"}
            </Badge>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="strip-label">방문 예정 시간</p>
            <p className="strip-value">2025-05-20 14:02</p>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <Timer size={16} />
          </span>
          <div>
            <p className="strip-label">남은 시간</p>
            <p className={`strip-value ${expired ? "text-danger" : "text-warning"}`}>
              {expired ? "만료됨" : formatCountdown(remainingSeconds)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-3" style={{ margin: "20px 0", alignItems: "start" }}>
        <section className="panel">
          <p className="panel-title">방문 인증 세션 정보</p>
          <dl className="kv-list">
            <div>
              <dt>고객 제시 인증 번호</dt>
              <dd>{code}</dd>
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
            <div>
              <dt>생성 시각</dt>
              <dd>2025-05-20 13:47:02</dd>
            </div>
            <div>
              <dt>만료 예정 시각</dt>
              <dd>2025-05-20 14:15:00</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <p className="panel-title">방문 인증 혜택</p>
          <div className="benefit-icon">
            <Gift size={26} />
          </div>
          <dl className="kv-list">
            <div>
              <dt>혜택명</dt>
              <dd>한옥길 전통차 10% 할인</dd>
            </div>
            <div>
              <dt>사용 조건</dt>
              <dd>인증 완료 후 당일 사용 가능</dd>
            </div>
            <div>
              <dt>비고</dt>
              <dd>1회 1인 적용</dd>
            </div>
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
              : expired
                ? "인증 가능 시간이 만료되었습니다"
                : "방문 인증 하시겠습니까?"}
          </p>
          <p className="confirm-box-desc">
            {completed
              ? "해당 세션은 완료된 인증 목록으로 이동했습니다."
              : expired
                ? "인증번호 유효시간이 지나 더 이상 인증할 수 없어요. 고객에게 다시 방문 인증을 요청해주세요."
                : "인증을 완료하면 사용자의 방문 상태가 '인증 완료'로 변경되며, 해당 세션은 완료된 인증 목록으로 이동합니다."}
          </p>
        </div>
        <div className="confirm-box-actions">
          <Button variant="secondary" disabled={completed || expired}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={completed || expired}>
            {completed ? "처리 완료" : expired ? "만료됨" : "방문 인증 완료"}
          </Button>
        </div>
      </section>

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title="방문 인증이 완료되었습니다"
        description={`인증 번호 ${code}의 방문 상태가 '인증 완료'로 변경되었습니다.`}
        footer={<Button onClick={() => setResultOpen(false)}>확인</Button>}
      >
        <div className="confirm-result">
          <CheckCircle2 size={40} className="confirm-result-icon" />
        </div>
      </Modal>
    </>
  );
}
