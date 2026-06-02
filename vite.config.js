import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

function resolveQualifier() {
  const ref = process.env.GITHUB_REF_NAME || ''

  if (!ref) {
    return 'LOCAL'
  }

  if (ref === 'master') {
    return ''
  }

  if (/^v\d+\.\d+\.\d+$/.test(ref)) {
    return ''
  }

  const match = ref.match(/^v\d+\.\d+\.\d+-(.+)$/)

  if (match) {
    return match[1]
  }

  if (ref === 'beta') {
    return 'beta'
  }

  return 'SNAPSHOT'
}

const qualifier = resolveQualifier()
const appVersion = qualifier ? `${version}-${qualifier}` : version

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  }
})
