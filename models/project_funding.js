var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = require('../settings').mongodbUrl;
var async = require('async');


function Project_funding(title, description, author_id, feature_image, short_blurb,
                         project_category, funding_goal, funding_duration, reward, video,
                         risk_challenges, author_name, author_photo, author_link, 
                         author_bio, author_location, author_contact, author_email, 
                         email_append) {

    this.title = title;
    this.description = description;
    this.author_id = author_id;

    this.feature_image = feature_image; //url
    this.short_blurb = short_blurb;
    this.category = project_category;
    this.funding_goal = funding_goal;
    this.funding_duration = funding_duration;
    this.reward = reward; //should be [{amount: ,title: ,info: , limit: ,},..]
    this.video = video; //url
    this.risk_challenges = risk_challenges;

    this.author_name = author_name;
    this.author_photo = author_photo;
    this.author_link = author_link; //should be [], include weibo, wechat, etc. can be parsed by url into icons
    this.author_bio = author_bio; //infomations
    this.author_location = author_location;

    this.author_contact = author_contact;

    //can be default set to author.user.email
    this.author_email = author_email;

    //when user make a order, this will be send to customer with the confirm email.
    this.email_append = email_append;

}

module.exports = Project_funding;

Project_funding.prototype.save = function (maincb) {
    // var date = new Date();
    // var time = {
    //     date: date,
    //
    //     year: date.getFullYear(),
    //     month: (date.getMonth() + 1),
    //     day: date.getDate(),
    //
    //     print_day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    //     print_minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
    //     date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
    // };
    var project_funding = {

        //Project_funding
        title: this.title,
        description: this.description,
        author_id: this.author_id, //the _id of user

        feature_image: this.feature_image, //url
        short_blurb: this.short_blurb,
        categroy: this.category,
        funding_goal: this.funding_goal,
        funding_duration: this.funding_duration,
        reward: this.reward, //should be [{amount: ,title: ,info: , limit: ,},..]
        video: this.video, //url
        risk_challenges: this.risk_challenges,

        author_name: this.author_name,
        author_photo: this.author_photo,
        author_link: this.author_link, //should be [], include weibo, wechat, etc. can be parsed by url into icons
        author_bio: this.author_bio,//infomations
        author_location: this.author_location,

        author_contact: this.author_contact,
        author_email: this.author_email,
        email_append: this.email_append,

        //----others----
        //admin
        is_verified: false,
        is_deleted: false,
        is_good: false,

        //after published
        update_info: [], //should be [time: ,content:]

        //auto
        pv: 0, //default 0

        backers_count: 0, //default 0
        backers: [], //should be user._id

        current_amount: 0,

        comments_count: 0,
        comments: [],

        create_at: new Date(),
        update_times_count: 0,
        last_updated_at: new Date(),

    };
    /**
     * 使用async重写.原来的代码实在不具可读性.
     */
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db,cb) {
            db.collection('project_funding').insertOne(project_funding, function (err, result) {
                console.log("[OK]Inserted a [project_funding] into the project_funding.");
                cb(err, db, result.ops);
            });
        }
    ],function (err,db, doc) {
        db.close();
        maincb(err,doc);
    })
    
    // var insertProjectFunding = function (db, callback) {
    //     db.collection('project_funding').insertOne(project_funding, function (err, result) {
    //         console.log("[OK]Inserted a [project_funding] into the project_funding.");
    //         callback(err, result.ops);
    //     });
    // };
    // //执行
    // MongoClient.connect(url, function (err, db) {
    //     assert.equal(null, err);
    //     insertProjectFunding(db, function (err, user) {
    //         db.close();
    //         maincb(err, user);
    //     });
    // });

}

Project_funding.getAllBasicInfo = function (callback) {

}
Project_funding.getAll = function (callback) {

}
Project_funding.get = function (para, cb) {
    // var findProjecFunding = function (db,callback) {
    //     var cursor = db.collection('project_funding').fund(para);
    //
    // }
}