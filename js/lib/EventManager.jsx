'use strict';


class EventManager {
    constructor(events) {
        // listeners
        this.listener = {};
        for (var i=0; i<events.length; ++i) {
            var e = events[i];
            this.listener[e] = [];
        }
    }

    fire(evtName) {
        var listenerFuns = this.getListenersFor(evtName);
//      console.warn(this, "firing: "  + evtName + ", " + listenerFuns.length + " listeners");
        if (listenerFuns !== undefined) {
            for (var i=0; i< listenerFuns.length; ++i) {
                var lFun = listenerFuns[i];
                lFun();
            }
        } else {
            throw "Error: event " + evtName + "not handled";
        }
    }


    getListenersFor(evtName) {
        return this.listener[evtName];
    }


    /*
     * Fa sottoscrivere a un client gli eventi evtNames.
     * @param listnerFun funzione da chiamare quando l'evento è attivato
     * @param evtNames evento di cui essere avvisati, singola stringa o array
     */
    register(evtNames, callback) {
        var that = this;

        var registerSingle = function(evtName, callback) {
            var listenerFuns = that.getListenersFor(evtName);
            if (listenerFuns !== undefined) {
//               log("Event Manager registering for:" + evtName);
                that.listener[evtName].push(callback);
            } else {
                alert("JSTV.EventManager: Evento non gestito: " + evtName);
                return;
            }
        };

        if ($.isArray(evtNames) === false) {
            evtNames = [evtNames];
        }

        for (var i=0; i<evtNames.length; ++i) {
            var curEvtName = evtNames[i];
            registerSingle(curEvtName, callback);
        }

    }


    debug() {
        console.log(this.listener);
    }

    static install(obj, events) {
        var evMgr = new EventManager(events);
        obj._eventManager = evMgr;
        var on = function(event, callback) {
            this._eventManager.register(event, callback);
        };
        var fire = function(event) {
            this._eventManager.fire(event);
        };

        obj.on = on;
        obj.fire = fire;
    }

};

export {EventManager}
