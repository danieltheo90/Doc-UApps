'use strict';
// app/routes.js
var express   = require("express");
var router    = express.Router();
var passport  = require("passport");
var MiddleWare  = require("../config/middleware/index");
var Company   = require("../models/company");

router.get('/',MiddleWare.isLoggedIn,function (req, res) {
	
    res.render('dashboard/purchase',{
      title:'purchase'
    });
});

module.exports = router;
