var express = require('express');
// var crypto = require('crypto');
var sha256 = require('sha256');
var User = require('../models/users.js');
var async = require('async');

module.exports = function (app) {
    
    app.get('/demo',function (req,res) {
		User.getbyNameOrEmail("demo", function (err, user) {
			if (!user) {
				req.flash('error', '用户名或Email没找到');
				return res.redirect('/login');
			}
			req.session.user = user;
			res.redirect('/');
		});
    })
    
    app.get('/register', checkLogout);
    app.get('/register', function (req, res) {
        res.render('register', renderSession('注册 - 众客', req));
    });
    app.post('/register', checkLogout);
    app.post('/register', function (req, res) {
        var name = req.body.name;
        var password = req.body.password;
        var email = req.body.email;
        // 生成md5

        // var md5 = crypto.createHash('md5');

        // var md5_pass = md5.update(password).digest('hex');
        var sha256_pass = sha256(password);
        var newUser = new User({
            name: name,
            // password: md5_pass,
            password: sha256_pass,
            email: email,
        });
        User.getbyName(newUser.name, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/register');
            }
            if (user) {
                req.flash('error', '用户名已存在！');
                return res.redirect('/register');
            }
            User.get({ email: newUser.email }, function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/register');
                }
                if (user) {
                    req.flash('error', '邮箱已注册');
                    return res.redirect('/register');
                }
                newUser.save(function (err, user) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/register');
                    }
                    // console.dir(user);

                    req.session.user = user[0];

                    return res.redirect('/');
                });
            });
        });

    });
    app.get('/login', checkLogout);
	app.get('/login', function (req, res) {
		res.render('login', renderSession('登录 - 众客', req));
	});

	app.post('/login', checkLogout);
	app.post('/login', function (req, res) {
		// var md5 = crypto.createHash('md5');
		// var password = md5.update(req.body.password).digest('hex');
		var password = sha256(req.body.password);
		// 检查用户是否存在

		User.getbyNameOrEmail(req.body.nameoremail, function (err, user) {
			if (!user) {
				req.flash('error', '用户名或Email没找到');
				return res.redirect('/login');
			}
			if (user.password != password) {
				req.flash('error', '密码错误');
				return res.redirect('/login');
			}
			req.session.user = user;
			res.redirect('/');
		});
	});



	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user = null;
		res.redirect('/login');
	});
    
    function renderSession(title, req) {
		return {
			title: title,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		};
	};

	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '请先登录!');
			res.redirect('/login');
		}
		next();
	};
	function checkLogout(req, res, next) {
		if (req.session.user) {
			res.redirect('back');
		}
		next();
	};
    
};