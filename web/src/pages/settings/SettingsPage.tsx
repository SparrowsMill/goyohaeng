import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, LogOut, UserX } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import "./SettingsPage.css";

export default function SettingsPage() {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="settings-page">
      <PageHeader title="설정" hideSettings />

      <div className="section-label">기본 정보</div>
      <div className="settings-field-grid">
        <div className="form-row">
          <label>아이디</label>
          <input className="text-input" defaultValue="jeonju-hanok.kr" disabled />
        </div>
        <div className="form-row">
          <label>전화번호</label>
          <input className="text-input" defaultValue="063-123-4567" disabled />
        </div>
        <div className="form-row">
          <label>이메일</label>
          <input className="text-input" defaultValue="manager@jeonju-hanok.kr" disabled />
        </div>
      </div>

      <div className="section-label">
        비밀번호 변경
        <Button style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}>변경</Button>
      </div>
      <div className="settings-field-grid">
        <div className="form-row">
          <label>현재 비밀번호</label>
          <div className="field-input-wrap">
            <input className="text-input" type={showPw ? "text" : "password"} defaultValue="password123" />
            <button type="button" className="field-icon-btn pw-toggle" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>
        <div className="form-row">
          <label>새 비밀번호</label>
          <div className="field-input-wrap">
            <input className="text-input" type={showPw ? "text" : "password"} defaultValue="password123" />
            <button type="button" className="field-icon-btn pw-toggle" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>
        <div className="form-row">
          <label>새 비밀번호 확인</label>
          <div className="field-input-wrap">
            <input className="text-input" type={showPw ? "text" : "password"} defaultValue="password123" />
            <button type="button" className="field-icon-btn pw-toggle" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>
      </div>

      <div className="section-label">사업자 정보</div>
      <div className="settings-field-grid">
        <div className="form-row">
          <label>사업자명</label>
          <input className="text-input" defaultValue="전주 한옥마을" disabled />
        </div>
        <div className="form-row">
          <label>사업자등록번호</label>
          <input className="text-input" defaultValue="123-45-67890" disabled />
        </div>
      </div>

      <div className="section-label">계정 관리</div>
      <div className="account-manage-row">
        <div className="account-manage-item">
          <span className="account-manage-icon">
            <LogOut size={16} />
          </span>
          <div>
            <p className="account-manage-title">로그아웃</p>
            <p className="account-manage-desc">현재 계정에서 로그아웃합니다.</p>
          </div>
          <Link to="/login" className="btn btn-secondary account-manage-btn">
            로그아웃
          </Link>
        </div>
        <div className="account-manage-item">
          <span className="account-manage-icon danger">
            <UserX size={16} />
          </span>
          <div>
            <p className="account-manage-title">회원 탈퇴</p>
            <p className="account-manage-desc">탈퇴 시 관리자 계정 정보가 삭제됩니다.</p>
          </div>
          <button className="account-manage-danger-btn">회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
}
