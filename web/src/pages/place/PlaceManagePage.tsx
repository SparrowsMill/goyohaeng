import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, User, Gift, Clock, Camera, Trash2, ChevronRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import "./PlaceManagePage.css";

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

  return (
    <>
      <PageHeader title="장소 관리" subtitle="장소 정보를 관리하고 방문 혜택과 운영 정보를 설정합니다." />

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <section className="panel">
          <p className="panel-title">
            <FileText size={15} /> 1. 기본 정보
          </p>
          <div className="place-form-grid">
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
            <div className="form-row">
              <label>공식 홈페이지</label>
              <input className="text-input" defaultValue="https://jeonju-hanok.kr" />
            </div>
          </div>
        </section>

        <section className="panel">
          <p className="panel-title">
            <User size={15} /> 2. 소개
          </p>
          <div className="place-intro-grid">
            <div className="form-row">
              <label className="required">주인의 소개</label>
              <textarea
                className="textarea-input"
                style={{ minHeight: 150 }}
                maxLength={500}
                defaultValue="전주 한옥마을은 700여 채의 전통 한옥이 모여 있는 대한민국 대표 한옥 마을입니다. 전통과 현대가 어우러진 문화·관광 명소로, 전주의 맛과 멋, 정을 느낄 수 있는 특별한 여행지입니다."
              />
              <p className="hours-footnote">95 / 500자</p>
            </div>
            <div className="form-row">
              <label className="required">대표 사진</label>
              <div className="place-photo" />
              <div className="place-photo-actions">
                <button className="btn btn-secondary" type="button">
                  <Camera size={14} /> 사진 변경
                </button>
                <button className="btn btn-danger" type="button" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={14} /> 삭제
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <p className="panel-title">
            <Gift size={15} /> 3. 방문 혜택
          </p>
          <textarea
            className="textarea-input"
            style={{ minHeight: 130, marginTop: 8 }}
            maxLength={500}
            defaultValue={"• 한복 체험 10% 할인\n• 전통 차 시음 무료 제공\n• 기념품 구매 시 5% 할인\n• 문화 공연 우선 예약 혜택"}
          />
          <p className="hours-footnote">83 / 500자</p>
        </section>

        <section className="panel">
          <p className="panel-title">
            <Clock size={15} /> 4. 운영 정보
          </p>
          <div className="place-hours-grid">
            <div>
              <p className="place-hours-caption">운영시간 요약</p>
              <ul className="place-hours-list">
                {hoursSummary.map(([day, hours]) => (
                  <li key={day}>
                    <span>{day}</span>
                    <span>{hours}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="place-hours-caption">운영시간 관리</p>
              <p className="funnel-desc" style={{ marginBottom: 12 }}>
                운영시간의 상세 설정 및 예외 날짜, 특별 운영 시간 등은 운영시간 관리 페이지에서 수정합니다.
              </p>
              <Link to="/visit-auth/hours" className="place-hours-btn">
                운영시간 수정 <ChevronRight size={14} />
              </Link>
              <p className="hours-footnote">운영시간 관리 페이지로 이동합니다.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="place-footer">
        <p>* 표시는 필수 입력 항목입니다.</p>
        <div className="report-actions">
          <Button variant="secondary">변경 취소</Button>
          <Button>저장</Button>
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
            <Button variant="danger" onClick={() => setDeleteOpen(false)}>
              삭제
            </Button>
          </>
        }
      />
    </>
  );
}
