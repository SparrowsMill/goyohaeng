import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Trash2, Plus, X, Check } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import "./PlaceManagePage.css";

const initialBenefits = [
  "한복 체험 10% 할인",
  "전통 차 시음 무료 제공",
  "기념품 구매 시 5% 할인",
  "문화 공연 우선 예약 혜택",
];

const hoursSummary = [
  ["월요일", "09:00 ~ 18:00"],
  ["화요일", "09:00 ~ 18:00"],
  ["수요일", "09:00 ~ 18:00"],
  ["목요일", "09:00 ~ 18:00"],
  ["금요일", "09:00 ~ 20:00"],
  ["토요일", "09:00 ~ 20:00"],
  ["일요일", "09:00 ~ 18:00"],
  ["공휴일", "09:00 ~ 18:00"],
];

export default function PlaceManagePage() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [benefits, setBenefits] = useState(initialBenefits);
  const { showToast } = useToast();

  const updateBenefit = (index: number, text: string) => {
    setBenefits((prev) => prev.map((b, i) => (i === index ? text : b)));
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    setBenefits((prev) => [...prev, ""]);
  };

  return (
    <div className="place-page">
      <PageHeader title="장소 관리" hideSettings />

      <section className="place-card">
        <h2 className="place-card-title">기본 정보</h2>

        <div className="place-basic-layout">
          <div className="place-field-grid">
            <div className="form-row">
              <label className="required">장소 이름</label>
              <input className="text-input" defaultValue="전주 한옥마을" />
            </div>
            <div className="form-row">
              <label className="required">카테고리</label>
              <select className="select-input" defaultValue="관광지">
                <option>관광지</option>
                <option>음식점</option>
                <option>카페</option>
                <option>체험시설</option>
              </select>
            </div>
            <div className="form-row">
              <label className="required">주소</label>
              <input className="text-input" defaultValue="전북 전주시 완산구 풍남동3가" />
            </div>
            <div className="form-row">
              <label>전화번호</label>
              <input className="text-input" defaultValue="063-123-4567" />
            </div>
            <div className="form-row" style={{ gridColumn: "1 / -1" }}>
              <label>공식 홈페이지</label>
              <input className="text-input" defaultValue="https://jeonju-hanok.kr" />
            </div>
            <div className="form-row" style={{ gridColumn: "1 / -1" }}>
              <label className="required">소개</label>
              <textarea
                className="textarea-input"
                style={{ minHeight: 108 }}
                maxLength={500}
                defaultValue="전주 한옥마을은 700여 채의 전통 한옥이 모여 있는 대한민국 대표 한옥 마을입니다. 전통과 현대가 어우러진 문화·관광 명소로, 전주의 맛과 멋, 정을 느낄 수 있는 특별한 여행지입니다."
              />
              <p className="hours-footnote">95 / 500자</p>
            </div>
          </div>

          <div className="place-photo-panel">
            <label className="required">대표 사진</label>
            <div className="place-photo-hero">
              <button type="button" className="place-photo-change-btn">
                <Camera size={15} /> 사진 변경
              </button>
            </div>
            <button type="button" className="place-photo-remove" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={13} /> 사진 삭제
            </button>
          </div>
        </div>
      </section>

      <section className="place-card">
        <div className="place-card-header">
          <h2 className="place-card-title">운영 세부사항</h2>
          <Link to="/places/hours" className="place-edit-hours-link">
            운영시간 수정
          </Link>
        </div>

        <div className="place-ops-layout">
          <div className="place-benefit">
            <p className="place-ops-caption">방문 혜택</p>
            <ul className="place-benefit-list">
              {benefits.map((b, i) => (
                <li key={i}>
                  <span className="place-benefit-icon">
                    <Check size={13} />
                  </span>
                  <input
                    className="place-benefit-input"
                    value={b}
                    placeholder="혜택 내용을 입력하세요"
                    onChange={(e) => updateBenefit(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="place-benefit-remove"
                    aria-label="혜택 삭제"
                    onClick={() => removeBenefit(i)}
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="place-benefit-add" onClick={addBenefit}>
              <Plus size={13} /> 혜택 추가
            </button>
          </div>

          <div className="place-ops-divider" />

          <div className="place-hours">
            <p className="place-ops-caption">운영시간</p>
            <ul className="place-hours-list">
              {hoursSummary.map(([day, hours]) => (
                <li key={day}>
                  <span>{day}</span>
                  <span>{hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="place-footer">
        <p>* 표시는 필수 입력 항목입니다.</p>
        <div className="report-actions">
          <Button variant="secondary" onClick={() => showToast("변경 사항을 취소했습니다.", "info")}>
            변경 취소
          </Button>
          <Button onClick={() => showToast("장소 정보가 저장되었습니다.", "success")}>저장</Button>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="대표 사진을 삭제할까요?"
        description="삭제한 사진은 복구할 수 없습니다. 계속 진행하시겠습니까?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDeleteOpen(false);
                showToast("대표 사진이 삭제되었습니다.", "success");
              }}
            >
              삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
