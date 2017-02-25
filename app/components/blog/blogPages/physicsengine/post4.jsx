import React from 'react';
import {Link} from 'react-router';
import ExternalLink from 'app/components/ExternalLink';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light';
import js from 'highlight.js/lib/languages/javascript';
import vim from 'highlight.js/lib/languages/vim';
import html from 'highlight.js/lib/languages/xml';
import solarized from 'react-syntax-highlighter/dist/styles/solarized-dark';
import Latex from 'react-latex';

registerLanguage('javascript', js);
registerLanguage('vim', vim);
registerLanguage('html', html);

export default (
             <div itemProp='articleBody'>
                <h1>Building a Physics Engine, Pt. 4 - Circle, Polygon, and the Update Loop</h1>
                <p className='post-date'>Dec 31, 2016</p>
                <p>Now we're going to add a few more primitive shapes - a circle and polygon, as well as make the shapes update.</p>
                <h2>The Circle</h2>
                <p>The circle will grab the Body object as it's prototype (If you need a refresher on the Body object, see <Link to='/blog/physengine2'>this post</Link>), and add any specific properties or methods specific to cirlces.  This code should look pretty familiar by now, it's how we've been structuring things for a while.  I like to bypass the <code>new</code> keyword, just because I think it's ugly, but you could obviously structure these objects in a million different ways.  It's one of the blessings and terrible terrible curses about Javascript.  Anyway, here it is:</p>
                <p>In a new file <em>Circle.js</em> in the same directory as <em>Body.js</em></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Import relevant stuff
import Body from './Body';

// I have a 'math' module with some helpful functions,
// distance just computes the euclidean distance between two points
// It looks like this - if you're really not sure what I'm talking about
// export const distance = function(x1, y1, x2, y2) {
//     return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
// };
import {distance} from '../math/math';

// Circle convenience 'constructor'
let circle = function(options) {
    options = options || {};
    let B = Object.create(Body);
    B.init(options);

    B.radius = options.radius || 10;
    B.scaledRadius = B.radius;
    B.type = 'circle';
    B.aabb = aabb(B);

    B.isPointInterior = function(x, y) {
        let bx = B.position.x,
            by = B.position.y;
        if (distance(x, y, bx, by) <= B.scaledRadius) {
            return true;
        }
        return false;
    };

    return B;
};

export default circle;

`}</SyntaxHighlighter>
                <p>And that's it.  It's really quite simple.  We're exporting a simple function that creates a new Body, runs it's initialization code, then adds a <code>type</code> property, and <code>radius</code> and a <code>scaledRadius</code> property, among other things.  Why do we need two radii?  Well, in the future we'll want to be able to scale objects easily, through a <code>scale</code> property on <code>Body</code> objects.  If the user sets scale to 2, then the radius would double in size, but then what if the user changes the radius? Do we assume they also want to set the scale back to 1? Or keep it at 2? If they set the radius, then we have to make a decision about how to scale the object.  By keeping radius, and scaledRadius separate, we allow the user to set whatever radius they want, whatever scale they want, and the system will use the scaled radius - i.e. radius * scale, to draw and determine collision behavior.</p>
                <p>There's also a simple method <code>isPointInterior</code> which tests for just that, if a passed in x and y value are inside the circle.  Might be useful later, but it was simple enough to write up, so there it is.</p>

                <p>So with that code above, we can now create new circles in the following manner</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
import circle from './Circle'; // Assuming we're in the same directory

// Pass in an object of parameters
let c = circle({
    x: 100,
    y: 100,
    radius: 20,
    strokeStyle: 'red',
    lineWidth: 1
});
`}</SyntaxHighlighter>

                <h2>Now onto the polygon</h2>
                <p>Polygons are a bit trickier. Let's work backwards for this one, and think about how we, as a user, would want to interface with a polygon object.  We know that we can't just width and height, since polygons don't really have a true width and height (unless you're talking about their bounding box).  Instead, we'll need to directly define vertices, but that can be a pain if we're working in absolute coordinates.  So it'd be nice if we could define the vertices using relative coordinates, then use position to translate all the vertices to a world position.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Assuming we have a Polygon object to access
import polygon from './Polygon';

