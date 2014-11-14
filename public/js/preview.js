/*
 * @arthur:tqtan;
 * @content:多终端字体预览工具;
 * @publish_date:2014/8/5;
 */
var host = 'ws://www.isux.us:3000';
var socket;
var terminals = new Array();
var myType;
var uid=0;
var testFlag;
var testLinkTime = 5000;
var defaultText = "唧唧复唧唧，木兰当户织。不闻机杼声，惟闻女叹息。\n问女何所思，问女何所忆。女亦无所思，女亦无所忆。\n昨夜见军帖，可汗大点兵。军书十二卷，卷卷有爷名。\n阿爷无大儿，木兰无长兄。愿为市鞍马，从此替爷征。\n东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。\n旦辞爷娘去，暮宿黄河边。\n不闻爷娘唤女声，但闻黄河流水鸣溅溅。\n旦辞黄河去，暮至黑山头。\n不闻爷娘唤女声，但闻燕山胡骑鸣啾啾。";
var wordStr = defaultText;//文本
var family = "Arial";//字体
var size = "14px";//尺寸
var weight = "normal";//字重
var style = "normal";//字形
var color = "#000";//颜色
var bgcolor = "#fff";//背景色
var lineheight = "16px";//行高

// 检查是否加在到socket.js
if(io === undefined){
	var io;
	loadError();
	delete io;
}
else{
	socket = io.connect(host);
}

// 页面载入自动连接
window.onload = function(){
	if(uid==0||!uid){
		uid = getUid();
		myType = "5";//USER
		socket.emit('login',
		{
			'uid':uid,
			'type':myType
		});
	}
	return false;
};

// 在onunload调用前提示
window.onbeforeunload = function(event) { 
	return "刷新或离开页面可能丢失连接，您确定要离开此页面吗？"; 
}
// 退出登录
window.onunload = function(event) {
	if(uid){
		socket.disconnect();
	}
}

// 加载异常
function loadError(){
	$('#messages').prepend($('<li class="red">').text('请先检查服务器连接情况，在刷新页面重试。'));
	$('#reload').removeClass('hide');
	uid = 0;
}

function updateContentStyle(){
	$('#content').css({
		'font-family':family,
		'font-size':size,
		'font-weight':weight,
		'font-style':style,
		'color':color,
		'background-color':bgcolor,
		'line-height':lineheight
	});
}

function getInfo(){
	var info = {};
	var str = $('#content').val().split('\n');
	if(str!=""){
		wordStr = str;
	}
	else{
		wordStr = defaultText.split('\n');
	}
	info.words = wordStr;
	info.family = family;
	info.size = size;
	info.weight = weight;
	info.style = style;
	info.color = color;
	info.bgcolor = bgcolor;
	info.lineheight = lineheight;
	return info;
}

// 生成uid
function getUid(){
	return new Date().getTime()+""+Math.floor(Math.random()*899+100);
}

// 设备id翻译
function getTermsName(id){
	var type;
	switch(parseInt(id)){
		case 0: type = "PC";break;
		case 1: type = "MAC";break;
		case 2: type = "IOS";break;
		case 3: type = "ANDROID";break;
		case 4: type = "USER";break;
		default:type = "USER";break;
	}
	return type;
}

function getTermsNameId(name){
	var type;
	if(name == "PC"){
		type = 0;
	}
	else if(name == "MAC"){
		type = 1;
	}
	else if(name == "IOS"){
		type = 2;
	}
	else if(name == "ANDROID"){
		type = 3;
	}
	else{
		alert('设备转换id错误！');
	}
	return type;
}

function updateTermsState(terminals){
	var len = terminals.length;
	var PC = 0;
	var MAC = 0;
	var IOS = 0;
	var ANDROID = 0;
	for(var i = 0; i < len; i++){
		if(terminals[i].type==0){
			PC = 1;
		}
		else if(terminals[i].type==1){
			MAC = 1;
		}
		else if(terminals[i].type==2){
			IOS = 1;
		}
		else if(terminals[i].type==3){
			ANDROID = 1;
		}
	}
	if(PC === 1){$('#PC').addClass('link');}
	else{$('#PC').removeClass('link')}

	if(MAC === 1){$('#MAC').addClass('link');}
	else{$('#MAC').removeClass('link');}

	if(IOS === 1){$('#IOS').addClass('link');}
	else{$('#IOS').removeClass('link');}

	if(ANDROID === 1){$('#ANDROID').addClass('link');}
	else{$('#ANDROID').removeClass('link');}
}

function emitPreview(type,info){
	var from = uid;
	var to = 0;
	var content = 0;

	socket.emit('preview',
		{
			'type':type,
			'from':from,
			'to':to,
			'content':content,
			'info':info
		});
	return false;
}

function draw(img,type){
	var type = getTermsName(type);
	$('#'+type+'img').removeClass('hide').attr('src',img);
}

// 刷新页面
$('#reload').click(function(){
	location.reload();
});

$(".messages-wrap label").click(function(){
	var $wrap = $('.messages-wrap');
	if($wrap.hasClass('slide-right')){
		$wrap.removeClass('slide-right');
	}
	else{
		$wrap.addClass('slide-right');
	}
});

// css导出
$('#css').click(function(){
	var cssStr = 'font-family:' + $('#content').css('font-family')
				+';font-size:' + $('#content').css('font-size')
				+';font-weight:' + $('#content').css('font-weight')
				+';font-style:' + $('#content').css('font-style')
				+';color:' + $('#content').css('color')
				+';background-color:' + $('#content').css('background-color')
				+';line-height:' + $('#content').css('line-height')+';';

	var $code = $('#code');
	if($code.hasClass('hide')){
		$('#code').text(cssStr).slideDown(100).removeClass('hide');
	}
	else{
		$('#code').slideUp(100).addClass('hide');
	}
});

