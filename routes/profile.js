var express = require('express');
var crypto = require('crypto');

var Project_funding = require('../models/project_funding.js')
var Order = require('../models/order.js');
var async = require('async');

module.exports = function (app) {
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

