//  "./" 는 현재 디렉토리를 의미한다.
var testFolder = "./nodejs";
var fs = require("fs");

fs.readdir(testFolder, function(err, filelist) {
  console.log(filelist);
});
