/*
 * blogPages.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
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

// require('http://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.css');

let posts = [
    {
        title: 'Building a Physics Engine, Pt. 7 - Axis-Aligned Bounding-Box (AABB)',
        id: 'physengine7',
        url: 'physengine7',
        content: (
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
                <p>We're getting ready for collisions.  We have most of what we need.  Next time, we'll talk about the basics of collisions and implement the beginngs of our collision system.</p>
            </div>
        )
    },
    {
        title: 'Building a Physics Engine, Pt. 6 - Translation, Rotation, and Scaling',
        id: 'physengine6',
        url: 'physengine6',
        content: (
            <div>
                <h1>Building a Physics Engine, Pt. 6 - Translation, Rotation, and Scaling</h1>
                <p className='post-date'>Jan 1, 2017</p>
                <p>In this post, we'll talk about moving stuff around the screen.  We've seen the basics for how to update the position of an object based on it's velocity, but what if we want the object to rotate or scale?  This brings us into the world of vector transformations.  Let's start with the absolute simplest one - translation.</p>
                <h2>Translation</h2>
                <p>Translation means just what you'd expect.  Translate the location of a point to some other location.  So if we have a vector with x = 10 and y = 20, and we translate it by 5 in the x and 10 in the y, then, pretty straightforwardly, we get a new vector with x = 15 and y = 30.  It's simple addition.  We already have a method on our Vector object to handle addition, so if we want to translate a Body to a new location, we can simply add the translation vector to the Bodies current position.  Let's see some code to explain it a bit.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
const Body = {
    // Add a new method to our body object
    translate: function(x, y) {
        // All we need to do is add the x and y values to the bodies
        // position.  Voila, translation.  Simple, no?
        this.position.x += x;
        this.position.y += y;

        // And update the vertices of the Body
        // to ensure they stay in sync with it's current
        // position
        if (this.updateVertices) {
            this.updateVertices();
        }

        // Return 'this' for chaining method calls
        return this;
    },
}

`}</SyntaxHighlighter>
                <p>That's it.  That's translation.</p>
                <p>We can make one minor improvement and make this method more flexible so that it accepts either a vector object, or two coordiante points.  To do so, we'll take advantage of ES6 rest paramters which allow us to pass an arbitrary number of arguments into a function.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
const Body = {
    // our translate method will take any number of arguments
    translate: function(...args) {
        // We get back an array with the passed in args
        // Check the length of args:
        //  if 1 arg passed - assume it's a vector
        //  if 2 args passed - assume they're coordinate points
        if (args.length === 1) {

            // Do some extra type checking to ensure an objet was passed
            if (typeof args[0] === 'object') {
                // Add passed in vector to current position
                this.position.add(args[0]);
            }
        } else if (args.length === 2) {
            // Check to ensure both args are numbers
            if (typeof args[0] === 'number' && typeof args[1] === 'number') {
                // Add values directly to position
                this.position.x += args[0];
                this.position.y += args[1];
            }
        }

        if (this.updateVertices) {
            this.updateVertices();
        }
        return this;
    },
}

`}</SyntaxHighlighter>
                <p>That last thing we should do is add a convenience function to our Vector object for translating vectors directly.  In <em>Vector.js</em>, add a method called <code>translate</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    // You'll notice that this is exactly the same as the 'add' function
    // so why even bother?  Well it's nice to have things named by precisely
    // what they do, so here it is
    translate: function(x, y) {
        this.x += x;
        this.y += y;

        // return 'this' for chaining vector methods
        return this;
    },

`}</SyntaxHighlighter>
                <p>Because <code>.translate</code> is exactly the same as <code>.add</code>, there's no reason to have two separate methods, and we could just alias one to the other, but I'll leave that for you to figure out.  It's very straightforward.  We could also make all our vector methods more advanced by allowing them to accept either numbers or another vector, but again, I'll leave that for you to work through.  It's exaclty the same procedure as we did on the Body translate method.</p>
                <h2>Naive Rotation</h2>
                <p>Translation was dirt simple, but rotation is significantly trickier.  We're working with vectors, so our goal should be to create a <code>rotation</code> method on our Vector object.  If you'd like to see a full derivation of vector rotation, <ExternalLink url='https://en.wikipedia.org/wiki/Rotation_(mathematics)#Two_dimensions'>Wikipedia has a solid page on it.</ExternalLink></p>
                <p>Given a vector (x, y), we can rotate it by the angle <Latex>$\theta$</Latex> by applying the following operation.  x' and y' represent the new coordinates.</p>
                <Latex>$ x' = x \cos \theta - y \sin \theta $</Latex><br />
                <Latex>$ y' = x \sin \theta + y \cos \theta $</Latex>
                <p>Let's add this to our Vector object.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    // Add this method to the Vector object
    // Note: Angle is in radians
    rotate: function(angle) {
        // Grab sin and cos values for passed in angle
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        // Perform rotation operation
        let x = (this.x * cos) - (this.y * sin);
        let y = (this.x * sin) + (this.y * cos);

        // Set new x and y values
        this.x = x;
        this.y = y;

        // Return 'this' for method chaining
        return this;
    },

`}</SyntaxHighlighter>
                <p>Now we need to handle adding rotation to the Body.  Let's create a property to hold the rotation, as well as some code to update the vertices according to the rotation.</p>
                <p>Let's test it out on the rectangular body first.  First, inside <em>Body.js</em>, add a line to keep track of the rotation of the body (next to all the other lines holding properties).</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    // Inside Body.init()
    //... next to other properties, like position, width, etc.
    this.rotation = options.rotation || 0;
    // ...

`}</SyntaxHighlighter>
                <p>Now, in <em>Rect.js</em> and inside the updateVertices method:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
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

        // NEW CODE - handle rotation of vertices vectors
        if (B.rotation) {
            // Loop through all the vertices and rotate them.
            B.vertices.forEach(vertex => {
                // Use vector.rotate() method to rotate each vertex
                vertex.rotate(this.rotation);
            });
        }
    };

`}</SyntaxHighlighter>
                <p>Now let's test this out in our demo page to see if it's all working.  If you're not sure how to get a demo page up and running, see <Link to='/blog/physengine5'>the last post about webpack</Link>.  To reiterate, I have an index.html file in a demo folder.  I'm using webpack to build my library into a distribution file.  Then I'm loading that script into my html file, as well as a script file that I can write code to test the library.  The HTML file looks like this:</p>
                <SyntaxHighlighter
                    language='html'
                    style={solarized}
                >
{`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Demo</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <canvas id='canvas'></canvas>
        <script src='../dist/sciplay.js'></script>
        <script src='demo.js'> </script>
    </body>
</html>

`}</SyntaxHighlighter>
                <p>And in the the same folder, create a file called <em>demo.js</em>.  Opening up demo.js, let's write some code.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Instantiate a new sciplay object
var sci = sciplay();

// Create the system, give a width and height
var system = sci.system({
    width: 900,
    height: 600
});

// Create the renderer, give the id of the canvas element in the HTML doc, as
// well as the desired background color
var renderer = sci.renderer({
    canvas: 'canvas',
    background: 'black'
});

// Create two Rect bodies
var r = sci.rect({
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    strokeStyle: 'orange'
});

var r2 = sci.rect({
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    strokeStyle: 'green'
});

// Add the rects to the system
system.add(r);
system.add(r2);

// Render the system
renderer.render(system);

`}</SyntaxHighlighter>
                <p>We should expect to see two overlapping rectangles, like so:</p>
                <img src='/images/blog/post6/rotation1.png' />
                <p>Now in the javascript console (which you can get to in chrome by right clicking on the webpage and selecting 'inspect'), we can play around with rotation by typing <code>r.rotation = .3</code> and see what happens.</p>
                <img src='/images/blog/post6/rotation2.png' />
                <p>But that's not what we want.  At least, that's not what I want.  I want the shapes to rotate about their center.  Stay where there are on screen and just spin.  So what's going on?  Let's try rotating the other rectangle the other way - <code>r2.rotation = -.3</code> into the developer tools console.</p>
                <img src='/images/blog/post6/rotation3.png' />
                <p>What's actually happening is that we are indeed rotation our vector, but we're rotating it around the origin point.  In the world of Javascript, the origin is the upper left corner of the screen, so if you play around with this, you'll see the rectangle rolling around the origin.  We can see this happen in real time by adding a loop to our demo script like so:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// After the 'system.add(r)' lines from above...
// Create a loop where we're increment the rotation
// of the bodies
function loop() {
    r.rotation += .03;
    r2.rotation -= .03;
}

// Pass loop to the renderer so it'll get called every frame
renderer.render(system, loop);

`}</SyntaxHighlighter>
                <p>We can clearly see the rectangles spinning about the origin of the screen.</p>
                <img src='/images/blog/post6/rotation4.gif' />
                <h2>Fixing Rotation</h2>
                <p>The equation we used earlier for vector rotation is specifically for rotating vectors about the origin, so how can we offset our rotation so that it happens around the center of the Body?  The answer lies in simple, simple translation.  Let's think about this for a moment.  We have a series of vertices that represent our Body.  We want to twist these vertices about the center of the object, but the only thing we can actually do is rotate them about the origin of the screen.  So, what if we move the body to the origin of the screen, then perform the rotation?  What happens then?  In our demo, let's try that out.  Let's change our rectangle so that it's sitting on the origin and rotate it from there.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Change rect so it's center point is sitting on the origin
let r = sci.rect({
    x: -50,
    y: -50,
    width: 100,
    height: 100,
    strokeStyle: 'orange';
})

`}</SyntaxHighlighter>
                <p>Now we'll see the following behavior.</p>
                <img src='/images/blog/post6/rotation5.gif' />
                <p>Rotating a body when it's center is at the origin works just fine.  What if we then translate it back to it's starting position, after rotating?</p>
                <p>So we have to change our updateVertices method.  Previously it only rotated the object, but now it needs to translate the object's center to the origin, perform the rotation, then translate back to it's previous position.  There's one more little wrinkle, though.  We need to find the center (often referred to as the 'centroid') of the object.  It's actually pretty easy.  We just add up all the vertex vectors and average their components.  Essentially we're getting an average position of all the coordinates.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    B.updateVertices = function() {
        let w = this.width,
            h = this.height,
            x = this.position.x,
            y = this.position.y;

        // Calculate the centroid
        // Rects are easy, just get the midpoint between the corners
        let centroid = vector(
            x: (x + (x + w)) / 2,       // <-- x value
            y: (y + (y + h)) / 2        // <-- y value
        );
        B.centroid = centroid;

        B.vertices = [
            vector(x, y),
            vector(x + w, y),
            vector(x + w, y + h),
            vector(x, y + h)
        ];

        // UPDATED CODE - handle translation-rotation-translation
        if (B.rotation) {
            // Loop through all the vertices and rotate them.
            B.vertices.forEach(vertex => {
                // Use vector.rotate() method to rotate each vertex
                vertex.translate(-centroid.x, -centroid.y)
                    .rotate(this.rotation)
                    .translate(centroid.x, centroid.y);
            });
        }
    };
`}</SyntaxHighlighter>
                <p>And voila, now when we change the rotation, things will work as expected.</p>
                <p>It turns out it's not hard to generalize this to polygons either.  Let's update <em>Polygon.js</em> as well.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    // Inside Polygon.js

    // Update this function to take into account centroid,
    // then apply translation-rotation-translation
    B.updateVertices = function() {
        // Starting centroid object
        B.centroid = {x: 0, y: 0};

        // Loop through each vertex, summing up the x and y compoments
        // separately
        B.vertices.forEach((vert, index) => {
            let relVert = B._relativeVertices[index];
            vert.x = relVert.x + B.position.x;
            vert.y = relVert.y + B.position.y;

            B.centroid.x += vert.x;
            B.centroid.y += vert.y;
        });

        // Calculate centroid by averaging out components
        B.centroid.x /= B.vertices.length;
        B.centroid.y /= B.vertices.length;

        // Update rotate vertices
        if (B.rotation !== 0) {
            // For each vertex - apply translation-rotation-translation
            B.vertices.forEach(vertex => {
                vertex.translate(-B.centroid.x, -B.centroid.y)
                    .rotate(this.rotation)
                    .translate(B.centroid.x, B.centroid.y);
            });
        }
    };
`}</SyntaxHighlighter>
                <p>Finding the centroid is a tiny bit more complex than a rectangle, but it's still pretty simple.  Just loop through all the vertices, sum up the x and y components separately, then divide by the number of vertices to create average x and average y values.  Because our physics engine isn't going to have irregular mass distributions, this will work for all rigid bodies in the future because we assume that mass is distributed equally.  It makes our lives a lot easier.  Non-regular mass distributions get hairy quite quickly.</p>
                <h2>Scaling</h2>
                <p>All that work we went through to get rotation up and running means that scaling is now dirt simple.  If we went through the same exercise, we'd realize that scaling suffers from the same problem as rotation in that if not done at the origin, it will not only scale the size of the shape, but it will move the shape by the scale factor as well.  Not what we want.  So we translate to the origin, apply scaling, then translate back.  But we already have our translation, so all we have to do is add one more line of code to our Rect and Polygon objects</p>
                <p>In <code>updateVertices</code> of both <em>Rect.js</em> and <em>Polygon.js</em> we add the following:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
        // Update rotate vertices
        if (B.rotation !== 0 || B.scale !== 1) {
            // For each vertex - apply translation-rotation-translation
            B.vertices.forEach(vertex => {
                vertex.translate(-B.centroid.x, -B.centroid.y)
                    .rotate(this.rotation)
                    .multiply(this.scale)           // <---- ADD THIS LINE
                    .translate(B.centroid.x, B.centroid.y);
            });
        }

`}</SyntaxHighlighter>
                <p>We haven't added a <code>.scale</code> property to our Body object, but that's pretty simple, we just add the line <code>this.scale = options.scale || 1;</code> in with all the other property definitions.</p>
                <h2>One last example</h2>
                <p>Now that we have all the transformations in place, let's mess around with them.</p>
                <p>In our <em>demo.js</em> file, let's remove the second rectangle, add the loop function back in, give the first rectangle some velocity, then, inside loop, rotate, scale, and make the rectangle bounce off the walls.  With our burgeoning library, it takes very little code, and more importantly, very little logic, to accomplish all that.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Setup stuff - make top level object, system, renderer
var sci = sciplay();

var system = sci.system({
    width: 900,
    height: 600
});

var renderer = sci.renderer({
    canvas: 'canvas',
    background: 'black'
});

// Create a rectangle, and give it some velocity
// We can either pass a vector directly, or just give velocity
// an object with x and y props
var r = sci.rect({
    x: 200,
    y: 300,
    width: 100,
    height: 100,
    strokeStyle: 'orange',
    velocity: {
        x: 4, y: 2.5
    }
});

// Add it the system
system.add(r);

// Setup our loop function
// Hold the direction that we want to scale our object in this variable, it'll
// only ever have the values of 1 or -1
let scaleDir = 1;
function loop() {
    // Each loop, add a little rotation to the object
    r.rotation += .03;

    // Bounce off walls
    // if the right edge of the rect is greater than the system size, or the
    // left edge is left of zero, then reverse the x velocity.
    if (r.position.x + r.width > system.width || r.position.x < 0) {
        r.velocity.x *= -1;
    }

    // Do the same for the y velocity
    if (r.position.y + r.height > system.height || r.position.y < 0) {
        r.velocity.y *= -1;
    }

    // If the scale of the rectangle gets above or below a certain
    // threshold, then reverse the scale direction
    if (r.scale > 2) {
        scaleDir = -scaleDir;
    } else if (r.scale < 0.5) {
        scaleDir = -scaleDir;
    }

    // Increment the scale
    r.scale += .01 * scaleDir;
}

// Start the renderer, pass in our loop function
renderer.render(system, loop);

`}</SyntaxHighlighter>
                <p>and the result</p>
                <img src='/images/blog/post6/transformations6.gif' />
                <h2>Wrap Up</h2>
                <p>So that's the basics of transformations.  One thing you might notice in the last gif is the fact that while the object is rotating and it hit's an edge, sometimes a corner of the box actually bleeds past the edge of the system.  This is because the position and width of the rectangle aren't actually affected by rotation and scaling.  While this might be a bit on the confusing side, let's think instead about a polygon.  What's the width of an arbitrary polygon?  It depends on which direction you decide to measure in.  Manipulating width as the object rotates is a bit tricky to think about.  So in the next post we'll talk about something called the Axis-Aligned Bounding-Box which will solve this problem for us, as well as make a lot of future operations simpler.</p>
            </div>
        )
    },
    {
        title: 'Building a Physics Engine, Pt. 5 - Organization, Webpack, and a Library',
        id: 'physengine5',
        url: 'physengine5',
        content: (
            <div>
                <h1>Building a Physics Engine, Pt. 5 - Organization, Webpack, and a Library</h1>
                <p>I've read a ton of Javascript tutorials over the years.  And I find that even the ones that are excellently written, often leave you without much context.  They tend to focus on one thing, and try to do that one thing really well.  I'm not suggesting that people write about every little detail, no matter how trivial, but often enough I've been left scratching my head in puzzlement over a minor detail that the author assumed was too trivial to spend time explaining.  Those rabbit holes waste time, and lead to frustration.  As a result, when I decided to document the process of building this engine, I told myself I'd be overly explicit.  Like, to the point where a lot of the stuff you might read is too specific, too detailed, too trivial.  But there's nothing that isn't confusing to at least one person, and what's trivial for one might be confusing for others.  So, in that vein, let's talk organization.</p>
                <h2>The directory structure</h2>
                <p>The first thing to note - all those files we've been creating, they live in the following directory structure.  All source code lives in <em>src</em>, and webpack is going to build files into the <em>dist</em> folder.  You'll notice I've been calling my library sciplay for now.  Placeholder name until I can think of something better.</p>
                <pre className='dir-tree'>
|-- README.md<br/>
|-- demo<br/>
|   |-- playground<br/>
|   |   |-- demo.js<br/>
|   |   `-- index.html<br/>
|-- dist<br/>
|   |-- sciplay.js<br/>
|   `-- sciplay.js.map<br/>
|-- package.json<br/>
|-- node_modules<br/>
|-- src<br/>
|   |-- bodies<br/>
|   |   |-- Body.js<br/>
|   |   |-- Circle.js<br/>
|   |   |-- Polygon.js<br/>
|   |   |-- Rect.js<br/>
|   |-- math<br/>
|   |   |-- Vector.js<br/>
|   |   `-- math.js<br/>
|   |-- renderer<br/>
|   |   `-- Renderer.js<br/>
|   |-- sciplay.js<br/>
|   `-- system<br/>
|       `-- System.js<br/>
`-- webpack.config.js<br/>
</pre>
                <p>Inside <em>src</em>, you'll see our Body objects, the Renderer, the System, and the Vector objects that we've created over the last few posts.  You'll also see a math.js file that houses some extra, simple functions like distance calculations and degrees to radians coversions.  Simple stuff that I want but don't want to have to copy over when I need them.  You'll also notice sciplay.js.  That's the heart of the application.  That's the glue that binds all our files together into a single library.  Let's build out that file now</p>

                <p>In <code>sciplay.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// sciplay.js -> We want to export our entire library as a single object
// to prevent adding more than one thing to the global scope

// We accomplish this by creating an object that exposes anything
// a user of our library might need from it.

/* MATH OBJECTS */
import vector, {Vector} from './math/Vector';

