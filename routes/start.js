var express = require('express');
var Project_funding = require('../models/project_funding.js')
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
var upload = multer({ storage: storage });

module.exports = function (app) {
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