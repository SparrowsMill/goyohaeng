import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import "./AuthForm.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <AuthHeader title="관리자 로그인" subtitle="고요행 관리자 시스템에 오신 것을 환영합니다." />

      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <Field label="아이디" icon={<User size={16} />} placeholder="아이디를 입력하세요" />

        <Field
          label="비밀번호"
          icon={<Lock size={16} />}
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호를 입력하세요"
          hint={
            <button type="button" className="field-link">
              비밀번호 찾기
            </button>
          }
          suffix={
            <button
              type="button"
              className="field-icon-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="비밀번호 표시 전환"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          }
        />

        <Button type="submit" full>
          로그인
        </Button>

        <p className="auth-form-footnote">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </>
  );
}
