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
     <div itemProp='articleBody'>
        <h1>Building a Physics Engine, Pt. 8 - Spatial Subdivision</h1>
        <p className='post-date'>Jan 5, 2017</p>
        <p>Let's think about collisions for a moment.  There's a really simple way to check if two circles are colliding: get the distance between the two centers, then compare that distance to the sum of the two radii of the circles.  If the distance is smaller than the sum of the radii, then we know the circles are overlapping.  So with that in mind, let's take a leap and imagine that we have 100 circles on the canvas, like so:</p>
        <img src='/images/blog/post8/circlescolliding.png' alt='100 circles, some are overlapping'/>
        <p>Looking at the picture, we can easily see which are overlapping, but how is our engine supposed to know?  All it has are a list of circles with positions and radii.  We can use the stragegy mentioned above to check for overlap, but how do we know which circles to test against each other?  The naive approach is for every circle to test every other circle on the canvas.</p>
        <p>So, we have 100 circles, each one has to check 99 other circles to see if it's overlapping.  That's approximately 100 * 100, or 10000 tests.  Just to figure out that only a handful, maybe 10 of the circles are overlapping.  That's crazy.  If we were to use this approach on an ever increasing number of circles, i.e 1000 circles, that's 1000 * 1000 tests, or 1000000 tests.  This way of doing things has an O(n&sup2;) complexity, meaning if we have <em>n</em> circles, we have to perform <em>n</em>&sup2; tests.  1000 circles: 1000&sup2; tests.  Not good for trying to render things in real time.</p>
        <h2>Spatial Subdivision to the Rescue</h2>
        <p>The solution to this problem lies in a clever way to think about space.  Why are we testing circles in the lower right hand of the screen against circles in the upper left side?  We know for sure, 100% certain, that they aren't overlapping, so why do we need to test?  We only need to test the area directly around the circle itself, not circles seemingly miles away.  That's the heart of subdividing space.</p>
        <p>What we mean when we say <em>subdividing space</em> is actually quite simple.  We take an area, in this case the size of our canvas, and we chop it up into squares.  We can then figure out which circles are inside which squares</p>
        <p>Once we have our circles <em>bucketized</em> into the squares, we can then limit the collision tests for each circle to other circles that are in the same subdivided square.  It might be simpler to see in an image.</p>
        <img src='/images/blog/post8/spatialhash1.png' alt='spatial hashing of the system' />
        <p>The green squares represent sections of the system that do not currently have any children in them, while the red contain at least 1 object.</p>
        <p>This kind of subdivision is called <em>Spatial Hashing</em>, because in a sense it can be thought of a hash table for chunks of space.  Once implemented, we can look up any section of our system by <em>hashing</em> a given point (i.e. figuring out what bucket that point belongs to), then getting whatever children are currently contained within that hash.</p>
        <p>Of course, spatial hashing is only one of many possible ways to divide space.  I'm not going to talk in detail about other methods, but some of the most common ones are:</p>
        <ol>
            <li><strong>Quadtree</strong>: Similar to a spatial hash except the subdivision doesn't have to be regular.  We can generate subdivisions within subdivisions if there are too many objects in one area.  We can split a single square into 4 smaller squares, and split those smaller squares into 4 even smaller squares.  These are great for clustered objects because we can create very small buckets in densely populated areas, and keep big buckets for sparsely populated regions.</li>
            <li><strong>Octree</strong>: Exaclty the same as a quadtree, but splits space into 8 sections.  Only makes sense in 3D</li>
            <li><strong>Bounding Volume Hierarchy (BVH)</strong>: Bounding boxes are created around sets of objects.  It's similar in a way to a spatial hash, but the bounding boxes aren't necessarily aligned to a grid.  We can then use those bounding volumes and limit collision tests to objects within a bounding volume.</li>
            <li><strong>Binary Space Partition</strong>: Split space into partitions along hyperplanes (which in 2D are just straight lines).  BSP's are tricky in that the splits are not axis-aligned and require significant work to implement properly.</li>
        </ol>
        <p>You can probably see why I'm sticking with a spatial hash.  It's super simple, and for all intents and purposes will work just as well as the other options, with minimal effort to implement.  Spatial hashes tend to work best when the objects are sparsely distributed, rather than tightly clustered, and when the subdivision size (square size) is about twice as large as the average object in the system.  This engine isn't being designed for heavy applications, and until proven otherwise a spatial hash will be completely sufficient.  So let's get it into our engine.</p>
        <h2>It's All Just Data...</h2>
        <p>A spatial hash is nothing mysterious.  It's just a data structure.  In a sense, it's no different from a Javascript object where each spatial 'chunk' is a property on that object.  To visualize this, have a gander at this picture.</p>
        <img src='/images/blog/post8/spatialhash2-numberedgrid.png' alt='each square in a spatial hash is numbered' />
        <p>Each square can be represented by a number, or some identifier.  Then we can store the grid squares on an object using their id to look them up as needed.  Each stored square holds references to any objects that are inside that square, like so:</p>
        <img src='/images/blog/post8/spatialhash3.png' alt='spatial hash is essentially just a lookup table with references to objects they contain' />
        <p>Notice how one circle overlaps both buckets 7 and 13.  To deal with this, we just put that object into both the 7 and 13 buckets in our hash.</p>
        <h2>The Spatial Hash</h2>
        <p>Now that we understand what a spatial hash is, let's put it into practice.</p>
        <p>Just like always, let's create a new object to keep our Spatial Hash code on. In the <em>geometries</em> directory, add a new file <em>SpatialHash.js</em></p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Create an object skeleton just like always
