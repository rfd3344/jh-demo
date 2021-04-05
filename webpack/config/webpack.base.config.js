const path = require('path');
const webpack = require('webpack');
const env = require('../env.js');

const entryConfig = {
	main: path.resolve(__dirname, '../src/index.js'),
	entry2: path.resolve(__dirname, '../src/index2.js'),
};


const outputConfig = {
	filename: './dist/[name].bundle.js',
	path: path.resolve(__dirname, '../public/'),
	publicPath: '/',
};

const moduleConfig = {
	rules: [
		{
			test: /\.(js|jsx)$/,
			exclude: /(node_modules|bower_components)/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime'],
					},
				},
				// closed eslint check, reduce info generate in Terminal
				// { loader: 'eslint-loader' },
			],
		},
		{
			test: /\.(less|css)$/,
			use: [
				{ loader: 'style-loader' },
				{ loader: 'css-loader' },
				{ loader: 'less-loader' },
			],
		},
		{
			test: /\.(png|jpg|gif)$/,
			use: [{ loader: 'file-loader' }],
		},
	],
};

const resolveConfig = {
	alias: {
		// Define directory with alias name.
		// ex: import AxiosMethod from 'utilis/AxiosMethod';
		base: path.resolve(__dirname, '../'),
		utils: path.resolve(__dirname, '../src/utils'),
		helper: path.resolve(__dirname, '../src/helper'),
		static: path.resolve(__dirname, '../src/static'),
		tests: path.resolve(__dirname, '../tests'),
	},
};

const optimizationConfig = {
	runtimeChunk: true,
	splitChunks: {
		chunks: 'all',
	},
};

const performanceConfig = {
	hints: 'warning',
	maxEntrypointSize: 4000000,
	maxAssetSize: 4000000,
};

const pluginsConfig = [
	new webpack.NamedModulesPlugin(),
	new webpack.DefinePlugin({
		ENV: env,
	}),

];

module.exports = {
	mode: 'production',
	entry: entryConfig,
	output: outputConfig,
	module: moduleConfig,
	resolve: resolveConfig,
	optimization: optimizationConfig,
	performance: performanceConfig,
	plugins: pluginsConfig,
};
