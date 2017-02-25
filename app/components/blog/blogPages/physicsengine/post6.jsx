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
);
