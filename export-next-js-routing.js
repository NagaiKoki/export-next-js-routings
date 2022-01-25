const fs = require("fs");
const path = require("path");

const notRoutingPageRegex = /^\/(404|_app|_document)$/;

/**
 * argv[2]
 * pages dir path: next.js pages path
 * export target dir path: export dir path
 */

const exportNextRoutings = () => {
  const pagesPath = process.argv[2];
  const exportTargetDir = process.argv[3];
  let pagesFilenames = [];

  const nextPagesFiles = (dir) => {
    const filenames = fs.readdirSync(dir);

    filenames.forEach((filename) => {
      const fullPath = path.join(dir, filename);
      const stats = fs.statSync(fullPath);

      if (stats.isFile()) {
        pagesFilenames.push(fullPath);
      } else {
        nextPagesFiles(fullPath);
      }
    });
  };
  nextPagesFiles(pagesPath);

  let pageFullPaths = exportFileRoutings(pagesFilenames);
  writeRoutingToFile(pageFullPaths, exportTargetDir);
};

const exportFileRoutings = (pagesFilenames) => {
  const filenames = pagesFilenames.map((filename) => {
    return convertRoutingStr(filename);
  });

  return filenames.filter((filename) => !notRoutingPageRegex.test(filename));
};

// ファイル名からルーティングに置き換える
const convertRoutingStr = (filename) => {
  // /src/pages を省く
  const removedSrcAndPages = filename.replace(/sample\/pages/g, "");
  // tsxの拡張子を省く
  const removedTsxExtension = removedSrcAndPages.replace(/.tsx/g, "");
  if (removedTsxExtension === "/index") {
    return removedTsxExtension.replace(/index/g, "");
  } else {
    // index を省く（routing上はindexは 省略できるので）
    return removedTsxExtension.replace(/\/index/g, "");
  }
};

// ファイルへ書き込む
const writeRoutingToFile = (pageFullPaths, exportTargetDir) => {
  let data = "";

  data = `export const ROUTINGS = ${JSON.stringify(pageFullPaths)} as const`;

  fs.writeFile(exportTargetDir, data, (err) => {
    if (err) throw err;
    console.log("finished export!! yeah!");
  });
};

exportNextRoutings();
