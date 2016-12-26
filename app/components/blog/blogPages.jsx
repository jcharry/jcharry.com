/*
 * blogPages.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';

let posts = [
    {
        title: 'Building a Physics Engine, Pt. 3 - The Renderer',
        id: 'physengine3',
        url: 'physengine3',
        content: (
            <div>
                <h1>Building a Physics Engine, Pt. 3 - The Renderer</h1>
                <p>In this post we'll implement a simple Renderer object that will allow us to draw Bodies to the canvas</p>
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
                <p>The first part any good world, is, well, the world itself.  The stage.  The place where things exists.  This post will detail building out a simple world to keep track of all the objects that will eventually live inside it.  But before we do that, let's first make a simple object that can live in the world.  A Body</p>

                <h2>The Body Object</h2>
                <p>The first type of body we'll focus on is a simple rectangle, since it's really simple to get up and running.</p>
                <p>First the skeleton of the object.</p>
                <pre><code>
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
                </code></pre>
                <p>The structure here is relatively simple.  The Body object acts as a prototype to primitive shapes.  Any function shared between all primitive shapes (i.e. functions that both rectangles, circles, and polygons wil need) will live on this Body object.  By structuring code this way, we can ensure that we're not using up extra memory storing individual copies of shared functions.  These functions will exist in one spot in memory, and will be used by any and all primitive shapes as necessary.</p>
                <p>So far we just have an <code>init</code> function and an <code>update</code> function.  I have a personal aversion to Javascript's <code>new</code> keyword, so I like to structure my code a little differently.  This way we'll use Body as a prototype, and initialize with it's <code>init</code> function.  You'll see how it'll work in just a moment</p>
                <br />
                <p>Now let's take a look at a simple rectangular primitive</p>
                <pre><code>
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
        this.vertices = [
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
                </code></pre>
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
            <pre><code>
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
            </code></pre>
            <p>So let's break down what's happening.  In the same fashion as the Body object, we're defining a System object that will be used a prototype.  It comes with an <code>init</code> function that can be called to initialize it's parameters.  An <code>addObject</code> function just pushes objects into an internal array to keep track of everything.  Notice that we're using falltlhrough in the <code>switch</code> statement.  This is because in the future I'm envisioning having several different types of things that can be added to the system.  To keep them separate, we add all bodies to <code>this.bodies</code> and any other stuff that comes along in the future that isn't a <code>Body</code> object can go into a different array.</p>
            <p>Lastly we define an <code>update</code> function that will loop through all bodies and update them in turn.  Remember how we defined an <code>update</code> function on <code>Body</code>?</p>

            <p>Once we've created our System object, we export a simple function that leverages the same pattern as the <code>Rect</code> and <code>Body</code>. <code>system</code> takes some initalization params, uses Object.create to make a new object with <code>System</code> as it's prototype, initializes the newly created system object, then returns it. Easy peasy.</p>

            <h2>One more tweak to Body</h2>
            <p>We have to make a quick addition to the Body's <code>update</code> function.</p>
            <pre><code>
    update: function() {
        if (this.updateVertices) {
            this.updateVertices();
        }
    }
            </code></pre>
            <p>We need to make sure that our rectangle's vertices actually get updated when <code>System</code> updates all the bodies. Otherwise our rectangle would never actually move.</p>

            <h2>Using it</h2>
            <p>So how would we actually use these?</p>
            <p>Well, it's pretty straightforward.  Check it.</p>
            <pre><code>
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
            </code></pre>
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

<pre><code>
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
</code></pre>

            <h2>But, why?</h2>
            <p>Great, we've wrapped a map up into a react component. Whoop-de-do.  Big deal.  So far we haven't utilized react for anything interesting.  What we really want is to hook into react's lifecycle methods.  That's where the power lies.  That's what it's good at.  Looking at state and taking action for us.  But there's an issue here.  MapboxGl is ultimately just a canvas element.  That's why it can render zoom levels of 4.3, or 8.2.  It's just drawing into a canvas, and react doesn't really give any good way to interact with a canvas, since, after all, what happens in the canvas is irrelevant to the DOM.  As far as the DOM is concerned, the canvas exists, and that's all it cares about.  So how do we utilize a library that is super good at rendering DOM elemnents, with a library that doesnt' really give the DOM a second thought?  And why would we want to do that?</p>

            <p>Well, if you're just building a simple map with some data on it, it's pretty pointless to use React.  But once you start buliding a web-app <em>around</em> a map, well then react comes in handy for just about everything else besides the map, so it makes sense to figure out how to get the two to talk to each other amicably.</p>

            <p>We press on.</p>

            <h2>Lifecycle updates</h2>
            <p>The goal is to get the map to react when the state changes.  In the code above, I left in a state variable called whereAmI, which I'm using to track what 'page' the user is on.  If the user clicks forward in the app, the map should update with new data, and a new position.  We can let react handle telling our Map component that it needs to update by utilizing componentDidUpdate.</p>
<pre><code>
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
</code></pre>

            <h2>Mapbox Sources and Layers</h2>
            <p>This is all well and good, but what happens when you want to start adding overlays to your map?  If you're not familiar with MapboxGL, it basically works by storing <code>sources</code> and <code>layers</code>.  Sources act as, just what they sound like, sources of data.  Typically they contain geojson data, but are not limited to it.  Sources do not display, they just store data.  Layers reference a source, then figure out how to display the source on the map.  You can have many different layers, all showing different things, from the same source, e.g. borders or fills.</p>

            <p>So as the user pages through the app, the data changes.  How do we handle this?  There's a few potential ways to go about this:</p>
            <ol>
                <li>Store all sources and layers in the store, with properties that tell the app what page they should display on</li>
                <li>Store only visible sources and layers in the store, that we we don't have to do any filtering in the Map component itself</li>
                <li>Lastly, don't store any sources or layers in the store, and instead store them as local properties on our Map class.</li>
            </ol>

            <p>The most <em>reacty</em> to handle this would probably be option number 1. or 2.  Let Redux store what needs to be displayed and all the Map is responsible for is displaying it.  But in the process of trying to do this, I found it get a little hairy.  It ends up looking something like this:</p>
<pre><code>
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
</code></pre>
        <p>Do you see the problem?  componentDidUpdate gets run when whereAmI changes, which then dispatches a new overlay to the redux store, which in turn triggers componentDidUpdate again.  In this case it's manageable if we use a few simple conditionals, but the possibility for endless updating, or even more likely just hard to reason about code, is super high.  There is probably a better paradigm to handle this sort of a situation, but I found that the easiest way was just to let the Map component handle it's own state.  It flies directly in the face of 'Stateless all the things' and 'One source of truth', but it works.  And to be honest, I find it not terribly hard to reason about because you don't have to consider the cascading updates that are possible when a component is updating itself via <code>dispatch</code>.</p>

        <p>Here's how I handled it.  The Map component simply holds all overlays (that is, sources and layers) in it's own internal array.  Each overlay is wrapped in a separate class, called PointsOverlay or PathOverlay, depending on the type of geojson data we have, and that class has properties to store what page that overlay should be visible on.  So instead of dispatching a new action when the component updates, we just look at where we are, filter through our list of overlays, then display the relevant ones.</p>
<pre><code>
this.overlays.forEach((overlay) => {
    if (overlay.layer.visibleOnPage === whereAmI.page && overlay.layer.associatedPosition === whereAmI.position) {
        overlay.showLayer();    // a class method that calls mapboxGL .setLayoutProperty() and set's it to visible
    } else {
        overlay.hideLayer();    // Sets layout property to 'none'
    }
});
</code></pre>

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
            <pre><code>
var Sylvester = require('./node-sylvester/index.js');
var Matrix = require('./node-sylvester/lib/node-sylvester/matrix.js');
var Vector = require('./node-sylvester/lib/node-sylvester/vector.js');
    </code></pre>

            <h2>Setting things up</h2>
            <p>I need to create 4 modules:</p>
            <ol>
            <li>linearRegression.js - the controller, if you will</li>
            <li>costFunction.js - a simple module to compute the cost function</li>
            <li>gradDescent.js - you guessed it, a module to perform gradient descent</li>
            <li>normalize.js - and lastly a module to convert data points to normalized values</li>
            </ol>

            <p>let's start with linearRegression.js and layout what we need it to do:</p>
            <pre><code>
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

    </code></pre>

    <p>So what's going on up there.  First, node-sylvester provides an easy way to load in a txt file to a Sylvester Matrix object.  Because everything in Sylvester is an object, all Matrix and Vector operations are used via methods - e.g to multiply Matrices A and B you'd write <code>A.multiply(B);</code>  Data is typically provided in csv or tsv as a txt file where each row corresponds to one training example.  The number of columns in the data set informs the number of features we want to look at.  In the example data set here, there are two features, and 47 training sets.  The data file has the 2 feature columns first, followed by the solution column last.  So we slice out X (which represents our features), and y (which represents the output of those features).  We then want to Normalize our X values since it's likely that the scales of each feature set is quite different.  This will ensure gradient descent works much more efficiently.  We then initialize a theta vector with zeros (a good starting point for gradient descent).  Theta should have as many rows as there are features.  To account for theta(0), we have to add a row of ones to the X matrix - but we'll take care of that within the <code>normalize()</code> function.  We run gradient descent using our learning parameters, then use the resulting theta to predict the y value of a never before seen data point.  One caveat, when normalizing, we don't want to normalize X with a column of ones at the front, so inside the Matrix <code>map</code> we don't normalize the element at row = 1 (i.e. the first element).  That's all that's going on in that funky looking map call.</p>

            <h2>Normalize</h2>
            <p>Let's take a look at the normalize.js module:</p>
            <pre><code>
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
            </code></pre>

            <p>Nothing too crazy going on here.  We just have to understand that to normalize a features means subtracting the mean and dividing by the standard deviation of that set of examples.  So if we have 2 columns, for each item in the first column, we subtract the mean of the first column, the divide by the standard deviation of the first column.  We repeat for the second column, and that'll normalize our data set.  Lastly we add back a column vector of ones to ensure we can capture theta(0) when the time comes to perform gradient descent.  This was so easy because node-sylvester provides simple <code class='language-javascript'>mean</code> and <code class='language-javascript'>std</code> functions for us.  Without those, we'd just have to write some for loops and calucate it ourselves, which isn't terribly difficult, but why reinvent the wheel?  (I know what you're thinking, I'm reinventing so many wheels right now by implementing linear regression in javascript, but hey, how do you build a better wheel without first understanding how to build a simple wheel, right?)</p>

            <h2>Cost Function</h2>
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/07/wZzrX.gif" alt="wZzrX" width="920" height="447" class="alignnone size-full wp-image-65" />
            <p>The cost function for linear regression basically says: calculate the difference between our hypothesis and the actual value that we know from the training data set, square that value, then sum up all the squared differences across each training set. It's beyond the scope of this to go into how we get our hypothesis and cost function, you can kind of think of the hypothesis as a function that will draw a line to fit our data best and we can get the parameters theta(0), theta(1), and so on by minimizing J(theta) - our cost function - with respect to theta.  So plugging in our hypothesis, our actual values, and knowing that m = # of training sets, then it's simply a matter of basic linear algebra to get the cost function.</p>
            <pre><code>
// Requires a sylvester Matrices and vectors to be passed in
module.exports = function(X, y, theta) {
    var m = X.dimensions().rows;
    var predictions = X.multiply(theta);
    var difference = predictions.subtract(y);
    var sqrErrors = difference.elementMultiply(difference);

    return 1 / (2 * m) * sqrErrors.sum();
};
            </code></pre>
            <p>Note: we don't need to include Sylvester here because we're assuming that Sylvester objects are being passed in, so they already come with all the methods they'll need.</p>

            So we first figure out the number of training examples (m) by getting the number of rows in X.  <code class='langauge-javascript'>predictions</code> represents a vector of our hypothesis for each training example, so it should have dimensions of m x 1.  Notice by multiplying X (an m x (n+1) matrix) by theta ( a (n+1) x 1 vector), we get an m x 1 vector out.  This is equivalent to saying theta(0) + theta(1)*x(1) + theta(2)*x(2) and so on, except it does it using linear algebra, which keeps things nice and tidy.  <code class='langauge-javascript'>difference</code> calculates the difference between the predictions and the actual values.  We then multiply difference by itself, element-wise, to get a vector of squared errors.  Lastly we sum up all the square differences, multiply by 1 / (2 * m), and return our cost value.  Pretty easy.

            <h2>Gradient Descent Time</h2>
            Finally, we need to implement the gradient descent algorithm.  If we take a peek at it, it looks like this:
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/07/gradient-descent-algorithm-OLS.png" alt="gradient descent algorithm OLS" width="484" height="274" class="alignnone size-full wp-image-66" />
            What this says is to update each value of theta - theta(j) by calculating the sum of the difference vector element-wise multiplied by the value of each feature for each training set.  This formula comes by taking the partial derivative of J(theta) with respect to theta for each value of j (which essentially respresents the slope of the line of our cost function).  When we subtract the slope from theta, then run gradient descent again, we'd expect the slope of the new cost function with new theta's to be different.  Eventually, if we've chosen our learning rate properly, then the slope of J(theta) will converge to (or very near to) zero, thus ensuring that theta will no longer update.  At that point, the algorithm has converged and we've found our best guess at theta. 

            It's a lot easier to see what's going on through some code. So here it is:
            <pre><code>
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
            </code></pre>
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
                <pre><code>
noremap <Up> <NOP>
noremap <Down> <NOP>
noremap <Left> <NOP>
noremap <Right> <NOP>
                </code></pre>

        If you're feeling super ambitious, disable non-counted movements for hjlk by dropping this into your .vimrc.  This is taken from a <a href='http://jeetworks.org/from-acolyte-to-adept-the-next-step-after-nop-ing-arrow-keys/'>great post by Jeet Sukumaran</a>
        <pre><code>
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

DisableNonCountedBasicMotions</code></pre>

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
