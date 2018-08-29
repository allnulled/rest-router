const fs = require("fs");
const fixedFile = __dirname + "/node_modules/sequelize-auto/lib/index.js";
const contentsSource = fs.readFileSync(fixedFile).toString();
var contentsTemp = contentsSource.replace("  self.sequelize.close();", "// self.sequelize.close();")
var contentsDest = contentsTemp;
fs.writeFileSync(fixedFile, contentsDest, "utf8");