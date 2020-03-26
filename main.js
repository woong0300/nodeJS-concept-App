const express = require("express");
const app = express();
var fs = require("fs");
var template = require("./lib/template.js");
var path = require("path");
var qs = require("querystring");
var sanitizeHtml = require("sanitize-html");

// 라우팅
//get : route, toutung을 해주는 함수이다.
//app.get("/", (req, res) => res.send("Hello World!"));
//위와 아래 코드는 동일한 작용을 하는 것이다.
app.get("/", function(request, response) {
  fs.readdir("./data", function(error, filelist) {
    var title = "Welcome";
    var description = "Hello, Node.js";
    var list = template.list(filelist);
    var html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.send(html);
  });
});

app.get("/page/:pageId", function(request, response) {
  fs.readdir("./data", function(error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"]
      });
      var list = template.list(filelist);
      var html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      response.send(html);
    });
  });
});

app.get("/create", function(request, response) {
  fs.readdir("./data", function(error, filelist) {
    var title = "WEB - create";
    var list = template.list(filelist);
    var html = template.HTML(
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
    response.send(html);
  });
});

app.post("/create_process", function(request, response) {
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
});

app.get("/update/:pageId", function(request, response) {
  fs.readdir("./data", function(error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
      var title = request.params.pageId;
      var list = template.list(filelist);
      var html = template.HTML(
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
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      //위의 코드에서 /update?id=${title} 부분은 /update/${title}로 수정 되어야 하는 버그입니다.
      response.send(html);
    });
  });
});

app.post("/update_process", function(request, response) {
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
        response.redirect(`/?id=${title}`);
      });
    });
  });
});

app.post("/delete_process", function(request, response) {
  var body = "";
  request.on("data", function(data) {
    body = body + data;
  });
  request.on("end", function() {
    var post = qs.parse(body);
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(err) {
      response.redirect("/");
    });
  });
});
//마찬기지로 위와 아래 코드가 동일한 것이다.
// app.listen(3000, () => console.log("Example app listening on port 3000!"));
app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
// NodeJS 파트 공부한 내용.
// // pm2를 작동시키기 위해서
// // 권한을 잠시 해제  Set-ExecutionPolicy Unrestricted
// // 출처 : https://gist.github.com/jwgo/63292c48ecc2040ac5aec2b756858bf0

// //구조를 보면 pathname에 따라서 각각의 정보를 받아내고 수정해서 그려주는 방식이다.
// //왜 MVC모델을 사용하는지 알겠지?? 대충 유추가 된다.
// //템플릿이라는 뷰에 모델을 받아와서 그려주고 컨트롤을 해주는 기능마다 따로 구현을 해놓은 거지
// var http = require("http");
// var fs = require("fs");
// var url = require("url");
// var qs = require("querystring");
// var template = require("./lib/template.js");
// var path = require("path");
// var sanitizeHtml = require("sanitize-html");

