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
        <h1>Building a Physics Engine, Pt. 10 - Collision Detection using Separating Axis Theorem (SAT)</h1>
        <p className='post-date'>Jan 27, 2017</p>
        <p>We've got our spatial subdivision in place.  We have arbitrary body objects.  We have a canvas based renderer to see what's happening.  And a system to run the whole simulation.  Now it's time to dig into a bit of a meatier topic - collision detection.</p>
        <p>Ideally what we want is a method to determine if any two objects are colliding.  Generally speaking, that means we only really need to account for three tests: Circle-Circle, Circle-Polygon, and Polygon-Polygon.  Seeing as a rectangle is treated as a polygon in our engine, it'll suffice to have only these three tests.  The most common method for dealing with collision is called the Separating Axis Theorem (SAT) as it's fairly simple to implement.  One thing to note however, is that SAT only works for convex polygons.  We're not going to worry about concave polygons in our engine, so for us SAT will be perfect.</p>
        <h2>Circle Circle</h2>
        <p>This is the easy one and doesn't actually require SAT at all.  How can we tell if two circles are overlapping?  Well, it's probably easier to see visually.</p>
        <img src='/images/blog/post10/circlecircle.png' alt='circle overlap test' />
        <p>We can tell if two circles are overlapping if the distance between the two centers is less than the sum of the radii.  It makes a good deal of intuitive sense.  If the distance is greater than the sum of the radii, then there must be space between them.  Otherwise, they must be overlapping.  Super, super simple.</p>
        <p>overlap if:<Latex>$  d &lt; r1 + r2 $</Latex><br /></p>
        <p>where d is equal to <Latex>{"$ \\sqrt{(c2.x - c1.x)^2 + (c2.y - c1.y)^2} $"}</Latex></p>
        <p>Let's see that in code</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
function circlecircle(c1, c2) {
    let distance = Math.sqrt( (c2.x - c1.x) * (c2.x - c1.x) + (c2.y - c1.y) * (c2.y - c1.y) );
    if (distance < c1.r + c2.r) {
        return true;
    }

    return false;
}