/* CORE OBJECTS */
import system from './system/System';
import renderer from './renderer/Renderer';

/* BODIES */
import rect from './bodies/Rect';
import wave from './bodies/Wave';
import circle from './bodies/Circle';
import polygon from './bodies/Polygon';

// Psuedo 'constructor' - creates a new sciplay object
// Expose vector, renderer, system, and bodies to the public
let sciplay = function() {
    return {
        Vector, // for operations that return a new vector
        vector, // actual vector constructor
        renderer,
        system,
        rect,
        polygon,
        circle
    };
};

export default sciplay;

`}</SyntaxHighlighter>
                <p>Let's step through that code.  First we import the files we created in earlier posts.  Note how when we import the vector object we're grabbing the default export, which was the convenience function for creating new vectors, and the actual constructor, which has the static methods on it.  We could entirely ignore the convenience function, but I like it, so I'm gonna keep it.</p>
                <p>A few notes on syntax.  I'm using ES6 destructuring to grab the Vector object off the vector module.  That's the difference between just exporting something and exporting something as default.  When exported as default - as in <code>export default vector</code> - that's what's' imported when I call <code>import vector from './Vector';</code>.  If I leave off the <code>default</code> keyword, I can stil export stuff, but the import returns an object that I have to pull stuff off.  So <code>export Vector = function()</code> means that when I import I have to pull the Vector function off the import object using destructuring like so <code>import &#123;Vector&#125; from './Vector';</code>.</p>
                <p>The other bit of syntax is the implicit object property inside the <code>sciplay</code> function.  If the name of the property is the same as the name of the variable you're assinging to it, then you can leave off the property name all together.  <code>return &#123; Vector: Vector &#125;;</code> becomes <code>return &#123;Vector&#125;</code>.  It's the same thing in ES6 land.</p>

                <br/>
                <p>So what's that all mean?</p>
                <p>Basically, we're going to use sciplay.js as the single export for our library.  That way when we use the library, only sciplay will be exposed, and we can access bodies, the system, etc. by calling <code>sciplay.system()</code> or <code>sciplay.rect()</code></p>
                <h2>Webpack time</h2>
                <p>For those not familiar, Webpack is essentially a way to automate a bunch of tasks that are usually desireable for a production ...thing.  A webpage, a library, whatever.  If you want to do a bunch of stuff to a file, Webpack usually can do it for you.</p>
                <p>For example, we can use webpack to:</p>
                <ul>
                    <li>automatically bundle all our files into a single file large file</li>
                    <li>use <ExternalLink url='https://babeljs.io/'>Babel</ExternalLink> first to transpile down to ES5 before it concatenates everything</li>
                    <li>minify code (i.e. remove all comments, whitespace, shorten variable names). Useful for shrinking file size of a production file</li>
                </ul>
                <p>But webpack is also really useful for development, because it allows us to hook into linters and run a hot-reloading dev server.  I use eslint, and I can configure webpack, if I so desired, to notify me of any and all linting errors when it builds.  Neat trick for catching style or syntax errors in files that you haven't looked at in a while.  Webpack does a whole host of other things as well (it's very powerful for building out web apps), but here we're just going to focus on what's necessary to build our library.</p>
                <h3>Webpack Setup</h3>
                <p>First thing we need to do is install dependencies.</p>
                <ol>
                    <li>If you haven't done so already, run <code>$ npm init</code> to create a package.json</li>
                    <li>install webpack, and babel for transpiling with <code>$ npm install --save-dev webpack babel-core babel-loader babel-preset-es2015 babel-plugin-add-module-exports</code></li>
                    <li>If you want to install a test runner (more on this later), you can run <code>$ npm install --save-dev mocha chai</code> Don't worry about this at the moment.  We'll get into testing.</li>
                </ol>
                <p>Now make a new file called <code>webpack.config.js</code> in the root of your directory.  If you're not sure, take a look at the directory structure above.</p>
                <p>That is the webpack config file.  To run webpack, (i.e. do all the things we mentioned above), we run <code>webpack</code> on the command line.  But we need to configure webpack so it knows what to do.  That's the job of <code>webpack.config.js</code>.</p>
                <p>Inside that file, we'll put the following:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Load in webpack module
var webpack = require('webpack');
// Load in path module from node
var path = require('path');

var config = {
    entry: path.resolve('./src/sciplay.js'),
    output: {
        path: path.resolve('./dist'),
        filename: 'sciplay.js',
        library: 'sciplay',
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
};

module.exports = config;

`}</SyntaxHighlighter>
                <p>At it's most basic, all we have to do is specify an entry point, and an output path.  We'll use <code>sciplay.js</code> as our entry point, since it's the main module we want to export, and use the <em>dist</em> folder as the export location.  In case you're wondering <code>path.resolve()</code> takes as many strings as you want to give it, and it will construct an absolute path out of the arguments.  So <code>path.resolve('./dist')</code> will return /Users/myusername/dev/sciplay/dist/ . That's not the actual path, but you get the point.</p>
            <p>The output object, requires us to specify a path and a filename, but we can also give it some extra information, like the type of library, in this case UMD, and a library name.  UMD, otherwise known as Univeral Module Definition, will allow for users to import our library in either CommonJS or AMD syntax.  So either <code>var sciplay = require('sciplay')</code> or <code>require(['sciplay'], function(sciplay) &#123;...&#125;)</code>.  UMD tends to be preferable, since it's not much overhead, and it'll handle both cases.</p>
            <p>Finally, the <code>filename</code> property refers to the name of our built output file.  So our bundled library file will be located in './dist/sciplay.js'.  If we want to use it, we can grab it from there and do whatever with it - import it directly into a webpage, for example.</p>
            <h3>Loaders</h3>
            <p>In webpack language, <em>loaders</em> are what process the code before the library file is built.  So we could use a loader to run eslint, and another loader for transpiling with babel.  In other situations, we can use loaders to convert SASS to CSS, or to convert React JSX into regular Javascript.  Loaders are pretty endless, and you can see a huge list of what's possible <ExternalLink url='https://webpack.github.io/docs/list-of-loaders.html'>here</ExternalLink>.  It's pretty insane how many there are.  But usually we only need a few.  Let's add to our config file:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Load in webpack module
var webpack = require('webpack');
// Load in path module from node
var path = require('path');

var config = {
    entry: path.resolve('./src/sciplay.js'),
    output: {
        path: path.resolve('./dist'),
        filename: 'sciplay.js',
        library: 'sciplay',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },

    // Loaders is an array that has to live on the module object
    // Each loader is an object that has a test for filetype,
    // the loader name, and any files you want to exclude
    // test and exclude take regular expressions
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,  // Don't process node_module files...
                loader: 'babel-loader'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,  // Don't process node_module files...
                loader: 'eslint-loader'
            }
        ]
    },
};

