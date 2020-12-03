const Koa = require('koa');
const Router = require('koa-router');

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');    //将函数promise化

const stat = promisify(fs.stat);    //用来获取文件的信息
const mime = require('mime');   //mime类型获取插件

let app = new Koa();
let router = new Router();


function metastatic(dir) {
    return async (ctx, next) => {
        let pathname = ctx.path;
        let realPath = path.join(dir, pathname);

        console.log("real path " + realPath);
        try {
            let statObj = await stat(realPath);
            if (statObj.isFile()) {
                console.log("Send File !");
                ctx.set('Content-Type', mime.getType(realPath) + ";charset=utf-8");
                ctx.body = fs.createReadStream(realPath)
            } else {
                //如果不是文件，则判断是否存在index.html
                let filename = path.join(realPath, 'index.html')
                console.log("Send index" + filename);
                await stat(filename)
                ctx.set('Content-Type', "text/html;charset=utf-8");
                ctx.body = fs.createReadStream(filename);
            }
        } catch (e) {
            await next();   //交给后面的中间件处理
        }
    }
}

app.use(metastatic(__dirname));
app.use(router.routes());

const PORT = 19810;

// https

// const options = {
//     key: fs.readFileSync("/home/cert/4528032_aam.archialgo.com.key", "utf8"),
//     cert: fs.readFileSync("/home/cert/4528032_aam.archialgo.com.pem", "utf8")
// };

// const https = require('https').createServer(options, app.callback());
// https.listen(PORT+1, () => {
//     console.log("listening on *:19811")
// });

// http
const http = require('http').createServer(app.callback());
http.listen(PORT, () => {
    console.log("listening on http//localhost:19810")
});
