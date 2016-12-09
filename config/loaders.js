var path         = require('path');
module.exports = {
    loaders: [
        {
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015']
            }
        },
        {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['react', 'es2015', 'stage-2']
            }
        },
        {
            test: /\.scss/,
            loader: 'style-loader!css-loader!postcss-loader!sass'
        },
        //{
            //test: /\.css/,
            //loader: "style-loader!css-loader!postcss-loader"
        //},
        {
            test: /\.json$/,
            loader: 'json-loader'
        },
        {
            test: /\.csv$/,
            loader: 'dsv-loader'
        },
        {
            test: /\.(png|jpg|pdf|gif)$/,
            loader: 'url-loader?limit=8192'
        }
    ],
    postLoaders: [
        {
            include: path.resolve(__dirname, 'node_modules/pixi.js'),
            loader: 'transform?brfs'
        }
    ]
}; 