`}</SyntaxHighlighter>
        <p>Easy peasy.</p>
        <h2>Box Box</h2>
        <p>When you first think about it, box-box tests seems pretty simple.  We could simply check if the minimum of box1 is less than the maximum of box2, and the maximum of box1 is greater than the minimum of box 2.  Easy to implement, easy to test.</p>
        <img src='/images/blog/post10/boxbox1.png' alt='axis aligned bounding box test' />
        <p>In the above image, we can see that min of box 2 is greater less than the max of box 1.  That in an of itself is not enough to say there's been a collision, it just means that box 2 is to the left and above the bottom right corner of box 1.  To round out the test, we can also see that box 2's min is greater than box1's min, meaning it's between box 1's min and max, therefore must be colliding.  Let's check another box configuration to make sure our logic holds up.</p>
        <img src='/images/blog/post10/boxbox2.png' alt='edge case of axis aligned bounding box test' />
        <p>The min of box2 is still less than the max of box1 and greater than the min of box1.  So that works.  Turns out, to write this test in code, it's easier to go through a process of elimination.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
function boxbox(b1, b2) {
    // If box1's max x is less than box 2's min, box 1 is left of b, so no
    // intersection
    if (b1.max.x < b2.min.x) {return false;}

    // If box1's min x is greater than box2's max x, it's to the right of box
    // 2, so no intersection
    if (b1.min.x > b2.max.x) {return false;}

    // Likewise for the y direction
    if (b1.max.y < b2.min.y) {return false;} // a is above b
    if (b1.min.y > b2.max.y) {return false;} // a is below b

    // If all those tests pass, then we know we have an intersection
    return true;
}

`}</SyntaxHighlighter>

        <p>There's a big "but" coming.  What happens if one of the boxes is rotated?</p>
        <img src='/images/blog/post10/boxbox3.png' alt='simple box box overlap test doesnt work with rotated boxes' />
        <p>It's easy to see that our test above does not hold up for rotated rectangles.  Box 2's min and greater than Box 1's max, but the boxes are clearly intersecting.  Our test above would incorrectly say there's no intersection, when clearly there is.  So how can we handle this new situation?</p>
        <p>Math to the rescue, of course.</p>
        <h2>Separating Axis Theorem</h2>
        <p>Separating Axis Theorem, or SAT, is fairly simple to explain, but to get right requires a bit of vector math.  Let's first take a look at how it works on two non-rotated (i.e. axis aligned) rectangles.</p>
        <p>The main idea is to <em>project</em> the bodies onto different axes, and see if the projections overlap.  If any of the projections do not overlap, then we can confidently say we do not have an intersection.  It's tough to grasp in words, so we'll take a look at a diagram in a moment, but first we need to talk about what it means to <em>project</em> a vector.</p>
        <p>When a vector <strong>A</strong> is projected onto some vector <strong>B</strong>, the result tells you how much distance A covers in the direction of B.  Essentially, it finds the B component of A.  It's a little like splitting a velocity vector into it's X and Y components.  Projecting the velocity vector along the x-axis returns the x component of the velocity.  Same for Y.  For arbitrary vectors, we usually use different letters, but the concept is the same.  Here's a diagram to help you picture what's going on</p>
        <img src='/images/blog/post10/vectorprojection.jpg' alt='vector projection' longdesc='http://blogs.jccc.edu/rgrondahl/files/2012/02/parallelprojection1.jpg' />
        <p>So if we look again at our simple axis aligned boxes, and project their min and max positions onto the x and y-axes, we get the following diagram.</p>
        <img src='/images/blog/post10/sat1.png' alt='axis aligned bounding box SAT test no overlap' />
        <p>We can see that the projections along the x-axis overlap, but the projections along the y-axis do not overlap.  Thus we can say there is no intersection.  That's SAT.  That's really all there is to it.  Project the body's min and max cooridates onto a set of axes and test for overlap.  Let's see a few more examples.</p>
        <img src='/images/blog/post10/sat2.png' alt='axis aligned bounding box SAT test with overlap' />
        <p>This time the boxes overlap, so the projections on both the x and y-axes overlap.</p>

        <p>What about if a box is rotated?  Well, again, we project onto the axes and see that they overlap on both axes.</p>
        <img src='/images/blog/post10/sat3.png' alt='axis aligned bounding box SAT test rotated box' />
        <p>The important thing to note about the above situtation is that when choosing which coordinates to project, we always need to choose the min values along that axis.  So look at the x-axis.  The vertex we choose to project onto the x-axis for box 2 is box 2's smallest x.  Same for the max x value.  Also for the y-axis.  So the vertices we choose are the extremes along the axis we're projecting onto.</p>
        <h2>Getting into details</h2>
        <p>If you're familiar with SAT, you may have noticed that I skimped on a few details.  First, how do we know what axes to test on?  In the above examples I've only tested along the x and y-axes.  How did I choose those?  Second, how can we find the min and max coordinates for a box along a desired axis?  Third, how do I actually perform vector projection?</p>
        <h3>Projection</h3>
        <p>Let's tackle that last one first.  Vector projection is actually quite easy.  There are two kinds of projection, though.  Scalar and Vector projection.  Scalar just gives us back the distance that vector A travels along vector B.  Vector projection actually gives us back the vector, not just the distance.  I won't go through the full proof, but the two forms are as follows (assuming we're projecting vector <strong>A</strong> onto vector <strong>B</strong>):</p>
        <p>Scalar Projection: <Latex>{"$ \\dfrac{A \\cdot B}{||B||} $"}</Latex></p>
        <p>Vector Projection: <Latex>{"$ \\dfrac{A \\cdot B}{||B||^2} B $"}</Latex></p>
        <p>The scalar projection is just the dot product divided by the magnitude of B.  And the Vector projection is almost the same, just divided by the magnitude squared, then multiplied by B to return a vector.</p>
        <p>There's a nice feature of projections that if the vector <strong>B</strong> is a normal vector, then the projection simplifies to simply be the dot product.  This is because the magnitude of a normalized vector equals 1, so the denominator in the above formulas becomes one, and all that's left is the dot product.  Pretty neat.</p>
        <p>When projecting onto a unit vector, the formulas become:</p>
        <p>Scalar Projection: <Latex>{"$ A \\cdot B $"}</Latex> when <strong>B</strong> is a unit vector</p>
        <p>Vector Projection: <Latex>{"$ A \\cdot B * B $"}</Latex> when <strong>B</strong> is a unit vector</p>
        <p>So that's it for projection.  Now onto how we choose axes.</p>
        <h3>How to choose axes?</h3>
        <p>We can't just choose arbitrary axes to project onto.  We need to make a smart choice, otherwise the test won't work.  It turns out that if we select the normal vector for all of the edges for both shapes as our test axes, then the SAT test will work perfectly.</p>
        <p>The following illustration shows the normal axes for two rotated boxes.</p>
        <img src='/images/blog/post10/sat4.png' alt='normal vectors for edges on two rotated boxes' />
        <p>Extending the normal vectors out to look more like axes...</p>
        <img src='/images/blog/post10/sat5.png' alt='axes to test for SAT' />
        <p>Notice how there were 8 normal vectors, but only 4 axes.  That's because on a square (or rectangle), normal vectors repeat.  Since edges are parallel, that means the normals to those edges will be parallel.  So for a box, we only need to worry about two of it's edges, instead of all 4.  For arbitrary polygons, this won't be the case, but we should keep it mind as a way to reduce the number of tests that need to be run.</p>
        <p>So now we know how to choose the axes to test.  Lastly, we need to find the min and max coordinates for each body along the test axes.  We'll get to that as we start to dive into code.</p>
        <h2>Coding Time</h2>
        <p>With all that theory out of the way, let's write some code.</p>
        <p>First we need to create our <em>SAT</em> class.  In a new file inside a <em>collision</em> folder, add <em>SAT.js</em>.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// We'll be doing a bunch of vector calculations,
// so we need our vector class
import {Vector} from '../math/Vector';

// Create the SAT Object
// Since we only need one SAT object for our
// entire engine, don't worry about prototypes,
// just build out the object directly
const SAT = {};

/**
* Entry point for SAT test
* @param {Body} b1 - first body
* @param {Body} b2 - second body
*/
SAT.intersect = function(b1, b2) {

};

/**
* Circle Circle test
* @param {Circle} c1
* @param {Circle} c2
*/
SAT.circlecircle = function(c1, c2) {

};

/**
* Polygon Polygon test
* @param {Polygon} p1
* @param {Polygon} p2
*/
SAT.polypoly = function(p1, p2) {

};

/**
* Polygon Circle test
* @param {Polygon || Circle} b1
* @param {Polygon || Circle} b2
*/
SAT.polycircle = function(b1, b2) {

};

export default SAT;

`}</SyntaxHighlighter>

        <p>Nothing fancy there, just laying out the bones of our SAT object.</p>
        <p>I laid out 4 main methods.  One for each of the collision tests, and one called <code>intersect</code> which will be the entry point for the whole object.  <code>intersect</code> will take any two bodies, and route them to the correct collision test.  It'll make our lives easier once we're out of here and we want to deal with other things, and not have to remember our API for the SAT object.</p>
        <p>Let's build out the <code>.intersect</code> object.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
/**
* Entry point for SAT test
* @param {Body} b1 - first body
* @param {Body} b2 - second body
*/
SAT.intersect = function(b1, b2) {
    // We want to make sure we pass the bodies into the collision functions
    // in the right order

    // If b1 is a polygon, route it to either .polycircle()
    // or .polypoly()
    if (b1.type === 'rectangle' || b1.type === 'polygon') {
        if (b2.type === 'circle') {
            return SAT.polycircle(b1, b2);
        }

        // b2 must then be a Polygon (or a rectangle)
        return SAT.polypoly(b1, b2);
    }

    // If b1 is a circle, route it to either .polycircle()
    // or .circlecircle()
    if (b1.type === 'circle') {
        if (b2.type === 'circle') {
            return SAT.circlecircle(b1, b2);
        }

        // b2 Must be a polygon or a rectangle
        return SAT.polycircle(b1, b2);
    }
};
`}</SyntaxHighlighter>
        <p>Now let's implement the simplest of tests - <code>.circlecircle</code></p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
