const path = require("path");

export default function() {
	this.addPlugin({
		src: path.resolve(__dirname, "plugin.js"),
		options: {
			scheme: {
				module: path.resolve(__dirname, "../lib/scheme/SchemeOAuth"),
				moduleImport: "SchemeOAuth"
			},
			storage: {
				module: path.resolve(__dirname, "../lib/storage/StorageCookies"),
				moduleImport: "StorageCookies"
			}
		}
	});
}