module.exports = config;

`}</SyntaxHighlighter>

                <p>The comments should be pretty self explanatory, but the idea is that loaders is an array of objects - each object has a test, exclude, and loader property.  test is a regex for filenames to test, in our case only .js files.  exclude is files we don't want to process, i.e. all our node_modules folder.  And loader is the loader that we're going to run the code through.  In this case we specify 2: babel-loader for transpiling, and eslint-loader for syntax checking.  eslint-loader is completely optional, but I like it.</p>
                <h3>Resolving aliases</h3>
                <p>We need to tell webpack how to handle paths that appear in <code>import</code> statements.  We can use the <code>resolve</code> object to do just that.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Load in webpack module
var webpack = require('webpack');
// Load in path module from node
var path = require('path');

var config = {
    entry: path.resolve('./src/sciplay.js'),
    output: {
        path: path.resolve('./dist'),
        filename: 'sciplay.js',
        library: 'sciplay',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },

    // Add resolve object
    // Define the root of our app (node gives us __dirname for free, which
    // points to the current directory)
    // Tell webpack to look in the node_module folders for importing modules
    // And define acceptable extensions to import
    resolve: {
        root: __dirname,
        modulesDirectories: [
            'node_modules'
        ],
        alias: {
            src: 'src'
        },
        extensions: ['', '.js']
    },

    // Loaders is an array that has to live on the module object
    // Each loader is an object that has a test for filetype,
    // the loader name, and any files you want to exclude
    // test and exclude take regular expressions
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,  // Don't process node_module files...
                loader: 'babel-loader'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,  // Don't process node_module files...
                loader: 'eslint-loader'
            }
        ]
    }
};

module.exports = config;

`}</SyntaxHighlighter>
                <p>Again, the comments should explain most of what the <code>resolve</code> object does, but to reiterate, it tells webpack how to handle <code>import</code> statements.  If given just a string, webpack will look for that module in the node_modules folder.  So <code>import _ from 'underscore';</code> would look for underscore in node_modules, and return it if it's found.  On the other hand, webpack doesn't know anything about our custom js files, like Body.js.  So when we import those, we have to use relative paths.</p>
                <h3>Environment Variables and Source Maps</h3>
                <p>When we're developing the library, we want to have webpack constantly running, and on any change, rebuild our library file.  This is so that we can build a demo webpage, import our library, and write a demo app to ensure things are working as expected.  Turns our webpack has a neat feature to do just that.  If we call webpack with the --watch flag (i.e. <code>$ webpack --watch</code>), then webpack will rebuild our file whenver a source file changes.</p>
                <p>Let's create a little dummy page to ensure everything is working.  Inside the <em>demo/</em> directory create an index.html file and a script.js file</p>

                <SyntaxHighlighter
                    language='html'
                    style={solarized}
                >
{`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Sciplay Demo</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <canvas id='canvas'></canvas>
        <script src='../../dist/sciplay.js'></script>
        <script src='script.js'> </script>
    </body>
</html>

`}</SyntaxHighlighter>
            
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// script.js
var sci = sciplay();
console.log(sci);

`}</SyntaxHighlighter>
                <p>In the sample html file, we load our built library, then load our webpage script.</p>
                <p>To test, we need to run <code>$ webpack</code> from the root directory of the project</p>
                <p>Once the file is build, we can start a server with <code>$ http-server -p 8080</code>, then navigate to localhost:8080 in our browser, click into the dist folder and look at the browser console to see if the library exists.  If it does exist, then we've successfuly built our library with webpack!</p>
                <p>We're not done, though, because while we've loaded our library, it's going to be annoying to debug.  That's because our library exists in one gigantic file, so any errors will show up inside that gigantif file with a bunch of other webpack junk in there.  It gets tough to look at, plus - line numbers in error messages won't match up with line numbers in your source code files.  The answer to this lies in <em>Source Maps</em>.  A source map is basically just a file that links code in your big, monolithic library file to the corresponding locations in your smaller, source code files.  So when you get an error in, the browser will display the source mapped location.  Pretty nifty.  Hooking that up is very simple.</p>
                <p>We also want to setup the production build process for later.  All we want to do for a production file is minify it, so we can use a built in webpack plugin called UglifyJs.  It will strip all comments, shorten variable names, and remove all whitespace.  It'll make the code unreadable, so we'll never use it for development, but if we want to wrap it up and send it to be used somewhere, it's better for it to be minified.  Le'ts see how to do both those things.</p>
                <p>In <code>webpack.config.js</code></p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
var webpack = require('webpack');
var path = require('path');

// THIS IS NEW!
// We'll grab the BUILD_ENV environment variable and use it to make a few
// decisions about how to build our library
// if BUILD_ENV is set to 'production', then we'll minify, and we'll call
// our file 'sciplay.min.js' to keep it separate from it's
// non-minified cousin
var env = process.env.BUILD_ENV;

var config = {
    entry: path.resolve('./src/sciplay.js'),

    // ADD Source Maps - super, super simple
    devtool: 'source-map',
    // ----------------

    output: {
        path: path.resolve('./dist'),
        filename: env === 'production' ? 'sciplay.min.js' : 'sciplay.js', // <--- !!! Also new, change name depending on BUILD_ENV
        library: 'sciplay',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        root: __dirname,
        modulesDirectories: [
            'node_modules'
        ],
        alias: {
            src: 'src'
        },
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,  // Don't process node_module files...
                loader: 'babel-loader'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,  // Don't process node_module files...
                loader: 'eslint-loader'
            }
        ]
    },

    // Add UglifyJs plugin, but only for production builds
    // This ternary will enable the plugin when our env variable
    // is 'production', otherwise it won't add the plugin, and thus
    // it won't minify the code
    plugins: env === 'production' ?
        [new webpack.optimize.UglifyJsPlugin({minimize: true})] :
        []
};

module.exports = config;
`}</SyntaxHighlighter>
                <p>And that's all she wrote for our webpack config file.  It's a lot to take in at first, but it starts to make sense the more times you use it.  I promise.</p>
                <h2>Some Scripts for Convenience</h2>
                <p>Now that we've done all that configuration, let's wire up some simple scripts to help us run webpack.  If you've ever run an npm based project, you're probably familar with running <code>$ npm start</code> to kick off a server file, or whatever you're running.  If not, no worries.  Npm gives us a way to wrap bash calls in aliases that we can define inside our <em>packages.json</em>.  For example, we could edit our package file to create a script called 'build' that would run webpack for us.  Now you're probably wondering why you would do this.  Well, bash commands can get long and annoying to type, for example do you really want to type this whever you want to build your library file <code>$ BUILD_ENV=production webpack</code>.  Granted, that's not a terribly long command, but we can make it even shorter, like so:</p>
            <p>Inside package.json, in the "scripts" section, we'll add a few lines</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
{
    "name": "sci-play",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "build": "BUILD_ENV=production webpack",
        "dev": "BUILD_ENV=dev webpack --progress --colors --watch"
    },
    "author": "",
    "license": "ISC",
    "devDependencies": {
        "babel-core": "^6.14.0",
        "babel-eslint": "^6.1.2",
        "babel-loader": "^6.2.5",
        "babel-plugin-add-module-exports": "^0.2.1",
        "babel-plugin-transform-object-rest-spread": "^6.8.0",
        "babel-preset-es2015": "^6.14.0",
        "chai": "^3.5.0",
        "eslint": "^3.3.1",
        "eslint-config-google": "^0.6.0",
        "eslint-loader": "^1.5.0",
        "json-loader": "^0.5.4",
        "mocha": "^3.0.2",
        "webpack": "^1.13.2"
    }
}
`}</SyntaxHighlighter>
                <p>I've got some extra dependencies in there that you can ignore, but the important thing to note is that we've created two "scripts".  "build" and "dev".  Now when we want to run webpack in --watch mode, we can simply write <code>$ npm run dev</code>.  And when we want to build a minified file, we can type <code>$ npm run build</code> into the command line.</p>
            <h2>Wrap up</h2>
            <p>Phew. So that was a lot.  Webpack is finnicky, and often confusing.  It's not uncommon to spend a few hours chasing down a webpack issue becuase you can't get it to do what you want.  But, like all things, familiarity comes with practice, and eventually it all starts to make sense.  We've now set up our environment so that we don't have to worry about it again.  We can focus on the library, not the tedious build stuff.</p>
            <p>And if we want to build out a demo page while we're developing, we can now easily write code using our library in our demo script.js file, and run our library in a real browser.  Just remember that you'll need two terminal windows open and running, one running webpack in --watch mode (i.e. using <code>$ npm run dev</code>), and one running a local server to serve up your demo html and javascript file.</p>
            <h2>Next Time</h2>
            <p>Next time we'll get back to the physics stuff and implement rotation and translation to our primitive shapes.</p>
            </div>
        )
    },
    {
        title: 'Building a Physics Engine, Pt. 4 - Circle, Polygon, and the Update Loop',
        id: 'physengine4',
        url: 'physengine4',
        content: (
            <div>
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
        )
    },
    {
        title: 'Building a Physics Engine, Pt. 3 - The Renderer',
        id: 'physengine3',
        url: 'physengine3',
        content: (
            <div>
                <h1>Building a Physics Engine, Pt. 3 - The Renderer</h1>
                <p className='post-date'>Dec 29, 2016</p>
                <p>In this post we'll implement a simple Renderer object that will allow us to draw Bodies to the canvas</p>

                <h2>Skeleton Renderer Object</h2>
                <p>Now that we have a System in place to keep track of all our bodies, let's implement a simple Renderer object that hooks into the HTML canvas.</p>
                <p>I'm using the same object creation pattern as the Body and System objects -> Create an object literal with an <code>init</code> method, then create a convenience function generates a prototype, runs the initialization code, then returns the newly generated object</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`// Create an empty Renderer object
