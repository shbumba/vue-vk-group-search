<template>
    <transition name="progress">
    <div v-show="visible" class="progress-bar" :class="addedClass">
        <div class="progress-bar__wrap">
            <div class="progress-bar__text-list">
                <div v-for="(message, index) in messageList" class="progress-bar__text" :key="message.key" :class="[(index > 0) ? 'progress-bar__text--hide' : '']">
                    {{ message.text }}
                </div>
            </div>
        </div>
    </div>
    </transition>
</template>

<script>
    import './index.pcss';

    export default {
        name: 'progress-bar',
        props: {
            obj: {
                type: Object,
                default: null,
                validator(obj) {
                    return ('message' in obj && 'status' in obj && 'end' in obj);
                }
            }
        },
        data() {
            return {
                visible: false,
                addedClass: null,
                timers: [],
                messageNum: 0,
                messageList: [],
                statusList: {
                    'info': 'progress-bar--info',
                    'success': 'progress-bar--success',
                    'error': 'progress-bar--error'
                }
            }
        },
        watch: {
            obj(obj) {
                let message = obj.message,
                    status = obj.status,
                    end = obj.end;

                this.unsetTimer();
                this.showProgress();

                if (this.messageList.length > 2) {
                    this.cleanOldMessage(0, 0);
                }

                this.setTimer(() => {
                    this.setStatus(status);
                    this.setMessage(message);
                }, (this.messageList.length <= 1) ? 0 : 250);

                if (end) {
                    this.hideProgress();
                }
            }
        },
        methods: {
            setTimer(callback, time = 500) {
                this.timers.push(setTimeout(callback, time));
            },
            unsetTimer() {
                this.timers.forEach((timer, index) => {
                    clearTimeout(this.timers[index]);
                });
            },
            setStatus(status) {
                this.addedClass = (status in this.statusList) ? this.statusList[status] : null;
            },
            setMessage(message) {
                this.addMessage(message);
            },
            addMessage(message) {
                this.messageList.unshift({
                    key: this.messageNum++,
                    text: message
                });

                return true;
            },
            showProgress() {
                this.visible = true;

                return true;
            },
            cleanOldMessage(start = 0, end = 2) {
                this.messageList = this.messageList.slice(start, end);
            },
            hideProgress() {
                this.cleanOldMessage();

                this.setTimer(() => {
                    this.cleanOldMessage(0, 1);
                    this.visible = false;
                    this.addedClass = null;
                }, 1000);
            }
        }
    }
</script>
