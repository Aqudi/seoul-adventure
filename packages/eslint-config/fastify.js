const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
    extends: [
        "eslint:recommended",
        "prettier",
        require.resolve("@vercel/style-guide/eslint/node"),
        require.resolve("@vercel/style-guide/eslint/typescript"),
        "eslint-config-turbo",
    ],
    plugins: ["only-warn"],
    env: {
        node: true,
    },
    settings: {
        "import/resolver": {
            typescript: {
                project,
            },
        },
    },
    ignorePatterns: [
        ".*.js",
        "node_modules/",
        "dist/",
    ],
    overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
};
