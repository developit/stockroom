module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai-sinon'],
		reporters: ['mocha'],
		browsers: ['ChromeHeadlessNoSandbox'],

		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox']
			}
		},

		files: [
			{ pattern: __dirname+'/../node_modules/babel-polyfill/dist/polyfill.js', watched: false, included: true },
			{ pattern: __dirname+'/**/*.test.js', watched: false, included: true, served: true }
		],

		preprocessors: {
			'**/*': ['webpack', 'sourcemap']
		},

		webpack: {
			module: {
				loaders: [
					{
						test: /\.jsx?$/,
						exclude: /node_modules/,
						loader: 'babel-loader',
						query: {
							presets: [
								['env', {
									targets: {
										browsers: ['last 2 versions', 'IE >= 9']
									},
									modules: false,
									loose: true
								}],
								'stage-0'
							],
							plugins: [
								['transform-object-rest-spread'],
								['transform-react-jsx', { pragma: 'h' }]
							]
						}
					},
					{
						test: /\.css$/,
						loader: 'style-loader!css-loader'
					}
				]
			},
			resolve: {
				alias: {
					stockroom: __dirname+'/../src',
					src: __dirname+'/../src'
				}
			}
		},

		webpackMiddleware: {
			noInfo: true
		},

		mochaReporter: {
			showDiff: true
		},

		client: {
			captureConsole: true
		}
	});
};