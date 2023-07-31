// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("./package.json");
const fs = require("fs");
const path = require("path");

const getPackageName = () => {
  return packageJson.name.split("/")[1];
};

const findFilesWithIndexTs = dirPath => {
  const entries = [];
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      entries.push(...findFilesWithIndexTs(fullPath));
    } else if (file.endsWith("index.ts")) {
      entries.push({
        filePath: `./${path.relative("./", fullPath)}`,
        outFile: `./dist/${fullPath.split("/")[1]}.d.ts`,
        noCheck: true,
      });
    }
  });
  return entries;
};

const srcDirectory = "./src";

const entries = findFilesWithIndexTs(srcDirectory);

const config = {
  compilationOptions: {
    preferredConfigPath: "./tsconfig.json",
  },
  entries: [...entries],
};

module.exports = config;
