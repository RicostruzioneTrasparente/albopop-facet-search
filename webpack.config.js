// For plugins usage
var webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "./dist/js/bundle.js"
    },
    plugins: [
        // Minimization in production
        /*new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: { warnings: false }
        })*/
    ],
    module: {
        noParse: [/alasql/],
        rules: [
            // Loader for custom tag
            { test: /\.tag\.html$/, exclude: /node_modules/, loader: 'riot-tag-loader' },
            // Loaders for stylesheet (output in css/ dir)
            { test: /\.css$/, loader: "style!css?name=./dist/css/[name].[ext]" },
            // Loaders for fonts (output in assets/ dir)
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff&name=./dist/assets/[name].[ext]' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream&name=./dist/assets/[name].[ext]' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=./dist/assets/[name].[ext]' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml&name=./dist/assets/[name].[ext]' },
            // Loader for images (output in assets/ dir)
            { test: /\.(png|jpg|gif)$/, loader: "file-loader?name=./dist/assets/[name].[ext]" },
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
        disableHostCheck: true,
        inline: true
    }
};
