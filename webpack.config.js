var webpack = require('webpack');
var path = require('path');
var loaders = require('./config/loaders');
var plugins = require('./config/plugins');
var envFile = require('node-env-file');
var precss = require('precss');
var autoprefixer = require('autoprefixer');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PWD = process.cwd();


module.exports = {
    devtool: process.env.NODE_ENV === 'production' ? null : 'cheap-eval-source-map',
    entry: process.env.NODE_ENV === 'production' ?
        [
            'script!jquery/dist/jquery.min.js',
            'script!foundation-sites/dist/foundation.min.js',
            './app/app.jsx'
        ] :
        [
            'webpack-dev-server/client?http://localhost:8080',
            'webpack/hot/dev-server',
            'script!jquery/dist/jquery.min.js',
            'script!foundation-sites/dist/foundation.min.js',
            './app/app.jsx'
        ],
    node: {
        fs: 'empty'
    },
    output: {
        path: path.resolve(process.env.PWD, 'dist'),
        filename: '/bundle.js'
        // publicPath: '/dist'
    },
    resolve: {
        root: __dirname,
        alias: {
            'webworkify': 'webworkify-webpack',
            app: 'app',
        },
        extensions: ['', '.js', '.jsx']
    },
    module: loaders,
    sassLoader: {
        includePaths: [
            path.resolve(process.env.PWD, './node_modules/foundation-sites/scss')
        ]
    },
    postcss: function() {
        return [require('autoprefixer'), require('precss')];
    },
    plugins: plugins,
    devServer: process.env.NODE_ENV === 'production' ? null : {
        contentBase: './dist',
        hot: true,
        historyApiFallback: true
    }
};