// Just like the circle object, it'll take an object of parameters
let p = polygon({
    x: 100,
    y: 100,
    vertices: [
        {x: 0, y: 0},    // First point in polygon
        {x: 50, y: 50},  // Second point
        {x: -50, y:50}  // Last point
    ],
    strokeStyle: 'blue',
    lineWidth: 1
});
`}</SyntaxHighlighter>
                <p>So that's how we'd like to write it.  Notice how the first vertex is at (0, 0).  That's a relative coordinate.  It's (0, 0) away from the position, which is (100, 100).  So in world coordinates, the polygon is actually a triangle with vertices (100, 100), (150, 150), (50, 150).  But it's easier to think in relative terms when coming up with the shape.</p>
                <p>Let's see what it would take to get that to work.  In <em>Polygon.js</em> in the same directory as <em>Body.js</em></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
import Body from './Body';

// Create a convenience 'constructor', like always
var polygon = function(options) {
    options = options || {};

    // Create and initialize a body, but require that vertices be passed as
    // a parameter if creating a polygon
    var B = Object.create(Body);
    if (!options.vertices) {
        throw new Error('Polygons MUST be initialized with vertices. See docs.');
    }
    B.init(options);

    // Set type
    B.type = 'polygon';

    //Initialize vetices
    // Here's where we'll store the relative vertices - i.e. (0, 0), (50, 50),
    // etc.
    B._relativeVertices = [];

    // public vertices, (contain world coords);
    // Here's where we'll store world coordinates, i.e. (100, 100), (150, 150),
    // etc.
    // These will be used for all drawing and collision detection
    B.vertices = [];

    // Loop through passed in vertices
    options.vertices.forEach(vert => {
        // Push relative verts
        B._relativeVertices.push(vert.x, vert.y);

        // Add world coords to relative vertices
        B.vertices.push(options.x + vert.x, options.y + vert.y);
    });

    /**
    * Update vertices - to be used in Update loop
    * Recalculates public vertices with new world position
    * @method
    */
    B.updateVertices = function() {
        B.vertices.forEach((vert, index) => {
            // Use the relative vertices and add the new position to them
            let relVert = B._relativeVertices[index];
            vert.x = relVert.x + B.position.x;
            vert.y = relVert.y + B.position.y;
        });
    };

    /**
    * Check if point is inside polygon
    * @param {number} x - x coordinate
    * @param {number} y - y coordinate
    * @return {bool} inside - either true or false
    */
    B.isPointInterior = function(x, y) {
        var inside = false;
        for (var i = 0, j = B.vertices.length - 1; i < B.vertices.length; j = i++) {
            let vi = B.vertices[i];
            let vj = B.vertices[j];
            var xi = vi.x,
                yi = vi.y;
            var xj = vj.x,
                yj = vj.y;

            var intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    };

    // Upon first initialization, we have to update vertices
    // to create all public vertices
    B.updateVertices();
    return B;
};

export default polygon;

`}</SyntaxHighlighter>
                <p>Not so bad, just a little trick with private and public vertices.  It's not necessary, by any means, but it's a nice convenience for creating polygons.</p>

                <h2>A Wild Vector Appears!</h2>
                <p>If you've had any experience with physical simulation before, you've probably come across the idea of vectors.  Vectors are pivotal to any good engine because they make the math oh so much simpler.  We could probably get by without them, but why would we do such a thing?  We could also take one of the million vector JS libraries out there and just use it, but we like to do things the slow, annoying way, so we're going to build out our own vector object.  But don't worry, it's actually pretty simple.  Here's the skeleton and a few simple methods:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
const Vector = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Vector.prototype = {
    clone: function() {
        return new Vector(this.x, this.y);
    },

    add: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    },

    subtract: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    },

    multiply: function(vec) {
        if (typeof vec === 'object') {
            this.x *= vec.x;
            this.y *= vec.y;
        } else if (typeof vec === 'number') {
            this.x *= vec;
            this.y *= vec;
        }

        return this;
    }
};

var vector = function(x, y) {
    return new Vector(x, y);
};

export default vector;

