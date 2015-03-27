function addZero (num) {
    num = parseInt(num);
    return num<10 ? '0'+num : ''+num;
}

// var ws = io.connect('ws://localhost:8080/');
// 不传入任何url，默认是localhost
var ws = io();

var name = '';
while(!(name = prompt('请输入昵称：',''))) {
    alert('请输入昵称');
}
// 向服务器发送用户名
ws.emit('online_who', name);

var oUl = document.getElementById('ul1');
var oBtn = document.getElementById('btn1');
var oTxt = document.getElementById('txt1');

function sendMsg () {
    if(!oTxt.value) {
        alert("说点东西呗");
    } else {
        // 向服务器发送消息
        ws.emit('msg_atServer', {user: name, msg: oTxt.value});

        var oDate = new Date();
        var sDate = oDate.getFullYear()+'-'+addZero(oDate.getMonth()+1)+'-'+addZero(oDate.getDate())+' '+addZero(oDate.getHours())+':'+addZero(oDate.getMinutes())+':'+addZero(oDate.getSeconds());

        // 显示自己发的消息
        var newLi = document.createElement('li');
        newLi.className = 'self';
        newLi.innerHTML = '<strong>'+name+'</strong> <span>'+sDate+'</span>\
        <p>'+oTxt.value+'</p>';
        oUl.appendChild(newLi);
        oTxt.value = '';
    }
}

// ctrl+enter 发送消息
oTxt.onkeydown = function(ev){
    var oEvent = ev || window.event;
    if(oEvent.keyCode == 13 && oEvent.ctrlKey) {
        sendMsg();
    }
};

oBtn.onclick = sendMsg;

// 获取焦点时，发送谁在输入
oTxt.onfocus = function(){
    ws.emit('typing',{user:name});
};

ws.on('typing_AtClient', function(json){
    var newLi = document.createElement('li');
    newLi.className = 'typing';
    newLi.style.color = '#eee';
    newLi.innerHTML = json.user + '正在输入...';
    oUl.appendChild(newLi);
});

ws.on('msg_atClient', function(json){
    var oDate = new Date();
    oDate.setTime(json.time);
    var sDate = oDate.getFullYear()+'-'+addZero(oDate.getMonth()+1)+'-'+addZero(oDate.getDate())+' '+addZero(oDate.getHours())+':'+addZero(oDate.getMinutes())+':'+addZero(oDate.getSeconds());

    var newLi = document.createElement('li');
    newLi.innerHTML = '<strong>'+json.name+'</strong> <span>'+sDate+'</span>\
    <p>'+json.msg+'</p>';
    oUl.appendChild(newLi);
});

ws.on('online_whoAtClient', function(name){
    var newLi = document.createElement('li');
    newLi.className = 'who';
    newLi.style.color = 'green';
    newLi.innerHTML = name + '上线了';
    oUl.appendChild(newLi);
});

ws.on('offline_who', function(name){
    var newLi = document.createElement('li');
    newLi.className = 'who';
    newLi.style.color = '#BA0000';
    newLi.innerHTML = name + '下线了';
    oUl.appendChild(newLi);
});