const SpatialHash = {
    // initialization function
    init: function(cellSize, width, height) {
        // Size of each 'square' or 'bucket'
        this.cellSize = cellSize;

        // Size of the system to hash
        this.width = width;
        this.height = height;
    }
};

// Convenience 'constructor';
const hash = function(cellSize, width, height) {
    let h = Object.create(SpatialHash);
    h.init(cellSize, width, height);
    return h;
};

export default hash;

`}</SyntaxHighlighter>
        <p>Notice how we need to initialize the object with the following properties:</p>
        <ul>
            <li><code>cellSize</code> - the size of each grid square</li>
            <li><code>width</code> - the width of the system</li>
            <li><code>height</code> - the height of the system</li>
        </ul>
        <p>We want to allow the cellSize to be altered because there's no one best size.  The optimal cellSize depends on the average size of the objects currently held in the system, so we want it to be tweakable.</p>
        <p>Next, we need a <code>.hash()</code> function.  The function will allow us to figure out what cell a given point belongs to.  For example, if we know a circle's location is (200, 250), we need a way to figure out what bucket contains those coordinates.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Create an object skeleton just like always
const SpatialHash = {
    // initialization function
    init: function(cellSize, width, height) {
        // Size of each 'square' or 'bucket'
        this.cellSize = cellSize;

        // Size of the system to hash
        this.width = width;
        this.height = height;
    },

    // New function!
    // Hash a point and return the corresponding bucket
    // We're passing in a 'point' object, which is any object that has x and
    // y properties on it (e.g. a position vector)
    hash: function(point) {
        // Hashing a point is easy, we just figure out what column and row it's
        // in by dividing it's position by the cellSize, and flooring it.
        let col = Math.floor(point.x / this.cellSize);
        let row = Math.floor(point.y / this.cellSize);
        return {
            col,
            row
        };
    },
};

`}</SyntaxHighlighter>
        <p>Notice how we're returning a column and row corresponding to the bucket, rather than just a number corresponding to index.  We could do that, but I found it easier to conceptualize the buckets as a grid of rows and columns.  And in the end it works out just the same.  Next we need to determine how to add bodies to any buckets they are touching.  Add an <code>.insertBody()</code> function on the object:</p>
        <p>But how should we go about doing that? A body isn't a single point, and it can overlap more than one bucket, as we've seen above.  The answer is quite simple -> Loop over the AABB vertices for the body, and add the body to any bucket that it falls inside of.  This isn't perfect, of course, because the AABB could overlap a square that the Body is not physically inside of, but it's good enough in most circumstances.</p>
        <p>And where do we store objects when we find their buckets?  We'll create an empty object and fill it up by row and column.  It's a bit difficult to explain in words, and easier to see in code.  Let's assume that we have the data from above, with circles located in buckets 2, 7, 9, 11, 13, 22.  One circle is shared between buckets 7 and 13.  If we convert those buckets to rows and columns, then we're looking at data in the following buckets: (0, 1), (1, 0), (1, 2), (1, 4), (2, 0), and (3, 3), where the first coordinate is the row and the second is the column. Our data structure should look like this</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
