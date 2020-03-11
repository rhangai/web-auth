const path = require("path");

export default function() {
	this.addPlugin({
		src: path.resolve(__dirname, "plugin.js"),
		options: {
			storage: {
				module: path.resolve(__dirname, "../lib/scheme/SchemeOAuth"),
				moduleImport: "SchemeOAuth"
			}
		}
	});
}
