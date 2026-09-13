import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, ShieldCheck, Calendar, Eye, EyeOff, User, Phone, Mail, Building2, Hash, MapPin, Lock } from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import InfoBox from "../../components/ui/InfoBox";
import { useToast } from "../../components/ui/Toast";
import { checkUsername, signup } from "../../api/auth";
import { ApiError } from "../../api/client";
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
const BIRTH_DATE_PATTERN = /^\d{4}[.-]\d{2}[.-]\d{2}$/;

function toIsoDate(value: string) {
  return value.replace(/\./g, "-");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatBizNo(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export default function SignupRequestPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const clearError = (key: keyof FormState) => {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleCheckUsername = async () => {
    if (!form.username.trim()) {
      setErrors((prev) => ({ ...prev, username: "아이디를 입력해주세요." }));
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await checkUsername(form.username.trim());
      showToast(
        res.available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.",
        res.available ? "success" : "error"
      );
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "중복 확인에 실패했습니다.", "error");
    } finally {
      setCheckingUsername(false);
    }
  };

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    clearError(key);
  };

  const updatePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
    clearError("phone");
  };

  const updateBizNo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, businessNumber: formatBizNo(e.target.value) }));
    clearError("businessNumber");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (!form.birthDate.trim()) nextErrors.birthDate = "생년월일을 입력해주세요.";
    else if (!BIRTH_DATE_PATTERN.test(form.birthDate.trim()))
      nextErrors.birthDate = "YYYY.MM.DD 형식으로 입력해주세요.";
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
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signup({
        username: form.username.trim(),
        password: form.password,
        realName: form.name.trim(),
        birthDate: toIsoDate(form.birthDate.trim()),
        email: form.email.trim(),
        phone: form.phone.trim(),
        businessName: form.businessName.trim(),
        businessRegistrationNo: form.businessNumber.trim(),
        submittedStoreAddress: form.address.trim(),
      });
      showToast("가입 신청이 완료되었습니다. 로그인 후 승인 상태를 확인해주세요.", "success");
      navigate("/login");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "가입 신청에 실패했습니다.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthHeader
        title="관리자 승인 요청"
        subtitle="관리자 계정 승인을 요청하시면 운영진의 검토 후 승인됩니다."
      />
      <div className="auth-divider" />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-section">
          <div className="card-head" style={{ marginBottom: 4 }}>
            <span className="card-head-icon">
              <User size={18} />
            </span>
            <div>
              <p className="card-head-title">기본 정보</p>
              <p className="card-head-desc">가입자 본인 확인을 위한 정보를 입력해주세요.</p>
            </div>
          </div>
          <div className="auth-field-grid">
            <Field
              label="이름"
              icon={<User size={16} />}
              placeholder="이름을 입력하세요"
              value={form.name}
              onChange={update("name")}
              error={errors.name}
            />
            <Field
              label="생년월일"
              icon={<Calendar size={16} />}
              placeholder="YYYY.MM.DD"
              value={form.birthDate}
              onChange={update("birthDate")}
              error={errors.birthDate}
            />
            <Field
              label="전화번호"
              icon={<Phone size={16} />}
              placeholder="010-1234-5678"
              inputMode="numeric"
              value={form.phone}
              onChange={updatePhone}
              error={errors.phone}
            />
            <Field
              label="이메일"
              icon={<Mail size={16} />}
              placeholder="example@email.com"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
            />
          </div>
        </div>

        <div className="auth-section">
          <div className="card-head" style={{ marginBottom: 4 }}>
            <span className="card-head-icon">
              <Building2 size={18} />
            </span>
            <div>
              <p className="card-head-title">사업자 정보</p>
              <p className="card-head-desc">운영 중인 사업장 정보를 입력해주세요.</p>
            </div>
          </div>
          <div className="auth-field-grid">
            <Field
              label="사업자명"
              icon={<Building2 size={16} />}
              placeholder="사업자명을 입력하세요"
              value={form.businessName}
              onChange={update("businessName")}
              error={errors.businessName}
            />
            <Field
              label="사업자등록번호"
              icon={<Hash size={16} />}
              placeholder="000-00-00000"
              inputMode="numeric"
              value={form.businessNumber}
              onChange={updateBizNo}
              error={errors.businessNumber}
            />
            <Field
              label="매장 주소"
              icon={<MapPin size={16} />}
              placeholder="매장 주소를 입력하세요"
              value={form.address}
              onChange={update("address")}
              error={errors.address}
            />
          </div>
        </div>

        <div className="auth-section">
          <div className="card-head" style={{ marginBottom: 4 }}>
            <span className="card-head-icon">
              <Lock size={18} />
            </span>
            <div>
              <p className="card-head-title">관리자 계정 정보</p>
              <p className="card-head-desc">로그인에 사용할 아이디와 비밀번호를 설정해주세요.</p>
            </div>
          </div>
          <div className="auth-field-grid">
            <div className="field-with-action">
              <Field
                label="아이디"
                icon={<User size={16} />}
                placeholder="아이디를 입력하세요"
                value={form.username}
                onChange={update("username")}
                error={errors.username}
              />
              <button
                type="button"
                className="field-action-btn"
                onClick={handleCheckUsername}
                disabled={checkingUsername}
              >
                {checkingUsername ? "확인 중..." : "중복 확인"}
              </button>
            </div>
            <Field
              label="비밀번호"
              icon={<Lock size={16} />}
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
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
            <Field
              label="비밀번호 확인"
              icon={<Lock size={16} />}
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm}
              onChange={update("passwordConfirm")}
              error={errors.passwordConfirm}
              suffix={
                <button
                  type="button"
                  className="field-icon-btn"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  aria-label="비밀번호 확인 표시 전환"
                >
                  {showPasswordConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              }
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

        <Button type="submit" full disabled={submitting}>
          {submitting ? "요청 중..." : "승인 요청 보내기"}
        </Button>

        <p className="auth-form-footnote">
          이미 요청하셨나요? <Link to="/login">로그인 후 승인 결과 확인</Link>
        </p>
      </form>
    </>
  );
}
