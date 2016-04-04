var express = require('express');

module.exports = function(app){
	app.get('/', function(req, res, next) {
		res.render('index');
	});
	app.get('/reg',function(req,res){
		res.render('reg');
	});
	app.post('/reg',function(req,res){
	});
};
