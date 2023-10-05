import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'

const envPrefix = 'APP_'

export default defineConfig({
    base: '/',
    plugins: [
        vue()
    ],
    envPrefix,
    resolve: {
        alias: {
            '@': '/src'
        },
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
        host: '127.0.0.1',
        port: 3000,
        open: true,
        proxy: {
            '/iteamdo': {
                target: 'http://api.teamdo.com',
                changeOrigin: true
            }
        }
    }
})
