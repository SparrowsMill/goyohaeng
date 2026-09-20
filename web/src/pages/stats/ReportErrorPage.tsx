import { useState } from "react";
import { Link2, FileText, Unlink, PenLine, Megaphone, Clock, Mail, Sparkles, Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import InfoBox from "../../components/ui/InfoBox";
import "./ReportErrorPage.css";

const types = [
  { key: "unrelated", label: "우리 매장과 관련 없는 게시물", icon: FileText },
  { key: "link", label: "링크 오류", icon: Unlink },
  { key: "etc", label: "기타 (직접 작성)", icon: PenLine },
];

export default function ReportErrorPage() {
  const [type, setType] = useState("unrelated");
  const [desc, setDesc] = useState("");

  return (
    <>
      <PageHeader
        title="정보 오류 신고"
        breadcrumbs={[
          { label: "통계 데이터 보드", to: "/stats" },
          { label: "트렌드 모니터링", to: "/monitoring" },
          { label: "정보 오류 신고" },
        ]}
        showVisitToggle
      />

      <InfoBox
        tone="primary"
        icon={<Info size={16} />}
        title="정보 오류 신고 기능은 준비 중입니다."
        description="아래 폼은 미리보기이며, 제출해도 실제로 접수되지 않아요."
      />

      <div className="grid grid-2" style={{ gridTemplateColumns: "1.8fr 1fr", alignItems: "start", marginTop: 16 }}>
        <section className="panel">
          <div style={{ marginBottom: 24 }}>
            <Field label="잘못된 링크" icon={<Link2 size={16} />} placeholder="문제 있는 링크를 붙여넣어 주세요." />
          </div>

          <p className="panel-title">신고 유형 선택</p>
          <div className="report-type-grid">
            {types.map((t) => {
              const Icon = t.icon;
              const active = type === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`report-type-card ${active ? "active" : ""}`}
                  onClick={() => setType(t.key)}
                >
                  <span className={`report-type-radio ${active ? "active" : ""}`} />
                  <Icon size={26} strokeWidth={1.6} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <p className="panel-title" style={{ marginTop: 24 }}>
            상세 설명
          </p>
          <textarea
            className="textarea-input"
            style={{ marginTop: 8, minHeight: 140 }}
            placeholder="신고 내용을 자세히 작성해 주세요. (직접 작성)"
            maxLength={500}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <p className="char-counter">{desc.length} / 500</p>

          <div className="report-actions">
            <Button icon={<Megaphone size={15} />} disabled title="준비 중인 기능입니다.">
              정보 오류 신고
            </Button>
            <Button variant="secondary">취소</Button>
          </div>
        </section>

        <section className="panel">
          <p className="panel-title">
            <Megaphone size={15} /> 신고 안내
          </p>
          <ul className="guide-list">
            <li>
              <span className="guide-icon">
                <FileText size={16} />
              </span>
              <div>
                <p className="guide-title">운영팀 검토</p>
                <p className="guide-desc">신고 접수 후 운영팀이 내용을 검토하여 필요 시 해당 플랫폼에 조치를 요청합니다.</p>
              </div>
            </li>
            <li>
              <span className="guide-icon">
                <Clock size={16} />
              </span>
              <div>
                <p className="guide-title">처리 시간</p>
                <p className="guide-desc">검토 및 조치는 통상 1~3일 정도 소요될 수 있습니다.</p>
              </div>
            </li>
            <li>
              <span className="guide-icon">
                <Mail size={16} />
              </span>
              <div>
                <p className="guide-title">결과 안내</p>
                <p className="guide-desc">신고 접수는 확인되지만, 조치 결과는 별도로 안내되지 않을 수 있습니다.</p>
              </div>
            </li>
          </ul>
          <div className="guide-tip">
            <Sparkles size={14} />
            정확한 신고는 빠른 검토와 조치에 도움이 됩니다. 가능한 한 상세한 정보와 링크를 제공해 주세요.
          </div>
        </section>
      </div>
    </>
  );
}
