var fs = require("fs");
//fs모듈을 불러와서 변수를 통해 이름을 넣어줬어

/*
readFileSync
console.log("A");
var result = fs.readFileSync("nodejs/sample.txt", "utf8");
console.log(result);
console.log("B");
*/

//Sync가 붙어있는게 따로 있고 기본이 비동기라는 것을 비동기가 기본이라는 것
//비동기를 선호하는 것을 알 수 있다.
console.log("A");
fs.readFile("nodejs/sample.txt", "utf8", function(err, result) {
  console.log(result);
});
//비동기의 경우는 마지막 인자로 콜백함수를 사용한다.

console.log("B");

//콜백함수
//자바스크립트에서는 함수도 변수가 될 수 있다.
var a = function() {
  console.log("A");
};

function showfunc(callback) {
  callback();
}

showfunc(a);
