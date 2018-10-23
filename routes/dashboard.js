'use strict';
// app/routes.js
var express   = require("express");
var router    = express.Router();
var passport  = require("passport");
var MiddleWare  = require("../config/middleware/index");
var getData   = require('../helpers/getData');
var Company   = require("../models/company");

router.get('/',MiddleWare.isLoggedIn,function (req, res) {
	var role = getData.getString(req.user.role);
	
	if (role==="sales"){
		res.redirect("/dashboard-sales");
	}else if (role==="purchase"){
		res.redirect("/dashboard_purchase");
	}else if (role==="pos"){
		res.redirect("/dashboard_pos");
	}else{
		Company.find({}, function(err, data){
			if(err){
	       		req.flash('error', err);
	        	console.log(err);
	    	}else{ 
			res.render("dashboard/welcome",{
	       		title: 'welcome',
	       		company:data
			});
			}
		});
	};

});

module.exports = router;
