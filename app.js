/*
 * @author:tqtan
 * @content:文字预览工具
 * @date:2014/7/9
*/


// load module
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

var terminals = [];

// router
app.use(express.static(__dirname + '/public'));

io.on('connection',function(socket){
	console.log(socket.id);

	// 构造客户端对象
	var client = {
	    uid:false,
	    type:false
	}
	
	//登录 
	socket.on('login',function(msg){
		client.uid = msg.uid;
		client.type = msg.type;
		terminals.push({'uid':client.uid,'type':client.type});

		console.log(client.uid+" "+client.type);
		// 给所有终端报告状态
		socket.broadcast.emit('login',{'terminals':terminals});
		socket.emit('login',{'terminals':terminals});
	});

	//监听用户退出
	socket.on('disconnect', function(){
		// 删除对应终端
		for(var i = 0;i < terminals.length; i++){
			if(terminals[i].uid == client.uid){
				terminals.splice(i,1);
				break;
			}
		}

		//向其他所有客户端广播用户退出
		socket.broadcast.emit('logout',{'terminals':terminals});
	});

	// 发送截图请求给link端
	socket.on('preview',function(msg){
		var flag = 0;//标记是否找到终端，0为未找到

		// 查找是否有空闲终端
		// 从后开始搜索，保证最新的设备状态
		for(var i = terminals.length-1;i > 0; i--){
			if(terminals[i].type == msg.type){
				// 确认目标终端uid
				flag = 1;
				msg.to = terminals[i].uid;
				break;
			}
		}

		if(flag == 0){
			// 向所有终端发布消息
			var words = "当前没有可用终端，请稍后再试，或联系工程师。";
			socket.emit('nodevice',{'msg':words,'terminals':terminals});
		}
		else{
			// 向所有终端发布消息
			socket.broadcast.emit('preview',{'msg':msg,'terminals':terminals});
		}
	});

	// 截图返回
	socket.on('done',function(msg){
		// 向所有终端发布消息
		socket.broadcast.emit('done',{'msg':msg,'terminals':terminals});
		socket.emit('done',{'msg':msg,'terminals':terminals});
	}); 

	socket.on('freshterms',function(){
		socket.broadcast.emit('fresh',null);
	});

});

http.listen(3000,function(){
	console.log('listening on http://www.isux.us:3000');
});