`}</SyntaxHighlighter>
                <p>Our vector object is pretty simple so far.  All it can do is add, subtract, and multiply.  I'm wrapping the constructor call in a convenience function because why not. Also, you're probably asking why I didn't follow the same pattern as with all my other objects.  You'll see why in a moment, but it has to do with the fact that we'd like to add some static methods onto the constructor function.</p>
                <p>To back up a step, a vector is just an object with an <code>x</code> and <code>y</code> property, and a bunch of methods to manipulate those values.  It represents an arrow pointing from the origin of the system (0, 0) to the x and y coordinates.  They're useful for all sorts of operations, namely translation, rotation, and scaling, and they make physics math much simpler, as we'll see in a bit.  Right now our vector object is can only do a small fraction of what vectors are capable of, but don't worry, as we get into more complex manipulations, we'll start fleshing out this vector object more fully.  One thing I will add right now, though, is a way to perform vector operations without manipulating the original vectors.</p>
                <p>You'll notice, in the code above, that all the operations, except for <code>.clone()</code> actually change the x and y values on the object.  That's great if we want to update, say, the position of a body.  But what if want to perform an operation in the future where we'd like to add two vectors together and get back a third, new, vector without changing the first two?  Why would we want to do that, you ask?  Well, just wait, we'll need to eventually. Trust me on that.  So to accomplish that, we take advantage of the fact that in Javascript, functions are <em>just</em> objects.  That's right, they can have methods and properties, just like any other object.</p>
                <p>Let's add some code below all the other code in <code>Vector.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
export default vector;
// Continue under the export line from above

// ---------- Static Methods -----------//

// These are being added to a function! Crazy, right!?
// Notice now they return a new Vector.  Neither v1 or v2
// are modified in any way.
Vector.add = function(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
};
Vector.subtract = function(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
};
Vector.multiply = function(v1, v2) {
    if (typeof v1 === 'number' && typeof v2 === 'number') {
        return v1 * v2;
    }

    if (typeof v1 === 'object' && typeof v2 === 'number') {
        return new Vector(v1.x * v2, v1.y * v2);
    }

    if (typeof v2 === 'object' && typeof v1 === 'number') {
        return new Vector(v1 * v2.x, v1 * v2.y);
    }

    return new Vector(v1.x * v2.x, v1.y * v2.y);
};

`}</SyntaxHighlighter>
                <p>I'm adding methods DIRECTLY to the function.  Bizarre.  It takes some getting used to, but it's pretty nifty.  So <code>Vector</code> can either be used as a constructor (i.e. <code>new Vector(10, 20)</code>), or we can use the static methods we defined above to create a new vector from two previous vectors (i.e. <code>Vector.add(vec1, vec2)</code>).  The latter will take vec1 and vec2, add them together, and return a new, third, vector without modifying vec1 or vec2.  Neat.</p>
                <p>Okay, so with the vector object ready to go, let's see the update loop.  Finally, amirite?</p>
                <h2>The Update loop</h2>
                <p>We have all this nice code for primitive shapes, but they don't actually update yet.</p>
                <p>First let's convert <code>position</code> to be an instance of the vector object we just created. So inside <code>Body.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    init: function() {
        // ----- More code above ----- //

        // Replace this.position with a vector,
        // Also add velocity.  We're doing some checking to ensure a velocity
        // was passed as a param, and if not, set a default value of 0
        this.position = vector(options.x || 0, options.y || 0);
        this.velocity = vector(
            (options.velocity && options.velocity.x) || 0,
            (options.velocity && options.velocity.y) || 0
        );
    }

`}</SyntaxHighlighter>
                <p>While we're at it, let's change the Rect's and Polygon's vertices to be vectors</p>
                <p>In <code>Rect.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Rect.js
import vector from '../math/Vector';
var rect = function(options) {

    // MORE CODE ABOVE //

    // Change B.updateVertices to the following
    B.updateVertices = function() {
        let w = this.width,
            h = this.height,
            x = this.position.x,
            y = this.position.y;
        B.vertices = [
            vector(x, y),
            vector(x + w, y),
            vector(x + w, y + h),
            vector(x, y + h)
        ];
    };

    // MORE CODE BELOW //
}
`}</SyntaxHighlighter>
                <p>In <code>Polygon.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Polygon.js
import vector from '../math/Vector';

var polygon = function(options) {
    // MORE CODE ABOVE //

    // Change vertices to vectors
    options.vertices.forEach(vert => {
        B._relativeVertices.push(vector(vert.x, vert.y));
        B.vertices.push(vector(options.x + vert.x, options.y + vert.y));
    });

    // MORE CODE BELOW //
};

`}</SyntaxHighlighter>
                <p>Inside <code>Body.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    update: function() {
        // Use position vector, and add velocity each update
        this.position.add(this.velocity);

        // For rects and polygons, we need to update their vertices
        // each loop
        if (this.updateVertices) {
            this.updateVertices();
        }

        return this;
    }

`}</SyntaxHighlighter>
                <p>So, what we're doing in <code>update()</code> is ultimately pretty simple.  Vectors allows us to update the position of the body in one line. We know from basic physics that velocity means 'change in position over time'.  So we can determine that for each 'tick' (i.e. each loop of the animation), that the position should change equal to the velocity.  If our velocity is 1 pixel per loop, and our position is 20 pixels, then over 1 loop, the position will change by 1 pixel, and the world position will update to be 21 pixels.  This is essentially what we're doing.  By adding velocity each loop, we're saying that the position changes by that much each time, and we'll get a non-accelerating motion.  If we want to include acceleration, we'd need something to change the velocity (which is the definition of acceleration - change in velocity over time). We'll get to that, but for now, let's leave it here and focus on some other stuff.</p>

                <h2>Next Time</h2>
                <p>We're starting to amass quite a few files.  So next time I'm going to quickly go over organization, and the method I'm using to build the library.  You'll notice I'm writing ES6 code, and while support is rapidly coming online as of Dec 2016 (when I'm writing this post), we still need to deal with transpiling to get access to any ES6 features we want.  It also means we'll end up with a library that can run anywhere, because it will all get transpiled down to ES5.  So that's next time, organization, and setup.  Boring, but for the modern day JavaScript developer, unfortunately necessary.</p>
            </div>
);
