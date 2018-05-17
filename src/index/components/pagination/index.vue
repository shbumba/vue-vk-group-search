<template>
    <div class="pagination">
        <div class="pagination__col" v-for="paginationGroup in pagination">
            <div class="pagination__item"
                 v-for="page in paginationGroup"
                 @click="setCurrent(page)"
                 :key="page"
                 :class="[current === page ? 'pagination__item--active' : '']">
                {{ page }}
            </div>
        </div>
    </div>
</template>

<script>
    import './index.pcss';

    export default {
        name: 'pagination', //Название компонента
        props: { //Передаваемые войства
            onPage: {
                type: Number,
                default: 15
            },
            totalResult: {
                type: Number,
                default: 0
            },
            navSize: {
                type: Number,
                default: 3
            },
            currentPage: {
                type: Number,
                default: 1
            }
        },
        data() {
            return {
                current: this.currentPage,
                offset: 0,
                list: [],
                pagination: []
            };
        },
        computed: {
            totalPages() {
                return Math.round(this.totalResult / this.onPage);
            }
        },
        watch: {
            list(obj) {
                this.setPagination();
            },
            current(current) {
                this.getOffset();

                if (current !== this.currentPage) {
                    this.sendCurrent();
                }
            },
            offset() {
                this.sendOffset();
                this.setPaginationObj();
            },
            navSize() {
                this.setPaginationObj();
            },
            totalResult() {
                this.setPaginationObj();
            },
            onPage() {
                this.setPaginationObj();
            },
            currentPage(current) {
                this.setCurrent(current);
                this.setPaginationObj();
            }
        },
        created() {
            this.setPaginationObj();
        },
        methods: {
            getOffset() {
                this.offset = (this.current * this.onPage) - this.onPage;
            },
            setCurrent(page) {
                this.current = page;
            },
            async setPaginationObj() {
                let startPages = await this.getStartPages();
                let currentPages = await this.getCurrentPages();
                let endPages = await this.getEndPages();

                this.list = [startPages, currentPages, endPages].filter((arr) => arr.length > 0);
            },
            getStartPages() {
                let total = this.totalPages;
                let startPageNum = total >= this.navSize ? this.navSize : total;

                return Array.from(
                    Array(startPageNum).keys(),
                    (value) => value + 1
                ).sort((a, b) => a - b);
            },
            getCurrentPages() {
                let total = this.totalPages;
                let i = 0;

                return Array.from(
                    Array(this.navSize).keys(),
                    (value) => this.current + (((value + 1) % 2 === 0) ? i : -i++)
                ).filter((value) => value > 0 && value <= total).sort((a, b) => a - b);
            },
            getEndPages() {
                let total = this.totalPages;
                let startPageNum = total >= this.navSize ? this.navSize : total;
                let balanceEnd = total - startPageNum;
                let endPageNum = balanceEnd > this.navSize ? this.navSize : balanceEnd;

                return Array.from(
                    Array(endPageNum).keys(),
                    (value) => total - value
                ).sort((a, b) => a - b);
            },
            /**
             * Ищем значения первого массива (first) во втором (second),
             * и если найдено хотябы одно значение, возвращаем true.
             * В противном случае false.
             *
             * @param first
             * @param second
             * @returns {boolean}
             */
            mathFoundArrays(first, second) {
                return first.filter((item) => second.indexOf(item) > -1).length !== 0;
            },
            /**
             * Объеденяем массив first и second. Предварительно отфильтровав
             * массив second и убрав из него все совпадающие значения массива first
             *
             * @param first
             * @param second
             * @returns {Array.<*>|T[]|Array.<T>}
             */
            mergeArrays(first, second) {
                return [].concat(first, second.filter((item) => first.indexOf(item) < 0)).sort((a, b) => a - b);
            },
            setPagination() {
                let i = 0;

                this.pagination = this.list.reduce((pre, cur) => {
                    let returnVal = pre;

                    if (pre === null) {
                        return cur;
                    }

                    if (typeof pre === 'object' && !Array.isArray(pre)) {
                        //Проверяем есть ли хотябы одно совпадение в объекте с текущим массивом, и записываем ключи объекта для склеивания
                        let mergeKeys = Object.keys(pre).filter((value) => {
                            return this.mathFoundArrays(pre[value], cur);
                        });

                        //Если совпадение есть, то выполняем обход по найденым ключам и склеиваем массивы, переписав значения обекта
                        if (mergeKeys.length > 0) {
                            mergeKeys.map((value) => {
                                returnVal[value] = this.mergeArrays(pre[value], cur);
                            });
                        } else { //Если совпадений нет, то просто записываем результат в объект
                            returnVal[i++] = cur;
                        }
                    } else if (this.mathFoundArrays(pre, cur)) { //Ищем похожие элементы, если они найдены то склеиваем массивы
                        returnVal = this.mergeArrays(pre, cur);
                    } else { //Если похожих значений нет, то сохраняем массивы поместив их в объект, для выполнение первого оператора
                        returnVal = {};
                        returnVal[i++] = pre;
                        returnVal[i++] = cur;
                    }

                    return returnVal;
                }, null);
            },
            sendOffset() {
                this.$emit('offset', this.offset);
            },
            sendCurrent() {
                this.$emit('current', this.current);
            }
        }
    };
</script>
