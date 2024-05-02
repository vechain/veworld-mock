const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/mock-controller.ts',
	mode: 'production',
	performance: {
		hints: false,
		maxAssetSize: 400000,
		maxEntrypointSize: 400000,
	},
	module: {
		rules: [
			{
				exclude: /node_modules/,
				test: /\.tsx?$/,
				use: 'ts-loader',
			},
		],
	},
	output: {
		filename: 'veworld-mock.js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
			process: 'process/browser',
		})
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		fallback: {
			buffer: require.resolve('buffer/'),
			crypto: require.resolve('crypto-browserify'),
			http: require.resolve('stream-http'),
			https: require.resolve('https-browserify'),
			stream: require.resolve('stream-browserify'),
			url: require.resolve('url/'),
			vm: require.resolve('vm-browserify'),
		},
	},
};
