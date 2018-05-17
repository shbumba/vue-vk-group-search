import 'normalize.css';
import './app.pcss';
import Core from '../core/core';
import AppVue from './app.vue';

Core.setOption({
    vueDebug: true,
    plugin: {
        Debugging: {
            log: true,
            error: true
        }
    }
}).run(() => {
    VK.init({
        apiId: 6174424,//2274003
    });

    new Vue({
        el: '#app',
        render: h => h(AppVue)
    });
});
