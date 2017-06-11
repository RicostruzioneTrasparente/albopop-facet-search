// For plugins usage
var webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "./js/bundle.js"
    },
    plugins: [
        // Minimization in production
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: { warnings: false }
        })
    ],
    module: {
        rules: [
            // Loader for custom tag
            { test: /\.tag\.html$/, exclude: /node_modules/, loader: 'riot-tag-loader' },
            // Loaders for stylesheet (output in css/ dir)
            { test: /\.css$/, loader: "style!css?name=./css/[name].[ext]" },
            // Loaders for fonts (output in assets/ dir)
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff&name=./assets/[name]/[hash].[ext]' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream&name=./assets/[name]/[hash].[ext]' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=./assets/[name]/[hash].[ext]' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml&name=./assets/[name]/[hash].[ext]' },
            // Loader for images (output in assets/ dir)
            { test: /\.(png|jpg|gif)$/, loader: "file-loader?name=./assets/[name].[ext]" }
        ]
    },
    node: {
        // Suppress useless warnings
        fs: "empty"
    },
    // Enable sources for better debug in the browser console
    devtool: 'source-map',
    devServer: {
        port: 8088,
        disableHostCheck: true
    }
};
