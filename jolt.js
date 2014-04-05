/**
 * jolt.js
 * @author Nate Ferrero
 */

/**
 * About
 * =====
 * 
 * Jolt turns ordinary javascript classes into directed flow graphs.
 * Start by defining a conventional class constructor method:
 * 
 *     var Person = function Person (name) {
 *         this.jolt();  // This bit makes everything happen
 *
 *         this.name = name;
 *         this.alive = true;
 *     };
 *
 * Next, define instance methods, properties, and class methods:
 * 
 *     Person.setPlanet = function (planet) {
 *         this.planet = planet;
 *     };
 *   
 *     Person.greeting = function property () {
 *         return this.formatGreeting(this.name, this.planet);
 *     };
 *
 *     Person.formatGreeting = function classMethod (cls, name, planet) {
 *         return 'Hi, I am %1 from %2'.replace('%1', name).replace('%2', planet);
 *     };
 * 
 * The basics work as expected:
 * 
 *     var bob = new Person('Bob Miller');
 *     bob.setPlanet('Earth');
 *     console.log(bob.greeting);  // Prints 'Hi, I am Bob Miller from Earth.'
 *
 * However, this also works:
 *
 *     bob.setPlanet('Mars').in(2000)
 *     bob.setPlanet.then(function () {
 *         console.log(bob.greeting);
 *     });
 */

(function (P) {


    /**
     * Run Control
     */
    P.now = function () {
        var args = Array.prototype.slice.apply(arguments);
        var result;
        try {
            result = this.apply(this, args);
            this.emit('success', result);
        }
        catch (e) {
            console.error(e);
            this.emit('error', e);
        }
        this.emit('complete');
        return result;
    };

    P._now = function () {
        var args = Array.prototype.slice.apply(arguments);
        var self = args.splice(0, 1)[0];
        var result;
        try {
            result = this.apply(self, args);
            this._emit('success', self, result);
        }
        catch (e) {
            console.error(e);
            this._emit('error', self, e);
        }
        this._emit('complete', self);
        return result;
    };

    /**
     * Delay Control
     */
    var units = {
        's':     1e3,
        'm':    60e3,
        'h':  3600e3,
        'd': 86400e3
    };

    P.later = function () {
        setTimeout(this.now.bind(this));
    };

    P.in = function (n, unit) {
        if (!this.timers) {
            this.timers = [];
        }
        this.timers.push(setTimeout(this.now.bind(this), (n || 0) * (units[unit] || 1)));
    };

    P.every = function (n, unit) {
        if (!this.intervals) {
            this.intervals = [];
        }
        this.intervals.push(setInterval(this.now.bind(this), (n || 0) * (units[unit] || 1)));
    };

    /**
     * Stop all timers
     */
    P.stop = function () {
        this.timers && this.timers.forEach(function (timer) {
            clearTimeout(timer);
        });
        this.timers = [];
        this.intervals && this.intervals.forEach(function (interval) {
            clearInterval(interval);
        });
        this.intervals = [];
    };

    /**
     * Funj an entire class, equivalent to binding all prototype methods
     */
    P.funj = function () {
        for (key in this.prototype) {
            if (this.prototype.hasOwnProperty(key)) {
                var fn = this.prototype[key];
                this.prototype.__defineGetter__(key, function () {
                    var self = this;
                    return function () {
                        var args = [self].concat(Array.prototype.slice.apply(arguments));
                        return fn._now.apply(fn, args);
                    };
                });
            }
        }
    };

    /**
     * Flow Control
     */
    var events = function () {
        return {'success': [], 'error': [], 'complete': []};
    };

    P.emit = function () {
        var args = Array.prototype.slice.apply(arguments);
        if (!args.length) {
            throw new Error('Function.emit must be called with the event name as the first argument');
        }
        var event = args.splice(0, 1)[0];
        this.events && [event] && this.events[event].map(function (fn) {
            fn.now.apply(fn, args);
        });
    };

    P._emit = function () {
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            throw new Error('Function._emit must be called with the event name as the first argument and the thisArg as the second argument');
        }
        var event = args.splice(0, 1)[0];
        this.events && [event] && this.events[event].map(function (fn) {
            fn._now.apply(fn, args);
        });
    };

    P.on = function (event, fn) {
        if (!this.events) { this.events = events(); };
        if (!this.events[event]) { this.events[event] = []; };
        this.events[event].push(fn);
    };

    P.fork = function () {
        var orig = this;
        return function () {
            var args = Array.prototype.slice.apply(arguments);
            return orig.now.apply(orig, args);
        };
    };

    P.then = function (fn) { if (!this.events) { this.events = events(); }; this.events['success'].push(fn) ; return this; };

    P.error = function (fn) { if (!this.events) { this.events = events(); }; this.events['error'].push(fn) ; return this; };

    P.always = function (fn) { if (!this.events) { this.events = events(); }; this.events['complete'].push(fn) ; return this; };

})((function () {}).__proto__);
