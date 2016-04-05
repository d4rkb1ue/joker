var mongodb = require('./db');
var crypto = require('crypto');
var async = require('async');

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;

};

module.exports = User;

User.prototype.save = function(callback){
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,

	};
	async.waterfall([
		function(cb){
			mongodb.open(function(err,db){
				cb(err,db);
			});
		},
		function(db,cb){
			db.collection('users', function(err, collection){
				cb(err,collection);
			});
		},
		function(collection, cb){
			collection.insert(user, {
				safe:true
			},function(err,user){
				cb(err,user);
			});
		}
	],function(err,user){
		mongodb.close();
		callback(err,user[0]);
	});
};

User.getbyName = function(name, callback){
	async.waterfall([
		function(cb){
			mongodb.open(function(err,db){
				cb(err,db);
			});
		},
		function(db,cb){
			db.collection('users',function(err,collection){
				cb(err,collection);
			});
		},
		function(collection,cb){
			collection.findOne({
				name: name
			}, function(err,user){
				cb(err, user);
			});
		}
	], function(err,user){
		mongodb.close();
		callback(err,user);
	});
};


// key_value : {name: value}
User.getbyKey_Value = function(key_value, callback){
	async.waterfall([
		function(cb){
			mongodb.open(function(err,db){
				cb(err,db);
			});
		},
		function(db,cb){
			db.collection('users',function(err, cllt){
				cb(err,cllt);
			});
		},
		function(cllt,cb){
			cllt.findOne(key_value, function(err,user){
				cb(err,user);
			});
		}
	], function(err,user){
		mongodb.close();
		callback(err, user);
	});
};

User.getbyNameOrEmail = function(value, callback){
	User.getbyKey_Value({name: value},function(err, user){
		if(err){
			return callback(err);
		}
		if(user){
			return callback(null,user);
		}
		//没找到
		
		User.getbyKey_Value({email: value}, function(err,user){
			return callback(err,user);
		});
	});
};