// //http 모듈이자 객체, 그 안에 createServer메소드(함수)가 있다.
// //또한 함수를 인자로 받기 때문에 내부에 저렇게 긴 코드를 넣어놓을 수 있던거야.
// //우리가 원하는 response를 만들어 주느라 이렇게 길어지는 거고
// //App이라는 변수에 http객체가 담기는 거고
// //마지막에 aa.listen()을 통해 request에 응답할 수 있는 서버를 열어주는 거야.
// // 우리가 듣느다고 한 포트를 주목하면서 우리의 app이 응답하려고 할거야.
// var app = http.createServer(function(request, response) {
//   var _url = request.url;
//   var queryData = url.parse(_url, true).query;
//   var pathname = url.parse(_url, true).pathname;
//   if (pathname === "/") {
//     if (queryData.id === undefined) {
//       fs.readdir("./data", function(error, filelist) {
//         var title = "Welcome";
//         var description = "Hello, Node.js";
//         var list = template.list(filelist);
//         var html = template.HTML(
//           title,
//           list,
//           `<h2>${title}</h2>${description}`,
//           `<a href="/create">create</a>`
//         );
//         response.writeHead(200);
//         response.end(html);
//       });
//     } else {
//       fs.readdir("./data", function(error, filelist) {
//         var filteredId = path.parse(queryData.id).base;
//         fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
//           var title = queryData.id;
//           var sanitizedTitle = sanitizeHtml(title);
//           var sanitizedDescription = sanitizeHtml(description, {
//             allowedTags: ["h1"]
//           });
//           var list = template.list(filelist);
//           var html = template.HTML(
//             sanitizedTitle,
//             list,
//             `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
//             ` <a href="/create">create</a>
//                 <a href="/update?id=${sanitizedTitle}">update</a>
//                 <form action="delete_process" method="post">
//                   <input type="hidden" name="id" value="${sanitizedTitle}">
//                   <input type="submit" value="delete">
//                 </form>`
//           );
//           response.writeHead(200);
//           response.end(html);
//         });
//       });
//     }
//   } else if (pathname === "/create") {
//     fs.readdir("./data", function(error, filelist) {
//       var title = "WEB - create";
//       var list = template.list(filelist);
//       var html = template.HTML(
//         title,
//         list,
//         `
//           <form action="/create_process" method="post">
//             <p><input type="text" name="title" placeholder="title"></p>
//             <p>
//               <textarea name="description" placeholder="description"></textarea>
//             </p>
//             <p>
//               <input type="submit">
//             </p>
//           </form>
//         `,
//         ""
//       );
//       response.writeHead(200);
//       response.end(html);
//     });
//   } else if (pathname === "/create_process") {
//     var body = "";
//     request.on("data", function(data) {
//       body = body + data;
//     });
//     request.on("end", function() {
//       var post = qs.parse(body);
//       var title = post.title;
//       var description = post.description;
//       fs.writeFile(`data/${title}`, description, "utf8", function(err) {
//         response.writeHead(302, { Location: `/?id=${title}` });
//         response.end();
//       });
//     });
//   } else if (pathname === "/update") {
//     fs.readdir("./data", function(error, filelist) {
//       var filteredId = path.parse(queryData.id).base;
//       fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
//         var title = queryData.id;
//         var list = template.list(filelist);
//         var html = template.HTML(
//           title,
//           list,
//           `
//             <form action="/update_process" method="post">
//               <input type="hidden" name="id" value="${title}">
//               <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//               <p>
//                 <textarea name="description" placeholder="description">${description}</textarea>
//               </p>
//               <p>
//                 <input type="submit">
//               </p>
//             </form>
//             `,
//           `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
//         );
//         response.writeHead(200);
//         response.end(html);
//       });
//     });
//   } else if (pathname === "/update_process") {
//     var body = "";
//     request.on("data", function(data) {
//       body = body + data;
//     });
//     request.on("end", function() {
//       var post = qs.parse(body);
//       var id = post.id;
//       var title = post.title;
//       var description = post.description;
//       fs.rename(`data/${id}`, `data/${title}`, function(error) {
//         fs.writeFile(`data/${title}`, description, "utf8", function(err) {
//           response.writeHead(302, { Location: `/?id=${title}` });
//           response.end();
//         });
//       });
//     });
//   } else if (pathname === "/delete_process") {
//     var body = "";
//     request.on("data", function(data) {
//       body = body + data;
//     });
//     request.on("end", function() {
//       var post = qs.parse(body);
//       var id = post.id;
//       var filteredId = path.parse(id).base;
//       fs.unlink(`data/${filteredId}`, function(error) {
//         response.writeHead(302, { Location: `/` });
//         response.end();
//       });
//     });
//   } else {
//     response.writeHead(404);
//     response.end("Not found");
//   }
// });
// app.listen(3000);

// //사용자에게 전송할 데이터를 end에 넣어주면 된다.
// //사용자가 접속한 URL에 따라서 파일들을 읽어주는 부분

// //node main.js 명령어로 실행시키면 기본으로 3000포트에서 웹서버가 동작한다.
// //http://localhost:3000/

