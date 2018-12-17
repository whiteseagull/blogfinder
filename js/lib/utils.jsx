class TimeConverter {
    static convert(afterWhen) {
        console.log("aw", afterWhen);
        var now = Date.now();
        
        const aWeek = 1000 * 60 * 60 * 24 * 7;
        const aMonth = aWeek * 4;
        const sixMonths = aMonth * 6;

        let when;
        if (afterWhen == "lastWeek") {
            when = new Date(now - aWeek);
        } else if (afterWhen == "lastMonth") {
            when = new Date(now - aMonth);
        } else if (afterWhen == "lastSixMonths") {
            when = new Date(now - sixMonths);
        }
        return when;
    }
    
    static millisToISO(millis) {
        return new Date(millis).toISOString();
    }
}


class RequestExecutor {
    
   /**
    * @param {any} delay delay between requests
    * @param name mnemonic name of the executor
    */
    constructor(name, delay) {
        this.requestQueue = [];
        this.realSendInterval = undefined;
        this.lastReq = 0;
        this.name = name;
        this.delay = delay;
    }
    
    isWorking() {
        return (this.realSendInterval != undefined);
    }
    
    realExecute() {
        if (this.requestQueue.length > 0) {
            var now = Date.now();
            if (now - this.lastReq > this.delay) {
//                console.log(this.name);
                let request = this.requestQueue.pop();
//                console.log("Executing request ", now);
                request();
                this.lastReq = Date.now();
            }
            if (this.requestQueue.length > 0 && this.realSendInterval == undefined) {
                var that = this;
                this.realSendInterval = setInterval(
                        function(){that.realExecute();}, that.delay);
            }
        } else {
            clearInterval(this.realSendInterval);
            this.realSendInterval = undefined;
        }
    }
    
    execute(request) {
        this.requestQueue.push(request);
        this.realExecute();
    }
}

export {RequestExecutor, TimeConverter};