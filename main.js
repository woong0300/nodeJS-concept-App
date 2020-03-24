// pm2를 작동시키기 위해서
// 권한을 잠시 해제  Set-ExecutionPolicy Unrestricted
// 출처 : https://gist.github.com/jwgo/63292c48ecc2040ac5aec2b756858bf0

var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

function templateHTML(title, list, body, control) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}
function templateList(filelist) {
  var list = "<ul>";
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ul>";
  return list;
}
//구조를 보면 pathname에 따라서 각각의 정보를 받아내고 수정해서 그려주는 방식이다.
//왜 MVC모델을 사용하는지 알겠지?? 대충 유추가 된다.
//템플릿이라는 뷰에 모델을 받아와서 그려주고 컨트롤을 해주는 기능마다 따로 구현을 해놓은 거지

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function(error, filelist) {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = templateList(filelist);
        var template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", function(error, filelist) {
        fs.readFile(`data/${queryData.id}`, "utf8", function(err, description) {
          var title = queryData.id;
          var list = templateList(filelist);
          var template = templateHTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            ` <a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function(error, filelist) {
      var title = "WEB - create";
      var list = templateList(filelist);
      var template = templateHTML(
        title,
        list,
        `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
        ""
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function(data) {
      body = body + data;
    });
    request.on("end", function() {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", function(err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function(error, filelist) {
      fs.readFile(`data/${queryData.id}`, "utf8", function(err, description) {
        var title = queryData.id;
        var list = templateList(filelist);
        var template = templateHTML(
          title,
          list,
          `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function(data) {
      body = body + data;
    });
    request.on("end", function() {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, "utf8", function(err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function(data) {
      body = body + data;
    });
    request.on("end", function() {
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, function(error) {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);

//사용자에게 전송할 데이터를 end에 넣어주면 된다.
//사용자가 접속한 URL에 따라서 파일들을 읽어주는 부분

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
