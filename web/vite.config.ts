import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 관리자 웹은 앱의 Android 웹뷰(구형은 Chrome 100 안팎) 안에서도 뜬다.
    // 기본 타깃(baseline-widely-available)으로 빌드하면 CSS 압축기가
    // `@media (max-width: 900px)`를 범위 문법 `(width<=900px)`(Chrome 104+)로
    // 바꿔 써서, 구형 웹뷰가 반응형 규칙을 통째로 무시하고 PC 레이아웃으로
    // 그려버린다. 웹뷰가 이해하는 문법으로 내보내도록 타깃을 낮춰 둔다.
    target: 'chrome87',
    cssTarget: 'chrome87',
  },
})
