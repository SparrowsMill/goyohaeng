import { useParams } from "react-router-dom";
import { IdCard, CalendarClock, Timer, ShieldCheck, Gift, Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import "./VisitAuthConfirmPage.css";

const history = [
  { code: "482914", nickname: "minji_jeonju", status: "인증 완료", tone: "success" as const, created: "2025-05-20 13:35:18", processed: "2025-05-20 13:40:55", by: "고요행 관리자" },
  { code: "482913", nickname: "travel_lover", status: "방문 예정", tone: "primary" as const, created: "2025-05-20 13:28:47", processed: "-", by: "-" },
  { code: "482912", nickname: "happy_day", status: "시간 만료", tone: "danger" as const, created: "2025-05-20 12:18:32", processed: "2025-05-20 12:48:32", by: "자동 만료" },
];

export default function VisitAuthConfirmPage() {
  const { id } = useParams();
  const code = id ?? "482915";

  return (
    <>
      <PageHeader title="방문 인증 상세" subtitle="도착한 고객의 인증 번호와 혜택 정보를 확인하고 방문 인증을 완료하세요." />

      <section className="panel visit-detail-strip">
        <div>
          <span className="strip-icon">
            <IdCard size={16} />
          </span>
          <div>
            <p className="strip-label">인증 번호</p>
            <p className="strip-value">{code}</p>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="strip-label">현재 상태</p>
            <Badge tone="primary">방문 예정</Badge>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="strip-label">방문 예정 시간</p>
            <p className="strip-value">2025-05-20 14:02</p>
          </div>
        </div>
        <div>
          <span className="strip-icon">
            <Timer size={16} />
          </span>
          <div>
            <p className="strip-label">남은 시간</p>
            <p className="strip-value text-warning">01:12</p>
          </div>
        </div>
      </section>

      <div className="grid grid-3" style={{ margin: "20px 0", alignItems: "start" }}>
        <section className="panel">
          <p className="panel-title">방문 인증 세션 정보</p>
          <dl className="kv-list">
            <div>
              <dt>고객 제시 인증 번호</dt>
              <dd>{code}</dd>
            </div>
            <div>
              <dt>세션 번호</dt>
              <dd>SESSION-0520-0015</dd>
            </div>
            <div>
              <dt>방문자 닉네임</dt>
              <dd>yejin_travel</dd>
            </div>
            <div>
              <dt>방문 장소</dt>
              <dd>전주 한옥마을</dd>
            </div>
            <div>
              <dt>방문 인원</dt>
              <dd>2명</dd>
            </div>
            <div>
              <dt>생성 시각</dt>
              <dd>2025-05-20 13:47:02</dd>
            </div>
            <div>
              <dt>만료 예정 시각</dt>
              <dd>2025-05-20 14:15:00</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <p className="panel-title">방문 인증 혜택</p>
          <div className="benefit-icon">
            <Gift size={26} />
          </div>
          <dl className="kv-list">
            <div>
              <dt>혜택명</dt>
              <dd>한옥길 전통차 10% 할인</dd>
            </div>
            <div>
              <dt>사용 조건</dt>
              <dd>인증 완료 후 당일 사용 가능</dd>
            </div>
            <div>
              <dt>비고</dt>
              <dd>1회 1인 적용</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <p className="panel-title">
            <Info size={15} /> 처리 안내
          </p>
          <ul className="guide-bullets">
            <li>고객이 보여준 인증 번호와 동일한지 확인하세요.</li>
            <li>인증 완료 시 사용자 방문 상태가 즉시 반영됩니다.</li>
            <li>완료 처리된 세션은 관리자 목록에서 '인증 완료' 상태로 이동합니다.</li>
            <li>잘못 처리한 경우 운영자에게 문의하세요.</li>
          </ul>
        </section>
      </div>

      <section className="panel confirm-box">
        <span className="confirm-box-icon">
          <ShieldCheck size={20} />
        </span>
        <div className="confirm-box-text">
          <p className="confirm-box-title">방문 인증 하시겠습니까?</p>
          <p className="confirm-box-desc">
            인증을 완료하면 사용자의 방문 상태가 '인증 완료'로 변경되며, 해당 세션은 완료된 인증 목록으로 이동합니다.
          </p>
        </div>
        <div className="confirm-box-actions">
          <Button variant="secondary">취소</Button>
          <Button>방문 인증 완료</Button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="panel-title">최근 처리 이력</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>인증 번호</th>
                <th>방문자 닉네임</th>
                <th>상태</th>
                <th>생성 시각</th>
                <th>처리 시각</th>
                <th>처리자</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.code}>
                  <td className="mono">{h.code}</td>
                  <td>{h.nickname}</td>
                  <td>
                    <Badge tone={h.tone}>{h.status}</Badge>
                  </td>
                  <td>{h.created}</td>
                  <td>{h.processed}</td>
                  <td>{h.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
