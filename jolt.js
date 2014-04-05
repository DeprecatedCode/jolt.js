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

(function (Obj, Fn) {

    /**
     * {}.jolt
     */
    Obj.__defineGetter__('jolt', function () {

        var self = this;
        var cls = self.__proto__.constructor;
        if (!cls.__jolt__) {
            cls.__jolt__ = {};
            cls.__jolt__.__defineGetter__('class', function () {
                return cls;
            });
            cls.__jolt__.__defineGetter__('jolt', function () {
                return function () {
                    console.log(this);
                };
            });
        }
        self.__proto__ = cls.__jolt__;
        return self.jolt;
    });

    /**
     * fn () {}.as('Name')
     */
    Fn.as = function (name) {
        return (new Function("return function (call) { " +
            "return function " + name + " () { return " + 
            "call(this, arguments) }; };")()
        )(Function.apply.bind(this));
    };

})({}.__proto__, (function () {}).__proto__);
