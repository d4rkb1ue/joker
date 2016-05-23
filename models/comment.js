var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = require('../settings').mongodbUrl;
var async = require('async');

function Comment(comment) {
    this.proj_id = comment.proj_id;
    this.user_id = comment.user_id;
    this.user_name = comment.user_name;
    this.user_photo = comment.user_photo || "";
    this.content = comment.content;
    this.repost_to = comment.repost_to || "";
}

module.exports = Comment;

Comment.prototype.save = function (maincb) {
    var now = new Date();
    // user_id, 评论者id
    // user_name, 评论者name
    // user_photo, 评论者头像
    // content, 评论内容
    // create_at, 时间戳
    // repost_to, 回复哪个帖子？
    // like, 顶的数量, int
    var comment = {
        proj_id : this.proj_id,
        user_id : this.user_id,
        user_name : this.user_name,
        user_photo : this.user_photo,
        content : this.content,
        create_at : now,
        repost_to : this.repost_to,
        like : 0
    };
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db,cb){
            db.collection('comment').insertOne(comment, function (err, result) {
                console.log("[OK]Inserted a [comment] into the comment.");
                cb(err, db, result.ops);
            });
        }
    ],
    function (err,db,doc) {
        db.close();
        maincb(err,doc);
    });
    
    
}

Comment.getByProjID = function (maincb,proj_id) {
   async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            var cursor = db.collection('comment').find({"proj_id": proj_id}).sort({"create_at": -1});
            cursor.toArray(function (err, docs) {
                cb(err, db, docs);
            });
        }
    ], function (err, db, docs) {
        db.close();
        // console.log(docs);
        maincb(err, docs);
    })
}



Comment.getByUserID = function (maincb) {
    
}