const Renderer = {};

// Set up it's prototype
Renderer.prototype = {

    /**
    * Constructor function
    * @param {Object} params - initialzation parameters
    * @param {string} [params.background] - background color
    * @param {string} [params.canvas] - DOM id of a canvas element. If null,
    * then the Renderer will create a canvas element and add it to the DOM
    */
    init: function(params) {

        // Capture background color to be used later
        this.background = params.background || 'black';

        // Initialize Canvas element
        // Pardon the ugly ternary...
        // Basically, captures canvas element, or creates one if necessary
        this.canvas = (typeof params.canvas === 'undefined') ?
            (function() {
                let c = document.createElement('canvas');
                c.id = 'canvas';
                // Set default size
                document.body.appendChild(c);
                return c;
            })() : (function() {
                // Default values for canvas size
                let c = document.getElementById(params.canvas);
                return c;
            })();

        // Capture canvas ctx to be used for drawing
        this.ctx = this.canvas.getContext('2d');
    },

    /**
    * Render!
    * @param {System} system - we need access to any bodies, which are stored
    * in the system, so it should be passed in
    */
    render: function(system) {
        // Empty for right now
        // But soon we'll put canvas drawing code in here
    }
};

/**
* Psuedo Constructor function (don't use 'new' with this!!!)
* @params {Object} params - initialization parameters
*/
var renderer = function(params) {
    let R = Object.create(Renderer.prototype);
    R.init(params);
    return R;
};

export default renderer;`}</SyntaxHighlighter>
                <p>To create a renderer, we can write the following:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`import renderer from './Renderer';

// We'll only pass the background color in
// We don't have to pass a canvas ID, because the Renderer
// will create one for us and add it to the DOM.
const params = {
    background: 'black'
};
const sciRenderer = renderer(params);`}</SyntaxHighlighter>
                <p>Now the astute among you will realize we never set the width and height of the canvas.  I've chosen to do that on the first render of system, like so.</p>
                <p>Inside Renderer.render</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`  /**
    * Render!
    * @param {System} system - we need access to any bodies, which are stored
    * in the system, so it should be passed in
    */
    render: function(system) {
        // We'll store a reference to the System on the renderer.
        // The first time .render is called, this.system will be undefined
        // so at that point, we'll use the system height and width to set the
        // canvas size, as well as capture a reference to it internally
        if (!this.system) {
            this.system = system;
            this.canvas.width = system.width;
            this.canvas.height = system.height;
        }
    }`}</SyntaxHighlighter>
                <p>It might not make much sense now as to why we want to capture a reference to the System in the renderer seeing as we're passing it into .render every call, but it'll give us some flexibility later, so we'll keep in in there.</p>
                <p>Now to actually kick off an animation loop we add the following to our .render method below the code we already have.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`      // In order to pass 'system' into render
        // we have to wrap it in a function before
        // passing it to requestAnimationFrame
        // NOTE: It's important that we use an arrow function here, otherwise
        // 'this' will not point to the Renderer, and instead will be undfined
        // Also NOTE: that requestAnimationFrame returns an ID that can be used
        // to cancel the animation loop at another time. So let's capture
        // a reference to it.
        this._requestID = requestAnimationFrame(() => {
            this.render(system);
        });

`}</SyntaxHighlighter>
                <p>This kicks off an animation loop using requestAnimationFrame.  As mentioned in the comments, it's important to use an arrow function in the requestAnimationFrame callback in order to preserve the meaning of this.  It's an ES6 thing that's super handy, and it means you don't have to do the <code>var self = this</code> trick.</p>

                <p>Now to actually draw stuff!</p>
                <h2>Drawing bodies</h2>
                <p>Add a little more code to our .render method to draw the background and any bodies present in the system:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
        // Draw background
        this.ctx.beginPath();
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update the system!
        // This will trigger all the bodies to update their internal states
        // (i.e position, velocity, etc.)
        system.update();

        // Loop through all bodies and call a function we haven't written yet
        system.bodies.forEach(body => {
            this.drawBody(body);
            });

`}</SyntaxHighlighter>
                <p>So what's the <code>drawBody</code> function look like?  Well if we remember from an earlier post, bodies have a few style properties that are settable by the user. They also contain all relevant geometric data necessary to draw them.  For now let's focus on rectangles, since that's all we've implement so far.  They have a property called .vertices - an array that stores each vertex (corresponding to each corner of the rectangle). So we can loop through the vertices and draw a bunch of lines.  Now you might be asking "Why don't we just use the .fillRect() method of the canvas!?".  Well, dear reader, we're hoping in the future to expand beyond simple rectangles into polygons, and since a rectangle is just a 4 sided polygon, if we can loop through the vertices of a rect, it's trivial to draw much more complicated polygons.  This code is fairly straightforward, so I won't go into much detail, but here it is:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`  /**
     * Draw a body object
     * @private
     * @param {Body} body - phys.system object containing all objects
     */
    drawBody: function(body) {
        // Start a new path for each body
        this.ctx.beginPath();
        this.ctx.globalAlpha = 1;

        // Plan for future body types
        switch (body.type) {
            case 'rectangle': {
                // Set fill and stroke styles based on Body properties
                this.ctx.fillStyle = body.style.fillStyle;
                this.ctx.lineWidth = body.style.lineWidth;
                this.ctx.strokeStyle = body.style.strokeStyle;

                // miter ensures line's join seamlessly at adjacent vertices
                this.ctx.lineJoin = 'miter';

                // Start drawing Rect
                this.ctx.moveTo(body.vertices[0].x, body.vertices[0].y);

                // For each successive vertex, draw a line to it
                for (let i = 1; i < body.vertices.length; i++) {
                    let v = body.vertices[i];
                    this.ctx.lineTo(v.x, v.y);
                }

                // Close path, fill and stroke
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            }

            // Pretend we have a circle object, let's just imagine how to draw
            // it
            case 'circle': {
                // Set fill and stroke styles based on body properties
                this.ctx.fillStyle = body.style.fillStyle;
                this.ctx.lineWidth = body.style.lineWidth;
                this.ctx.strokeStyle = body.style.strokeStyle;

                // Draw and ellipse
                this.ctx.ellipse(body.position.x, body.position.y, body.radius, body.radius, 0, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.fill();
                break;
            }

            // Same for polygons, let's pretend we can just loop through
            // vertices and draw a bunch of lines
            case 'polygon': {
                // Set fill and stroke styles based on body properties
                this.ctx.fillStyle = body.style.fillStyle;
                this.ctx.lineWidth = body.style.lineWidth;
                this.ctx.strokeStyle = body.style.strokeStyle;

                // 'miter' lineJoin will ensure lines don't look fun at the
                // ends
                this.ctx.lineJoin = 'miter';

                // Move to first vertex
                this.ctx.moveTo(body.vertices[0].x, body.vertices[0].y);

                // For each successive vertex, draw a line to it
                for (let i = 1; i < body.vertices.length; i++) {
                    let v = body.vertices[i];
                    this.ctx.lineTo(v.x, v.y);
                }

                // Close the path, then fill and stroke
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            }

            // If we have a body type we don't recognize, just ignore it and
            // move on
            default:
                break;
        }
    },`}</SyntaxHighlighter>
                <p>There's a lot of code in there, but it's pretty simple.  The only thing that might be a bit unclear is that we've added cases to the switch statement which will never fire, like the case for drawing circles or polygons.  Remember, we'll all about preparing for the future.  So can't hurt to put this code here now and test it later when we implement Circle and Polygon Body Objects.</p>
                <p>And that's basically it. We now have a working system to draw Body objects to the canvas.</p>

                <h2>A few more improvements</h2>
                <p>It'd be nice to have a way to pause and restart the animation loop, as well as expose the render loop so the user (i.e. programmer), could add their own behavior into the animation.</p>
                <p>Let's begin with starting and stopping the animation loop. Starting is easy, we can just call <code>render</code> again and pass in the stored reference to the system.  That's one reason why it was nice to capture a reference.  Renderer can now access the system whenever it needs it, not just in the <code>render</code> method.  The other trick is to understand that requestAnimationFrame returns a reference to the animation loop, that in order to cancel the loop, you call cancelAnimationFrame and pass in the loopId.  Hopefully that makes it clear why we </p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    /**
     * Stop animation cycle
     */
    stop: function() {
        cancelAnimationFrame(this._requestID);
    },

    /**
     * Restart animation cycle
     */
    start: function() {
        this.render(this.system);
    },
`}</SyntaxHighlighter>


                <p>It'd also be nice to have a way to dynamically resize the canvas and system.  A simple method accomplishes that:</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    /**
     * Resize the canvas and system
     * @param {number} width - new width of canvas
     * @param {number} height - new height of canvas
     */
    resize: function(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.system.width = width;
        this.system.height = height;
    },
