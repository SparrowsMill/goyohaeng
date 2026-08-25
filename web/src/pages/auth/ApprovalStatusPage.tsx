type ApprovalStatus = "pending" | "approved" | "rejected";

export default function ApprovalStatusPage({ status }: { status: ApprovalStatus }) {
  if (status === "pending") {
    return (
      <div>
        <h1>승인 대기</h1>
        <p>평균 소요시간 / 현재 상태. 완료 시 문자 발송.</p>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div>
        <h1>승인 완료</h1>
        <p>가입 정보 확인 → 정식 계정으로 로그인 가능</p>
      </div>
    );
  }

  return (
    <div>
      <h1>승인 거절</h1>
      <p>거절 사유 표시. 확인 시 계정 만료.</p>
    </div>
  );
}
