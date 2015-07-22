/**
 * Created by fengqi on 2015/1/30.
 * modify on 2015/3/15.
 */

Array.prototype.remove = function(name) {
    for (var i=0; i<this.length; i++) {
        if (this[i] == name) {
            this.splice(i--, 1);
        }
    }

};

function getContentType (url) {
    var json = {
        ".css":     "text/css",
        ".js":      "text/javascript",
        ".jpg":     "image/jpeg",
        ".png":     "image/png",
        '.gif':     'image/gif',
        '.txt':     'text/plain'
    };

    var extName = path.extname(url).toLowerCase();

    if(json[extName]) {
        return json[extName];
    } else {
        return "text/html";
    }

}

var http = require('http');
var io = require('socket.io');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function(req, res){
    // 流的好处:解决了文件太大占用内存过多；读写时操作峰值太高的问题
    var rs = fs.createReadStream(__dirname+req.url);
    
    rs.on('error', function(){
        res.writeHead(404, {});
        res.end('404');
    });

    // 正常
    res.writeHeader(200, {"content-type": getContentType(req.url)});

    rs.pipe(res);

});

server.listen(8080);
// 将http服务传入，创建了一个socket.io的实例
var ws_server = io.listen(server);

// 存储在线用户
var aClient = [];

function brocast (client, event_name, data) {
    for (var i=0; i<aClient.length; i++){
        // 如果是自己则跳过不发送
        if (aClient[i]==client)
            continue;
        aClient[i].emit(event_name, data); 
    }
}

ws_server.on('connection', function(client){
    aClient.push(client);
    console.log('有人上线，当前在线人数为'+ aClient.length);

    var current_username = '';

    client.on('online_who', function(name){
        // 广播
        brocast(client, 'online_whoAtClient', name);
        current_username = name;
    });

    client.on('disconnect', function(){
        aClient.remove(client);
        console.log('有人下线，当前在线人数为'+ aClient.length);
        // 广播
        brocast(client, 'offline_who', current_username);
    });

    client.on('msg_atServer', function(json){
        json.time = new Date().getTime();
        console.log(json.user+'发的消息：'+json.msg);

        // 向其他用户广播消息
        brocast(client, 'msg_atClient', json);
    });

    client.on('typing', function(json){
        console.log(json.user + "is typing");

        // 广播
        brocast(client, 'typing_AtClient', json);
    });

});

