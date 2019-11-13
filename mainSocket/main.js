
// 官方连接：https://socket.io/

var io = require('socket.io')(12358);
console.log('server start');
io.on('connection', function (socket) {
    console.log('client connection');
    //注册服务器的自定义事件
    socket.on('actuator', function (data, callback) {
        console.log('actuator:' + data['payload']);
		io.sockets.emit('ClientListener', { hello: data['payload'] });
    });
	
	socket.on('recommend',function (data,callback){
		console.log('发送消息给scratch3.0'+ data['email']);
		
		io.sockets.emit('recommendModule',{type:data});
	});
	
	socket.on('clear',function(){
		io.sockets.emit('clear');
		console.log('收到clear');
	});
	
    //断开连接会发送
    socket.on('disconnect', function () {
        console.log('client disconnected');
    });
	socket.on('print',function(data){
		console.log("scratch收到了消息"+data['payload']);
		
	});
	
});