`}</SyntaxHighlighter>
                <p>Lastly, let's wire up a way to inject custom code into the render method.</p>
                <p>All we have to do is add one more argument passed to <code>render</code> - a callback that will get called before the system updates are applied. This will allow the user to add custom behavior without having to dig into our library. But also ensure if the user tries to do something that might break the system, regular system updates will apply and may override the user behavior.  It's important to understand this moving forward to ensure we keep the system updates clean enough to give the user the right amount of flexibility.</p>
                <SyntaxHighlighter
                    language='js'
                    style={solarized}
                >
{`
    render: function(system, updateFn) {

        // Capture a reference to system and set canvas size
        // on first render
        if (!this.system) {
            this.system = system;
            this.canvas.width = this.system.width;
            this.canvas.height = this.system.height;
        }

        // Kick off animation loop, and capture animation ID
        this._requestID = requestAnimationFrame(() => {
            this.render(system, updateFn);
        });

        // Clear background
        if (this.clearBackground) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw background
        this.ctx.beginPath();
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Call user draw code
        // But only if the function was provided, otherwise we'll error
        if (updateFn) {
            updateFn();
        }

        // Update the system
        system.update();

        // Draw all objects
        system.bodies.forEach(body => {
            this.drawBody(body);
        });
    }

`}</SyntaxHighlighter>
                <p>There's only one addition to the <code>render</code> function above - the <code>updateFn</code> arg, and it's subsequent call later in the function. So when a user calls <code>render</code>, all the should pass in the system and their custom loop function like so:</p>
                <SyntaxHighlighter
                    language='js'
                    style={solarized}
                >
{`
sciRenderer.render(system, loop);

function loop() {
    let randColor = Math.random() < 0.5 ? 'red' : 'green';
    this.system.bodies.forEach(body => {
        body.style.strokeStyle = randColor;
    });
}

`}</SyntaxHighlighter>
                <p>That will effectively change the color of all bodies to be either red or green on each draw loop.  It'll be a christmas-y mess of flashing colors, but hey, gotta start somewhere.</p>
                <br />
                <h2>That's a wrap</h2>
                <p>That's it for the renderer.  There's still lots of additions we can (and will) make, most helpfully a <code>debug</code> mode that will draw things that are otherwise hidden to give us a better idea if things are working and what's going on, but that's for a later post.</p>
                <p>And if you've got a weirdly accurate memory, and I mean, like bizarrely good, then you might remember that earlier when we implemented the Body object, we didn't actually fill out it's <code>update</code> method.  We'll tackle that in the next post, as well as add Circle and Polygon primitives.</p>
                <p>Peace out.</p>
            </div>
        )
    },
    {
        title: 'Building a Physics Engine, Pt. 2 - A Body in The World',
        id: 'physengine2',
        url: 'physengine2',
        content: (
            <div>
                <h1>Building a Physics Engine, Pt. 2 - The World and a Body</h1>
                <p className='post-date'>Dec 28, 2016</p>
                <p>Before we start, the code that follows kind of exists in isolation.  By that I mean it's written in ES6, with no way to actually use it in a browser.  If you'd first like to set up your environment to be able to code in ES6, as well as bundle all your files for use in a browser, and a way to write a demo app alongside the libraries development, jump ahead to <Link to='/blog/physengine5'>Part 5 - Webpack Setup</Link>, then come back.</p>
                <br />
                <p>The first part any good world, is, well, the world itself.  The stage.  The place where things exists.  This post will detail building out a simple world to keep track of all the objects that will eventually live inside it.  But before we do that, let's first make a simple object that can live in the world.  A Body</p>

                <h2>The Body Object</h2>
                <p>The first type of body we'll focus on is a simple rectangle, since it's really simple to get up and running.</p>
                <p>First the skeleton of the object.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
let Body = {
    init: function(options) {
        options = options || {};

        // Allow user to set styles for drawing to the canvas
        this.style = {
            fillStyle: options.fillStyle || 'rgba(0,0,0,0)',
            lineWidth: options.lineWidth || 2,
            strokeStyle: options.strokeStyle || '#abcabc'
        };

        // Capture position and size
        this.position = {
            x: options.x || 0,
            y: options.y || 0
        };
        this.height = options.height || 10;
        this.width = options.width || 10;
    },

    update: function() {
        // Any update code will go in here
    }
};

export default Body;
`}</SyntaxHighlighter>
                <p>The structure here is relatively simple.  The Body object acts as a prototype to primitive shapes.  Any function shared between all primitive shapes (i.e. functions that rectangles, circles, and polygons wil need) will live on this Body object.  By structuring code this way, we can ensure that we're not using up extra memory storing individual copies of shared functions.  These functions will exist in one spot in memory, and will be used by any and all primitive shapes as necessary.</p>
                <p>So far we just have an <code>init</code> function and an <code>update</code> function.  I have a personal aversion to Javascript's <code>new</code> keyword, so I like to structure my code a little differently.  This way we'll use Body as a prototype, and initialize with it's <code>init</code> function.  You'll see how it'll work in just a moment</p>
                <br />
                <p>Now let's take a look at a simple rectangular primitive</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
// Import the body we just created
// Note, we saved Body.js in the same directory as this file (Rect.js)
import Body from './Body';

// Create a 'constructor' style function
var rect = function(options) {
    options = options || {};

    // Create a body object using Body as a prototype
    let B = Object.create(Body);
    // Initialize with passed in options
    B.init(options);
    // Set it's type
    B.type = 'rectangle';

    /**
     * Update location of vertices - used in update loop
     * We'll eventually use these vertices to draw the rectangle
     * into the canvas
     */
    B.updateVertices = function() {
        let w = this.width,
            h = this.height,
            x = this.position.x,
            y = this.position.y;
        B.vertices = [
            {x: x,     y: y},
            {x: x + w, y: y},
            {x: x + w, y: y + h},
            {x: x,     y: y + h}
        ];
    };

    B.updateVertices();
    return B;
};

export default rect;
`}</SyntaxHighlighter>
                <p>In Rect.js, we define a kind of 'constructor' function.  I put it in quotes because it's not a real constructor in the way that Javascript defines them.  Constructor functions are meant to be used with the <code>new</code> keyword.  This function serves the same purpose, in that it creates an object, set's some properties, then returns that object, but it does so without requiring the use of <code>new</code>.  In works in the following way:</p>
                <ol>
                    <li>First, load in the Body object from Body.js</li>
                    <li><code>rect</code> takes an options object as it's only argument</li>
                    <li>A new Body object <code>B</code> is created using <code>Object.create</code> then calling <code>B.init</code> and passing in the options object</li>
                    <li>We add a few rectangle specific properties to <code>B</code>, including <code>type</code> and a method called <code>updateVertices</code></li>
                    <li>Then we call <code>updateVertices()</code></li>
                    <li>And finally return that object</li>
                    <li><code>rect</code> is exported so that when we want to create a new rectangle primitive, we just call <code>rect(options)</code> without the <code>new</code> keyword.  Pretty neat.</li>
            </ol>
            <p>Before we move on, you might be asking yourself, 'What's this updateVertices function?'. Well, We're thinking a bit ahead at the moment and we know that eventually we'll want to have arbitrary polygons in our engine.  To make things more flexible, if we can define our primitives as a set of vertices, rather than an x and y position and a width and a height, then we can more more easily handle arbitrary polygons, that don't have a constant width or height.  By keeping track of each vertex, we'll also be in a better position to handle object-object interaction because we'll need each vertex individually in order to perform collision detection.  So if it doesn't make sense now, hopefully it will as we move forward.  The other thing to note is that we wrap the vertices creation into a function so that we can call it on each update loop to update the vertices as the rectangle moves about the world.</p>

            <h2>The World</h2>
            <p>So now that we have a body object to put into our world, let's make the world.</p>
            <p>In a new file called System.js, we'll create an object in a simlar fashion as the Body object from above.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
import hash from '../geometries/SpatialHash';

const System = {};
System.prototype = {
    // Initialize properties
    init: function(params) {
        this.bodies = [];
        this.width = params.width || 600;
        this.height = params.height || 300;
    },

    /**
    * Add an object to the system
    * @param {object} obj - the body object to add
    */
    addObject: function(obj) {
        // Forward thinking - eventually we'll have more primitives, right?
        // And maybe we'll have other things besides bodies, who knows!
        switch (obj.type) {
            case 'rectangle':
            case 'circle':
            case 'polygon':
                this.bodies.push(obj);
                break;
            default:
                throw new Error('Can\'t add whatever you\'re trying to add');
        }
    },

    // System needs to update on each render loop
    update: function() {
        // Loop through all bodies and update one at a time
        this.bodies.forEach(body => {
            body.update();
        });
    }
};

/**
 * @public
 * @param {object} params - initialization parameters
 * @return {System}
 *
 * params
 *  - width: int - width of entire system (usually canvas width)
 *  - height: number - height of entire system
 */
const system = function(params) {
    const s = Object.create(System.prototype);
    s.init(params);
    return s;
};

export default system;
`}</SyntaxHighlighter>
            <p>So let's break down what's happening.  In the same fashion as the Body object, we're defining a System object that will be used a prototype.  It comes with an <code>init</code> function that can be called to initialize it's parameters.  An <code>addObject</code> function just pushes objects into an internal array to keep track of everything.  Notice that we're using falltlhrough in the <code>switch</code> statement.  This is because in the future I'm envisioning having several different types of things that can be added to the system.  To keep them separate, we add all bodies to <code>this.bodies</code> and any other stuff that comes along in the future that isn't a <code>Body</code> object can go into a different array.</p>
            <p>Lastly we define an <code>update</code> function that will loop through all bodies and update them in turn.  Remember how we defined an <code>update</code> function on <code>Body</code>?</p>

            <p>Once we've created our System object, we export a simple function that leverages the same pattern as the <code>Rect</code> and <code>Body</code>. <code>system</code> takes some initalization params, uses Object.create to make a new object with <code>System</code> as it's prototype, initializes the newly created system object, then returns it. Easy peasy.</p>

            <h2>One more tweak to Body</h2>
            <p>We have to make a quick addition to the Body's <code>update</code> function.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
    update: function() {
        if (this.updateVertices) {
            this.updateVertices();
        }
    }
`}</SyntaxHighlighter>
            <p>We need to make sure that our rectangle's vertices actually get updated when <code>System</code> updates all the bodies. Otherwise our rectangle would never actually move.</p>

            <h2>Using it</h2>
            <p>So how would we actually use these?</p>
            <p>Well, it's pretty straightforward.  Check it.</p>
                <SyntaxHighlighter
                    language='javascript'
                    style={solarized}
                >
{`
import system from 'System';
import rect from 'Rect';

let s = system({
    width: 900,
    height: 600
});

let r = rect({
    width: 50,
    height: 50,
    x: 20,
    y: 30
    });

system.addObject(r);

// Right now calling update doesn't really do anything because nothing is
// moving
system.update();

// But if we wrap it in a loop
setInterval(() => {
    r.x += 1;
    system.update();
}, 100)

