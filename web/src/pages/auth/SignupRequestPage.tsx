import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, ShieldCheck } from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import InfoBox from "../../components/ui/InfoBox";
import "./AuthForm.css";

interface FormState {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  businessName: string;
  businessNumber: string;
  address: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

const initialForm: FormState = {
  name: "",
  birthDate: "",
  phone: "",
  email: "",
  businessName: "",
  businessNumber: "",
  address: "",
  username: "",
  password: "",
  passwordConfirm: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (!form.birthDate.trim()) nextErrors.birthDate = "생년월일을 입력해주세요.";
    if (!form.phone.trim()) nextErrors.phone = "전화번호를 입력해주세요.";
    if (!form.email.trim()) nextErrors.email = "이메일을 입력해주세요.";
    else if (!EMAIL_PATTERN.test(form.email)) nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    if (!form.businessName.trim()) nextErrors.businessName = "사업자명을 입력해주세요.";
    if (!form.businessNumber.trim()) nextErrors.businessNumber = "사업자등록번호를 입력해주세요.";
    if (!form.address.trim()) nextErrors.address = "매장 주소를 입력해주세요.";
    if (!form.username.trim()) nextErrors.username = "아이디를 입력해주세요.";
    if (!form.password) nextErrors.password = "비밀번호를 입력해주세요.";
    else if (form.password.length < 8) nextErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (!form.passwordConfirm) nextErrors.passwordConfirm = "비밀번호를 다시 입력해주세요.";
    else if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      navigate("/approval-pending");
    }
  };

  return (
    <>
      <AuthHeader
        title="관리자 승인 요청"
        subtitle="관리자 계정 승인을 요청하시면 운영진의 검토 후 승인됩니다."
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-section">
          <p className="auth-section-title">
            <span className="auth-section-step">1</span>기본 정보
          </p>
          <div className="auth-field-grid">
            <Field label="이름" placeholder="이름을 입력하세요" value={form.name} onChange={update("name")} error={errors.name} />
            <Field
              label="생년월일"
              placeholder="YYYY.MM.DD"
              value={form.birthDate}
              onChange={update("birthDate")}
              error={errors.birthDate}
            />
            <Field
              label="전화번호"
              placeholder="010-1234-5678"
              value={form.phone}
              onChange={update("phone")}
              error={errors.phone}
            />
            <Field
              label="이메일"
              placeholder="example@email.com"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
            />
          </div>
        </div>

        <div className="auth-section">
          <p className="auth-section-title">
            <span className="auth-section-step">2</span>사업자 정보
          </p>
          <div className="auth-field-grid">
            <Field
              label="사업자명"
              placeholder="사업자명을 입력하세요"
              value={form.businessName}
              onChange={update("businessName")}
              error={errors.businessName}
            />
            <Field
              label="사업자등록번호"
              placeholder="000-00-00000"
              value={form.businessNumber}
              onChange={update("businessNumber")}
              error={errors.businessNumber}
            />
            <Field
              label="매장 주소"
              placeholder="매장 주소를 입력하세요"
              value={form.address}
              onChange={update("address")}
              error={errors.address}
            />
          </div>
        </div>

        <div className="auth-section">
          <p className="auth-section-title">
            <span className="auth-section-step">3</span>관리자 계정 정보
          </p>
          <div className="auth-field-grid">
            <div className="field-with-action">
              <Field
                label="아이디"
                placeholder="아이디를 입력하세요"
                value={form.username}
                onChange={update("username")}
                error={errors.username}
              />
              <button type="button" className="field-action-btn">
                중복 확인
              </button>
            </div>
            <Field
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
            />
            <Field
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm}
              onChange={update("passwordConfirm")}
              error={errors.passwordConfirm}
            />
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