// /**
//  * Node.JS - 9. URL의 이해
//  * HTTP://korea.org:3000/main?id=HTML&page=12
//  * 프로토콜, host(도메인), 포트번호,
//  * 어떤 프로토콜을 사용하고 있는지, ftp면 FTP로 되어있겠지
//  * 도메인 : 인터넷에 연결되어있는 컴퓨터를 가르키는 주소
//  * 포트 : 한 대의 컴퓨터 안에 여러 서버가 있을 수 있다. 그걸 고를 수 있는게 포트번호다.
//  * path? : 어떤 디렉토리에 접근했는가??
//  * query string
//  * 내부정보를 변경하면 웹서버에 정보를 전달할 수 있어
//  * ?로 시작한다 약속되어있고, 값과 값은 &, 값의 이름과 값은 = 로 연결
//  * query string에 따라 NodeJS웹 서버가 사용자에게 동적으로 생성한 정보를 전달할 수 있다.
//  *
//  * Node.JS - 40. 객체에서의 반복 (for ~ in ~)
//  * 객체에서 반복문을 사용할 때, default는 key값을 가져온다.
//  * value = roles[name] 으로  value값을 가져올 수 있다.
//  * roles.designer 로도, roles[designer]로도 사용가능
//  *
//  * Node.JS - 41. 객체: 값으로서의 함수 - 자바스크립트의 특징
//  * Statement이면서 값으로도 사용될 수 있다. 변수에 넣을 수 있다.
//  * 구문 - if(true){console.log(1)}, while문의 경우에도 값으로 들어갈 수 없어
//  * var i = if(true){console.log(1)}  이게 될까????
//  *
//  * 하지만!! 함수의 경우는?!
//  * var x = function(){console.log(x)} -> 이게 가능하다잉~!!!
//  * console.log(x) : Function: x 라고 뜬다
//  * x() : 라고 콘솔에 치면 실행된다.
//  *
//  * var a =[f];
//  * a[0]();  이게 실행이 된다야
//  *
//  * 객체를 만들어주고 (오브젝트) 객체의 원소(프로퍼티)로 func 를 주면 동작가능
//  * var o = {
//  *  func:f
//  * }
//  * o.func();  이것도 실행이 된다.
//  * 자바스크립트에 배열과 객체는 모두 서로 연관된 데이터를 담는 그릇인데
//  * 처리방법을 그룹핑 하는 함수조차도 데이터이기 때문에 배열과 객체에 담을 수 있다.
//  * (배열에 담는 것은 쓸모가 거의 없고 객체에 넣어서 이름으로 꺼내쓰는 경우가 많다.)
//  *
//  * Node.JS - 42. 객체: 데이터와 처리방법을 담는 그릇
//  * var o = {
//  *  v1:"v1",
//  *  v2:"v2",
//  *  f1:function(){    //내부에 넣어줄 때는 익명함수의 꼴로 넣어준다.
//  *    console.log(this.v1)   //this를 통해 객체 자기자신을 참조가능
//  *  }
//  *  f1:function(){
//  *    console.log(this.v1)
//  *  }
//  * }
//  *
//  * 객체 밖에서 이런 식의 함수를 신입이 만들어 버리면 무효화될 수 있는데
//  * 객체 안에 있음으로서 막을 수 있다.
//  * function f1(){
//  *  console.log(v1);
//  * }
//  * o.f1();
//  * o.f2();
//  *
//  * Node.JS - 40. Module의 형식
//  * 수많의 객체 수믾은 함수를 쪼개서 모듈로 정리하는거야.
//  *
//  * Node.JS - 46~47.보안
//  * 1.입력정보에 대한 보안
//  * var path = require('path);
//  * path.parse('../password.js').base;
//  * path를 통해 상위 디렉토리를 탐색 불가능하게 세탁이 가능하다.
//  *
//  * 2.출력정보에 대한 보안
//  * 텍스트 입력칸에 <script>태그 끼워넣기로 alert('merong') 등올 사용가능
//  * location.href="~"; 다른데로 튕기기도 가능
//  * 출력과정에서도 이렇게 오류를 발생시킬 수 있다.
//  * 출려과정도 필터링을 해줘야 된다.
//  * 태그 꺽쇠 <>를 걍 그대로 텍스트화 시켜버리면 좋제
//  * &nbsp와 같은 느낌으로 ~! 스크립트 태그를 직접 변환 시켜주자
//  * 오염된 입력정보를 출력할 때, 소독한다.
//  *
//  */
