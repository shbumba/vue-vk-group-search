export default {
    data() {
        return {
            paginationNavSize: 3,
            paginationOnPage: 10,
            paginationTotalResult: 0,
            paginationCurrent: 1,
            paginationOffset: 0
        }
    },
    methods: {
        paginationSetTotal(total) {
            total = parseInt(total);

            this.paginationTotalResult = total;

            if (total <= 0) {
                this.paginationClear(false);
            }
        },
        paginationSetOffset(offset) {
            this.paginationOffset = offset;
        },
        paginationSetCurrent(current) {
            this.paginationCurrent = current;
        },
        paginationClear(clearTotal = true) {
            this.paginationSetOffset(0);
            this.paginationSetCurrent(1);

            if (clearTotal) {
                this.paginationSetTotal(0);
            }
        }
    }
};
