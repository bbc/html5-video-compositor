module.exports = {
    entry: __dirname + "/src/main.js",
    output: {
        path: __dirname+'/dist',
        filename: "videocompositor.js", 
        libraryTarget: "var",
        library: "VideoCompositor"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};