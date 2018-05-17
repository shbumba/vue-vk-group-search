<template>
    <div class="app">
        <preloader :message="preloaderText"></preloader>

        <div class="app__main">
            <div class="head">
                <div class="head__col head__col--back">
                    <button v-if="previousSection" @click="goBack()" class="back-btn">back</button>
                </div>
                <div class="head__col head__col--title" v-bind:class="[isLogin ? classObject.isLoginClass : classObject.isLogoutClass, classObject.userLogin]">
                    <h1>{{ currentTitle }}</h1>
                </div>
                <div class="head__col head__col--action">
                    <auth
                        :isLogin="isLogin"
                        @userID="setUserID"
                        @log="log"
                        @status="status"
                        @logout="setLogout"
                        @login="setLogin"
                        @clean="cleanData"
                        @complete="complete"
                    ></auth>
                </div>
            </div>

            <div class="wrap">
                <group-list
                    v-show="currentSection == 'groupList'"
                    :userID="userID"
                    :isLogin="isLogin"
                    @click="viewGroup"
                    @complete="complete"
                    @log="log"
                    @status="status"
                    @title="setTitle"
                ></group-list>

                <searching-in-group
                    v-if="currentSection == 'groupDetail'"
                    :groupData="groupData"
                    :valueDefault="groupSearchInput"
                    :modeDefault="searchMode"
                    @log="log"
                    @progress="progress"
                    @title="setTitle"
                ></searching-in-group>
            </div>
        </div>
    </div>
</template>
<script>
    import PreloaderComponent from './components/preloader/index.vue';
    import AuthComponent from './components/auth/index.vue';
    import GroupListComponent from './components/group-list/index.vue';
    import SearchInGroupComponent from './components/searching-in-group/index.vue';

    let data = {
        classObject: {
            userLogin: 'userLogin',
            isLoginClass: 'userLogin--on',
            isLogoutClass: 'userLogin--off'
        },
        preloaderText: 'Loading...',
        preloaderTimer: null,
        sections: {
            index: {
                titleTpl: null,
                title: 'Welcome!'
            },
            groupList: {
                titleTpl: null,
                title: 'List of groups'
            },
            groupDetail: {
                titleTpl: 'Group: "{title}"',
                title: 'Group Detail'
            }
        },
        currentSection: 'index',
        previousSection: null,
        currentTitle: 'Welcome!',
        isLogin: null,
        userID: null,
        groupData: {},
        groupSearchInput: '#speeeedyrelease',
        searchMode: 'audio'
    };
    let cleanObject = Object.assign({}, data);

    export default {
        components: {
            'preloader': PreloaderComponent,
            'auth': AuthComponent,
            'group-list': GroupListComponent,
            'searching-in-group': SearchInGroupComponent
        },
        data() {
            return data;
        },
        watch: {
            userID(userID) {
                if (userID) {
                    this.changeSection('groupList');
                }
            },
            currentSection(mode, lasMode) {
                this.previousSection = (['index', 'groupMode'].indexOf(lasMode) === -1) ? lasMode : null;

                this.currentTitle = this.sections[mode].title;

                this.log('currentTitle:' + this.currentTitle);
                this.log('currentSection:' + mode);
            }
        },
        created() {
            this.log('app created');
            this.status('Application created.');
        },
        methods: {
            goBack() {
                this.changeSection(this.previousSection);
            },
            progress(obj) {
                this.progressObj = obj;
            },
            status(text, disable = false) {
                clearTimeout(this.preloaderTimer);

                if (disable) {
                    this.preloaderText = text;

                    this.preloaderTimer = setTimeout(() => {
                        this.preloaderText = null;
                    }, 350);
                } else {
                    this.preloaderText = text;
                }
            },
            complete() {
                this.status('App loading complete.', true);
            },
            cleanData() {
                this.status('Cleaning application data.');

                Object.keys(cleanObject).forEach((key) => {
                    this.$data[key] = cleanObject[key];
                });
            },
            setLogout() {
                this.isLogin = false;

                this.changeSection('index');
            },
            setLogin() {
                this.isLogin = true;

                this.changeSection('groupList');
            },
            setSessionData(data) {
                this.sessionData = data;
            },
            setUserID(userID) {
                this.userID = userID;
            },
            changeSection(mode) {
                this.currentSection = mode;
            },
            setTitle(title) {
                let currentSection = this.currentSection,
                    section = (currentSection in this.sections) ? this.sections[currentSection] : null;

                if (section !== null && 'titleTpl' in section && typeof section.titleTpl === 'string') {
                    title = section.titleTpl.replace('{title}', title);
                }

                this.currentTitle = title;
            },
            viewGroup(groupData) {
                this.groupData = groupData;

                this.changeSection('groupDetail');
            }
        }
    };
</script>
