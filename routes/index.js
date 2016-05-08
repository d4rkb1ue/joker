var express = require('express');
var crypto = require('crypto');

var Project_funding = require('../models/project_funding.js')
var Order = require('../models/order.js');
var async = require('async');


module.exports = function (app) {


	app.get('/', function (req, res, next) {
		async.waterfall([
			function (cb) {
				Project_funding.getMiniInfo({}, function (err, docs) {
					cb(err, docs);
				});
			},
			// function (docs, cb) {
			// 	Project_funding.pretty(docs);
			// }
		], function (err, docs) {
			if (err) {
                req.flash('error', err);
                return res.redirect("/404");
            }
			console.log(req.session.user);
			return res.render('index', {
                title: '众客',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                project_fundings: docs
            });
		})
	});


	

    app.get('/project-funding/:_id', function (req, res) {
		async.waterfall([
			function (cb) {
				Project_funding.getByID(req.params._id, function (err, project_funding) {
					cb(err, project_funding);
				});
			},
			function (project_funding, cb) {
				Order.getByProjID(function (err, orders) {
					cb(err, project_funding, orders);
				}, req.params._id);
			}
			, function (project_funding, orders, cb) {
				Order.calculateRwBackers(orders);
				cb(null, project_funding, orders);
			},
			function (project_funding, orders, cb) {
				Project_funding.parseRw(project_funding);
				cb(null, project_funding, orders);
			},
			// 获取当前用户的支持历史
			function (project_funding, orders, cb) {
				if (req.session.user) {
					Order.getOrders(function (err, currentUserBacked) {
						cb(err, project_funding, orders, currentUserBacked);
					},
						{
							user_id: req.session.user._id,
							proj_id: req.params._id
						}
					);
				} else {
					cb(null, project_funding, orders, null);
				}

			}
		], function (err, project_funding, orders, currentUserBacked) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			} else {

				return res.render('project-funding', {
					title: project_funding.title,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString(),
					project: project_funding,
					orders: orders,
					currentUserBacked: currentUserBacked
				});
			}

		})

    })

   


	
	
	
	

	app.get('/project-by-category', function (req, res) {
		// req.query.category
		async.waterfall([
			function (cb) {
				Project_funding.getMiniInfo(
					// 如果没有参数就返回所有
					req.query.category ? { category: req.query.category } : {}
					,
					function (err, projects) {
						cb(err, projects);
					})
			}
		], function (err, projects) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.render('/', renderSession('众客', req));
			}
			return res.render('project-by-category', {
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				projects: projects,
			})
		})
	});
	

	app.get('/search', function (req, res) {
		// 没有参数就返回首页
		if(!req.query.word){
			return res.redirect('/');
		}
		
		var query = req.query.word;
		
		console.error(query);
		
		var splitWord = query.split('+').reduce( (x,y) => x+"|"+y );
		var regStr = "";
		
		// 每个关键词都要加一次
		// ("people|suck|p") => ("[people|suck|p]+.*[people|suck|p]+.*[people|suck|p]+.*")
		query.split('+').forEach( function(){
			regStr+= "["+splitWord+"]+.*";
		});
		
		var regExp = new RegExp(regStr);
		async.waterfall([
			function (cb) {
				Project_funding.getMiniInfo(
					{ title: regExp }
					,
					function (err, projects) {
						cb(err, projects);
					});
			}
		],function(err,projects){
			if(err){
				req.flash('error', err);
				console.log(err);
				return res.render('/', renderSession('众客', req));
			}
			return res.render('search-result', {
				query: query,
				title: '搜索 '+ query,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				projects: projects,
			})
		})
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

