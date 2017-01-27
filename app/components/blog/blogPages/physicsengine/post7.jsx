import React from 'react';
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
     <div>
        <h1>Building a Physics Engine, Pt. 7 - Axis-Aligned Bounding-Box (AABB)</h1>
        <p className='post-date'>Jan 3, 2017</p>
        <p>The AABB, or axis-aligned bounding-box, represents a non-rotated square that outlines an arbitrary shape.  It's easier to see with an image</p>
        <img src='/images/blog/post7/aabb1.png' alt='axis aligned bounding box'/>
        <p>The red box represents the AABB.  Notice how it's not rotated.  That is the 'Axis-Aligned' part.  It's always perfect aligned to our axes. And it grows larger to accomodate the larger x-space occupied by the rotated rectangle.  That's the 'Bounding-Box' part.  It always encompases the entire shape by growing or shrinking to accomodate the shape's changing scale or rotation.</p>
        <h2>So what's it good for?</h2>
        <p>First and foremost, we can use the AABB to solve the issue from the last post of a rotating rectangle slightly traveling past the boundaries of the system before bouncing off the walls.  We'll get there in a second, but first we need to implement the AABB.</p>
        <h2>AABB Object</h2>
        <p>I created a new folder in the directory called <em>geometries/</em> inside of which I created a new file called <em>AABB.js</em></p>
        <p>Let's edit that file and create our very familiar object skeleton.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
let AABB = {
    init: function(body) {
        this.body = body;
        this.min;
        this.max;
    }
};

let aabb = function(body) {
    let ab = Object.create(AABB);
    ab.init(body);
    return ab;
};

export default aabb;

`}</SyntaxHighlighter>
        <p>Nothing new here, just creating an empty object factory, essentially.  Notice how to initialize a new AABB, we pass in a Body object.  We can then use the body vertices to calculate the position and size of the AABB, which we'll store in the <code>min</code> and <code>max</code> properties.</p>
        <p>A box can easily be defined by it's upper left corner's coordinates (we'll call this the <em>min</em>) and it's lower right corner's coordinates (we'll call this the <em>max</em>).  The width, then is just <code>max.x - min.x</code>.  The same for the height.  The upper left is easy - we just take the position of the Body.  But how do we figure out the max?</p>
        <p>Well, the max point simply has the coordinates of the maximum x coordinate of any of the vertices, and the maximum y of any of the vertices.  So if we loop through all the vertices, find the max and min, then we can combine those to create our AABB's max coordinate.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
let AABB = {
    init: function(body) {
        this.body = body;

        // Upon initialization, get min and max for the first time
        let bounds = this.findMinMax(body);

        // Store them internally
        this.max = bounds.max;
        this.min = bounds.min;
    },

    // New function to find Min and Max values
    findMinMax: function() {
        // Only deal with two types of bodies...
        // Those with vertices, and circles

        // Polygon's and Rectangles
        if (this.body.vertices) {
            // Keep track of min and max values as we move through the vertices
            let minx,
                miny,
                maxx,
                maxy;

            // Loop through all vertices
            this.body.vertices.forEach(v => {
                // Grab x and y off the vertex
                let x = v.x,
                    y = v.y;

                // If this is the first vertex, minx will be undefined,
                // so set it for the first time
                if (typeof minx === 'undefined') {
                    minx = x;
                } else if (typeof minx !== 'undefined' && x < minx) {
                    // Else, minx has a previous value, so check if the next
                    // value is smaller than the previously stored value
                    // If so, update minx;
                    minx = x;
                }

                // Do the same for the other three coordinate points
                if (typeof miny === 'undefined') {
                    miny = y;
                } else if (typeof miny !== 'undefined' && y < miny) {
                    miny = y;
                }

                if (typeof maxx === 'undefined') {
                    maxx = x;
                } else if (typeof maxx !== 'undefined' && x > maxx) {
                    maxx = x;
                }

                if (typeof maxy === 'undefined') {
                    maxy = y;
                } else if (typeof maxy !== 'undefined' && y > maxy) {
                    maxy = y;
                }
            });

            // Return an object with min and max coordinates
            return {
                max: {
                    x: maxx,
                    y: maxy
                },
                min: {
                    x: minx,
                    y: miny
                }
            };
        }

        // Else, we have a circle!
        else {
            // Circles are easy,
            // it's position refers to the center, so we subtract or add
            // the radius as needed to get the min and max
            let cx = this.body.position.x,
                cy = this.body.position.y,
                r = this.body.scaledRadius;
            return {
                max: {
                    x: cx + r,
                    y: cy + r
                },
                min: {
                    x: cx - r,
                    y: cy - r
                }
            };
        }
    },
}

    `}</SyntaxHighlighter>

        <p>It's a long function, but it's not complicated.  We're just looping through vertices of the body and keeping track of the smallest and largest x and y points.  That gives us the bounds of the AABB.</p>
        <p>We also want a convenient way to update the bounds as needed, so we can create a simple helper function <code>.update()</code>.</p>

        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// New function on AABB object
