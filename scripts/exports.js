// const { readdirSync, writeFileSync } = require("fs");
// const { resolve, join } = require("path");
// const { , , ,  } = require("chalk");
import { readdirSync, writeFileSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(`[Exports] Starting to build exports...`);

const enginePath = resolve(__dirname, "..", "src");

const subDirs = readdirSync(enginePath)
    .filter((str) => str !== "exports.ts")
    .filter((str) => str != "test");

let files = [];
for (const subDir of subDirs) {
    const subFiles = readdirSync(resolve(enginePath, subDir)).map((str) =>
        join("./", subDir, str)
    );
    files = files.concat(
        subFiles
            .filter((str) => !str.endsWith(".json"))
            .map((str) => str.slice(0, str.lastIndexOf(".")).replace("\\", "/"))
    );
}

const str = files.map((str) => `export * from "./${str}";`).join("\n");
writeFileSync(join(enginePath, "exports.ts"), str);
console.log(
    `[Exports] Finished building exports, loaded `,
    files.length,
    ` exports from `,
    subDirs.length,
    `subdirectories`
);
