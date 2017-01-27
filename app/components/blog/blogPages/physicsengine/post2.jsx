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

const System = {
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
    const s = Object.create(System);
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
);
