var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = require('../settings').mongodbUrl;
var async = require('async');
var rightpad = require('pad-right');
var Comment = require('./comment');


function Project_funding(title, short_blurb, category, funding_goal
    , funding_duration, videourl, author_name
    , author_bio, author_email, author_contact
    , author_location, email_append, risk_challenges
    , description, rewards
    , author_id, feature_image_filename, author_photo_filename) {



    this.title = title;
    this.short_blurb = short_blurb;
    this.category = category;
    this.funding_goal = funding_goal;
    this.funding_duration = funding_duration;

    this.video = videourl;

    this.author_name = author_name;
    this.author_bio = author_bio;
    this.author_email = author_email;
    this.author_contact = author_contact;
    this.author_location = author_location;
    this.email_append = email_append;
    this.risk_challenges = risk_challenges; // 备注
    this.description = description;
    this.rewards = rewards;

    this.author_id = author_id;

    this.feature_image = feature_image_filename;
    this.author_photo = author_photo_filename;

    // this.author_link = author_link; //should be [], include weibo, wechat, etc. can be parsed by url into icons



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
    var now = new Date();
    var project_funding = {


        //Project_funding
        title: this.title,
        description: this.description,
        author_id: this.author_id, //the _id of user

        feature_image: this.feature_image,
        short_blurb: this.short_blurb,
        category: this.category,
        funding_goal: this.funding_goal,
        funding_duration: this.funding_duration,
        rewards: this.rewards, //should be [{amount: ,title: ,info: , limit: ,},..]
        video: this.video, //url
        risk_challenges: this.risk_challenges,

        author_name: this.author_name,
        author_photo: this.author_photo,

        // author_link: this.author_link, //should be [], include weibo, wechat, etc. can be parsed by url into icons

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
        // backers: [], //should be [{user._id:_id, reward: type, time: date},{..}]

        current_amount: 0,

        comments_count: 0,
        // comments: [],

        watcher_count: 0, // 关注者
        watchers: [],

        /**
         * create_at : when author hand in.
         * start_at : when admin authorized. The actual time when it start being funding
         */
        create_at: now,
        start_at: now,
        update_times_count: 0,
        last_updated_at: new Date(),
        /**
         title,description,author_id,feature_image,short_blurb,category,funding_goal,funding_duration,rewards,video,risk_challenges,author_name,author_photo,author_bio,author_location,author_contact,author_email,email_append,is_verified,is_deleted,is_good,update_info,pv,backers_count,current_amount,comments_count,comments,watcher_count,watchers,create_at,start_at,update_times_count,last_updated_at
         */

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
        function (db, cb) {
            db.collection('project_funding').insertOne(project_funding, function (err, result) {
                console.log("[OK]Inserted a [project_funding] into the project_funding.");
                cb(err, db, result.ops);
            });
        }
    ], function (err, db, doc) {
        db.close();
        maincb(err, doc);
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
/**
 * get all project_funding include all states, sorted by created time, recently first
 * @param findPara find({?})
 * @param [sortPara] find.sort({?}) //default: {"create_at": -1}
 * @param maincb(err,docs)
 */
Project_funding.get = function (findPara, sortPara, maincb) {
    var inside_sortPara = sortPara;
    var inside_maincb = maincb;
    if (arguments.length === 2) {
        inside_sortPara = { "create_at": -1 };
        // 第2个参数就是callback
        inside_maincb = sortPara;
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            var cursor = db.collection('project_funding').find(findPara).sort(inside_sortPara);
            //cursor.toArray() : Returns an array of documents.
            cursor.toArray(function (err, docs) {
                cb(err, db, docs);
            });
        },
        function (db, docs, cb) {
            docs.forEach(Project_funding.calculate);
            cb(null, db, docs);
        }
    ], function (err, db, docs) {
        db.close();
        inside_maincb(err, docs);
    })

}

Project_funding.pretty = function (docs) {
    var category = {
        "lib" : "文学历史",
        "sci" : "数学理工",
        "finance" : "金融管理",
        "tech" : "数码科技",
        "arts" : "艺术美术",
        "health" : "医学心理",
        "edu" : "心理教育",
        "other" : "其他"
    };
        
    docs.forEach(function (project, index) {
        project.category = category[project.category];
    });

}
/**
 * get only {title, author_name, short_blurb, feature_image, category,
 *          funding_goal, funding_duration, backers_count, current_amount,
 *          _id, start_at
 *          also calculate:
 *          days_to_go, funded_percent}
 *
 * 
 * 
 * @param findPara find({?})
 * @param [sortPara] find.sort({?}) //default: {"create_at": -1}
 * @param maincb(err,docs)
 */