SAT.circlecircle = function(c1, c2) {

    // Get vector between two centers
    let v1 = Vector.subtract(c2.position, c1.position);

    // The magnitude is the distance, so get that.
    let d = v1.magnitude();

    // Sum up the radii (note we're using the bodies scaledRadius)
    // because that's what drawn by the renderer
    let rplusr = c1.scaledRadius + c2.scaledRadius;

    // Check for overlap
    if (d < rplusr) {

        // Ensure mtv axis points from p2 to p1
        let c2toc1 = Vector.subtract(c2.position, c1.position);
        if (v1.dot(c2toc1) >= 0) {
            v1.negate();
        }

        // Where's this collision function coming from!?
        // We'll get there...
        // What's important to note is that we're keeping track of
        // the following things:
        //      1. Both bodies involved in the collision
        //      2. The amount in which the bodies are overlapping (rplusr - d)
        //      3. And the vector pointing from the center of circle 1 to
        //         circle 2
        return collision(c1, c2, v1.normalize(), rplusr - d);
    }

    return;
};
`}</SyntaxHighlighter>
        <p>We're just going through the steps we outlined earlier.  Measure the distance between the two circles, and if it's less than the sum of the radii, then we have an overlap.  We're returning the result of a call to a <code>collision()</code> function that we haven't defined yet.  We'll define it in a bit, but for now just know that it returns an object that just keeps track of the properties that we need for collision resolution.</p>
        <p>Let's think about this.  What do we need to resolve a collision?  We know that when the bodies touch, for now all we want to do is move them away from each other just enough so they're no longer touching.  How do we know how much to move them?  And in what direction?  How much is easy.  We can get the overlap of two circles by just looking at the difference between the center-center distance and the sum of the radii.  And if we move each circle away from each other along the vector pointing from centers, then we should get a reasonable looking resolution.  That is, the circles will move directly away from how they collided.  Combining these - if we move each circle halfof the overlap amount in the direction of the center-center axis, then the collision is resolved.  That vector, by the way, the one that we move the bodies along, is called the <strong>Minimum Translation Vector (MTV)</strong>, and it's very important.  Notice how we return that vector <code>v1</code> in the collision object.  Also note how <code>v1</code> is normalized.  We need the MTV to be normalized so that it's easy to move objects along it.</p>
        <p>Phew! That was a lot of words.  But a lot of important stuff was in there.  To recap, we need to keep track of the following:</p>
        <ol>
            <li>Bodies involved in the collision (so we can move them later)</li>
            <li>How much the bodies overlap</li>
            <li>The vector that defines the direction the bodies need to be moved away from each other, or the <strong>Minimum Translation Vector</strong></li>
        </ol>
        <p>Now let's take a quick look at the collision object we glossed over earlier.</p>
        <h3>Quick Detour - Collision Object</h3>
        <p>In the same folder, create a new file <em>Collision.js</em></p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Initialize a new Collision object
const Collision = {
    init: function(b1, b2, mtv, overlap) {
        this.body1 = b1;
        this.body2 = b2;
        this.mtvaxis = mtv;
        this.overlap = overlap;
        this.penetration = {x: mtv.x * overlap, y: mtv.y * overlap};
    }
};

// Convenience constructor
const collision = function(b1, b2, mtv, overlap) {
    let c = Object.create(Collision);
    c.init(b1, b2, mtv, overlap);
    return c;
};

export default collision;

`}</SyntaxHighlighter>
        <p>Each collision needs the properties we talked about above, so we're just creating a convenience object to hold these properties together.</p>
        <h3>One quick addition, keeping track of bodies</h3>
        <p>We should also add a little code in the circle-circle test to ensure the MTV is pointing from body1 to body2.  It's not necessarily important that it points from 1 to 2, but it'll be important in the future that our decision of which way the MTV should point is consistent.  The reason is that we want to know without question which body to move in which direction, and if the MTV is sometimes pointing one way, and sometimes pointing the other, than our resolutions will not always be the same.  It could lead to some unexpected behavior.  I know this from experience because I didn't have this code at first, and soon realized it was super necessary.  Inside our <code>circlecircle</code> method:</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Don't forget to import our new Collision object at the top of the file
