var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = require('../settings').mongodbUrl;
var async = require('async');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

User.prototype.save = function (miancb) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,

    };
    /**
     * 使用async重写.原来的代码实在不具可读性.
     */
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db)
            });
        },
        function (db, cb) {
            db.collection('users').insertOne(user, function (err, result) {
                console.log("[OK]Inserted a [user] into the users.");
                cb(err, db, result.ops); //7
            });
        },
    ], function (err,db,user) {
        db.close();
        miancb(err,user);
    })
    // var insertUser = function (db, callback) { //3
    //     db.collection('users').insertOne(user, //4
    //         function (err, result) {  //5
    //             console.log("[OK]Inserted a [user] into the users.");
    //             //result.ops is the doc just inserted
    //             // console.dir(result.ops); //6
    //             callback(err, result.ops); //7
    //         });
    // };
    // //执行 1,2,3 是该行代码被执行的顺序
    // MongoClient.connect(url, //1
    //     function (err, db) { //2
    //         assert.equal(null, err);
    //         insertUser(db, //3
    //             function (err, user) { //7
    //                 db.close();
    //                 miancb(err, user);
    //             });
    //     });
};

User.get = function (para, maincb) {
    /**
     * 使用async重写.
     */
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err,db) {
                cb(err,db);
            })
        },
        function (db,cb) {
            var cursor = db.collection('users').find(para).limit(1);
            cursor.next(function (err, user) {
                cb(err, db, user);
            });
        }
    ],function (err,db,user) {
        db.close();
        maincb(err,user);
    });

    // var findUsers = function (db, callback) {
    //     var cursor = db.collection('users').find(para).limit(1);
    //     cursor.next(function (err, user) {
    //         maincb(err, user);
    //     })
    // };
    // //执行
    // MongoClient.connect(url, function (err, db) {
    //     assert.equal(null, err);
    //     findUsers(db, function () {
    //         db.close();
    //     });
    // });
};

User.getbyName = function (name, cb) {
    User.get({"name": name}, cb);
};
User.getbyNameOrEmail = function (value, cb) {
    User.get({"name": value}, function (err, user) {
        if (err) {
            return cb(err);
        }
        if (user) {
            return cb(null, user);
        }
        //去找email
        User.get({"email": value}, function (err, user) {
            return cb(err, user);
        });
    });
}


