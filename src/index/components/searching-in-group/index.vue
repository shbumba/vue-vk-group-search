<template>
    <transition name="page">
    <div class="groupSearch">
        <progress-bar :obj="progressPlugin.obj"></progress-bar>

        <div class="groupSearch__main">
            <div class="groupSearch__col groupSearch__col--search">
                <div class="material-field">
                    <input class="material-field__input groupSearch__input" type="text" v-model.trim="inputValue" required/>
                    <div class="material-field__label groupSearch__label">Search:</div>
                </div>
            </div>
            <div class="groupSearch__col groupSearch__col--mode">
                <div class="material-field">
                    <div class="groupSearch__select">
                        <select class="material-field__select" v-model="searchMode">
                            <option v-for="(item, index) in modeList" :value="index" :selected="index == searchMode">
                                {{ item }}
                            </option>
                        </select>
                        <div class="material-field__label">Mode:</div>
                    </div>
                </div>
            </div>
        </div>
        <template v-if="searchResult">
            <div class="groupSearch__result">
                <pagination
                    :onPage="paginationOnPage"
                    :totalResult="paginationTotalResult"
                    :navSize="paginationNavSize"
                    :currentPage="paginationCurrent"
                    @offset="paginationSetOffset"
                    @current="paginationSetCurrent"
                ></pagination>

                <template v-if="searchMode == 'audio'">
                {{ songIndex = 1 }}
                <template v-for="audioList in filterResult">
                    <div class="groupSearch__item" v-for="song in audioList" :key="song.aid">
                        (#{{ songIndex++ }}): {{ song.artist }} - {{ song.title }}
                    </div>
                </template>
                </template>

                <template v-else-if="searchMode == 'video'">
                <div class="groupSearch__item" v-for="video in filterResult">
                    {{ video }}
                </div>
                </template>

                <template v-else-if="searchMode == 'text'">
                <div class="groupSearch__item" v-for="text in filterResult">
                    {{ text }}
                </div>
                </template>

                <template v-if="searchMode == 'info'">
                <div class="groupSearch__item" v-for="info in filterResult">
                    {{ info }}
                </div>
                </template>

                <pagination
                    :onPage="paginationOnPage"
                    :totalResult="paginationTotalResult"
                    :navSize="paginationNavSize"
                    :currentPage="paginationCurrent"
                    @offset="paginationSetOffset"
                    @current="paginationSetCurrent"
                ></pagination>
            </div>
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

    export default {
        name: 'searching-in-group',
        props: {
            groupData: {
                type: Object,
                default: null
            },
            valueDefault: {
                type: String,
                default: null
            },
            modeDefault: {
                type: String,
                default: 'audio'
            },
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
                inputValue: this.valueDefault,
                dateValue: null,
                groupData: this.groupData,
                searchMode: this.modeDefault,
                searchResult: null,
                filterResult: null,
                keyPressTimer: null,
                modeList: {
                    audio: 'Audio',
                    text: 'Text',
                    info: 'Info',
                    log: 'console.log'
                }
            }
        },
        watch: {
            inputValue(message) {
                this.log('input message:', message);
                this.process('Waiting for the end of typing...').send();

                this.unsetTimer();

                this.setTimer(() => {
                    this.searchResult = null;

                    this.process('Sending text to the server...').send();
                    this.setGroupData();
                });
            },
            searchMode() {
                this.setFilterModeResult();
            },
            paginationOffset() {
                this.process('Sending query to the server...').send();
                this.setGroupData();
            }
        },
        mounted() {
        },
        created() {
            this.title(this.groupData.name);
        },
        methods: {
            goBack() {
                this.$emit('back');
            },
            setTimer(callback, time = 500) {
                this.keyPressTimer = setTimeout(callback, time);
            },
            unsetTimer() {
                clearTimeout(this.keyPressTimer);
            },

            setGroupData() {
                let groupID = this.groupData.gid,
                    searchValue = this.inputValue;

                if (searchValue.length <= 3) {
                    this.process('Error: length < 3').status('error').send();

                    return false;
                }

                let dataSend = {
                    owner_id: '-' + groupID,
                    query: searchValue,
                    owners_only: 1,
                    count: this.paginationOnPage,
                    offset: this.paginationOffset
                };

                VK.Api.call('wall.search', dataSend, async (data) => {
                    this.process('The result is obtained. Begin processing...').send();

                    if (data.error) {
                        this.process(data.error.error_msg).status('error').end();
                        return;
                    }

                    this.paginationSetTotal(data.response[0]);

                    let searchResult = data.response.filter((obj) => {
                        return typeof obj === 'object';
                    });

                    await this.setSearchResult(searchResult);
                    await this.setFilterModeResult();
                });
            },
            setSearchResult(searchResult) {
                this.searchResult = searchResult;
            },
            async setFilterModeResult() {
                if (this.searchResult === null) {
                    return;
                }

                let mode = this.searchMode;
                mode = 'getFilter' + mode.charAt(0).toUpperCase() + mode.slice(1);

                this.process('Data processing...').send();
                await this[mode]();
                this.process('Data processing complete!').end();
            },
            async getFilterAttach(field) {
                let searchResult = this.searchResult;
                let newResult = [];

                let attachments = await (() => {
                    return searchResult.map((post) => {
                        return post.attachments;
                    })
                })();

                for (let attaches of attachments) {
                    let audios = await attaches.filter((attach) => {
                        return attach.type === field;
                    });

                    newResult.push(await audios.map((obj) => {
                        return obj[field];
                    }));
                }

                return newResult;
            },
            async getFilterAudio() {
                this.filterResult = await this.getFilterAttach('audio');
            },
            async getFilterVideo() {
                this.filterResult = await this.getFilterAttach('video');
            },
            async getFilterText() {
                let searchResult = this.searchResult;

                this.filterResult = await (() => {
                    return searchResult.map((post) => {
                        return post.text;
                    })
                })();
            },
            async getFilterInfo(result) {
                let searchResult = this.searchResult;

                this.filterResult = await (() => {
                    return searchResult.map((post) => {
                        return {
                            'id': post.id,
                            'likes': post.likes.count,
                            'date': post.date,
                            'comments': post.comments.count
                        };
                    })
                })();
            },
            getFilterLog() {
                this.filterResult = null;
                this.log(this.filterResult);
            },
            title(title) {
                this.$emit('title', title);
            }
        }
    }
</script>
