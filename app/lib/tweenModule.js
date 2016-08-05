// Module pattern for object creation
// Doesn't require use of 'new', and hides
// properties that aren't needed publicly
export default function(obj) {

    if (obj.start === undefined || obj.change === undefined) {
        throw('Must define both starting properties and change properties');
    } else {
        var startProps = obj.start;
        var changeProps = obj.change;
    }

    // We need to hold on to start props for easing, so
    // copy all the properties into a new object
    let props = {};
    Object.keys(startProps).forEach(function(prop) {
        props[prop] = startProps[prop];
    });

    // For testing purposes, this is needed only because
    // that's how the other library was built
    // If I did things like htis in practice, I woudn't need this propery
    var propsToAnimate = ['alpha'];

    let duration = obj.duration || 1000;
    let startTime;


    let easeOutBouce = function (t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    };
    
    let easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    let easeInOutCubic = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t + 2) + b;
    };

    let noEasing = function (t, b, c, d) {
        return c * t / d + b;
    };

    let invalidate = function() {

    };

    var easeFn = noEasing;
    if (obj.easing) {
        switch (obj.easing) {
            case 'easeInOutQuad':
                easeFn = easeInOutQuad;
                break;
            default:
                easeFn = noEasing;
        }
    } 
    var onComplete = obj.complete;

    let update = function(time) {

        // On the first call of update, 
        // capture the current time passed by requestAnimationFrame
        // and save it as the startTime for this tween
        if (startTime === undefined) {
            startTime = time;
        }
        
        // Check the time to determine if tween should finish
        if (time - startTime < duration) {

            // for each property passed to this tween,
            // update the value based on the easing function
            // Easing is set to noEasing as a default
            Object.keys(props).forEach((prop) => {
                props[prop] = easeFn(time - startTime, startProps[prop], changeProps[prop], duration);
            });
        } 
        // If the elapsed time is greater than the duration
        // of the tween, invalidate it
        else {
            if (onComplete) {
                onComplete();
            }
            //invalidate();
        }
    };

    return {
        update,
        propsToAnimate,
        props,
    };
}