// Then the rectangle's vertices will be updated as if it's moving 1 pixel to
// the right every 100 milliseconds.
`}</SyntaxHighlighter>
            <p>Stepping through the code above:</p>
            <ol>
                <li>First we initialize the system with a width and height</li>
                <li>Then we create a rectangle at (20, 30) of size 50 x 50</li>
                <li>We add the rectangle to the system</li>
                <li>We're using setInterval to create an animation loop (we'll make this better later), but for now this is fine</li>
                <li>Every 100 milliseconds, the rectangles position will get updated, then system.update will call the necessary code that updates the rectangles vertices.</li>
            </ol>
            <p>And that's it! Now we have a simple skeleton of a system and a way to create rectangular bodies.</p>
            <p>Next we'll look into how to actually render this to the screen.</p>
            </div>
        )
    },
    {
        title: 'Building a Physics Engine, Pt. 1 - The Why',
        id: 'physengine1',
        url: 'physengine1',
        content: (
            <div>
                <h1>Building a Physics Engine, Pt. 1 - The Why</h1>
                <p className='post-date'>Dec 28, 2016</p>
                <p>If there's one thing we can all agree on it's that physics is really, really awesome. Now that we're all on the same page, let's get right to the point</p>
                <p>In my striving to build a digital science lab, I quickly realized that I'd need a physics engine underpinning the whole thing.  I wanted objects to interact in a psuedo scientifically accurate way, and for that I'd need a system to keep track of objects and their interactions.  So what better tool than a physics engine?  After digging around, I found a handful of seemingly well made engines</p>
                <ol>
                    <li><a href='http://brm.io/matter-js/'>Matter.js</a></li>
                    <li><a href='http://www.cannonjs.org/'>Cannon.js</a></li>
                    <li><a href='http://wellcaffeinated.net/PhysicsJS/'>PhysicsJs</a></li>
                    <li><a href='http://box2d-js.sourceforge.net/'>Box2DJS</a></li>
                </ol>

                <p>I guess you could say 'glutton for punishment', or 'why reinvent the wheel!?', but as I poked around these, I had the thought, 'hey, I could build one of these things'.  And so I decided to tred a well worn path and build my own physics engine.  The ultimate effort may not be fruitful in that I probably won't build as good of an engine as any of those listed above, but the benefits to me are plenty:</p>
                <ol>
                    <li>Really up my programming skills</li>
                    <li>Get a chance to apply my undergrad physics degree</li>
                    <li>Get a chance to work on a complicated system rather than a one off application</li>
                    <li>Learn how to build a library designed to be used in other applications</li>
                    <li>And generally get to have fun thinking about science</li>
                </ol>

                <p>So over the next few months, I'll be documenting my progress as I work through building out this engine, and ultimately use it to build a digital science lab meant to encourage enthusiam and experimentation with regards to not just physics, but science as a whole.  Stay tuned.</p>
            </div>
        )
    },


    {
        title: 'React + MapboxGL',
        id: 'reactmapboxgl',
        url: 'reactmapboxgl',
        content:(
        <div>
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/06/Screen-Shot-2016-06-26-at-6.47.23-PM-1024x485.png" alt="Screen Shot 2016-06-26 at 6.47.23 PM" width="1000" height="474" class="alignnone size-large wp-image-53" />
            <p>React is super cool.  So is MapboxGL.  So when I started working on a mapping project I thought to myself, "hey, this is a chance to kill two birds with one stone and grab a hold of both React and MapboxGL in one fell swoop.  But as I heedless charged forward, it became apparent relatively quickly that react and mapbox might not be the match made in heaven that I was hoping for.</p>

            <h2>Not an issue with the DOM</h2>
            <p>Libraries like d3, that like to have a chokehold on the DOM are pretty tricky to integrate into React nicely.  Since react freaks out when the DOM is updated outside of it's reactive walls, having an external library mess with the DOM becomes a no-no.  This isn't actually a problem with MapboxGL, since it all works on a canvas element (with a few containers, but once those containers are in place, they are never really changed, unless you decide to use Mapbox's popups, which I feel like can always be improved upon, so we can skip over those).  We can skirt around the DOM messiness by wrapping a MapboxGL map into a react component, and add a few methods to handle any Mapbox api calls that we want to make.  I'm using redux here as well.</p>

            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
import React from 'react';
import { connect } from 'react-redux';
import mapboxgl from 'mapbox-gl';

import * as actions from 'app/actions/actions';

class Map extends React.Component {
    componentDidMount() {
        // Any information the map needs can be passed down as a prop from the parent
        var { map } = this.props;

        // Store the map as a property on the class so we can call mapbox methods later
        mapboxgl.accessToken = 'YOUR_TOKEN_HERE';
        this.map = new mapboxgl.Map({
            container: containerId,
            style: 'mapbox://styles/mapbox/light-v9',
            center: [-74, 51],
            zoom: 8
        });

        this.map.on('load', () => {
            this.initMap();
        });
    }

    initMap() {
        // Initialize you're map here
        // i.e. if you want to load an overlays right away, etc.
    }

    // Wrap mapbox flyTo for easy accessibility
    // Grap map from the store which holds the position that our map should be at
    setMapPosition() {
        var { map } = this.props;
        this.map.flyTo({
            center: map.center,
            zoom: map.zoom,
            pitch: map.pitch || 0,
            bearing: map.bearing || 0
        });
    }

    render() {
        return (
            &lt;div id='map'&gt;&lt;/div&gt;
        );
    }
}

// Use connect to transform state to props (a redux thing)
export default connect((state) => {
    return {
        map: state.map,
        whereAmI: state.whereAmI
    };
})(Map);
`}</SyntaxHighlighter>

            <h2>But, why?</h2>
            <p>Great, we've wrapped a map up into a react component. Whoop-de-do.  Big deal.  So far we haven't utilized react for anything interesting.  What we really want is to hook into react's lifecycle methods.  That's where the power lies.  That's what it's good at.  Looking at state and taking action for us.  But there's an issue here.  MapboxGl is ultimately just a canvas element.  That's why it can render zoom levels of 4.3, or 8.2.  It's just drawing into a canvas, and react doesn't really give any good way to interact with a canvas, since, after all, what happens in the canvas is irrelevant to the DOM.  As far as the DOM is concerned, the canvas exists, and that's all it cares about.  So how do we utilize a library that is super good at rendering DOM elemnents, with a library that doesnt' really give the DOM a second thought?  And why would we want to do that?</p>

            <p>Well, if you're just building a simple map with some data on it, it's pretty pointless to use React.  But once you start buliding a web-app <em>around</em> a map, well then react comes in handy for just about everything else besides the map, so it makes sense to figure out how to get the two to talk to each other amicably.</p>

            <p>We press on.</p>

            <h2>Lifecycle updates</h2>
            <p>The goal is to get the map to react when the state changes.  In the code above, I left in a state variable called whereAmI, which I'm using to track what 'page' the user is on.  If the user clicks forward in the app, the map should update with new data, and a new position.  We can let react handle telling our Map component that it needs to update by utilizing componentDidUpdate.</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
...
componentDidUpdate(prevProps) {
    var { whereAmI, map } = this.props;

    // if the current map position doesn't match
    // what's in the store, then move back to the stored location
    if (map.center !== this.map.getCenter()) {
        this.setMapPosition();
    }

    // Upon initialization, when the user hasn't done anything
    // just set the map to it's home position
    if (whereAmI.position === 'none') {
        this.setMapPosition();
        return;
    }

    // If the user initialized a page, i.e. whereAmI.position isn't 'none',
    // then check what page we're on
    if (whereAmI.page === 0) {  // we're on the first page, initialize
        this.initPage();
    } else {    //  we're not on the first page!
        this.updatePage();    // update data as necessary
    }

    return;
}
`}</SyntaxHighlighter>

            <h2>Mapbox Sources and Layers</h2>
            <p>This is all well and good, but what happens when you want to start adding overlays to your map?  If you're not familiar with MapboxGL, it basically works by storing <code>sources</code> and <code>layers</code>.  Sources act as, just what they sound like, sources of data.  Typically they contain geojson data, but are not limited to it.  Sources do not display, they just store data.  Layers reference a source, then figure out how to display the source on the map.  You can have many different layers, all showing different things, from the same source, e.g. borders or fills.</p>

            <p>So as the user pages through the app, the data changes.  How do we handle this?  There's a few potential ways to go about this:</p>
            <ol>
                <li>Store all sources and layers in the store, with properties that tell the app what page they should display on</li>
                <li>Store only visible sources and layers in the store, that we we don't have to do any filtering in the Map component itself</li>
                <li>Lastly, don't store any sources or layers in the store, and instead store them as local properties on our Map class.</li>
            </ol>

            <p>The most <em>reacty</em> to handle this would probably be option number 1. or 2.  Let Redux store what needs to be displayed and all the Map is responsible for is displaying it.  But in the process of trying to do this, I found it get a little hairy.  It ends up looking something like this:</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
...
componentDidUpdate(prevProps) {
    var { whereAmI, map, overlays, dispatch } = this.props;

    // if the current map position doesn't match
    // what's in the store, then move back to the stored location
    if (map.center !== this.map.getCenter()) {
        this.setMapPosition();
    }

    // whereAmI changed, so update what overlays need to be visible
    // THIS IS BAD - REALLY HARD TO MANAGE
    dispatch(actions.addOverlay('some overlay', 'some data'));
... Ignore the other stuff below here for the moment
}
`}</SyntaxHighlighter>
        <p>Do you see the problem?  componentDidUpdate gets run when whereAmI changes, which then dispatches a new overlay to the redux store, which in turn triggers componentDidUpdate again.  In this case it's manageable if we use a few simple conditionals, but the possibility for endless updating, or even more likely just hard to reason about code, is super high.  There is probably a better paradigm to handle this sort of a situation, but I found that the easiest way was just to let the Map component handle it's own state.  It flies directly in the face of 'Stateless all the things' and 'One source of truth', but it works.  And to be honest, I find it not terribly hard to reason about because you don't have to consider the cascading updates that are possible when a component is updating itself via <code>dispatch</code>.</p>

        <p>Here's how I handled it.  The Map component simply holds all overlays (that is, sources and layers) in it's own internal array.  Each overlay is wrapped in a separate class, called PointsOverlay or PathOverlay, depending on the type of geojson data we have, and that class has properties to store what page that overlay should be visible on.  So instead of dispatching a new action when the component updates, we just look at where we are, filter through our list of overlays, then display the relevant ones.</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
