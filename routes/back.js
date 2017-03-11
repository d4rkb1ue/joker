var express = require('express');

var Project_funding = require('../models/project_funding.js')
var Order = require('../models/order.js');
var async = require('async');


module.exports = function (app) {
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