update: function() {
    let {max, min} = this.findMinMax();
    this.max = max;
    this.min = min;
}

`}</SyntaxHighlighter>
        <p>The update function isn't strictly necessary, but It's a nice convenience, that way we can just call <code>aabb.update()</code> and know that the internal min and max are set.</p>
        <p>All that's left is that we add them to the bodies.  Inside each <em>Rect.js</em>, <em>Polygon.js</em>, and <em>Circle.js</em>, we add an <code>.aabb</code> property.</p>
        <p>Note: The following code block holds code from different files, but for clarity they've all been put into a single window...</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Polygon.js
import aabb from '../geometries/AABB';
var polygon = function(options) {
    options = options || {};

    var B = Object.create(Body);
    B.init(options);

    // Code here removed for clarity

    // Initialize...
    B.updateVertices();
    // Initialize an AABB on the Body object, after the vertices
    // are initialized.
    B.aabb = aabb(B);
    return B;
};


// Rect.js
import aabb from '../geometries/AABB';
var rect = function(options) {
    options = options || {};

    let B = Object.create(Body);
    B.init(options);

    // Code removed for clarity

    B.updateVertices();

    // Create the AABB after initializing the vertices
    B.aabb = aabb(B);
    return B;
};

// Circle.js
import aabb from '../geometries/AABB';
let circle = function(options) {
    options = options || {};
    let B = Object.create(Body);
    B.init(options);

    B.aabb = aabb(B);
}

`}</SyntaxHighlighter>
        <p>That's all we need to do to add the AABB.</p>
        <h2>For real, what's it good for?</h2>
        <p>Let's fix our demo from the last post to use the AABB as a check for wall collisions. It's super simple, only change a tiny bit of code.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
function loop() {
    r.rotation += .03;

    // Bounce off walls
    // use AABB min and max to test for system boundaries
    if (r.aabb.max.x >= system.width || r.aabb.min.x < 0) {
        r.velocity.x *= -1;
    }

    if (r.aabb.max.y >= system.height || r.aabb.min.y < 0) {
        r.velocity.y *= -1;
    }

    // Scale up and down
    if (r.scale > 2) {
        scaleDir = -scaleDir;
    } else if (r.scale < 0.5) {
        scaleDir = -scaleDir;
    }

    r.scale += .01 * scaleDir;
}

`}</SyntaxHighlighter>
        <img src='/images/blog/post7/aabb2.gif' />
        <p>See how it's getting stuck!?  What a bummer.  It's doing that because we don't handle our wall collision very well.  It's possible that the velocity get's reversed, but even after another tick, the aabb is still outside the system, which will cause the velocity to reverse again, pushing it out of the system again.  It's exacerbated by the fact that the rect is also scaling up.  Lucikly, dealing with this pretty simple.  We just need to push the rectangle back into the system a bit as soon as it collides with the wall, to ensure it's bounding box is entirley inside the system for the next tick.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
function loop() {
    r.rotation += .03;

    // Bounce off walls
    // use AABB min and max to test for system boundaries
    if (r.aabb.max.x >= system.width || r.aabb.min.x < 0) {
        r.velocity.x *= -1;

        // Push the rect back into the system by moving it one extra 'tick'
        // r.position.add(r.velocity);
        // But that doesn't take into account scale.

        // To take into account scaling, we could do somethign like this
        r.position.x += r.velocity.x * r.scale;
    }

    // Also nudge the rect in the y direction
    if (r.aabb.max.y >= system.height || r.aabb.min.y < 0) {
        r.velocity.y *= -1;
        r.position.y += r.velocity.x * r.scale;
    }

    // Scale up and down
    if (r.scale > 2) {
        scaleDir = -scaleDir;
    } else if (r.scale < 0.5) {
        scaleDir = -scaleDir;
    }

    r.scale += .01 * scaleDir;
}
`}</SyntaxHighlighter>
        <img src='/images/blog/post7/aabb3.gif' />
        <p>And there you have it.  A smooth bouncing rect.  Super exciting.</p>
        <h2>Next Time</h2>
        <p>We're getting ready for the heart of all physics engines, collisions, but we're not quite ready.  We know from past experience trying to collide bodies with each other that if we naively check if a body is colliding with every other body, then it won't take long before we have so many collision checks running that our engine will come to an ugly, grinding, perhaps browser freezing, hault.  So next we're going to look into a simple way to subdivide the system into buckets.</p>
    </div>
);
