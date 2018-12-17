const webpack = require('webpack');
const path = require('path');

var config = {
	module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
	// workaround for
	// ERROR in ./node_modules/wpcom/build/lib/site.media.js
  //  Module not found: Error: Can't resolve 'fs' in '/WordpressTools/node_modules/wpcom/build/lib'
	node: {
    fs: 'empty'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
	plugins: [
	 new webpack.HotModuleReplacementPlugin()
 ]
};

var aConfig = Object.assign({}, config, {
    name: "a",
    entry: "./js/blogfinder-mobx/index.js",
    output: {
       path: __dirname + '/WebContent/blogfinder/js/',
       filename: "bundle.js",
	   publicPath: 'http://localhost:8080/blogfinder/js/'
    },
	devServer: {
     historyApiFallback: true,
 	 contentBase: './WebContent',
	 publicPath: "http://localhost:8080/blogfinder/js/",
 	 hot: true
    }
});


var bmvConfig = Object.assign({}, config, {
    name: "bmvConfig",
    entry: "./js/bmv/app.jsx",
    output: {
       path: __dirname + '/WebContent/bmv/js/',
       filename: "bundle.js",
	   publicPath: 'http://localhost:8080/bmv/js/'
    },
	devServer: {
     historyApiFallback: true,
 	 contentBase: './WebContent',
	 publicPath: "http://localhost:8080/bmv/js/",
 	 hot: true
    }
});




module.exports = [
	aConfig,
	bmvConfig
];
