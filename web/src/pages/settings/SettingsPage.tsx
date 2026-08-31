import { Link } from "react-router-dom";
import { useState } from "react";
import { Pencil, Eye, EyeOff, LogOut, UserX, Home, ShieldCheck, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import "./SettingsPage.css";

export default function SettingsPage() {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="settings-page">
      <PageHeader title="설정" subtitle="관리자 계정 정보와 보안 설정을 관리하세요." hideSettings />

      <div className="grid grid-2" style={{ gridTemplateColumns: "1.8fr 1fr", alignItems: "start" }}>
        <div className="stack">
          <section className="panel">
            <div className="panel-header">
              <p className="panel-title">기본 정보</p>
              <button className="panel-action">
                <Pencil size={12} /> 수정
              </button>
            </div>
            <div className="settings-field-list">
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
          </section>

          <section className="panel">
            <p className="panel-title">비밀번호 변경</p>
            <div className="settings-field-list" style={{ marginTop: 4 }}>
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
              <Button>비밀번호 변경</Button>
            </div>
          </section>

          <section className="panel">
            <p className="panel-title">계정 관리</p>
            <div className="account-manage-row">
              <div className="account-manage-item">
                <span className="account-manage-icon">
                  <LogOut size={16} />
                </span>
                <div>
                  <p className="account-manage-title">로그아웃</p>
                  <p className="account-manage-desc">현재 계정에서 로그아웃합니다.</p>
                  <Link to="/login" className="btn btn-secondary account-manage-btn">
                    로그아웃
                  </Link>
                </div>
              </div>
              <div className="account-manage-item">
                <span className="account-manage-icon danger">
                  <UserX size={16} />
                </span>
                <div>
                  <p className="account-manage-title">회원 탈퇴</p>
                  <p className="account-manage-desc">탈퇴 시 관리자 계정 정보가 삭제됩니다.</p>
                  <button className="btn btn-danger account-manage-btn">회원 탈퇴</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="panel">
          <p className="panel-title">계정 요약</p>
          <ul className="account-summary-list">
            <li>
              <span className="account-summary-icon">
                <Home size={15} />
              </span>
              관리 장소
              <strong>전주 한옥마을</strong>
            </li>
            <li>
              <span className="account-summary-icon">
                <ShieldCheck size={15} />
              </span>
              관리자 상태
              <Badge tone="success">승인 완료</Badge>
            </li>
            <li>
              <span className="account-summary-icon">
                <Clock size={15} />
              </span>
              최근 로그인
              <strong>2025-05-20 09:12</strong>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
