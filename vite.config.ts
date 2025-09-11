import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import envCompatible from 'vite-plugin-env-compatible'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: false,
        rollupOptions: {
            cache: false,
            plugins: [
                visualizer({
                    brotliSize: true,
                    filename: 'dist/stats.html',
                    gzipSize: true,
                    open: true
                })
            ]
        }
    },
    plugins: [react(), tailwindcss(), envCompatible(), viteTsconfigPaths()],
    resolve: {
        alias: {
            find: '@root',
            replacement: resolve(__dirname, '.')
        }
    }
})
