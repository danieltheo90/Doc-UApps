'use strict';
// app/routes.js
var express   = require("express");
var router    = express.Router();
var passport  = require("passport");
var MiddleWare  = require("../config/middleware/index");

router.get('/',MiddleWare.isLoggedIn,function (req, res) {
    res.render('dashboard/sales',{
      title:'sales'
    });
});

module.exports = router;
