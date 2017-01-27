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
);