this.contents = {
    // Row 0
    0: {
        // Column 1
        1: [Body1]
    },

    // Row 1
    1: {
        // Columns 0, 2, 4
        0: [Body2],
        2: [Body3],
        4: [Body4]
    },

    // Row 2
    2: {
        // Columns 0 - note Body2 is shared between two buckets
        0: [Body2]
    },

    // Row 3
    3: {
        // Column 3
        3: [Body5]
    }
}

`}</SyntaxHighlighter>
        <p>We don't fill out the entire data structure, if a bucket doesn't have any children, then it just doesn't exist on the data structure.  This is called a <em>sparse spatial hash</em>.  We could create empty arrays for every single row and col combination, and just fill up buckets as needed, but that's not necessary.</p>
        <p>Now we need a way to actually push bodies into the data structure.  We'll add the <code>.contents</code> property, and a corresponding <code>.insertBody()</code> function.</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Create an object skeleton just like always
const SpatialHash = {
    // initialization function
    init: function(cellSize, width, height) {
        // Size of each 'square' or 'bucket'
        this.cellSize = cellSize;

        // Size of the system to hash
        this.width = width;
        this.height = height;

        // NEW Property
        // Initialize empty data structure for our hash
        this.contents = {};
    },

    hash: function(point) {
        // Hashing a point is easy, we just figure out what column and row it's
        // in by dividing it's position by the cellSize, and flooring it.
        let col = Math.floor(point.x / this.cellSize);
        let row = Math.floor(point.y / this.cellSize);
        return {
            col,
            row
        };
    },

    // New Function!
    // Pass a Body object, and determine which buckets to add it to
    // Loop over AABB points, hash each point, then add the body to any
    // corresponding buckets
    insertBody: function(body) {

        // Hash the vertices of the AABB
        // If the body is on the corner of 4 buckets, min returns the upper
        // left bucket, and max returns the lower right bucket
        let min = this.hash(body.aabb.min);
        let max = this.hash(body.aabb.max);

        // Iterate over rectangular region
        // And put the object in all buckets that
        // it hits
        for (let r = min.row; r < max.row + 1; r++) {
            for (let c = min.col; c < max.col + 1; c++) {

                // If the row already exists (i.e. another object is already
                // occupying somewhere in the row)
                if (this.contents[r]) {
                    // And if the column exists (another body shares the same
                    // bucket)
                    if (this.contents[r][c]) {
                        // Push this body into the spatial hash
                        this.contents[r][c].push(body);
                    } else {
                        // Otherwise create the column property and add an
                        // array with the first body
                        this.contents[r][c] = [body];
                    }
                } else {
                    // The row doesn't yet exist, so create the row and column,
                    // and initialize the array with the body object
                    this.contents[r] = {};
                    this.contents[r][c] = [body];
                }
            }
        }
    },
};

`}</SyntaxHighlighter>
        <h2>Querying buckets</h2>
        <p>The whole point of a spatial hash is so that we can query a bucket to get it's contents.  Ideally, we'd like to pass a body into some function, and get a list of all other objects in the same buckets as the object we pass in.  To accomplish this, we first have to figure out what buckets the body belongs to by hashing it's AABB.  We then look at the contents of the data structure for each of those buckets.  If we find any bodies, we collect them in a list, and return that list when we're done.  It's actually quite similar to inserting bodies.  Let's add it now, in a new function called <code>.queryBody()</code></p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Create an object skeleton just like always
