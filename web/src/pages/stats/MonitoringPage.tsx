import { useState } from "react";
import { Sparkles, ExternalLink, MessageCircle, TrendingUp, Flag } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DonutChart from "../../components/charts/DonutChart";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import "./MonitoringPage.css";

const topKeywords = [
  { rank: 1, tag: "전주여행", ratio: 18.7 },
  { rank: 2, tag: "한옥체험", ratio: 13.8 },
  { rank: 3, tag: "전주비빔밥", ratio: 10.9 },
  { rank: 4, tag: "감성사진명소", ratio: 9.6 },
  { rank: 5, tag: "야경", ratio: 8.3 },
  { rank: 6, tag: "한복대여", ratio: 7.6 },
  { rank: 7, tag: "전통시장", ratio: 5.4 },
  { rank: 8, tag: "골목산책", ratio: 5.3 },
];

const posts = [
  { channel: "블로그", title: "전주 한옥마을 1박 2일 여행 코스 추천!", desc: "한옥 속소에서의 숙박 후 아침 산책, 전주비빔밥 맛집, 숨은 골목 카페까지 …", date: "2024.05.20" },
  { channel: "인스타그램", title: "전주 한옥마을 감성 사진 스팟 모음 📸", desc: "은은한 한옥 골목 담벼락, 전통찻집 부치서 인생샷 건지는 장소들!", date: "2024.05.19" },
  { channel: "유튜브", title: "전주여행 브이로그 | 한옥체험 & 먹방 투어", desc: "하루 종일 전주에서 놀고 먹은 리얼 후기! 한옥숙박부터 야시장까지!", date: "2024.05.18" },
  { channel: "인스타그램", title: "전주비빔밥은 여기! 전주 맛집 리스트", desc: "현지인이 추천하는 진짜 로컬 맛집 5곳 정리해봤어요 :)", date: "2024.05.17" },
  { channel: "블로그", title: "전주 한옥마을 야경 산책 코스", desc: "해 질 무렵부터 조명이 켜지는 한옥마을, 야경 명소와 카페 추천", date: "2024.05.16" },
  { channel: "기타 SNS", title: "비 오는 날 전주 한옥마을 분위기 최고 ☔", desc: "우산 들고 걷는 한옥마을 골목길, 감성 그 자체였어요.", date: "2024.05.16" },
];

const channelSegments = [
  { label: "블로그", value: 5216, color: "var(--color-primary)" },
  { label: "인스타그램", value: 3276, color: "#c98a4f" },
  { label: "유튜브", value: 2104, color: "#d9c368" },
  { label: "기타 SNS/웹", value: 2268, color: "#c9c2ab" },
];

const reportTypes = ["우리 매장과 관련 없는 게시물", "링크 오류", "기타 (직접 작성)"];

export default function MonitoringPage() {
  const [reportType, setReportType] = useState(reportTypes[0]);
  const { showToast } = useToast();

  return (
    <>
      <PageHeader
        title="키워드 모니터링"
        subtitle="전주 한옥마을 관련 키워드와 언급 현황을 확인하세요."
        breadcrumbs={[{ label: "통계 데이터 보드", to: "/stats" }, { label: "키워드 모니터링" }]}
        showVisitToggle
      />

      <div className="grid grid-2" style={{ marginBottom: 20, gridTemplateColumns: "1.6fr 1fr" }}>
        <section className="panel">
          <p className="panel-title">최근 많이 언급되는 키워드 TOP 8</p>
          <div className="keyword-top-grid">
            {topKeywords.map((k) => (
              <div className="keyword-top-item" key={k.rank}>
                <span className="keyword-top-rank">{k.rank}</span>
                <div>
                  <p className="keyword-top-tag">#{k.tag}</p>
                  <p className="keyword-top-ratio">언급 비율 {k.ratio}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel ai-summary-panel">
          <p className="panel-title">
            <Sparkles size={15} /> AI 요약 관심 포인트
          </p>
          <p className="ai-summary-text">
            최근 전주 한옥마을은 감성적인 사진 명소와 한옥 체험에 대한 관심이 높습니다. 전주비빔밥, 감성 분위기 등
            지역 먹거리와 야경, 한복대여가 주요 관심사로 보이며, 야간 관광과 골목 산책 등 저녁 시간대 활동 정보도
            주목받고 있습니다.
          </p>
        </section>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
        <section className="panel">
          <p className="panel-title">관련 블로그 및 SNS 전체 언급</p>
          <ul className="post-list">
            {posts.map((p) => (
              <li key={p.title}>
                <span className="post-channel">
                  <MessageCircle size={14} />
                  {p.channel}
                </span>
                <div className="post-body">
                  <p className="post-title">{p.title}</p>
                  <p className="post-desc">{p.desc}</p>
                </div>
                <span className="post-date">{p.date}</span>
                <ExternalLink size={14} className="post-link-icon" />
              </li>
            ))}
          </ul>
          <button className="panel-action" style={{ margin: "12px auto 0", display: "flex" }}>
            더보기
          </button>
        </section>

        <div className="stack">
          <section className="panel">
            <p className="panel-title">채널별 언급 비중</p>
            <DonutChart segments={channelSegments} centerLabel="12,864 건" />
          </section>

          <section className="panel">
            <p className="panel-title">최근 언급 현황</p>
            <div className="mention-stat-grid">
              <div>
                <span className="mention-stat-icon">
                  <MessageCircle size={16} />
                </span>
                <p className="mention-stat-value">12,864건</p>
                <p className="mention-stat-label">전주 한옥마을 관련 전체 언급 수</p>
              </div>
              <div>
                <span className="mention-stat-icon success">
                  <TrendingUp size={16} />
                </span>
                <p className="mention-stat-value success">+18.6%</p>
                <p className="mention-stat-label">전주(10,846건) 대비</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="panel-title">정보 오류 신고</p>
        <p className="funnel-desc" style={{ marginBottom: 16 }}>
          아래의 노출된 게시물이나 링크가 실제로 우리 매장과 관련이 없거나 잘못된 정보라고 판단되면 신고해 주세요.
          신고 접수 후 운영팀에서 검토하여 조치하겠습니다.
        </p>
        <div className="report-inline">
          <Button
            variant="primary"
            icon={<Flag size={15} />}
            onClick={() => showToast("신고가 접수되었습니다. 운영팀에서 검토 후 조치할게요.", "success")}
          >
            정보 오류 신고
          </Button>
          <div className="report-radio-group">
            {reportTypes.map((t) => (
              <label key={t} className="report-radio">
                <input type="radio" checked={reportType === t} onChange={() => setReportType(t)} />
                {t}
              </label>
            ))}
          </div>
          <textarea className="textarea-input" placeholder="기타 사유를 입력해주세요." maxLength={500} style={{ flex: 1, minHeight: 60 }} />
        </div>
      </section>
    </>
  );
}
