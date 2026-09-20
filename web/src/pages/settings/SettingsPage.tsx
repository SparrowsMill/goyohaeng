import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogOut,
  UserX,
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Lock,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { ApiError } from "../../api/client";
import { changePassword, deleteMyAccount, getMyAccount, type MyAccount } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import "./SettingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [account, setAccount] = useState<MyAccount | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMyAccount()
      .then(setAccount)
      .catch((err) => showToast(err instanceof ApiError ? err.message : "계정 정보를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) {
      showToast("현재 비밀번호와 새 비밀번호를 입력해주세요.", "info");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      showToast("새 비밀번호가 일치하지 않습니다.", "info");
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      showToast("비밀번호가 변경되었습니다.", "success");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "비밀번호 변경에 실패했습니다.", "error");
    } finally {
      setChangingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      showToast("회원 탈퇴가 완료되었습니다.", "success");
      logout();
      navigate("/login");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "회원 탈퇴에 실패했습니다.", "error");
      setDeleting(false);
    }
  };

  if (loading) {
    if (!showSkeleton) return null;
    return (
      <div className="settings-page">
        <PageHeader
          title="계정 관리"
          icon={<img src="/assets/account-settings.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
          iconPlain
          hideSettings
        />
        <Skeleton height={200} />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <PageHeader
        icon={<img src="/assets/account-settings.png" alt="" className="page-title-icon-img page-title-icon-img-nudge" />}
        iconPlain
        title="계정 관리"
        hideSettings
      />

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <section className="panel">
          <div className="card-head" style={{ marginBottom: 20 }}>
            <span className="card-head-icon">
              <User size={18} />
            </span>
            <div>
              <p className="card-head-title">기본 정보</p>
              <p className="card-head-desc">기본적인 계정 정보를 확인할 수 있습니다.</p>
            </div>
          </div>
          <div className="settings-field-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Field label="아이디" icon={<User size={16} />} value={account?.account.username ?? ""} disabled />
            <Field label="전화번호" icon={<Phone size={16} />} value={account?.account.phone ?? "-"} disabled />
            <Field label="이메일" icon={<Mail size={16} />} value={account?.account.email ?? "-"} disabled />
          </div>
        </section>

        <section className="panel">
          <div className="card-head" style={{ marginBottom: 20 }}>
            <span className="card-head-icon">
              <Building2 size={18} />
            </span>
            <div>
              <p className="card-head-title">사업자 정보</p>
              <p className="card-head-desc">등록된 사업자 정보를 확인할 수 있습니다.</p>
            </div>
          </div>
          <div className="settings-field-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Field label="사업자명" icon={<Building2 size={16} />} value={account?.business.businessName ?? ""} disabled />
            <Field
              label="사업자등록번호"
              icon={<CreditCard size={16} />}
              value={account?.business.businessRegistrationNo ?? ""}
              disabled
            />
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header" style={{ alignItems: "flex-start" }}>
          <div className="card-head">
            <span className="card-head-icon">
              <Lock size={18} />
            </span>
            <div>
              <p className="card-head-title">비밀번호 변경</p>
              <p className="card-head-desc">계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.</p>
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={changingPw}>
            {changingPw ? "변경 중..." : "변경"}
          </Button>
        </div>
        <div className="settings-field-grid">
          <Field
            label="현재 비밀번호"
            icon={<Lock size={16} />}
            type={showPw ? "text" : "password"}
            placeholder="현재 비밀번호를 입력해주세요."
            value={pwForm.current}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            suffix={
              <button type="button" className="field-icon-btn" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            }
          />
          <Field
            label="새 비밀번호"
            icon={<Lock size={16} />}
            type={showPw ? "text" : "password"}
            placeholder="새 비밀번호를 입력해주세요."
            value={pwForm.next}
            onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
            suffix={
              <button type="button" className="field-icon-btn" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            }
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <Field
              label="새 비밀번호 확인"
              icon={<Lock size={16} />}
              type={showPw ? "text" : "password"}
              placeholder="새 비밀번호를 다시 입력해주세요."
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              suffix={
                <button type="button" className="field-icon-btn" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              }
            />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="card-head" style={{ marginBottom: 20 }}>
          <span className="card-head-icon">
            <LogOut size={18} />
          </span>
          <div>
            <p className="card-head-title">로그아웃 / 탈퇴</p>
            <p className="card-head-desc">계정에서 로그아웃하거나 탈퇴할 수 있습니다.</p>
          </div>
        </div>
        <div className="account-manage-row">
          <div className="account-manage-item">
            <span className="account-manage-icon">
              <LogOut size={16} />
            </span>
            <div>
              <p className="account-manage-title">로그아웃</p>
              <p className="account-manage-desc">현재 계정에서 로그아웃합니다.</p>
            </div>
            <button className="btn btn-secondary account-manage-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
          <div className="account-manage-item">
            <span className="account-manage-icon danger">
              <UserX size={16} />
            </span>
            <div>
              <p className="account-manage-title">회원 탈퇴</p>
              <p className="account-manage-desc">탈퇴 시 관리자 계정 정보가 삭제됩니다.</p>
            </div>
            <button className="account-manage-danger-btn" onClick={() => setDeleteOpen(true)}>
              회원 탈퇴
            </button>
          </div>
        </div>
      </section>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="회원 탈퇴를 진행할까요?"
        description="탈퇴하면 관리자 계정 정보가 삭제되며 되돌릴 수 없습니다."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? "처리 중..." : "탈퇴"}
            </Button>
          </>
        }
      />
    </div>
  );
}
