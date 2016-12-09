/*****************************
 *
 *  Personal Tween.js
 *      Utilize Robert Penner's Easing Functions
 *
 *      Simply interpolates numbers and returns them
 *      Takes named parameters, and returns those parameters
 *      with tweened values at each call of update()
 *
 *  Usage
 *      D3 style method chaining
 *
 *      Invoked like so:
 *          new Tween(arr parent)
 *              .duration(time)
 *              .easing('easeOutBouce')
 *              .start({
 *                  x: 0,
 *                  y: 0
 *              })
 *              .end({
 *                  x: 100,
 *                  y: 100
 *              });
 *
 *  Usage Notes
 *      parent refers to a parent array that can house all
 *      your tweens.  When a new tween is created, just push it
 *      into some arbitrary array, i.e. tweens.push(tween), then in
 *      your animation loop loop through each tween and update
 *      i.e. tweens.forEach((tween) => tween.update());
 *
 *      When a tween is done, it will remove itself from the
 *      parent array by calling invalidate() on itself
 *      that way when a tween is done it disappears for good
 *
 ********************************/
export default class Tween {
    // Set some initial values in case
    // some intialization parameters are not set
    constructor(parent) {
        // Default values
        this.dur = 1000;
        this.easeFn = this.noEasing;

        // Names of props that this tween is responsible for
        // are captured here, then used later to loop through
        // and update each property one at a time
        this.propsToAnimate = [];

        // Capture start time of tween the first time update()
        // is called.  Important that this starts as null or undefined
        this.startTime;

        // Parent gives access to the array that will house all
        // tweens.  Pattern makes it easier to delete tweens from
        // animation loop
        this.parent = parent;

        // Return this so methods are chainable
        return this;
    }


    // Set starting values for the tween
    // It accepts any named parameter, the value must
    // be a number
    start(startProps) {
        for (var prop in startProps) {
            if (startProps.hasOwnProperty(prop)) {
                this['start'+prop] = startProps[prop];
                this[prop] = startProps[prop];
                this.propsToAnimate.push(prop);
            }
        }
        return this;
    }

    // Set change for values for parameter names matching
    // start params
    end(endProps) {
        for (var prop in endProps) {
            if (endProps.hasOwnProperty(prop)) {
                this['end'+prop] = endProps[prop];
                //this[prop+'Dist'] = (endProps[prop] - this[prop]) / this.numberOfTicks;
            }
        }
        return this;
    }

    // ----------------------------------------//
    // -------- Easing Functions --------------//
    // ----------------------------------------//
    // Robert Penner's Easing Functions

    // PARAMS
    // t = current time (time - start time)
    // b = starting value
    // c = ending value
    // d = duration of tween

    easeOutBouce(t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    }

    easeInOutQuad(t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    easeInOutCubic(t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t + 2) + b;
    };

    noEasing(t, b, c, d) {
        return c * t / d + b;
    }
    // ----------------------------------------//
    // -------- END Easing Functions ----------//
    // ----------------------------------------//

    // Set the duration of the tween
    // Defaults to 1 second
    duration(dur) {
        this.dur = dur || 1000;
        //this.numberOfTicks = this.dur * 60 / 1000;
        return this;
    }

    // Set the easing type
    // Optional - defaults to no easing
    easing(easeType) {
        switch (easeType) {
            case 'easeOutBouce':
                this.easeFn= this.easeOutBouce;
                break;
            case 'easeInOutQuad':
                this.easeFn = this.easeInOutQuad;
                break;
            default:
                this.easeFn = this.noEasing;
                break;
        }
        return this;
    }

    // Add a completion callback handler
    // Optional
    complete(fn) {
        this.onComplete = fn;
        return this;
    }

    // Update should be called inside a requestAnimationFrame
    update(time) {

        // On the first call of update,
        // capture the current time passed by requestAnimationFrame
        // and save it as the startTime for this tween
        if (!this.startTime) {
            this.startTime = time;
        }
        // Check the time to determine if tween should finish
        if (time - this.startTime < this.dur) {

            // for each property passed to this tween,
            // update the value based on the easing function
            // Easing is set to noEasing as a default
            this.propsToAnimate.forEach((prop) => {
                this[prop] = this.easeFn(time - this.startTime, this[`start${prop}`], this[`end${prop}`], this.dur);
            });
        }
        // If the elapsed time is greater than the duration
        // of the tween, invalidate it
        else {
            if (this.onComplete) {
                this.onComplete();
            }
            this.invalidate();
        }
    }

    // Remove tween from parent array
    invalidate() {
        this.parent.splice(this.parent.indexOf(this), 1);
    }
}

