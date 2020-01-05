import { parallel } from "gulp";
import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import tslint from "rollup-plugin-tslint";
import json from "@rollup/plugin-json";

const ts = async () => {
	const bundle = await rollup({
		input: "src/gridsome.server.ts",
		plugins: [
			json(),
			nodeResolve({
				preferBuiltins: true,
			}),
			commonjs(),
			tslint(),
			typescript(),
		],
	});

	await bundle.write({
		output: {
			file: "gridsome.server.js",
			format: "cjs",
		},
	});
};

const build = parallel(ts);

export { build };
