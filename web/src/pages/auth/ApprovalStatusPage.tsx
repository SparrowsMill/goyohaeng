import { Link } from "react-router-dom";
import {
  Hourglass,
  User,
  Clock,
  MessageSquare,
  XCircle,
  FileX,
  AlertCircle,
  CheckCircle2,
  Sprout,
} from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import InfoBox from "../../components/ui/InfoBox";
import "./AuthForm.css";

type ApprovalStatus = "pending" | "approved" | "rejected";

const applicant = {
  name: "김다연",
  birth: "1995.05.20",
  phone: "010-1234-5678",
  email: "dayeon@goyo.com",
  bizName: "다연 한옥찻집",
  bizNumber: "123-45-67890",
  address: "전북 전주시 완산구 한옥마을길 27",
};

export default function ApprovalStatusPage({ status }: { status: ApprovalStatus }) {
  if (status === "pending") {
    return (
      <>
        <AuthHeader title="승인 대기" subtitle="관리자 승인 요청이 현재 심사 중입니다." />
        <span className="auth-status-pill" style={{ color: "var(--color-warning)" }}>
          <Hourglass size={15} /> 심사 중
        </span>

        <div className="auth-form">
          <InfoBox
            icon={<User size={16} />}
            title="현재 승인 대기 상태입니다."
            description="관리자가 요청 내용을 확인 후 승인 절차를 진행하고 있습니다."
          />
          <InfoBox
            icon={<Clock size={16} />}
            title={<span style={{ color: "var(--color-text-faint)", fontWeight: 500 }}>평균 승인 시간</span>}
            description={<span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>12~36시간</span>}
          />
          <InfoBox
            icon={<MessageSquare size={16} />}
            title="승인 완료 시 등록한 전화번호로 문자 안내가 발송됩니다."
          />

          <Link to="/login" className="btn btn-primary btn-full">
            로그인으로 돌아가기
          </Link>
        </div>
      </>
    );
  }

  if (status === "rejected") {
    return (
      <>
        <AuthHeader title="승인 거절" subtitle="관리자 승인 요청이 반려되었습니다." />
        <span className="auth-status-pill" style={{ color: "var(--color-danger)" }}>
          <XCircle size={15} /> 승인 거절
        </span>

        <div className="auth-form">
          <InfoBox
            icon={<FileX size={16} />}
            title="승인 거절 사유"
            description="사업자 등록 정보와 매장 주소 확인이 어려워 승인이 반려되었습니다. 정보를 수정한 뒤 다시 신청해주세요."
          />
          <InfoBox
            icon={<AlertCircle size={16} />}
            title="안내"
            description="확인 버튼을 누르면 기존에 확인에 사용하던 아이디와 비밀번호는 만료됩니다."
          />
          <InfoBox icon={<MessageSquare size={16} />} title="수정 후 다시 관리자 승인 요청을 진행해 주세요." />

          <Link to="/signup" className="btn btn-primary btn-full">
            확인
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthHeader title="승인 완료" subtitle="관리자 승인 요청이 승인되었습니다." />
      <span className="auth-status-pill" style={{ color: "var(--color-success)" }}>
        <CheckCircle2 size={15} /> 승인 완료
      </span>

      <div className="auth-form">
        <p style={{ fontSize: 14, fontWeight: 700 }}>승인 요청 정보</p>
        <dl className="auth-summary-table" style={{ marginTop: -8 }}>
          <div className="auth-summary-item">
            <dt>이름</dt>
            <dd>{applicant.name}</dd>
          </div>
          <div className="auth-summary-item">
            <dt>사업자명</dt>
            <dd>{applicant.bizName}</dd>
          </div>
          <div className="auth-summary-item">
            <dt>생년월일</dt>
            <dd>{applicant.birth}</dd>
          </div>
          <div className="auth-summary-item">
            <dt>사업자등록번호</dt>
            <dd>{applicant.bizNumber}</dd>
          </div>
          <div className="auth-summary-item">
            <dt>전화번호</dt>
            <dd>{applicant.phone}</dd>
          </div>
          <div className="auth-summary-item">
            <dt>매장 주소</dt>
            <dd>{applicant.address}</dd>
          </div>
          <div className="auth-summary-item">
            <dt>이메일</dt>
            <dd>{applicant.email}</dd>
          </div>
        </dl>

        <InfoBox
          tone="primary"
          icon={<AlertCircle size={16} />}
          title="안내"
          description="확인 버튼을 누른 후 기존에 확인에 사용하던 아이디와 비밀번호로 정식 계정 로그인할 수 있습니다. 승인이 완료되어 계정이 활성화되었습니다."
        />
        <InfoBox
          icon={<Sprout size={16} />}
          title="이제 정식으로 고요행 관리자(장소 관리자) 페이지에 접속할 수 있습니다."
        />

        <Link to="/" className="btn btn-primary btn-full">
          확인
        </Link>
      </div>
    </>
  );
}
