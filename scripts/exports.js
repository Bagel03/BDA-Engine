const { readdirSync, writeFileSync } = require("fs");
const { resolve, join } = require("path");
const { greenBright, blueBright, bold, cyan } = require("chalk");

console.log(blueBright`[Exports] Starting to build exports...`);

const enginePath = resolve(__dirname, "..", "src");

const subDirs = readdirSync(enginePath).filter(
    (str) => str !== "exports.ts" && str !== "types"
);

let files = [];
for (const subDir of subDirs) {
    if (subDir === "types") continue;
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
    bold(
        greenBright`[Exports] Finished building exports, loaded `,
        cyan(files.length),
        greenBright` exports from `,
        cyan(subDirs.length),
        greenBright`subdirectories`
    )
);
