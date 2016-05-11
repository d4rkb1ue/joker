var express = require('express');
var crypto = require('crypto');


var Project_funding = require('../models/project_funding.js')
var Order = require('../models/order.js');
var async = require('async');
var ObjectId = require('mongodb').ObjectID;

module.exports = function (app) {
    app.get('/project-panel', checkLogin);
    app.get('/project-panel', function (req, res) {
        checkAuthorized(req, function (err,project) {
            if (err) {
                // 如果id不对就返回重新选择项目
                return res.redirect('/profile#ui-id-4');
            }
            return res.render('project-panel', {
                title: project.title + ' - 项目管理 - 众客',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
            });
        })

    });

    app.get('/project-orders', checkLogin);
    // 获取 query.proj_id 指定的项目的订单列表
    // 首先需要匹配author_id === currentUser_id
    app.get('/project-orders', function (req, res) {
        async.waterfall([
            function (cb) {
                if (req.query.proj_id && req.query.proj_id.length === 24) {
                    Project_funding.getSpecificInfo(
                        { "_id": new ObjectId(req.query.proj_id) }
                        , { author_id: 1, title: 1 }
                        , function (err, projects) {
                            cb(err || projects[0] ? null : "project not found", projects[0]);
                        });
                }
            },
            function (project, cb) {
                // check author_id
                if (project.author_id !== req.session.user._id) {
                    return cb("user is not authorized");
                }
                cb(null, project);
            },
            function (project, cb) {
                // go for orders
                Order.getByProjID(function (err, orders) {
                    cb(err, project, orders)
                }, req.query.proj_id);
            }
        ], function (err, project, orders) {

            // if (err) {
            //     req.flash('error', err);
            //     console.log(err);
            //     return res.send("err");
            // }
            // return res.render('orders', {
            //     title: '订单 - ' + project.title + ' - 众客',
            //     user: req.session.user,
            //     success: req.flash('success').toString(),
            //     error: req.flash('error').toString(),
            //     orders: orders
            // })

            // let's try json!

            if (err) {
                res.json({ err: err });
                console.log(err);
            }
            return res.json(JSON.stringify(orders));
        })
    });

    // 是否存在该项目，是否是该项目主人：匹配author_id === currentUser_id
    // 注意是异步方法
    function checkAuthorized(req, maincb) {
        async.waterfall([
            function (cb) {
                if (req.query.proj_id && req.query.proj_id.length === 24) {
                    Project_funding.getSpecificInfo(
                        { "_id": new ObjectId(req.query.proj_id) }
                        , { author_id: 1, title: 1 }
                        , function (err, projects) {
                            cb(err || projects[0] ? null : "project not found", projects[0]);
                        });
                } else {
                    cb('query is not an _id')
                }
            },
            function (project, cb) {
                // check author_id
                if (project.author_id !== req.session.user._id) {
                    return cb("user is not authorized");
                }
                cb(null, project);
            }
        ], function (err, project) {
            maincb(err, project);
        })
    }


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