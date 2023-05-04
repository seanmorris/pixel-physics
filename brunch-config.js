const { exec } = require('child_process');

module.exports = {
	files: {
		javascripts: {joinTo: 'app.js'}
		, stylesheets: {joinTo: 'app.css'}
	}
	, plugins: {
		babel: {
			presets:   [
				['@babel/preset-env', {
					useBuiltIns: false,
					targets: {browsers: ['>0.25%',  'not ie 11', 'not op_mini all', 'not dead']},
					exclude: [
						'@babel/plugin-transform-template-literals',
						'@babel/plugin-transform-arrow-functions',
						'@babel/plugin-transform-block-scoping',
						'@babel/plugin-transform-for-of',
						'@babel/plugin-transform-spread',
					]
				}]
			]
			, plugins: ["@babel/plugin-proposal-class-properties"]
		}
		, raw: {
			pattern: /\.(html|svg)$/,
			wrapper: content => `module.exports = ${JSON.stringify(content)}`
		}
		, preval:{
			tokens: { BUILD_TIME: ()=> Date.now() }
		}
	}
	, paths: {
		public: './docs'
	}
	, watcher: {
		awaitWriteFinish: true
	}
};

// exports.hooks = {
// 	preCompile: () => {
// 		console.log('About to compile...');
// 		exec(
// 			`pushd ../curvature-2 && npm link && popd && npm link curvature`
// 			, (err, stdout, stderr)=>{
// 				console.log(err);
// 				console.log(stdout);
// 				console.log(stderr);

// 				return Promise.resolve();
// 			}
// 		)
// 	}
// };