import Collision from './Collision';

SAT.circlecircle = function(c1, c2) {

    // ...... //

    // Check for overlap
    if (d < rplusr) {

        // NEW CODE: Ensure MTV points from c1 to c2
        // Get the vector from c2 to c1.  It's essentially a copy of v1
        let c2toc1 = Vector.subtract(c2.position, c1.position);

        // If the dot product of a two vectors is positive, then they're
        // pointing in the same general direction (i.e. from c2 to c1)
        // So we want to negate the vector (i.e. rotate 180deg)
        if (v1.dot(c2toc1) >= 0) {
            v1.negate();
        }

        // Return our collision object
        return collision(c1, c2, v1.normalize(), rplusr - d);
    }

    return;
};
`}</SyntaxHighlighter>
        <p>If you're paying really close attention, you'll note that I don't actually need the code to check that the MTV is pointing from circle 1 to circle 2.  Because we know that v1 points from c2 to c1, we can always safely negate it and know that it'll point from c1 to c2.  The reason I did it here is to demonstrate how to do it, becuase it <em>will</em> be actually necessary in later SAT tests.</p>
        <h3>Polygon-Polygon</h3>
        <p>Now for the main show.  The polygon-polygon test.  This will apply everything we've learned up until now.  We'll need to gather all our test axes, project the bodies onto them, and measure overlaps.  First step, let's gather all the normal axes to all the edges of both polygons.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
SAT.polypoly = function(p1, p2) {
    // Gather all axes to test
    let axes = [],

    // Keep track of smallest overlap on all test axes
    smallestOverlap,

    // Keep track of which axis is the MTV
    MTVAxis,

    // Convenience variables holding number of vertices in each polygon
    numVerts1 = p1.vertices.length,
    numVerts2 = p2.vertices.length;

    // Remember that if we're looking at a rectangle, we only need two axes
    if (p1.type === 'rectangle') {
        numVerts1 = 2;
    }

    // Loop through all vertices of polygon1
    for (let i = 0; i < numVerts1; i++) {
        // For each vertex, get it's neighbor
        // For the last vertex, wrap around and grab the first vertex
        let v1 = p1.vertices[i];
        let v2 = p1.vertices[i + 1 === p1.vertices.length ? 0 : i + 1];		// Wraps around the array

        // Create a vector to hold the axis.  Start with the edge between two vertices
        let axis = Vector.subtract(v1, v2);

        // Normalize it, then make a normal vector by applying the .perp() method
        // which rotates the vector 90 degrees
        axis.normalize().perp();

        // Capture this axis in our list of axes
        axes.push(axis);
    }

    // Repeat all the above steps, but for the second polygon
    if (p2.type === 'rectangle') {
        numVerts2 = 2;
    }

    // Get axes for polygon
    for (let i = 0; i < numVerts2; i++) {
        let v1 = p2.vertices[i];
        let v2 = p2.vertices[i + 1 === p2.vertices.length ? 0 : i + 1];
        let axis = Vector.subtract(v1, v2);
        axis.normalize().perp();
        axes.push(axis);
    }

    // PERFORM INTERSECTION TEST
    // Iterate through every axis and test for an overlap
    // If we find an axis with no overlap, we can exit the test early
    // and say there was no collision
    for (let i = 0; i < axes.length; i++) {
        // Get the individual axis
        let axis = axes[i];

        // Here's some magic - We're projecting the body onto the axis like we talked about above,
        // We'll implement the .projectBody() method in a moment
        // But know that it returns the results of projecting a body onto an axis
        let p1Projection = this.projectBody(p1, axis);
        let p2Projection = this.projectBody(p2, axis);

        // A little more magic.  This tells us if two lines on the same axis
        // Overlap at all.  We'll also implement this in a moment, but for now
        // know that it returns either 0 for no overlap, or an integer amount of overlap of the two lines
        let overlap = this.lineOverlap(p1Projection.min, p1Projection.max, p2Projection.min, p2Projection.max);

        // If at any point the overlap is zero, then we're guaranteed
        // to have no collision, so exit the test
        if (overlap === 0) {
            return;
        }

        // We know we want to keep track of the smallest overlap to be used for collision resolution
        if (smallestOverlap) {
            // If this overlap is smaller than the current smallest...
            // capture the value, and the axis that goes along with it
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        } else {
            smallestOverlap = overlap;
            MTVAxis = axis;
        }
    }

    // We saw this from earlier
    // Ensure mtv axis points from p1 to p2
    let p2top1 = Vector.subtract(p2.position, p1.position);
    if (MTVAxis.dot(p2top1) >= 0) {
        MTVAxis.negate();
    }

    // Return our freshly created collision object
    return collision(p1, p2, MTVAxis, smallestOverlap);
};
`}</SyntaxHighlighter>
        <p>Okay, so that's a lot of code.  Take your time with, it's pretty straightforward.  There's nothing crazy going on, but it can be hard to wrap your head around at first.  Let's step through it.  First, we gather all the test axes for each polygon.  Those axes are the normals for each edge, meaning we first have to loop through the vertices of each polygon, grab their edges, then construct the normal vectors.  Also note that if we're dealing with a rectangle we know we only need to test two axes, so we don't bother looping through all the vertices, only the first two.</p>
        <p>Then we perform the actual test.  There are a few magic functions in there that we haven't defined, but we should be able to understand the output of those and press on.  We loop through the test axes one at a time, project both bodies onto each axis, and see if their projections overlap.  If there is no overlap, we can exit the entire test early (which is a good thing!) and save ourselves a bunch of useless computation.</p>
        <p>Now let's define those magic functions <code>.projectBody()</code> and <code>lineOverlap</code>.</p>
        <p>Remember earlier we said we need to loop through the vertices of the body and find the minimum and maximum points of that body with respect to the axis we're projecting onto.  So the project body method will essentially do just that</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
