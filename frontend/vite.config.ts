import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // 모노레포 루트의 packages/edupy/edupy/** 소스를 ?raw 로 가져오려면 상위 폴더 접근 허용 필요
      // (frontend/src/pyodide/edupyRuntime.ts 의 import.meta.glob 참고)
      allow: ['..'],
    },
  },
})
