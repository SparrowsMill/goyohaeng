export default function VisitAuthManagePage() {
  return (
    <div>
      <h1>방문 인증 관리</h1>
      <p>방문인증 ON/OFF 토글 (기본: 운영시간 연동 자동 / 수동 전환 가능)</p>
      <p>방문예정 리스트: 6자리 인증번호 · 만료시간 · 상태(방문예정/인증완료/시간만료)</p>
      <button>방문인증가능시간 수정</button>
    </div>
  );
}
