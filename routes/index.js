var express = require('express');
var crypto = require('crypto');
var mObjectID = require('mongodb').ObjectID;

var User = require('../models/users.js');
var Project_funding = require('../models/project_funding.js')
var Order = require('../models/order.js');
var async = require('async');
var multer = require('multer');

// multer configs
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// 这个 '.' 不能丢啊！！
		cb(null, './public/uploads')
	},
	filename: function (req, file, cb) {

		// cb(null, file.fieldname + '-' + Date.now())
		// g for global: all change
		// ~~另外，multer 自动更改空格！不动手动！~~
		var nonSpace = file.originalname.replace(/\s+/g, '-');

		cb(null, Date.now() + '-' + nonSpace);

	}
});
var upload = multer({ storage: storage })

module.exports = function (app) {


	// app.get('/', function (req, res, next) {
	// 	return res.render('ueditor', {
	// 		title: '众客'
	// 	});
	// });
	app.get('/test', function (req, res) {
		

	});


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
			return res.render('index', {
                title: '众客',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                project_fundings: docs
            });
		})
	});

	app.get('/register', checkLogout);
	app.get('/register', function (req, res) {
		res.render('register', renderSession('注册 - 众客', req));
	});
	app.post('/register', checkLogout);
	app.post('/register', function (req, res) {
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
                    console.dir(user);

                    req.session.user = user;

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
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		//检查用户是否存在

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

	app.get('/start', checkLogin);
	app.get('/start', function (req, res) {
		res.render('start', renderSession('创建您的项目 - 众客', req));
	});

	app.post('/start', checkLogin);

    app.post('/start', upload.any(), function (req, res) {
		// -----------just print

		// console.log(req.body);
		// console.log(req.files);

		var feature_image_filename, author_photo_filename;

		for (tmp in req.files) {
			if (req.files[tmp].fieldname === 'feature_image') {
				feature_image_filename = req.files[tmp].filename;
			} else if (req.files[tmp].fieldname === 'author_photo') {
				author_photo_filename = req.files[tmp].filename;
			};
		}

		// -----------
        var currentUser = req.session.user;

        var project_funding = new Project_funding(
			// 暂缺
            // req.body.author_link,

			req.body.title,
			req.body.short_blurb,
			req.body.category,
			req.body.funding_goal,
			req.body.funding_duration,
			req.body.videourl,
			req.body.author_name,
			req.body.author_bio,
			req.body.author_email,
			req.body.author_contact,
			req.body.author_location,
			req.body.email_append,
			req.body.risk_challenges,
			req.body.description,
			req.body.rewards,

			currentUser._id,
			feature_image_filename,
			author_photo_filename

		);





        project_funding.save(function (err) {
            if (err) {
                // req.flash('error', err);
				res.send('err');
                // return res.redirect('back');
            }
			res.send('ok');
            // req.flash('success', '已提交审核!');
            // res.redirect('/project-funding-preview');

        })


		// res.redirect('/start');
    })

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

    app.get('/back', checkLogin);
    app.get('/back', function (req, res) {
		// console.log(req.query.proj_id);
		// console.log(req.query.rw_id);
		async.waterfall([
			function (cb) {
				Project_funding.getByID(req.query.proj_id, function (err, project_funding) {
					cb(err, project_funding);
				});
			},
			function (project_funding, cb) {
				Order.getByProjID(function (err, orders) {
					cb(err, project_funding, orders);
				}, req.query.proj_id);
			}
			, function (project_funding, orders, cb) {
				Order.calculateRwBackers(orders);
				cb(null, project_funding, orders);
			},
			function (project_funding, orders, cb) {
				Project_funding.parseRw(project_funding);
				cb(null, project_funding, orders);
			},
			function (project_funding, orders, cb) {
				// 检查project是否存在，rw是否存在，rw是否还可以购买
				if (orders.bk_counts[req.query.rw_id]
					&& project_funding.parsedRw[req.query.rw_id].rwlimited !== 0
					&& orders.bk_counts[req.query.rw_id] >= project_funding.parsedRw[req.query.rw_id].rwlimited) {
					return cb('reward has reached its limit');
				}
				cb(null, project_funding, orders);
			}
		], function (err, project_funding, orders) {
			console.log('here');
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			} else {

				return res.render('back', {
					title: '支持-' + project_funding.title,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString(),
					project: project_funding,
					orders: orders,
					rw_id: req.query.rw_id,
				});

			}

		})

    });



	app.post('/back', checkLogin);
    app.post('/back', function (req, res) {
		// console.log(req.query.proj_id);
		// console.log(req.body);
		async.waterfall([
			function (cb) {
				Project_funding.getByID(req.body.proj_id, function (err, project_funding) {
					cb(err, project_funding);
				});
			},
			function (project_funding, cb) {
				Order.getByProjID(function (err, orders) {
					cb(err, project_funding, orders);
				}, req.body.proj_id);
			}
			, function (project_funding, orders, cb) {
				Order.calculateRwBackers(orders);
				cb(null, project_funding, orders);
			},
			function (project_funding, orders, cb) {
				Project_funding.parseRw(project_funding);
				cb(null, project_funding, orders);
			},
			function (project_funding, orders, cb) {
				// 检查project是否存在，rw是否存在，rw是否还可以购买
				if (orders.bk_counts[req.body.rw_id]
					&& project_funding.parsedRw[req.body.rw_id].rwlimited !== 0
					&& orders.bk_counts[req.body.rw_id] >= project_funding.parsedRw[req.body.rw_id].rwlimited) {
					cb('Reward has reached its limit');
				}
				cb(null, project_funding, orders);
			},
			// add to order
			function (project_funding, orders, cb) {

				var order = new Order({
					user_id: req.session.user._id,
					proj_id: req.body.proj_id,
					proj_name: project_funding.title,
					rw_id: req.body.rw_id,
					rw_amout: project_funding.parsedRw[req.body.rw_id].rwcount,
					payment: req.body.payment,
					note: req.body.note,
					details: project_funding.parsedRw[req.body.rw_id].rwdetails,
					feature_img: project_funding.feature_image,
				});
				order.save(function (err) {
					cb(err, project_funding, orders);
				});
			},
			// add to project_funding meta-info
			function (project_funding, orders, cb) {
				Project_funding.addBacker(project_funding._id
					, project_funding.parsedRw[req.body.rw_id].rwcount
					, function (err, result) {
						cb(err, project_funding, orders);
					})
			}
		], function (err, project_funding, orders) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.send('err');
			} else {
				return res.send('ok');
			}

		})

    });


	app.get('/project-panel',checkLogin);
	app.get('/project-panel',function(req, res){
		return res.render('profile', {
			title: '项目管理 - 众客',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		});
	});
	
	
	app.get('/created', checkLogin);
	app.get('/created', function (req, res) {
		async.waterfall([
			// 获取当前用户发布的项目
			function (cb) {
				Project_funding.get(
					{ author_id: req.session.user._id },
					function (err, projects) {
						cb(err, projects);
					}
				);
			},
			// 计算时间等信息
			function (projects, cb) {
				projects.forEach(function (project, index) {
					Project_funding.calculate(project);
					// console.log(project.print_to_go);
				});
				cb(null, projects);
			},
			function (projects, cb) {
				Project_funding.pretty(projects);
				cb(null, projects);
			}
		], function (err, projects) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.render('/', renderSession('众客', req));
			}
			return res.render('created', {
				title: '创立的项目 - 众客',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				projects: projects
			});
		})
	})

	app.get('/profile', checkLogin);
	app.get('/profile', function (req, res) {
		return res.render('profile', {
			title: '个人信息 - 众客',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		});
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
	app.get('/back-history', checkLogin);
	app.get('/back-history', function (req, res) {
		async.waterfall([
			// 获取当前用户的支持历史
			function (cb) {
				Order.getOrders(function (err, currentUserBacked) {
					cb(err, currentUserBacked);
				},
					{
						user_id: req.session.user._id
					}
				);
			},
			function (currentUserBacked, cb) {
				Order.pretty(currentUserBacked);
				cb(null, currentUserBacked);
			}
		], function (err, currentUserBacked) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.render('back-history-content', renderSession('支持过的项目 - 众客', req));
			}
			return res.render('back-history-content', {
				title: '支持过的项目 - 众客',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				orders: currentUserBacked
			});
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

