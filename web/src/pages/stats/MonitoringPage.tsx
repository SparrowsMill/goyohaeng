import { useEffect, useState } from "react";
import { Sparkles, ExternalLink, MessageCircle, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DonutChart from "../../components/charts/DonutChart";
import ComboChart from "../../components/charts/ComboChart";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { ApiError } from "../../api/client";
import { getNaverAnalytics, type NaverAnalytics } from "../../api/analytics";
import "./MonitoringPage.css";

// 아래 목업 데이터(TOP 키워드, 블로그/SNS 피드, 채널별 언급 비중, AI 요약)는
// 백엔드 API 범위 밖(스펙 20장 참고)이라 아직 실제 데이터로 대체할 수 없다.
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

const DIRECTION_META = {
  UP: { icon: TrendingUp, label: "상승", tone: "success" },
  DOWN: { icon: TrendingDown, label: "하락", tone: "danger" },
  SAME: { icon: Minus, label: "유지", tone: "neutral" },
} as const;

export default function MonitoringPage() {
  const { showToast } = useToast();
  const [naver, setNaver] = useState<NaverAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  useEffect(() => {
    getNaverAnalytics()
      .then(setNaver)
      .catch((err) => showToast(err instanceof ApiError ? err.message : "네이버 분석 데이터를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader
        title="키워드 모니터링"
        breadcrumbs={[{ label: "통계 데이터 보드", to: "/stats" }, { label: "키워드 모니터링" }]}
        hideSettings
      />

      <section className="panel" style={{ marginBottom: 12 }}>
        <p className="panel-title">
          <Search size={15} /> 네이버 검색 관심도
        </p>
        {loading ? (
          showSkeleton ? <Skeleton height={100} /> : null
        ) : !naver || !naver.available ? (
          <EmptyState icon={<Search size={18} />} title="아직 집계된 검색 관심도 데이터가 없습니다." />
        ) : (
          <>
            <div className="mention-stat-grid">
              <div>
                <p className="mention-stat-value">{naver.searchTerm}</p>
                <p className="mention-stat-label">등록된 검색어</p>
              </div>
              <div>
                <p className={`mention-stat-value ${naver.direction === "UP" ? "success" : ""}`}>
                  {naver.latestInterest ? naver.latestInterest.ratio.toFixed(2) : "-"}
                </p>
                <p className="mention-stat-label">
                  최신 관심도
                  {naver.direction && (
                    <>
                      {" · "}
                      {DIRECTION_META[naver.direction].label}
                      {naver.difference !== null && ` (${naver.difference > 0 ? "+" : ""}${naver.difference.toFixed(3)})`}
                    </>
                  )}
                </p>
              </div>
            </div>
            {naver.history.length > 0 && (
              <ComboChart
                data={naver.history.map((h) => ({
                  label: new Date(h.periodStart).toLocaleDateString("ko-KR", { year: "2-digit", month: "short" }),
                  line: Math.round(h.ratio * 100),
                }))}
                detailed
                area
                height={140}
              />
            )}
          </>
        )}
        <p className="hours-footnote" style={{ marginTop: 8 }}>
          ratio는 실제 검색 횟수가 아니라 상대적인 검색 관심도예요.
        </p>
      </section>

      <div className="grid grid-2" style={{ marginBottom: 12, gridTemplateColumns: "1.6fr 1fr" }}>
        <section className="panel">
          <p className="panel-title">최근 많이 언급되는 키워드 TOP 8 (목업 데이터)</p>
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
            <Sparkles size={15} /> AI 요약 관심 포인트 (목업 데이터)
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
          <p className="panel-title">관련 블로그 및 SNS 전체 언급 (목업 데이터)</p>
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
            <p className="panel-title">채널별 언급 비중 (목업 데이터)</p>
            <DonutChart segments={channelSegments} centerLabel="12,864 건" />
          </section>

          <section className="panel">
            <p className="panel-title">최근 언급 현황 (목업 데이터)</p>
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
    </>
  );
}
