var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = require('../settings').mongodbUrl;
var async = require('async');

/*
function Order(user_id, proj_id, proj_name, rw_id, rw_amout, payment, note, status) {
    // order id _id auto
    // this.user_id = user_id;

    this.user_id = user_id;
    this.proj_id = proj_id;

    this.proj_name = proj_name; // rarely changes
    this.rw_id = rw_id; // cannot changes
    this.rw_amout = rw_amout; // cannot changes

    this.payment = payment; // can be 'alipay' 'wechatpay' 'unionpay' 'coupon'
    this.note = note || "";

    this.status = status || 'topay'; // could be 'topay' 'paid' 'learning' 'refunding' 'refunded' 'canceled' 

    // date

}

user_id
proj_id
proj_name
rw_id
rw_amout
payment
note
status

*/

function Order(order) {
    this.user_id = order.user_id;
    this.proj_id = order.proj_id;
    this.proj_name = order.proj_name;
    this.rw_id = order.rw_id;
    this.rw_amout = order.rw_amout;
    this.payment = order.payment;
    this.note = order.note;
    this.status = order.status;
}


module.exports = Order;

Order.prototype.save = function (maincb) {
    var now = new Date();

    var order = {
        user_id: this.user_id,
        proj_id: this.proj_id,
        proj_name: this.proj_name,
        rw_id: this.rw_id,
        rw_amout: this.rw_amout,
        payment: this.payment,
        note: this.note,
        status: this.status,

        /**
         * 
         */

        history: {
            'created': now,
        },

    };

    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection('orders').insertOne(order, function (err, result) {
                console.log("[OK]Inserted a [order] into the orders.");
                cb(err, db, result.ops);
            });
        }
    ], function (err, db, doc) {
        db.close();
        maincb(err, doc);
    });
}


Order.getByProjID = function (maincb, proj_id) {

    if (proj_id.length !== 24) { //ObjectId("571f6d09621ff43d546d6752")
        return maincb('not an id')
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            var cursor = db.collection('orders').find({ "proj_id": proj_id });
            cursor.toArray(function (err, docs) {
                cb(err, db, docs);
            });
        }
    ], function (err, db, doc) {
        db.close();
        maincb(err, doc);
    })

}

Order.calculateRwBackers = function (orders) {
    // backers count backers_counts
    // {"0":"4","1":"5"}
    var res = {};
    orders.forEach(function (order, index) {
        if (res.hasOwnProperty(order.rw_id)) {
            res[order.rw_id] += 1;
        } else {
            res[order.rw_id] = 1;
        }
    });
    orders.bk_counts = res;
    
}