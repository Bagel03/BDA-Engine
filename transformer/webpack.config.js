const path = require("path");
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = dirname(fileURLToPath(import.meta.url));

module.exports = {
    mode: "production",
    entry: "./transformer.ts",
    output: {
        path: path.resolve(__dirname, "..", "dist"),
        filename: "transformer.js",
        library: {
            type: "commonjs2",
            name: "default",
            export: "default",
        },
    },
    externals: {
        typescript: "commonjs2 typescript",
    },
    // devtool: "inline-source-map",
    resolve: {
        extensions: [".ts", ".js", ".json"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: require.resolve("ts-loader"),
                // options: {
                //   compiler: "ttypescript",
                // },
            },
        ],
    },
};
