import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";
import "./AuthForm.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!username.trim()) nextErrors.username = "아이디를 입력해주세요.";
    if (!password) nextErrors.password = "비밀번호를 입력해주세요.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await login(username.trim(), password);
      navigate(res.businessAccount.status === "APPROVED" ? "/" : "/approval-status");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 401
            ? "아이디나 비밀번호가 올바르지 않습니다."
            : err.message
          : "로그인에 실패했습니다.";
      setErrors({ password: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthHeader title="관리자 로그인" subtitle="고요행 관리자 시스템에 오신 것을 환영합니다." />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field
          label="아이디"
          icon={<User size={16} />}
          placeholder="아이디를 입력하세요"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
        />

        <Field
          label="비밀번호"
          icon={<Lock size={16} />}
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
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

        <Button type="submit" full disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </Button>

        <p className="auth-form-footnote">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </>
  );
}