this.overlays.forEach((overlay) => {
    if (overlay.layer.visibleOnPage === whereAmI.page && overlay.layer.associatedPosition === whereAmI.position) {
        overlay.showLayer();    // a class method that calls mapboxGL .setLayoutProperty() and set's it to visible
    } else {
        overlay.hideLayer();    // Sets layout property to 'none'
    }
});
`}</SyntaxHighlighter>

            <h2>So the paradigm is this:</h2>
            <p>Let react handle state affects the entire app, including all DOM elements, but let the Map component handle it's internal state and decide on it's own what to show and not show.  It's not necessarily 100% aligned to the react mentality, but react is new, and some old habits are still good, even if they're old.</p>

            <p>And the moral of the story is, if you're building something on your own, and you find a way to do something that might be a bit unorthadoxed or a bit frowned upon, if it works, and you understand it, and it doesn't smell super funny, then run with it!  What do you have to lose?</p>

            <h2>Happy mapping!</h2>
        </div>
        )
    },
    {
        title: 'Javascript Gradient Descent',
        id: 'javascript-gradient-descent',
        url: 'javascript-gradient-descent',
        content:(
        <div>
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/07/wZzrX.gif" alt="wZzrX" width="920" height="447" class="alignnone size-full wp-image-65" />
            <p>I'm following along with Professor Ng's course on Machine Learning, and I thought it'd be a good idea to recreate some of the algorithms in Javascript, my current language of choice. Although it's quickly becoming clear that Javascript is perhaps one of the worst languages to choose from for Machine Learning applications simply due to it's lack of support for scientific packages, like python's NumPy, or just all of Matlab.  But perhaps that's a good reason to start implementing these in Javascript now - so I could eventually contribute to projects porting machine learning to the language of the world wide web.</p>

            <p>Anyway, with that said, I'll start with the simplest algorithm of all - Linear Regression using Gradient Descent.  It's fairly simple to implement, so let's get started.</p>

            <p>First, we need a good linear algebra package.  There are a handful of them floating around</p>
            <ul>
            <li><a href='http://mathjs.org/'>Math.js</a></li>
            <li><a href='http://www.numericjs.com/'>Numeric Javascript</a></li>
            <li>and a bunch more that a quick google search will reveal</li>
            </ul>
            <p>But I settled on <a href='https://github.com/NaturalNode/node-sylvester'>Sylvester</a>, which conveniently has been wrapped up into a node implementation to make my life easier, or so I thought.  I picked Sylvester because I noticed in the source that there  were simple functions to calculate the mean and standard deviation of columns of matrices, which is essential for normalizing data for linear regression, but it turns out that the package of node-sylvester hosted on NPM isn't up to date with the github repo.  I.e. it doesn't have the <code>std()</code> function that I needed, which is strange.  Perhaps the owner of the repo added that functionality but never published it to NPM.  Alas, all I had to do was grab the repo directly and avoid the NPM package, and I got what I need.</p>

            <p>To take full advantage of the implementation, I had to import three modules from the sylvester package:</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
var Sylvester = require('./node-sylvester/index.js');
var Matrix = require('./node-sylvester/lib/node-sylvester/matrix.js');
var Vector = require('./node-sylvester/lib/node-sylvester/vector.js');
`}</SyntaxHighlighter>

            <h2>Setting things up</h2>
            <p>I need to create 4 modules:</p>
            <ol>
            <li>linearRegression.js - the controller, if you will</li>
            <li>costFunction.js - a simple module to compute the cost function</li>
            <li>gradDescent.js - you guessed it, a module to perform gradient descent</li>
            <li>normalize.js - and lastly a module to convert data points to normalized values</li>
            </ol>

            <p>let's start with linearRegression.js and layout what we need it to do:</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
// ... Load modules up here

// Load data using conveniently provided loadFile() func
var data = Matrix.loadFile('./ex1data2.txt').map(parseFloat);
var rows = data.dimensions().rows;
var cols = data.dimensions().cols;

// Set learning rate and number of iterations (these may need to change
// depending on the data set)
var alpha = 0.5;
var iterations = 500;

// Slice out X and y from loaded data
var y = data.slice(1, rows, cols, cols);
var X = data.slice(1, rows, 1, cols - 1);

// Normalize X values
var normal = normalize(X);
var mean = normal.mean;
var sigma = normal.sigma;
var XNorm = normal.XNorm;

// Initialize theta to a vector of all zeros
var theta = Vector.Zero(XNorm.dimensions().cols).transpose();

// Perform gradient descent using normalized data and our learning parameters
var grad = gradDescent(XNorm, y, theta, alpha, iterations);

// Pull off theta and history of costs from the result of gradient descent
theta = grad.theta;
var JHistory = grad.JHistory;

// Use the discovered theta to predict the y value of a new data point
var mappedPrediction = Vector.create([1, 1650, 3]).map(function(element, row) {
    if (row === 1) {
        return 1;
    }

    return ((element - mean.e(row - 1)) / sigma.e(row - 1));
});

var prediction = theta.transpose().multiply(mappedPrediction);
`}</SyntaxHighlighter>

    <p>So what's going on up there.  First, node-sylvester provides an easy way to load in a txt file to a Sylvester Matrix object.  Because everything in Sylvester is an object, all Matrix and Vector operations are used via methods - e.g to multiply Matrices A and B you'd write <code>A.multiply(B);</code>  Data is typically provided in csv or tsv as a txt file where each row corresponds to one training example.  The number of columns in the data set informs the number of features we want to look at.  In the example data set here, there are two features, and 47 training sets.  The data file has the 2 feature columns first, followed by the solution column last.  So we slice out X (which represents our features), and y (which represents the output of those features).  We then want to Normalize our X values since it's likely that the scales of each feature set is quite different.  This will ensure gradient descent works much more efficiently.  We then initialize a theta vector with zeros (a good starting point for gradient descent).  Theta should have as many rows as there are features.  To account for theta(0), we have to add a row of ones to the X matrix - but we'll take care of that within the <code>normalize()</code> function.  We run gradient descent using our learning parameters, then use the resulting theta to predict the y value of a never before seen data point.  One caveat, when normalizing, we don't want to normalize X with a column of ones at the front, so inside the Matrix <code>map</code> we don't normalize the element at row = 1 (i.e. the first element).  That's all that's going on in that funky looking map call.</p>

            <h2>Normalize</h2>
            <p>Let's take a look at the normalize.js module:</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
var sylvester = require('./node-sylvester/lib/node-sylvester/sylvester.js');
var Matrix = require('./node-sylvester/lib/node-sylvester/matrix.js');
var Vector = require('./node-sylvester/lib/node-sylvester/vector.js');

module.exports = function(mat) {
    var rows = mat.dimensions().rows;
    var cols = mat.dimensions().cols;

    // Calculate mean and standard deviation
    var mean = mat.mean();
    var std = mat.std();

    // For each element, return it's normalized value
    matcp = mat.map(function(element, row, col) {
        return ((element - mean.e(col)) / std.e(col));
    });

    // Add ones vector back in before returning
    var ones = Vector.One(rows);

    return {
        mean: mean,
        sigma: std,
        XNorm: ones.transpose().augment(matcp)
    };
};
`}</SyntaxHighlighter>

            <p>Nothing too crazy going on here.  We just have to understand that to normalize a features means subtracting the mean and dividing by the standard deviation of that set of examples.  So if we have 2 columns, for each item in the first column, we subtract the mean of the first column, the divide by the standard deviation of the first column.  We repeat for the second column, and that'll normalize our data set.  Lastly we add back a column vector of ones to ensure we can capture theta(0) when the time comes to perform gradient descent.  This was so easy because node-sylvester provides simple <code class='language-javascript'>mean</code> and <code class='language-javascript'>std</code> functions for us.  Without those, we'd just have to write some for loops and calucate it ourselves, which isn't terribly difficult, but why reinvent the wheel?  (I know what you're thinking, I'm reinventing so many wheels right now by implementing linear regression in javascript, but hey, how do you build a better wheel without first understanding how to build a simple wheel, right?)</p>

            <h2>Cost Function</h2>
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/07/wZzrX.gif" alt="wZzrX" width="920" height="447" class="alignnone size-full wp-image-65" />
            <p>The cost function for linear regression basically says: calculate the difference between our hypothesis and the actual value that we know from the training data set, square that value, then sum up all the squared differences across each training set. It's beyond the scope of this to go into how we get our hypothesis and cost function, you can kind of think of the hypothesis as a function that will draw a line to fit our data best and we can get the parameters theta(0), theta(1), and so on by minimizing J(theta) - our cost function - with respect to theta.  So plugging in our hypothesis, our actual values, and knowing that m = # of training sets, then it's simply a matter of basic linear algebra to get the cost function.</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
