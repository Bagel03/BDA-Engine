const path = require("path");
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = dirname(fileURLToPath(import.meta.url));

module.exports = {
    mode: "production",
    entry: "./src/exports.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "lib.mjs",
        library: {
            type: "module",
        },
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: require.resolve("ts-loader"),
                options: {
                    compiler: "ttypescript",
                },
            },
        ],
    },
};
