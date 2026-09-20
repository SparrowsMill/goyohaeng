// 관광공사(tong.visitkorea.or.kr) 등 외부 사진 URL이 http:// 로 내려온다. Android WebView는
// 평문 요청을 막고(ERR_CLEARTEXT_NOT_PERMITTED), https 페이지에서는 혼합 콘텐츠로도 막히므로
// 표시할 때만 https:// 로 바꾼다(저장된 값은 그대로). 로컬 개발 주소는 건드리지 않는다.
export function toHttps(url: string) {
  if (/^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:|\/|$)/i.test(url)) return url;
  return url.replace(/^http:\/\//i, "https://");
}
