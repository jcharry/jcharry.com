var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var envFile = require('node-env-file');

// Get development environment and current working directory
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PWD = process.cwd();

// In production (i.e. on heroku), we won't use an ENV file
// instead we use a heroku environment variable with the same vars
try {
    envFile(path.join(process.env.PWD, 'config/' + process.env.NODE_ENV + '.env'));
} catch(e) {
}

// Returns a concatenated list of plugins depending on 
// whether environment is development or production
var configure = () => {

    // All dev plugins go here
    var dev = [
        new webpack.HotModuleReplacementPlugin()
    ];

    // Shared plugins (i.e. both dev and prod) go here
    var shared = [
        new HtmlWebpackPlugin({
            template: './app/index.html'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            }
        })
    ];

    // Prod plugins here
    var prod = [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false,
            },
        }),
        new webpack.optimize.OccurenceOrderPlugin()
    ];

    // Pick which plugins to return
    if (process.env.NODE_ENV === 'production') {
        return shared.concat(prod);
    } else {
        return shared.concat(dev);
    }
};

module.exports = configure();
