var http = require("http");
var fs = require("fs");
var url = require("url");

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var title = queryData.id;
  console.log(queryData.id);
  if (_url == "/") {
    title = "Welcome";
  }
  if (_url == "/favicon.ico") {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200);
  console.log(queryData.id);
  fs.readFile(`data/${queryData.id}`, "utf8", function(err, description) {
    if (err) console.log("Error!!");

    var template = `
    <!DOCTYPE html>
      <html>
      <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8" />
      </head>
      <body>
          <h1><a href="/">WEB</a></h1>
          <ol>
          <li><a href="1.html">HTML</a></li>
          <li><a href="2.html">CSS</a></li>
          <li><a href="3.html">JavaScript</a></li>
          </ol>
          <h2>${title}</h2>
          <p>
          ${description}
          </p>
      </body>
      </html>
  
    `;
    response.end(template);
  });

  //사용자에게 전송할 데이터를 end에 넣어주면 된다.
  //사용자가 접속한 URL에 따라서 파일들을 읽어주는 부분
});
app.listen(3000);

//node main.js 명령어로 실행시키면 기본으로 3000포트에서 웹서버가 동작한다.
//http://localhost:3000/

/**
 * Node.JS -9. URL의 이해
 * HTTP://korea.org:3000/main?id=HTML&page=12
 * 프로토콜, host(도메인), 포트번호,
 * 어떤 프로토콜을 사용하고 있는지, ftp면 FTP로 되어있겠지
 * 도메인 : 인터넷에 연결되어있는 컴퓨터를 가르키는 주소
 * 포트 : 한 대의 컴퓨터 안에 여러 서버가 있을 수 있다. 그걸 고를 수 있는게 포트번호다.
 * path? : 어떤 디렉토리에 접근했는가??
 * query string
 * 내부정보를 변경하면 웹서버에 정보를 전달할 수 있어
 * ?로 시작한다 약속되어있고, 값과 값은 &, 값의 이름과 값은 = 로 연결
 * query string에 따라 NodeJS웹 서버가 사용자에게 동적으로 생성한 정보를 전달할 수 있다.
 *
 */
