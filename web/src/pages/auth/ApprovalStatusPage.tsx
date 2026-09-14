import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hourglass, User, Clock, MessageSquare, XCircle, FileX, AlertCircle } from "lucide-react";
import AuthHeader from "../../components/ui/AuthHeader";
import InfoBox from "../../components/ui/InfoBox";
import Skeleton from "../../components/ui/Skeleton";
import { getApprovalStatus, type ApprovalStatusResponse } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import "./AuthForm.css";

export default function ApprovalStatusPage() {
  const navigate = useNavigate();
  const { setBusinessAccount, logout } = useAuth();
  const [data, setData] = useState<ApprovalStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showSkeleton = useDelayedLoading(!data && !error);

  useEffect(() => {
    let cancelled = false;
    getApprovalStatus()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setBusinessAccount({ id: 0, status: res.status, rejectionReason: res.rejectionReason, place: res.place });
        if (res.status === "APPROVED") navigate("/", { replace: true });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "승인 상태를 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <>
        <AuthHeader title="승인 상태 확인 실패" subtitle="승인 상태를 불러오는 중 문제가 발생했습니다." />
        <div className="auth-form">
          <InfoBox tone="danger" icon={<AlertCircle size={16} />} title={error} />
          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </>
    );
  }

  if (!data) {
    if (!showSkeleton) return null;
    return (
      <>
        <AuthHeader title="승인 상태 확인 중" subtitle="잠시만 기다려주세요." />
        <div className="auth-form">
          <Skeleton height={72} />
          <Skeleton height={72} />
        </div>
      </>
    );
  }

  if (data.status === "REJECTED") {
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
            description={data.rejectionReason ?? "사유가 등록되지 않았습니다."}
          />
          <InfoBox
            icon={<AlertCircle size={16} />}
            title="안내"
            description="정보를 수정한 뒤 다시 신청해주세요."
          />

          <Link to="/signup" className="btn btn-primary btn-full">
            다시 신청하기
          </Link>
          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            로그아웃
          </button>
        </div>
      </>
    );
  }

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
          title={<span style={{ color: "var(--color-text-faint)", fontWeight: 500 }}>신청 접수일</span>}
          description={
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>
              {new Date(data.submittedAt).toLocaleDateString("ko-KR")}
            </span>
          }
        />
        <InfoBox
          icon={<MessageSquare size={16} />}
          title="승인 완료 시 등록한 전화번호로 문자 안내가 발송됩니다."
        />

        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          로그아웃
        </button>
      </div>
    </>
  );
}
