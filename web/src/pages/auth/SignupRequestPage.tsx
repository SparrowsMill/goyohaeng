import { Link } from "react-router-dom";
import { Info, ShieldCheck } from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import InfoBox from "../../components/ui/InfoBox";
import "./AuthForm.css";

export default function SignupRequestPage() {
  return (
    <>
      <AuthHeader
        title="관리자 승인 요청"
        subtitle="관리자 계정 승인을 요청하시면 운영진의 검토 후 승인됩니다."
      />

      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <div className="auth-section">
          <p className="auth-section-title">
            <span className="auth-section-step">1</span>기본 정보
          </p>
          <div className="auth-field-grid">
            <Field label="이름" placeholder="이름을 입력하세요" />
            <Field label="생년월일" placeholder="YYYY.MM.DD" />
            <Field label="전화번호" placeholder="010-1234-5678" />
            <Field label="이메일" placeholder="example@email.com" />
          </div>
        </div>

        <div className="auth-section">
          <p className="auth-section-title">
            <span className="auth-section-step">2</span>사업자 정보
          </p>
          <div className="auth-field-grid">
            <Field label="사업자명" placeholder="사업자명을 입력하세요" />
            <Field label="사업자등록번호" placeholder="000-00-00000" />
            <Field label="매장 주소" placeholder="매장 주소를 입력하세요" />
          </div>
        </div>

        <div className="auth-section">
          <p className="auth-section-title">
            <span className="auth-section-step">3</span>관리자 계정 정보
          </p>
          <div className="auth-field-grid">
            <div className="field-with-action">
              <Field label="아이디" placeholder="아이디를 입력하세요" />
              <button type="button" className="field-action-btn">
                중복 확인
              </button>
            </div>
            <Field label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" />
            <Field label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력하세요" />
          </div>
        </div>

        <InfoBox
          tone="primary"
          icon={<Info size={16} />}
          title="입력하신 정보는 관리자 승인 검토에 사용됩니다."
          description={
            <>
              <ShieldCheck size={13} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
              승인 완료 후 설정한 아이디와 비밀번호로 로그인할 수 있습니다.
            </>
          }
        />

        <Button type="submit" full>
          승인 요청 보내기
        </Button>

        <p className="auth-form-footnote">
          이미 요청하셨나요? <Link to="/approval-pending">로그인 후 승인 결과 확인</Link>
        </p>
      </form>
    </>
  );
}
