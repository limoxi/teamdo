import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import path from 'path'

const srcPath = path.join(__dirname, 'src')
const envPrefix = 'APP_'

export default defineConfig({
    base: './',
    plugins: [
        vue()
    ],
    envPrefix,
    resolve: {
        alias: [
            { find: /^@\//, replacement: `${srcPath}/` },
        ],
        extensions: ['.js', '.vue', '.json', '.less', '.css']
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true
            }
        },
        postcss: {
            plugins: [
                autoprefixer
            ],
        }
    },
    server: {
        open: true,
        proxy: {
            '/teamdo': {
                target: 'http://localhost:8002',
                changeOrigin: true
            }
        }
    }
})
