var express = require('express');
var crypto = require('crypto');
var mObjectID = require('mongodb').ObjectID;

var User = require('../models/users.js');
var Project_funding = require('../models/project_funding.js')
module.exports = function(app){
	
	app.get('/', function(req, res, next) {
        console.dir(Project_funding.getMiniInfo({},function (err,docs) {
            if(err){
                req.flash('error',err);
                return res.redirect("/");
            }
            // console.dir(docs);
            return res.render('index',{
                title: '众客',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                project_fundings: docs
            });
        }));

	});
	
	app.get('/register',checkLogout);
	app.get('/register',function(req,res){
		res.render('register', renderSession('注册 - 众客',req));
	});
	app.post('/register',checkLogout);
	app.post('/register',function(req,res){
		var name = req.body.name;
		var password = req.body.password;
		var email = req.body.email;
		//生成md5

		var md5 = crypto.createHash('md5');
		var md5_pass = md5.update(password).digest('hex');
		var newUser = new User({
			name: name,
			password: md5_pass,
			email: email,
		});
		User.getbyName(newUser.name, function(err,user){
			if(err){
				req.flash('error',err);
				return res.redirect('/register');
			}
			if(user){
				req.flash('error','用户名已存在！');
				return res.redirect('/register');
			}
			User.get({email:newUser.email}, function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('/register');
				}
				if(user){
					req.flash('error','邮箱已注册');
					return res.redirect('/register');
				}
				newUser.save(function (err,user){
					if(err){
						req.flash('error',err);
						return res.redirect('/register');
					}
                    console.dir(user);

                    req.session.user = user;
                    
					return res.redirect('/');
				});
			});
		});

	});
	
	app.get('/login',checkLogout);
	app.get('/login',function(req,res){
		res.render('login',renderSession('登录 - 众客',req));
	});

	app.post('/login',checkLogout);
	app.post('/login',function(req,res){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		//检查用户是否存在

		User.getbyNameOrEmail(req.body.nameoremail, function(err,user){
			if(!user){
				req.flash('error','用户名或Email没找到');
				return res.redirect('/login');
			}
			if(user.password != password){
				req.flash('error','密码错误');
				return res.redirect('/login');
			}
			req.session.user = user;
			res.redirect('/');
		});
	});
	


	app.get('/logout',checkLogin);
	app.get('/logout',function(req,res){
		req.session.user = null;
		res.redirect('/login');
	});

	app.get('/start',checkLogin);
	app.get('/start',function(req,res){
		res.render('start',renderSession('创建您的项目 - 众客',req));
	});
	
	app.post('/start',checkLogin);
    app.post('/start',function (req,res) {
        var currentUser = req.session.user;
        var project_funding = new Project_funding(
            req.body.title,
            req.body.description,
            currentUser._id,
            req.body.feature_image,
            req.body.short_blurb,
            req.body.project_category,
            req.body.funding_goal,
            req.body.funding_duration,
            req.body.reward,
            req.body.video,
            req.body.risk_challenges,
            req.body.author_name,
            req.body.author_photo,
            req.body.author_link,
            req.body.author_bio,
            req.body.author_location,
            req.body.author_contact,
            req.body.author_email,
            req.body.email_append);
        project_funding.save(function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','已提交审核!');
            res.redirect('/project-funding-preview');

        })
    })

    app.get('/project-funding/:_id',function (req,res) {
        Project_funding.getByID(req.params._id,function (err,doc) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            console.dir(doc);
            return res.redirect('/');

        })
    })



	function renderSession(title, req){
		return {
			title: title,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		};
	};
	
	function checkLogin(req,res,next){
		if(!req.session.user){
			req.flash('error','请先登录!');
			res.redirect('/login');
		}
		next();
	};
	function checkLogout(req,res,next){
		if(req.session.user){
			res.redirect('back');
		}
		next();
	};

};

