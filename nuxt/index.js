const path = require("path");

export default function() {
	this.addPlugin({
		src: path.resolve(__dirname, "plugin.js"),
		options: {
			AuthContainer: path.resolve(__dirname, "../lib/"),
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
}
