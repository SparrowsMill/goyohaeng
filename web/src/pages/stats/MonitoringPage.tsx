import { useEffect, useState } from "react";
import { Sparkles, ExternalLink, MessageCircle, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ComboChart from "../../components/charts/ComboChart";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";
import { getNaverAnalytics, type NaverAnalytics } from "../../api/analytics";
import { getPlaceTrendSummary, type PlaceTrendSummary } from "../../api/place";
import "./MonitoringPage.css";

const CONTENT_TYPE_LABEL: Record<string, string> = {
  NAVER_BLOG: "블로그",
};

const DIRECTION_META = {
  UP: { icon: TrendingUp, label: "상승", tone: "success" },
  DOWN: { icon: TrendingDown, label: "하락", tone: "danger" },
  SAME: { icon: Minus, label: "유지", tone: "neutral" },
} as const;

export default function MonitoringPage() {
  const { showToast } = useToast();
  const { businessAccount } = useAuth();
  const placeId = businessAccount?.place?.id;
  const [naver, setNaver] = useState<NaverAnalytics | null>(null);
  const [trend, setTrend] = useState<PlaceTrendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const showTrendSkeleton = useDelayedLoading(trendLoading);

  useEffect(() => {
    getNaverAnalytics()
      .then(setNaver)
      .catch((err) => showToast(err instanceof ApiError ? err.message : "네이버 분석 데이터를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!placeId) {
      setTrendLoading(false);
      return;
    }
    getPlaceTrendSummary(placeId)
      .then(setTrend)
      .catch((err) => showToast(err instanceof ApiError ? err.message : "블로그 언급 데이터를 불러오지 못했습니다.", "error"))
      .finally(() => setTrendLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  return (
    <>
      <PageHeader
        title="트렌드 모니터링"
        breadcrumbs={[{ label: "통계 데이터 보드", to: "/stats" }, { label: "트렌드 모니터링" }]}
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

      <div className="grid monitoring-keyword-row" style={{ marginBottom: 12 }}>
        <section className="panel">
          <p className="panel-title">최근 많이 언급되는 키워드</p>
          {trendLoading ? (
            showTrendSkeleton ? <Skeleton height={140} /> : null
          ) : !trend || trend.keywords.length === 0 ? (
            <EmptyState icon={<Search size={18} />} title="아직 수집된 키워드가 없습니다." />
          ) : (
            <div className="keyword-top-grid">
              {trend.keywords.slice(0, 8).map((tag, i) => (
                <div className="keyword-top-item" key={tag}>
                  <span className="keyword-top-rank">{i + 1}</span>
                  <p className="keyword-top-tag">#{tag}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel ai-summary-panel">
          <p className="panel-title">
            <Sparkles size={15} /> AI 요약 관심 포인트
          </p>
          {trendLoading ? (
            showTrendSkeleton ? <Skeleton height={140} /> : null
          ) : !trend || !trend.summaryText ? (
            <EmptyState icon={<Sparkles size={18} />} title="아직 생성된 AI 요약이 없습니다." />
          ) : (
            <p className="ai-summary-text">{trend.summaryText}</p>
          )}
        </section>
      </div>

      <section className="panel">
        <p className="panel-title">관련 블로그 언급</p>
        {trendLoading ? (
          showTrendSkeleton ? <Skeleton height={200} /> : null
        ) : !trend || trend.contents.length === 0 ? (
          <EmptyState icon={<MessageCircle size={18} />} title="아직 수집된 블로그 언급이 없습니다." />
        ) : (
          <ul className="post-list">
            {trend.contents.map((c) => (
              <li key={c.id}>
                <a href={c.url} target="_blank" rel="noreferrer" style={{ display: "contents" }}>
                  <span className="post-channel">
                    <MessageCircle size={14} />
                    {CONTENT_TYPE_LABEL[c.contentType] ?? c.contentType}
                  </span>
                  <div className="post-body">
                    <p className="post-title">{c.title ?? "(제목 없음)"}</p>
                    <p className="post-desc">{c.author ? `작성자: ${c.author}` : ""}</p>
                  </div>
                  <span className="post-date">
                    {c.publishedAt
                      ? new Date(c.publishedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
                      : "-"}
                  </span>
                  <ExternalLink size={14} className="post-link-icon" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
