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
        <h1>Building a Physics Engine, Pt. 9 - Diversion 1: Visualizing Our System for Debugging</h1>
        <p className='post-date'>Jan 5, 2017</p>
        <p>A quick diversion to add some stuff to the renderer.  In previous posts some of the images have boxes surrounding either bodies or representing the spatial hash.  These visuals are enormously helpful because we can see that our system is working as expected.  The alternative is console logging out states of various objects and poking through them to make sure things look good.  It's super painful to do that, so let's make some additions to our Renderer.</p>
        <h2>Debugging Bodies and their AABB's</h2>
        <p>This one's simple, if a body has a flag <code>this.debug = true</code>, then we want to not only draw the shape, but it's AABB.  Inside the <code>.drawBody()</code> on the Renderer:</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
drawBody: function(body) {
    // NEW CODE - right at top of function
    // If the body's debug flag is true
    // draw it's aabb in red
    if (body.debug) {
        this.ctx.beginPath();
        let aabb = body.aabb;
        let x = aabb.min.x;
        let y = aabb.min.y;
        let w = aabb.max.x - x;
        let h = aabb.max.y - y;
        this.ctx.rect(x, y, w, h);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = .5;
        this.ctx.stroke();
    }

    // All other code below is the same //
    // Omitted for clarity //
},
`}</SyntaxHighlighter>
        <p>We just have to remember to add a <code>.debug</code> property to the Body object.  Just add <code>this.body = options.debug === undefined ? false : options.debug;</code> to the initialization of the Body.  If the user passes false, or nothing at all, then the body won't be in debug mode, but if they pass anything else, then debug mode will be flipped on.</p>
        <h2>Rendering the Spatial Hash</h2>
        <p>This one's a bit trickier.  We want to draw a square for each grid of the hash, and if the hash has contents inside of it, flip the color of the square to red.</p>
        <p>First add a debug property to the Renderer.  We'll use this property to display a bunch of stuff that should otherwise be hidden.  For now we'll just use it to show the spatial hash.  Add <code>this.debug = params.debug === undefined ? false : params.debug</code></p>
        <p>Then add some code to actually draw the hash inside the renderer.  In the <code>.render()</code> method, underneath all the other drawing code:</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`

render: function(system, updateFn) {
    // OLD CODE //
    if (!this.system) {
        this.system = system;
        this.canvas.width = this.system.width;
        this.canvas.height = this.system.height;
    }

    this._requestID = requestAnimationFrame(() => {
        this.render(system, updateFn);
    });

    if (this.clearBackground) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.beginPath();
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (updateFn) {
        updateFn();
    }

    system.update();

    system.bodies.forEach(body => {
        this.drawBody(body);
    });
    // END OLD CODE //

    // NEW CODE - Draw spatial hash
    // If in debug mode, draw spatial hash
    // and highlight nodes that contain items in red
    if (this.debug === true) {

        // pull cell size from hash
        let cellSize = this.system.hash.cellSize;
        this.ctx.globalAlpha = 1;
        this.ctx.lineWidth = 1;

        // Iterate as many times as there are columns and rows
        for (let i = 0; i < this.system.hash.width; i += cellSize) {
            for (let j = 0; j < this.system.hash.height; j += cellSize) {
                // For each row and column draw a square
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'green';
                this.ctx.rect(i, j, cellSize, cellSize);
                this.ctx.stroke();
            }
        }

        // Check the contents of the hash, loop through each row
        Object.keys(this.system.hash.contents).forEach(row => {

            // And loop through each column
            Object.keys(this.system.hash.contents[row]).forEach(col => {

                // If the bucket has items inside of it (i.e. it's length
                // is > 0), then draw the square in red
                if (this.system.hash.contents[row][col].length !== 0) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 1;
                    this.ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
                    this.ctx.stroke();
                }
            });
        });
    }
},

`}</SyntaxHighlighter>
        <p>You might be wondering why I broke up drawing the entire grid, and then just the red squares into two separate loops.  Well, dear friend, it just happened to be easier for me to think about first drawing all the green background squares, then on top, drawing the red squares by just iterating through the sparse hash.  Sure, that could probably be optimized, but why bother optimizing a debug feature?  That's just a straight up waste of time, ya dig?</p>
        <p>Now when we run the renderer with <code>debug = true</code>, we'll see our hash structure, and we can dynamically see the red squares changing, indicating that the hash is being updated.</p>
        <img src='/images/blog/post9/debugging1.gif' alt='gif of circles moving and spatial hash highlighting as circles enter squares' />
        <h2>Next Time</h2>
        <p>We have our hash, we have our bodes, we have our renderer.  Let's talk about collisions using the Separating Axis Theorem.  Get your math hats ready.</p>
    </div>
);
