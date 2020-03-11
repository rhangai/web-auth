const path = require("path");

export default function() {
	let pluginConfigFilename = null;

	const pluginConfigTemplate = this.addTemplate({
		src: path.resolve(__dirname, "pluginConfig.js"),
		options: {
			scheme: {
				module: path.resolve(__dirname, "../lib/scheme/SchemeOAuth"),
				moduleImport: "SchemeOAuth",
				options: {}
			},
			storage: {
				module: path.resolve(__dirname, "../lib/storage/StorageCookies"),
				moduleImport: "StorageCookies",
				options: {}
			}
		}
	});
	pluginConfigFilename = pluginConfigTemplate.dist;

	this.addPlugin({
		src: path.resolve(__dirname, "plugin.js"),
		options: {
			lib: path.resolve(__dirname, "../lib/"),
			config: pluginConfigFilename
		}
	});
}
