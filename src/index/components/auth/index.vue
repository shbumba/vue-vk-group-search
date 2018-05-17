<template>
    <div class="user-badge">
        <div v-if="userData" class="user-badge__name">
            {{ fullName }}
        </div>
        <div class="user-badge__btn">
            <button v-if="isLogin" @click="logout">Logout</button>
            <button v-else @click="login">Login</button>
        </div>
    </div>
</template>

<script>
    import './index.pcss';

    const access = 1 | 2 | 4 | 8 | 16 | 128 | 1024 | 2048 | 4096 | 8192 | 65536 | 131072 | 262144 | 524288 | 1048576 | 4194304;

    let data = {
        sessionData: {},
        userData: null,
        firstName: null,
        lastName: null,
        userID: null
    };
    let cleanObject = Object.assign({}, data);

    export default {
        name: 'auth',
        props: {
            isLogin: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                sessionData: {},
                userData: null,
                firstName: null,
                lastName: null,
                userID: null
            }
        },
        computed: {
            fullName: {
                get() {
                    return this.firstName + ' ' + this.lastName;
                },
                set(newValue) {
                    let names = newValue.split(' ');

                    this.firstName = names[0];
                    this.lastName = names[names.length - 1];
                }
            }
        },
        watch: {
            userData(obj) {
                if (obj !== null && typeof obj.first_name !== 'undefined' && typeof obj.last_name !== 'undefined') {
                    this.fullName = obj.first_name + ' ' + obj.last_name;

                    this.appComplete();
                }
            },
            isLogin(val) {
                if (val && this.userID) {
                    this.setUserData();
                } else {
                    this.appComplete();
                }
            },
            userID(userID) {
                this.sendUserID(userID);
            }
        },
        created() {
            this.checkLogin();
        },
        methods: {
            checkLogin() {
                this.status('VK check login.');

                VK.Auth.getLoginStatus(async (response) => {
                    if (response.session) {
                        await this.status('VK check login success.');

                        await this.setSessionData(response.session);

                        await this.sendLogin();
                    } else {
                        await this.sendLogout();
                    }
                });
            },
            setSessionData(data) {
                let userID = data.mid;

                this.sessionData = data;
                this.userID = userID;
            },
            login() {
                this.status('VK send login.');

                VK.Auth.login(() => {
                    this.status('VK login success.');

                    this.checkLogin();
                }, access);
            },
            logout() {
                this.status('VK send logout.');

                VK.Auth.logout(() => {
                    this.status('VK logout success.');

                    this.sendLogout();
                    this.cleanData();
                    this.sendCleanData();
                });
            },
            setUserData() {
                this.status('Getting user data.');

                VK.Api.call('users.get', {
                    user_id: this.userID
                }, (data) => {
                    if (data.response) {
                        this.userData = data.response[0];
                    }
                });
            },
            status(message) {
                this.$emit('status', message);
            },
            sendLogout() {
                this.$emit('logout');
            },
            sendLogin() {
                this.$emit('login');
            },
            sendCleanData() {
                this.$emit('clean');
            },
            appComplete() {
                this.$emit('complete');
            },
            sendUserID(userID) {
                this.$emit('userID', userID);
            },
            cleanData() {
                this.status('Cleaning application data.');

                Object.keys(cleanObject).forEach((key) => {
                    this.$data[key] = cleanObject[key];
                });
            }
        }
    }
</script>
