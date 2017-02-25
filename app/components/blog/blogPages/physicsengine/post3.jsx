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
{`
// Set up it's prototype
const Renderer = {

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
    let R = Object.create(Renderer);
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
{`
    /**
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
{`
    /**
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
    },

`}</SyntaxHighlighter>
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
);
