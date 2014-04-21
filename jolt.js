/**
 * jolt.js
 * @author Nate Ferrero
 * @license Public Domain
 */

/**
 * About
 * =====
 * 
 * Jolt turns ordinary javascript classes into directed flow graphs.
 * Start by defining a conventional class constructor method:
 * 
 *     var Person = function Person (name) {
 *         this.$jolt();  // This bit makes everything happen
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
 *         return 'Hi, I am %0 from %1'.$fmt(name, planet);
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
 *     bob.setPlanet.in(2000)('Mars');
 *     bob.setPlanet.then(function () {
 *         console.log(bob.greeting);
 *     });
 */

(function (Obj, Fn) {

    /**
     * {}.$jolt
     */
    Obj.__defineGetter__('$jolt', function () {
        var self = this;
        var cls = self.__proto__.constructor;
        if (!cls.__jolt__) {
            cls.__jolt__ = {};
            cls.__jolt__.__defineGetter__('$class', function () {
                return cls;
            });
            cls.__jolt__.__defineGetter__('$jolt', function () {
                return function () {/* for future use */};
            });
            Object.keys(cls).forEach(function (key) {
                if (key === '__jolt__') return;
                setup(cls, key);
            });
        }
        self.__proto__ = cls.__jolt__;
        return self.$jolt;
    });

    /**
     * function () {}.as('Name')
     */
    Fn.as = function (name) {
        return (new Function("return function (call) { " +
            "return function " + name + " () { return " + 
            "call(this, arguments) }; };")()
        )(Function.apply.bind(this));
    };

    /**
     * "".$fmt()
     */
    String.prototype.$fmt = function () {
        var s = this;
        Array.prototype.slice.call(arguments)
        .forEach(function (v, i) {
            s = s.replace('%' + i, v);
        });
        return s.replace(/\%\%/g, '%');
    };

    /**
     * Private: setup
     */
    var setup = function (cls, key) {
        switch (typeof cls[key]) {
            case 'function':
                switch (cls[key].name) {
                    case '':
                        return setupMethod(cls, key);

                    case 'property':
                        return setupPropertyGet(cls, key);

                    case 'classMethod':
                        return setupClassMethod(cls, key);
                }
                throw Error("Function %0.%1 has invalid name: %2"
                    .$fmt(cls.name, key, cls[key].name));
        };
    };

    /**
     * Private: setupMethod
     */
    var setupMethod = function (cls, key) {
        cls.__jolt__.__defineGetter__(key, function () {
            return cls[key].bind(this);
        });
    };

    /**
     * Private: setupPropertyGet
     */
    var setupPropertyGet = function (cls, key) {
        cls.__jolt__.__defineGetter__(key, cls[key]);
    };

    /**
     * Private: setupClassMethod
     */
    var setupClassMethod = function (cls, key) {
        cls.__jolt__.__defineGetter__(key, function () {
            var _cls = this.$class;
            return function classMethod () {
                var a = Array.prototype.slice.call(arguments);
                a.unshift(_cls);
                return _cls[key].apply(undefined, a);
            };
        });
    };

})({}.__proto__, (function () {}).__proto__);
