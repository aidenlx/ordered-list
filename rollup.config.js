import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy2";
import zip from 'rollup-plugin-zip';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/
`;

export default {
  input: "src/main.ts",
  output: {
    dir: "dist/",
    format: "iife",
    exports: "none",
    sourcemap: "hidden",
    banner,
  },
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
    copy({
      assets: [
        "mnaddon.json",
        ["assets/title.png","title.png"]
      ]
    }),
    zip({
      file: "MYADDON.mnaddon"
    })
  ],
};