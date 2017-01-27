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
);
