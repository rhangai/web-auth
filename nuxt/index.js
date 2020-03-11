const path = require("path");
const packageJson = require("../package.json");

export default function(moduleOptions) {
	const options = moduleOptions || this.options.auth;
	this.addPlugin({
		src: path.resolve(__dirname, "plugin.js"),
		options: {
			lib: options.lib || packageJson.name,
			config: options.config
		}
	});
}

module.exports.meta = packageJson;
