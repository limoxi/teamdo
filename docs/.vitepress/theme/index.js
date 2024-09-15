// https://vitepress.dev/guide/custom-theme
import {h} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import HomeVideoLayout from './home_video_layout.vue'

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,
    Layout: HomeVideoLayout,
    enhanceApp({app, router, siteData}) {
        // ...
    }
}
