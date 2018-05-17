export default (() => {
    let __options = {
        log: false,
        error: true
    };

    const __methods = {
        log(...text) {
            if (!__options.log) {
                return true;
            }

            console.log(...text);

            return true;
        },

        error(...text) {
            if (!__options.error) {
                return true;
            }

            console.error(...text);

            return true;
        }
    };

    return {
        name: 'Debugging',
        log: __methods.log,
        error: __methods.error,
        setOptions: (options) => __options = Object.assign({}, __options, options),
        install: {
            install(Vue) {
                Vue.mixin({
                    methods: {
                        log: __methods.log,
                        error: __methods.error
                    }
                });
            }
        }
    }
})();
