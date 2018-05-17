export default class Progress{
    constructor(callback) {
        this.data = {
            message: null,
            status: null,
            end: false
        };

        this.callback = callback;
    }

    message(message = null) {
        this.data.message = message;

        return this;
    }

    status(status  = null) {
        this.data.status = status;

        return this;
    }

    setEnd() {
        this.data.end = true;

        return this;
    }

    reset() {
        this.data =  {
            message: null,
            status: null,
            end: false
        };
    }

    checkStatus() {
        this.data.status = this.data.status ?  this.data.status : 'success';
    }

    async end() {
        this.setEnd();
        this.checkStatus();

        await this.send();
    }

    async send() {
        await this.callback(this.data);

        this.reset();
    }
}
