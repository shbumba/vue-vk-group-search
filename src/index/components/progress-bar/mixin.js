import ProgressClass from '../progress-bar/progress';

export default {
    data() {
        return {
            progressPlugin: {
                class: null,
                obj: {
                    message: null,
                    status: null,
                    end: false
                }
            }
        }
    },
    mounted() {
        this.progressPlugin.class = new ProgressClass((data) => {
            this.progressPlugin.obj = data;
        });
    },
    methods: {
        process(text) {
            return this.progressPlugin.class.message(text);
        }
    }
};
