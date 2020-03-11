import pluginCommonJs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import pluginBabel from "rollup-plugin-babel";

export default [
	{
		input: "lib/index.js",
		output: {
			name: "WebAuth",
			file: "lib/index.umd.js",
			format: "umd"
		},
		plugins: [
			//
			pluginNodeResolve(),
			pluginCommonJs(),
			pluginBabel({
				exclude: "node_modules/**",
				runtimeHelpers: true,
				extensions: [".js", ".ts"]
			})
		]
	}
];
