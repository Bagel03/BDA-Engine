import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import json from "../package.json" assert { type: "json" };
const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = json;

const options = [
    "out-file=typings/types.d.ts",
    "project=tsconfig.types.json",
    "no-check",
    "no-banner",
];

const optionsStr = `--${options.join` --`}`;

console.log(`[Typings] Starting to build typings...`);

execSync(
    `dts-bundle-generator src/exports.ts ${optionsStr}`,
    {
        cwd: join(__dirname, ".."),
    },
    (err) => {
        console.error("Error", err);
    }
);

console.log(`[Typings] Finished building typings`);
console.log(`[Typings] Processing typings...`);

// Add the banner
const banner = `\tBDA Engine v${version} ©Bagel03 2022
    Thanks to "dts-bundle-generator" for deceleration merging: https://www.npmjs.com/package/dts-bundle-generator`;

const path = join(__dirname, "..", "typings", "types.d.ts");
const file = readFileSync(path);
let str = "/*\n" + banner + "\n*/\n" + file;

// Mark everything starting with _ as private
str = str.replaceAll(`_`, `private _`);

writeFileSync(path, str);

console.log(`[Typings] Finished processing typings`);
console.log(`[Typings] Finished typings`);