Project_funding.getMiniInfo = function (findPara, sortPara, maincb) {
    var inside_sortPara = sortPara;
    var inside_maincb = maincb;
    if (arguments.length === 2) {
        inside_sortPara = { "create_at": -1 };
        // 第2个参数就是callback
        inside_maincb = sortPara;
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            var cursor = db.collection('project_funding').find(findPara, {
                title: 1, author_name: 1,
                short_blurb: 1, feature_image: 1, category: 1,
                funding_goal: 1, funding_duration: 1, backers_count: 1,
                current_amount: 1, start_at: 1
            }).sort(inside_sortPara);
            //cursor.toArray() : Returns an array of documents.
            cursor.toArray(function (err, docs) {
                cb(err, db, docs);
            });
        },
        /**
         * also calculate:
         *          days_to_go, funded_percent}
         */
        function (db, docs, cb) {
            docs.forEach(Project_funding.calculate);
            cb(null, db, docs);
        }
    ], function (err, db, docs) {
        db.close();
        inside_maincb(err, docs);
    })

}
/**
 * @param fields like: {title:1,  author_name:1}
 * @param findPara find({?})
 * @param [sortPara] find.sort({?}) //default: {"create_at": -1}
 * @param maincb(err,docs)
 */
Project_funding.getSpecificInfo = function (findPara, sortPara, fields, maincb) {
    var inside_sortPara = sortPara;
    var inside_fields = fields;
    var inside_maincb = maincb;

    if (arguments.length === 3) {
        inside_sortPara = { "create_at": -1 };
        inside_fields = sortPara;
        inside_maincb = fields;
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            var cursor = db.collection('project_funding').find(findPara, inside_fields).sort(inside_sortPara);
            //cursor.toArray() : Returns an array of documents.
            cursor.toArray(function (err, docs) {
                cb(err, db, docs);
            });
        }

    ], function (err, db, docs) {
        db.close();
        inside_maincb(err, docs);
    })

}
/**
 * @param findPara find({?})
 * @param maincb(err,docs)
 */
Project_funding.getByID = function (_id, maincb) {

    if (!_id || _id.length !== 24) { //ObjectId("571f6d09621ff43d546d6752")
        console.dir("id = " + _id);
        return maincb('no an id')
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            var cursor = db.collection('project_funding').find({ "_id": new ObjectId(_id) }).limit(1);
            //cursor.toArray() : Returns an array of documents.
            cursor.next(function (err, doc) {
                cb(err, db, doc);
            });
        },
        function (db, doc, cb) {
            Project_funding.calculate(doc);
            cb(null, db, doc);
        }
    ], function (err, db, doc) {
        db.close();
        maincb(err, doc);
    })

}

/**
 *  millsecs_to_go, funded_percent, print_to_go
 */
Project_funding.calculate = function (doc) {
    doc.funded_percent = (doc.current_amount / doc.funding_goal * 100).toFixed(1);
    var now = new Date();
    var millsec = doc.funding_duration * 24 * 60 * 60 * 1000 - now.getTime() + doc.start_at.getTime();
    var hours = millsec / 1000 / 60 / 60;
    doc.millsecs_to_go = millsec;
    doc.print_to_go = hours > 24 ? (Math.floor(hours / 24).toString() + '天') : (Math.floor(hours).toString() + '小时');
}


/**
 * json parse rewards
 */

Project_funding.parseRw = function (project_funding) {
    var rw = JSON.parse(project_funding.rewards);
    project_funding.parsedRw = rw;

}

Project_funding.addBacker = function (_id, amount, maincb) {
    if (!_id || !amount) {
        maincb('err: _id or amount undefined');
    }
    if (amount.constructor === String) {
        amount = Number.parseFloat(amount);
        if (!amount) {
            maincb('err: amount is not a number/right string');
        }
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection('project_funding').updateOne(
                { "_id": new ObjectId(_id) },
                {
                    $inc: { "backers_count": 1, "current_amount": amount },
                    $currentDate: { "lastBack": true }
                },
                function (err, result) {
                    cb(err, db, result);
                }
            );
        }
    ], function (err, db, result) {
        db.close();
        maincb(err, result);
    })
}

Project_funding.addComment = function(_id,maincb){
    if (!_id) {
        maincb('err: _id undefined');
    }
    async.waterfall([
        function (cb) {
            MongoClient.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db,cb) {
            db.collection('project_funding').updateOne(
                { "_id": new ObjectId(_id) },
                {
                    $inc: { "comments_count": 1},
                    $currentDate: { "lastComment": true }
                },
                function (err, result) {
                    cb(err, db, result);
                }
            );
        }
    ],function (err,db,result) {
        db.close();
        maincb(err,result);
    })
}