const SpatialHash = {
    init: function(cellSize, width, height) { /* CODE REMOVED FOR CLARITY */ },
    hash: function(point) { /* CODE REMOVED FOR CLARITY */ },
    insertBody: function(body) { /* CODE REMOVED FOR CLARITY */},

    // New Function
    queryBody: function(body) {
        // Hash the body's aabb to get it's buckets.
        let min = this.hash(body.aabb.min);
        let max = this.hash(body.aabb.max);

        // Initialize an empty array to hold any nearby bodies
        let nearby = [];

        // Iterate over rectangular region
        // And put the object in all buckets that
        // it hits
        for (let r = min.row; r < max.row + 1; r++) {
            for (let c = min.col; c < max.col + 1; c++) {

                // If there are contents in this bucket
                // loop through all bodies
                this.contents[r][c].forEach(b => {

                    // Surely, we'll find the body we've passed in, so make
                    // sure we don't add the body to it's own list
                    // Also, we don't want to add other bodies more than once,
                    // so we check to make sure we haven't already added it to
                    // the list

                    if (nearby.indexOf(b) === -1 && b !== body) {
                        nearby.push(b);
                    }
                });
            }
        }
        // Simply return it
        return nearby;
    },

};

`}</SyntaxHighlighter>
        <p>Lastly, we need a way to clear out the hash altogether, which is as simple as it gets:</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Add this to the main object
// clears out this.contents, essentially clearing the hash completely.
clear: function() {
    this.contents = {};
}
`}</SyntaxHighlighter>
        <p>That's all we need for the Spatial Hash.</p>
        <h2>How do we actually use it?</h2>
        <p>Well, we aren't doing any collision detection yet, so we won't use our new hash to it's fullest extent just yet, but we can get started.  What we want to do is add our hash into our System.  Let's think about what we want to happen.  As bodies move around the system we need to make sure the bodies update their position in the Spatial Hash.  Otherwise moving bodies will quickly become out of sync with their corresponding buckets.  But there's not a nice clean way to do that without a lot of logic.  The simplest solution is just to clear out the hash at the beginning of each loop, update the bodies positions, then reinsert them into the hash.  That's why it's handy to have a <code>.clear()</code> method on the hash.  Clearing and reinserting adds a bit of overhead to each update loop, but it's a linear operation, meaning it'll run O(n).  Every loop only has to add <em>n</em> operations to insert into the hash.  Worst case it'll perform 4*n operations because inserting into the hash could run 4 loops if the body is in 4 different buckets.  But O(n) notation, we ignore constants because their impact on running time is pretty negligible.  The time saved by inserting into the hash each update is vast when we realize that by adding these extra <em>n</em> operations in the update loop, we can reduce our naive O(n&2sup;) collision tests to something <em>significantly</em> lower.</p>
        <p>Implementing into our System requires only a little bit of code.  In <em>System.js</em>, in the <code>.update()</code> method:</p>
        <SyntaxHighlighter
            language='javascript'
            style={solarized}
        >
{`
// Make sure import the Spatial Hash
import hash from '../geometries/SpatialHash';

const System = {
    init: function(params) {
        this.bodies = [];
        this.width = params.width || 600;
        this.height = params.height || 300;

        // Initialize Hash
        // First get the cellSize from params object, or set a default;
        this.cellSize = params.cellSize || 100;

        // Initialize spatial hash
        this.hash = hash(this.cellSize, this.width, this.height);
    },

    /* Other code ommited for clarity */

    // System needs to update on each render loop
    update: function() {
        // Before updating any bodies, clear out the hash
        // Loop through all bodies and update one at a time
        this.bodies.forEach(body => {
            body.update();
            // After updating the bodies position, re-insert it into the hash
            this.hash.insertBody(body);
        });
    }
};

`}</SyntaxHighlighter>
        <p>And that's all there is to it.  Now the bodies will always be in sync with the spatial hash.  And when we eventually perform collision test (we'll get there, I promise), we'll be able to query the hash and only test for bodies that are nearby.  Saving TONS of work.</p>
        <h2>Helpful Things for Debugging</h2>
        <p>In an earlier post on the Renderer, I mentioned that it'd be nice to have some debug functionality so as we're developing we can visualize what's actually happening.  It turns out to enormously useful to spend some time getting that working.  Trying to determine if our spatial hash is working properly without visualizing it is like a blind cat trying to find the last piece of food in it's bowl.  It's painful, really.  So next we'll take a little diversion and implement some Renderer Debugging visuals! Fun!</p>
    </div>
);