// Requires a sylvester Matrices and vectors to be passed in
module.exports = function(X, y, theta) {
    var m = X.dimensions().rows;
    var predictions = X.multiply(theta);
    var difference = predictions.subtract(y);
    var sqrErrors = difference.elementMultiply(difference);

    return 1 / (2 * m) * sqrErrors.sum();
};
`}</SyntaxHighlighter>
            <p>Note: we don't need to include Sylvester here because we're assuming that Sylvester objects are being passed in, so they already come with all the methods they'll need.</p>

            So we first figure out the number of training examples (m) by getting the number of rows in X.  <code class='langauge-javascript'>predictions</code> represents a vector of our hypothesis for each training example, so it should have dimensions of m x 1.  Notice by multiplying X (an m x (n+1) matrix) by theta ( a (n+1) x 1 vector), we get an m x 1 vector out.  This is equivalent to saying theta(0) + theta(1)*x(1) + theta(2)*x(2) and so on, except it does it using linear algebra, which keeps things nice and tidy.  <code class='langauge-javascript'>difference</code> calculates the difference between the predictions and the actual values.  We then multiply difference by itself, element-wise, to get a vector of squared errors.  Lastly we sum up all the square differences, multiply by 1 / (2 * m), and return our cost value.  Pretty easy.

            <h2>Gradient Descent Time</h2>
            Finally, we need to implement the gradient descent algorithm.  If we take a peek at it, it looks like this:
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/07/gradient-descent-algorithm-OLS.png" alt="gradient descent algorithm OLS" width="484" height="274" class="alignnone size-full wp-image-66" />
            What this says is to update each value of theta - theta(j) by calculating the sum of the difference vector element-wise multiplied by the value of each feature for each training set.  This formula comes by taking the partial derivative of J(theta) with respect to theta for each value of j (which essentially respresents the slope of the line of our cost function).  When we subtract the slope from theta, then run gradient descent again, we'd expect the slope of the new cost function with new theta's to be different.  Eventually, if we've chosen our learning rate properly, then the slope of J(theta) will converge to (or very near to) zero, thus ensuring that theta will no longer update.  At that point, the algorithm has converged and we've found our best guess at theta. 

            It's a lot easier to see what's going on through some code. So here it is:
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
module.exports = function(X, y, theta, alpha, iterations) {
    var m = y.dimensions().rows;
    var JHistory = [];

    for (var i = 0; i < iterations; i++) {
        var predictions = X.multiply(theta);
        var difference = predictions.subtract(y);
        var thetaChange = X.transpose().multiply(difference)
                            .multiply(alpha / m);

        theta = theta.subtract(thetaChange);
        JHistory.push(costFunction(X, y, theta));
    }

    return {
        JHistory: JHistory,
        theta: theta
    };
};
`}</SyntaxHighlighter>
            <p>So let's walk through it.  Similarly to the first few steps in calculating the cost function, we first get the predicted values of our data set using our initalized theta (a vector of all zeros).  This will most likely produce values that are nowhere near the actual values stored in y.  The difference variable will store the difference between our hypothesis and the actual values.  We then calculate thetaChange (which refers to the right hand term (excluding theta(j)) of our formula.  Notice how there's no sum function anywhere.  X.transpose().multiply(difference) can be written like so: x0(1)*d(1) + x0(1)*d(2) + x0(3)*d(3) + ... + x0(m)*d(m) where xj(i) is the jth feature of the ith training example.  If we look at the dimensions of X and difference, we'll see X has dims of m x (n+1) and d has dims of m x 1.  So X.transpose() has dims of (n+1) x m, and if we multiply X.transpose() by difference, the result is a vector of (n+1) x 1.  Because n is our number of features, if we have two features, it will be a 3x1 vector.  The same as theta.  So we can just directly subtract thetaChange from theta, and update theta with the new value.  We then run the iteration again, following the same procedure, updating theta.  Eventually, thetaChange should approach 0, as theta gets closer to it's best value.  Remember, values of theta that closely fit the data set will produce y values that are quite close to the actual y values in our data set, so the difference vector will be very small.</p>

                <p>When we've gone through all our iterations, just return theta.  Notice we're also returning a history of J values, which represents the cost function evaluated during each iteration.  It's a good way to ensure gradient descent is working properly by looking at the cost function at each step and ensure it's going down, and eventually hits a minimum value.</p>

                <h2>So that's it</h2>
                <p>We can use the value of theta we've found to predict new data coming in (see above).  And we've sucessfully implement gradient descent for linear regression with nothing but a few lines of Javascript.  Pretty neat, eh?</p>
            </div>
        )
    },


    // VIM
    {
        title: 'Vim Made Me a Better Programmer',
        id: 'vim-made-me-a-better-programmer',
        url: 'vim-made-me-a-better-programmer',
        thumbnailSrc: '',
        content:
            <div>
                <img src="http://blog.jcharry.com/wp-content/uploads/2016/06/Screen-Shot-2016-06-25-at-6.23.05-PM-1024x604.png" alt="Screen Shot 2016-06-25 at 6.23.05 PM" width="1000" height="590" class="alignnone size-large wp-image-6" />
                <h1>VIM is fun.</h1>
                <p>I've been using it for about 10 months now, and the more I use it, the more I'm realizing that the logic of how to use vim has actually seeped into the logic of how I write code.</p>

                <h2>Back up for a moment</h2>
                <p>It took about a month to feel comfortable with vim.  The first month was drudgerous.  Slow and painful.  <a href='http://vim-adventures.com/'>Vim-adventures</a> was a godsend.  After attaining a baseline feeling of comfort, I settled into a phase of complacent competence.  I felt comfortable with using vim to the point where exploring advanced features felt like more work than fun.  Then I came across <a href='http://jeetworks.org/from-acolyte-to-adept-the-next-step-after-nop-ing-arrow-keys/'>this deadly chunk of code</a> that disables non-counted movements.  I.e. no more hjlk keys for me, unless they were preceded by a number.  Suffice it to say, using vim became, once again, an absolute nightmare.  I found that for the first few days of disabling non-counted movements, I actually couldn't code anymore because I was spending so much brain power on figuring out how to move in vim again.  I had become so reliant on basic movements that when they were taken away, I was useless.  But struggle, and struggle some more, and I (and anyone who hampers themselves like this) inevitably began to internalize the powerful movement features vim lays at your fingertips.  Embrace searching, both word wise and character wise, embrace numbered movements and relative numbers, embrace ctrl-u and ctrl-d, embrace the period .</p>

                <p>By this time, the concepts of buffers, splits, folds, and powerful movement had all sunk in.  And that's when it started to hit me - could using vim have inadvertantly helped me along to becoming a better programmer?  I noticed that the ways I was coding was changing - which could simply be a product of improvement, but I can't shake the feeling that the logic of vim, the way it encourages you to work, actually encourages good habits and experimentation.</p>

                <h2>Better vim = better code</h2>
                <p>Take, for instance, the jumpy, precise movement style of normal mode.  It encourages quick iterations on a block of code.  You can write some garbage code, jump below, try out another solution, jump back up fold in some learnings, and iterate over and over.  It increases the speed at which you can throw away code such that it actually reinforces trying things out various ways.</p>

                <p>Buffers and splits encourage code modularization.  Most editors are tab-based, meaning you can only see one file at a time.  For people learning to code, it's often a daunting step to be able to work across multiple files, but with splits you can see everything you need.  And the ease in which you can switch buffers means changing code in another file is a piece of cake.  Add in grepping functionality and you're primed and ready to write modular code.</p>

                <p>And then there's plugins.  So many plugins.  But importantly when you're learning to code, there's the <em>severe lack</em> of functionality that often falls to plugins.  This is a good thing when you're starting.  Writing code is hard, and it's even harder when you're still trying to grasp the syntax.  I know it's painful for experienced programmers to have to type out a bunch of boilerplate code, but when you're learning syntax it's really useful to type out <em>every single character</em> to train your brain to not only remember proper syntax, but to be able to quickly spot errors, typos, and simple syntax mistakes.  Sure, you'll say that's what debuggers are for!  They tell you when you've made a syntax error and where!  But we're supposed to be smarter than the computer.  We can work a hell of a lot faster if we're not so reliant on some suite of developer tools to tell us when we've made a mistake.</p>

                <h2>Beyond that, vim is just plain fun</h2>
                <p>I liken it to learning an instrument.</p>

                <p>Sure, if actually taken as an instrument, it's not so hard, but I view the fumbling trudgery of starting with vim similar that the utter torture that is first picking up a guitar. &nbsp;As the strings taunt you, and the helpless confusion washes over you, you wonder if you'll ever begin to understand.  When you play your fingers start hurting, like the guitar is fighting you, like it doesn't want to be played. &nbsp;You watch people who know how to play and it looks like magic. &nbsp;How do their fingers do that? &nbsp;I found my progression through vim much the same.  But for whatever reason, I really dig the struggle.  There's something rewarding about suffering through, inching your way towards competence, then after a certain point, looking back and realizing you're actually quite capable now.  Vim let's me feel that way without any stakes.  And I think we all need a bit more of that in our lives.</p>


                <h2>Some tips to follow when learning vim.</h2>
                <h4>1. Pay a few bucks and <a href='http://vim-adventures.com/'>play this game</a></h4>
                <h4>2. Disable your arrow keys</h4>
            <SyntaxHighlighter
                language='vim'
                style={solarized}
            >
{`
noremap <Up> <NOP>
noremap <Down> <NOP>
noremap <Left> <NOP>
noremap <Right> <NOP>

`}</SyntaxHighlighter>

        If you're feeling super ambitious, disable non-counted movements for hjlk by dropping this into your .vimrc.  This is taken from a <a href='http://jeetworks.org/from-acolyte-to-adept-the-next-step-after-nop-ing-arrow-keys/'>great post by Jeet Sukumaran</a>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
function! DisableIfNonCounted(move) range
    if v:count
        return a:move
    else
        " You can make this do something annoying like:
           " echoerr "Count required!"
           " sleep 2
        return ""
    endif
endfunction

function! SetDisablingOfBasicMotionsIfNonCounted(on)
    let keys_to_disable = get(g:, "keys_to_disable_if_not_preceded_by_count", ["j", "k", "h", "l"])
    if a:on
        for key in keys_to_disable
            execute "noremap &lt;expr&gt; &lt;silent&gt; " . key . " DisableIfNonCounted('" . key . "')"
        endfor
        let g:keys_to_disable_if_not_preceded_by_count = keys_to_disable
        let g:is_non_counted_basic_motions_disabled = 1
    else
        for key in keys_to_disable
            try
                execute "unmap " . key
            catch /E31:/
            endtry
        endfor
        let g:is_non_counted_basic_motions_disabled = 0
    endif
endfunction

function! ToggleDisablingOfBasicMotionsIfNonCounted()
    let is_disabled = get(g:, "is_non_counted_basic_motions_disabled", 0)
    if is_disabled
        call SetDisablingOfBasicMotionsIfNonCounted(0)
    else
        call SetDisablingOfBasicMotionsIfNonCounted(1)
    endif
endfunction

command! ToggleDisablingOfNonCountedBasicMotions :call ToggleDisablingOfBasicMotionsIfNonCounted()
command! DisableNonCountedBasicMotions :call SetDisablingOfBasicMotionsIfNonCounted(1)
command! EnableNonCountedBasicMotions :call SetDisablingOfBasicMotionsIfNonCounted(0)

DisableNonCountedBasicMotions
`}</SyntaxHighlighter>

                <p>By disabling single movements, you'll be forced to find other ways to move around.  When I first disabled single movements, my productivity dropped to absolute zero again as I basically had to learn to move all over again.  What I realized was that I was completely reliant on hjlk and without them, I was practically useless.  No more.  Suffer through the pain and prepare to get nothing done for a few days.  Totally worth it.</p>

                <h4>3. Enable relative line numbers</h4>
                <code>set relativenumber</code>

                <p>And that's just for movement.  It's easy to sink hours at a time researching plugins, setting up linting, learning to use buffers, folds, marks, etc.  There's so much that even after 10 months, I still feel like I'm just scratching the surface.</p>

                <h4>All of the plugins</h4>
                <p>I spend most of my time writing Javascript, so most plugins are tailored to ensure that my Javascript looks pretty, and that vim plays nicely with html, css, jsx.  And linting.  Linting is super, super important, and <a href='http://eslint.org/'>ESLint</a> is fantastic.  The biggest pain to set up, but pretty worth it in my opinion is <a href='https://valloric.github.io/YouCompleteMe/'>YouCompleteMe</a> - an autocompleter for vim.  Combined with <a href='https://github.com/ternjs/tern_for_vim'>tern_for_vim</a>, and you've got yourself introspective code completion.  Pretty dope.  YCM is an UTTER PAIN to set up though.  The amount of time spent debugging why it didn't build properly (which was entirely my fault, I admit) was a nightmare.  All I can say is follow the instructions CAREFULLY.  Don't skip any steps, or you're in for a bad time.  The rest of the plugins deal with surrounding words, creating and jumping between html tags, templates for new files, proper indenting, etc, but I'll leave those to you to find.  That's part of the vim fun.  If you're curious, my check out my entire <a href='https://github.com/jcharry/dotfiles/blob/master/.vimrc'>.vimrc here</a>.</p>

                <h2>A fun (read: annoying) side-effect of Vim</h2>
                <p>Well, besides the complete and total sense of superiority I feel?  Yea, besides that, I can't use regular text editors anymore.  Even writing this blog post, my fingers naturally gravitate towards vim controls to fly around, only to have a bunch of nonsense characters appear in the window.  It's something I hadn't considered.  Using vim has made me a better programmer, but a worse writer.  Maybe one day someone will figure out how to implement vim controls into the wordpress editor...</p>

                <h2>So why do I love vim</h2>
                <p>Seriously, this might make me weird, but sometimes my brain is too fried to write code, but I still just want to play around with vim.  During those fuzzy brain hours, it's fun to learn new tricks, new movement patterns, find new plugins, figure out the most effective way to change that lowercase r 20 lines away to an uppercase in as few keystrokes as possible.  It's a game.  But a game that pays off.  So go learn vim.  You won't be sorry.  Just really frustrated for a few days.  But you really won't be sorry.</p>
            </div>
    }
];


let lookup = {};
posts.forEach(post => {
    lookup[post.id] = post;
});

export default posts;
export { lookup };
