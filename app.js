var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var settings = require('./settings');

var index_routes = require('./routes/index');
var user_routes = require('./routes/user');
var start_routes = require('./routes/start');
var back_routes = require('./routes/back');
var profile_routes = require('./routes/profile');
var project_panel_routes = require('./routes/project_panel');
var comment_routes = require('./routes/comment');

var flash = require('connect-flash');
var ueditor = require("ueditor");

// var multer  = require('multer');


var app = express();

// app.set('port',process.env.PORT || 3000);
app.set('port', settings.port);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//

app.use(session({
	secret: settings.cookieSecret,
	key: settings.cookieName,//cookie name
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
	store: new MongoStore({
		url: settings.mongodbUrl
	})
}));
app.use(flash());


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// 在 multer 1.1.0 版本中废弃了这种写法。
// app.use(multer({
//   dest: './public/uploads',
//   rename: function (fieldname, filename) {
// 	// make a non dulpicate file name
//     return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
//   }
// }));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ue
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        
        var imgname = req.ueditor.filename;

        var img_url = '/uploads' ;
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/uploads';
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));
// end ue


index_routes(app);
user_routes(app);
start_routes(app);
back_routes(app);
profile_routes(app);
project_panel_routes(app);
comment_routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.listen(app.get('port'),function(){
	console.log('[OK]Running on PORT:'+app.get('port'));
});
module.exports = app;
