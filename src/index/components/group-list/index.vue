<template>
    <transition name="page">
        <div class="groups">
            <progress-bar :obj="progressPlugin.obj"></progress-bar>

            <div class="groups-search">
                <div class="material-field">
                    <input class="material-field__input groups-search__input" type="text" v-model.trim="searchValue" required/>
                    <div class="material-field__label groups-search__label">Search:</div>
                </div>
            </div>
            <template v-if="groupListView">
            <pagination
                :onPage="paginationOnPage"
                :totalResult="paginationTotalResult"
                :navSize="paginationNavSize"
                :currentPage="paginationCurrent"
                @offset="paginationSetOffset"
                @current="paginationSetCurrent"
            ></pagination>

            <div class="groups-list">
                <div v-for="group in groupListView" class="groups-item" @click="viewGroup(group)" :key="group.gid">
                    <div class="groups-item__image">
                        <img :src="group.photo" :alt="group.name"/>
                    </div>
                    <div class="groups-item__title">{{ group.name }}</div>
                </div>
            </div>

            <pagination
                :onPage="paginationOnPage"
                :totalResult="paginationTotalResult"
                :navSize="paginationNavSize"
                :currentPage="paginationCurrent"
                @offset="paginationSetOffset"
                @current="paginationSetCurrent"
            ></pagination>
            </template>
        </div>
    </transition>
</template>
<script>
    import './index.pcss';
    //Pagination
    import PaginationComponent from '../pagination/index.vue';
    import PaginationMixin from '../pagination/mixin';
    //Progressbar
    import ProgressBarComponent from '../progress-bar/index.vue';
    import ProgressBarMixin from '../progress-bar/mixin';

    /*
        TODO: жесткие праблы с пагинацией, нужно править и немного переосмыслять поиск по группам и замену объекты данных т.к.
              периодически, а верней постоянно, происходит мелькание данных. Слишком избыточно рендрю блоки. Ну ни чего пофиксим =3
     */

    export default {
        name: 'group-list',
        props: {
            isLogin: {
                type: Boolean,
                default: false
            },
            userID: {
                type: Number,
                default: false
            }
        },
        components: {
            'pagination': PaginationComponent,
            'progress-bar': ProgressBarComponent
        },
        mixins: [
            ProgressBarMixin,
            PaginationMixin
        ],
        data() {
            return {
                groupList: null,
                groupListView: null,
                searchValue: '',
                progressObj: {
                    message: null,
                    status: null,
                    end: false
                },
                searchResult: null,
                keyPressTimer: null,
                //pagination
                paginationOnPage: 30
            }
        },
        watch: {
            isLogin() {
                this.getData()
            },
            userID() {
                this.getData()
            },
            groupList() {
                if (this.groupList) {
                    this.complete();
                }
            },
            searchValue(message) {
                this.log('input message:', message);
                this.process('Waiting for the end of typing...').send();

                this.unsetTimer();

                this.setTimer(() => {
                    this.searchResult = null;

                    this.process('Sending text to the server...').send();
                    this.searchGroups();
                });
            },
            searchResult(result) {
                this.groupListView = (result !== null && result.length > 0) ? result : this.groupList;
            },
            paginationOffset() {
                this.process('Searching...').send();
                this.searchGroups();
            }
        },
        created() {
            this.title('List of groups');
            this.getData();
        },
        methods: {
            viewGroup(group) {
                this.$emit('click', group);
            },
            setTimer(callback, time = 500) {
                this.keyPressTimer = setTimeout(callback, time);
            },
            unsetTimer() {
                clearTimeout(this.keyPressTimer);
            },
            async searchGroups() {
                let result = await this.searchInGroupList(this.searchValue);

                if (!result.length) {
                    this.getSearchGroups(this.searchValue);
                } else {
                    this.process('Searching complete!').end();
                    this.paginationClear();
                }

                this.searchResult = result;
            },
            searchInGroupList(text) {
                text = text.toLowerCase();

                return this.groupList.filter(function (group) {
                    return group.name.toLowerCase().indexOf(text) > -1;
                });
            },
            getSearchGroups(text) {
                if (text.length < 3) {
                    this.process('Error: length < 3').status('error').send();

                    return false;
                }

                this.process('Sending query to the server...').send();

                VK.Api.call('groups.search', {
                    q: text,
                    extended: 1,
                    count: this.paginationOnPage,
                    offset: this.paginationOffset
                }, (data) => {
                    if (data.error) {
                        this.process(data.error.error_msg).status('error').end();
                        return;
                    }

                    if (data.response) {
                        this.paginationSetTotal(data.response[0]);

                        this.searchResult = data.response.filter((obj) => {
                            return typeof obj === 'object';
                        });
                    }
                });
            },
            getData() {
                if (this.isLogin && this.userID) {
                    this.getGroupsList();
                } else {
                    this.groupList = null;
                }
            },
            getGroupsList() {
                if (this.groupList) {
                    return;
                }

                this.status('Getting user groups.');

                VK.Api.call('groups.get', {
                    user_id: this.userID,
                    extended: 1
                }, (data) => {
                    if (data.response) {
                        this.groupList = this.groupListView = data.response.filter((obj) => {
                            return typeof obj === 'object';
                        });
                    }
                });
            },
            complete() {
                this.$emit('complete');
            },
            status(message) {
                this.$emit('status', message);
            },
            title(title) {
                this.$emit('title', title);
            }
        }
    }
</script>
