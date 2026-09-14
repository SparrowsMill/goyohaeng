import { useEffect, useState } from "react";
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
  addressDetail: string;
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
  addressDetail: "",
  username: "",
  password: "",
  passwordConfirm: "",
};

interface DaumPostcodeResult {
  roadAddress: string;
  jibunAddress: string;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeResult) => void }) => {
        open: (position?: { left: number; top: number }) => void;
      };
    };
  }
}

const DAUM_POSTCODE_SRC = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadDaumPostcodeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${DAUM_POSTCODE_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("주소 검색 스크립트를 불러오지 못했습니다.")));
      return;
    }
    const script = document.createElement("script");
    script.src = DAUM_POSTCODE_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("주소 검색 스크립트를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

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

const STEP_TITLES = ["기본 정보", "사업자 정보", "계정 정보"];
const STEP_FIELDS: (keyof FormState)[][] = [
  ["name", "birthDate", "phone", "email"],
  ["businessName", "businessNumber", "address"],
  ["username", "password", "passwordConfirm"],
];
const LAST_STEP = STEP_FIELDS.length - 1;

function validateFields(form: FormState, keys: (keyof FormState)[]) {
  const nextErrors: Partial<Record<keyof FormState, string>> = {};
  for (const key of keys) {
    if (key === "name" && !form.name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (key === "birthDate") {
      if (!form.birthDate.trim()) nextErrors.birthDate = "생년월일을 입력해주세요.";
      else if (!BIRTH_DATE_PATTERN.test(form.birthDate.trim())) nextErrors.birthDate = "YYYY.MM.DD 형식으로 입력해주세요.";
    }
    if (key === "phone" && !form.phone.trim()) nextErrors.phone = "전화번호를 입력해주세요.";
    if (key === "email") {
      if (!form.email.trim()) nextErrors.email = "이메일을 입력해주세요.";
      else if (!EMAIL_PATTERN.test(form.email)) nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }
    if (key === "businessName" && !form.businessName.trim()) nextErrors.businessName = "사업자명을 입력해주세요.";
    if (key === "businessNumber" && !form.businessNumber.trim()) nextErrors.businessNumber = "사업자등록번호를 입력해주세요.";
    if (key === "address" && !form.address.trim()) nextErrors.address = "매장 주소를 입력해주세요.";
    if (key === "username" && !form.username.trim()) nextErrors.username = "아이디를 입력해주세요.";
    if (key === "password") {
      if (!form.password) nextErrors.password = "비밀번호를 입력해주세요.";
      else if (form.password.length < 8) nextErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    }
    if (key === "passwordConfirm") {
      if (!form.passwordConfirm) nextErrors.passwordConfirm = "비밀번호를 다시 입력해주세요.";
      else if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
  }
  return nextErrors;
}

export default function SignupRequestPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);

  // 미리 로드해둬야 클릭 핸들러가 동기적으로 open()을 호출할 수 있어서 팝업 차단을 피할 수 있다.
  useEffect(() => {
    loadDaumPostcodeScript().catch(() => {});
  }, []);

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

  const openPostcode = () => {
    const width = 500;
    const height = 600;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    new window.daum!.Postcode({
      oncomplete: (data) => {
        setForm((prev) => ({ ...prev, address: data.roadAddress || data.jibunAddress }));
        clearError("address");
      },
    }).open({ left, top });
  };

  const handleAddressSearch = () => {
    // 스크립트가 이미 로드돼 있으면(대부분의 경우) 클릭 핸들러 안에서 바로 동기 호출해야
    // 브라우저가 사용자 제스처로 인식해 팝업 차단을 하지 않는다.
    if (window.daum?.Postcode) {
      openPostcode();
      return;
    }
    setSearchingAddress(true);
    loadDaumPostcodeScript()
      .then(openPostcode)
      .catch((err) => showToast(err instanceof Error ? err.message : "주소 검색을 불러오지 못했습니다.", "error"))
      .finally(() => setSearchingAddress(false));
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const keys = STEP_FIELDS[step];
    const stepErrors = validateFields(form, keys);
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of keys) next[key] = stepErrors[key];
      return next;
    });
    if (Object.keys(stepErrors).length > 0) return;

    if (step < LAST_STEP) {
      setStep((s) => s + 1);
      return;
    }

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
        submittedStoreAddress: [form.address.trim(), form.addressDetail.trim()].filter(Boolean).join(" "),
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

      <div className="signup-steps">
        <div className="signup-steps-track">
          <div className="signup-steps-fill" style={{ width: `${((step + 1) / STEP_FIELDS.length) * 100}%` }} />
        </div>
        <div className="signup-steps-labels">
          {STEP_TITLES.map((title, i) => (
            <span key={title} className={`signup-step-label ${i <= step ? "done" : ""} ${i === step ? "current" : ""}`}>
              <span className="signup-step-index">{i + 1}</span>
              {title}
            </span>
          ))}
        </div>
      </div>

      <form className="auth-form" onSubmit={handleStepSubmit} noValidate>
        <div className="auth-step-content" key={step}>
          {step === 0 && (
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
                  autoFocus
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
          )}

          {step === 1 && (
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
                  autoFocus
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
                <div className="field-with-action" style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="매장 주소"
                    icon={<MapPin size={16} />}
                    placeholder="주소 검색을 눌러주세요"
                    value={form.address}
                    readOnly
                    error={errors.address}
                  />
                  <button
                    type="button"
                    className="field-action-btn"
                    onClick={handleAddressSearch}
                    disabled={searchingAddress}
                  >
                    {searchingAddress ? "불러오는 중..." : "주소 검색"}
                  </button>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="상세 주소"
                    icon={<MapPin size={16} />}
                    placeholder="동/호수 등 상세 주소 (선택)"
                    value={form.addressDetail}
                    onChange={update("addressDetail")}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
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
                    autoFocus
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
            </div>
          )}
        </div>

        <div className="signup-step-nav">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={handleBack} disabled={submitting}>
              이전
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {step < LAST_STEP ? "다음" : submitting ? "요청 중..." : "승인 요청 보내기"}
          </Button>
        </div>

        <p className="auth-form-footnote">
          이미 요청하셨나요? <Link to="/login">로그인 후 승인 결과 확인</Link>
        </p>
      </form>
    </>
  );
}
