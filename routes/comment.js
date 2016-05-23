var express = require('express');
var crypto = require('crypto');
var checkTool = require('./checkTool')
var Comment = require('../models/comment.js');
var Project_funding = require('../models/project_funding');
var async = require('async');

module.exports = function (app) {
    app.post('/api/make-comment', checkTool.checkLogin);
    app.post('/api/make-comment', function (req, res) {
        proj_id = req.body.proj_id;
        content = req.body.content;
        repost_id = req.body.repost_id;
        async.waterfall([
            // 先确认有这个project
            function (cb) {
                Project_funding.getByID(proj_id, function (err, project_funding) {
                    cb(err, project_funding);
                });
            },
            function (project_funding, cb) {
                if (!project_funding) {
                    cb('do not find this project');
            }
                else {
                    cb(null, project_funding);
                }
            },
            function (project_funding, cb) {
                var comment = new Comment({
                    proj_id: proj_id,
                    user_id: req.session.user._id,
                    user_name: req.session.user.name,
                    // user_photo: req.session.user.photo || "",
                    content: content,
                    repost_to: repost_id
                })

                comment.save(function (err, comment) {
                    cb(err, project_funding, comment);
                })
            }, function (project_funding, comment, cb) {
                // 项目评论数+1
                Project_funding.addComment(proj_id, function (err, result) {
                    cb(err, project_funding, comment);
                })
            }
        ], function (err, project_funding, comment) {
            if (err) {
                req.flash('error', err);
                console.log(err);
                return res.json({ err: err });
            }
            return res.json({ success: 'ok' });
        })
    });
    app.get('/api/get-comments/', function (req, res) {
        async.waterfall([
            function (cb) {
                if (req.query.proj_id && req.query.proj_id.length === 24) {
                    cb(null, req.query.proj_id);
                } else {
                    cb('not a proj_id');
                }
            },
            function (proj_id, cb) {
                Comment.getByProjID(function (err, comments) {
                    cb(err, proj_id, comments);
                }, proj_id)
            }
        ], function (err, proj_id, comments) {
            if (err) {
                console.log(err);
                return res.json({ err: err });
            }
            // console.log(comments);
            return res.json(JSON.stringify(comments));
        })

    })

}