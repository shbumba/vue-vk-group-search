<template>
    <div class="preloader" v-if="message">
        <svg class="preloader__filter" version="1.1">
            <defs>
                <filter id="preloadersvg">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="preloadersvg" />
                    <feComposite in="SourceGraphic" in2="preloadersvg" operator="atop" />
                </filter>
            </defs>
        </svg>
        <div class="preloader__animation">
            <div class="preloader__dot preloader__dot--dot1"></div>
            <div class="preloader__dot preloader__dot--dot2"></div>
            <div class="preloader__dot preloader__dot--dot3"></div>
            <div class="preloader__dot preloader__dot--dot4"></div>
            <div class="preloader__dot preloader__dot--dot5"></div>
        </div>
        <div class="preloader__text">
            {{ message }}
        </div>
    </div>
</template>
<script>
    import './index.pcss';

    export default {
        name: 'preloader',
        props: {
            message: {
                type: String,
                default: 'Loading...'
            },
        }
    }
</script>