/**
* Project a body onto a given axis
* @param {Body} b
* @param {Vector} axis
* @return {Object} min and max projected coordinates
*/
SAT.projectBody = function(b, axis) {
    // We'll handle projections differently for polygons and circles
    // Polygon case
    if (b.type === 'rectangle' || b.type === 'polygon') {

        // First, grab the first vertex and set it to be our current minimum
        // and maximum. We need to start somewhere, right?
        let min = b.vertices[0].scalarProjectUnit(axis);
        let max = min;

        // Loop through all vertices on the body,
        // project the vertex, then check to see if it's less than the current
        // min or greater than the current max
        for (let i = 0; i < b.vertices.length; i++) {
            // Get the vertex
            let v = b.vertices[i];

            // Project it using scalar projection (Note, we've added a .scalarProjectUnit() method to
            // our vector class.  I'll leave that for you to figure out how to
            // do)
            let p = v.scalarProjectUnit(axis);

            // Check if it's smaller or larger than the min or max,
            // respectively
            if (p < min) {
                min = p;
            } else if (p > max) {
                max = p;
            }
        }
        // Return the min and max values
        return {min, max};
    } else if (b.type === 'circle') {

        // Cirle case
        // Cirles don't have vertices, so we project the center onto the axis,
        // and offset the min and max by the radius of the circle.
        let p = b.position.scalarProjectUnit(axis);
        return {min: p - b.scaledRadius, max: p + b.scaledRadius};
    }
};
`}</SyntaxHighlighter>
        <p>First thing you're probably saying is "Hey, what's that <code>.scalarProjectUnit()</code> method!?"  Well, dear friend, that is something I've added to our Vector class that will project a vector onto a unit vector.  If you remember you're vector algebra, you're probably saying "But isn't that just the dot product!?"  And you'd be 100% correct.  We could replace those calls to <code>.scalarProjectUnit</code> with just <code>v.dot(axis)</code> and it'd be exaclty the same.  The reason I broke it out into another method is to let myself know that I have to project onto a UNIT vector, not just any old vector.  It's a convenience things, and I like to name things precisely what they do, so there's less to think about in the future.</p>
        <p>Now let's take a look at the other magic method <code>.lineOverlap</code></p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
/**
* Line Overlap
* Method to determine if two lines on the same axis have an overlap
* @param {number} p1min - min point of 1st line
* @param {number} p1max - max point of 1st line
* @param {number} p2min - min point of 2nd line
* @param {number} p2max - max point of 2nd line
* @return {number} amount of overlap of these two lines
*/
SAT.lineOverlap = function(p1min, p1max, p2min, p2max) {
    // Get the minimum of the two rightmost points
    let min1 = Math.min(p1max, p2max);

    // Get the maximum of the two leftmost points
    let max1 = Math.max(p1min, p2min);

    // The difference between those is the overlap.
    let diff = min1 - max1;

    // If the diff has a positive value, that's the overlap, otherwise return
    // 0 for no overlap
    return Math.max(0, diff);

    // We could write this all in one line, like so, if we were so inclined
    // return Math.max(0, Math.min(p1max, p2max) - Math.max(p1min, p2min));
};
`}</SyntaxHighlighter>
        <p>Let's look at a picture to help understand how that function works</p>
        <img src='/images/blog/post10/sat6.png' alt='determing overlap of two line segments' />
        <p>The smaller of the two rightmost points minus the larger of the two leftmost points is the overlap.</p>
        <h3>Polygon Circle</h3>
        <p>To round out the suite of test, we lastly have to account for the polygon-circle test.  This is almost identical to the polygon-polygon test but with one twist.  Circles don't have vertices, so what axes should we use for the circle?  Well, if we really wanted we could think of the circle as a set of discrete edges, and use all those normals as axes, but that's kinda silly.  It turns out that there's one special axis that if we test along with all the polygon's axes, then we get a complete test.  That axis is the one that goes from the circle center to the nearest point on the polygon.  Like so:</p>
        <img src='/images/blog/post10/sat7.png' alt='axis that points from circle center to nearest point on polygon' />
        <p>So we can reuse most of the code from the polypoly test, but remove the loop through the second shape, and instead replace it with a loop to determine which point is closest to the circle center.  To figure that out we can just take the euclidean distance.  And we can even same some computation by not taking the square root, because we don't care about the actual distance, we just care which point is closest.  And square roots are computationally expensive, so we should see if we can avoid them if possible.  Otherwise, the test is exactly the same.  I'm not going to write it out, becuase there's gotta be something left for you to do, right?  If you really want to see it, head over the <ExternalLink url='https://github.com/jcharry/SciPlay'>Git Repo</ExternalLink> and check out the SAT class.</p>
        <h2>Wrap up</h2>
        <img src='/images/blog/post10/sat7.gif' alt='animation of SAT in action' />
        <p>So that's basically it for SAT.  It's a really simple, yet really robust way to handle collision detection.  Next up, we'll add in the necessary framework to integrate this collision detection into our system, and introduce the broadphase and narrowphase aspects of collision.</p>
    </div>
);