// reset
$('#reset').click(function(){
	if(confirm('是否重置样式？')){
		wordStr = defaultText;//文本
		family = "Arial";//字体
		size = "14px";//尺寸
		weight = "normal";//字重
		style = "normal";//字形
		color = "#000";//颜色
		bgcolor = "#fff";//背景色
		lineheight = "16px";//行高
		updateContentStyle();

		$('#family option').each(function(){$(this).attr('selected','');})
		$('#family').find("option[value='Arial']").attr('selected','selected');

		$('#size option').each(function(){$(this).attr('selected','');})
		$('#size').find("option[value='14px']").attr('selected','selected');

		$('#weight').removeClass('active');
		$('#style').removeClass('active');

		$('#color').val('#000000');
		$('#bgcolor').val('#ffffff');

		$('#lineheight option').each(function(){$(this).attr('selected','');})
		$('#lineheight').find("option[value='16px']").attr('selected','selected');
	}
});

// 清除首次默认文本
$('#content').focus(function(){
	if(!$(this).hasClass('use')){
		$(this).val("").addClass('use');
	}
});

$('#content').blur(function(){
	if($(this).val()==""){
		$(this).val("请输入内容...");
		$(this).removeClass('use');
	}
});

// 选项监听器
$('#family').change(function(){
	family = $(this).find("option:selected").val();
	updateContentStyle();
});
$('#color').change(function(){
	color = "#"+$(this).val();
	updateContentStyle();
});
$('#bgcolor').change(function(){
	bgcolor = "#"+$(this).val();
	updateContentStyle();
});
$('#size').change(function(){
	size = $(this).find("option:selected").val();
	// 更新size的时候同步更新行高
	lineheight = size;
	$('#lineheight').find("option:selected").attr('selected',false);
	$('#lineheight option[value='+size+']').attr('selected',true);
	updateContentStyle();
});
$('#lineheight').change(function(){
	lineheight = $(this).find("option:selected").val();
	updateContentStyle();
});
$('#weight').click(function(){
	if($(this).hasClass('active')){
		$(this).removeClass('active');
		weight = "normal"
		updateContentStyle();
	}
	else{
		$(this).addClass('active');
		weight = "bold";
		updateContentStyle();
	}
});
$('#style').click(function(){
	if($(this).hasClass("active")){
		$(this).removeClass('active');
		style = "normal"
		updateContentStyle();
	}
	else{
		$(this).addClass('active');
		style = "italic";
		updateContentStyle();
	}
});

$('#submit').click(function(){
	if(uid==0||!uid){
		alert('请先连接！');
	}
	else{
		var info = getInfo();			

		$('.show-box').filter('.link').each(function(){
			emitPreview(getTermsNameId($(this).attr('id')),info);
		});
	}

});

$('#fresh-btn').click(function(){
	socket.emit('freshterms',null);
});

// 接受用户登录反馈
socket.on('login',function(msg){
	$('.link-status-msg').text('连接成功！').addClass('link-status-msg-active');
	setTimeout(function(){$('.link-status-msg').addClass('hide');},6000);

	var terminals = msg.terminals;
	var len = terminals.length;
	updateTermsState(terminals);

	$('#messages').prepend($('<li class="red">').text('新终端登录。'));
	for(var i = 0; i < len; i++){
		$('#messages').prepend($('<li>').text("终端"+getTermsName(terminals[i].type)+"("+terminals[i].uid+")"));
	}
	$('#messages').prepend($('<li>').text('==当前连接终端队列=='));
});

// 接受用户退出反馈
socket.on('logout',function(msg){
	var terminals = msg.terminals;
	var len = terminals.length;
	updateTermsState(terminals);

	$('#messages').prepend($('<li class="red">').text('有终端退出登录'));
	for(var i = 0; i < len; i++){
		$('#messages').prepend($('<li>').text("终端"+getTermsName(terminals[i].type)+"("+terminals[i].uid+")"));
	}
	$('#messages').prepend($('<li>').text('=========更新终端队列========='));
});


// 没有可用终端
socket.on('nodevice',function(msg){
	// 显示当前队列
	var terminals = msg.terminals;
	var words = msg.msg;
	var len = terminals.length;
	
	$('#messages').prepend($('<li class="red">').text(words));
	for(var i = 0; i < len; i++){
		$('#messages').prepend($('<li>').text("终端"+getTermsName(terminals[i].type)+"("+terminals[i].uid+")"));
	}
	$('#messages').prepend($('<li>').text('==当前连接终端队列=='));
	return false;
});


// 截图完成，更新用户队列
socket.on('done',function(msg){
	var terminals = msg.terminals;
	var len = terminals.length;
	var msg = msg.msg;

	// 返回当前用户，已完成，有内容
	if(msg.from == uid && msg.content != 0){
		draw(msg.content,msg.type);
		$('#messages').prepend($('<li class="red">').text('绘图返回'));
		// 显示当前队列
		for(var i = 0; i < len; i++){
			$('#messages').prepend($('<li>').text("终端"+getTermsName(terminals[i].type)+"("+terminals[i].uid+")"));
		}
		$('#messages').prepend($('<li>').text('==当前连接终端队列=='));
	}
});

// 重连
socket.on('reconnect',function(){
	$('#messages').prepend($('<li class="red">').text('该设备重连'));
	uid = getUid();
	myType = "5";//USER
	socket.emit('login',
	{
		'uid':uid,
		'type':myType
	});
});




