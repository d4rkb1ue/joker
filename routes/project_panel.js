var express = require('express');
var crypto = require('crypto');


var Project_funding = require('../models/project_funding.js')
var Order = require('../models/order.js');
var async = require('async');

module.exports = function (app) {
    app.get('/project-panel', checkLogin);
    app.get('/project-panel', function (req, res) {
        return res.render('profile', {
            title: '项目管理 - 众客',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
        });
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