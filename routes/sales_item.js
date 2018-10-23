'use strict';
// app/routes.js
var express   = require("express");
var router    = express.Router();
var passport  = require("passport");
var MiddleWare  = require("../config/middleware/index");
var getData   = require('../helpers/getData');
var async     = require("async");
var req_promise = require('request-promise');
const excel = require('node-excel-export');
var Company   = require("../models/company");


router.get("/",MiddleWare.isLoggedIn, function(req, res){
	var companyparam =getData.getString(req.user.company);
	var deptCodeparam =getData.getString(req.user.department);
	var options = {
	    uri: 'http://10.29.87.5:8080/api/items/list-items-price',
	    qs: {
		    company: req.query.company,
		    deptCode: req.query.department,
		    No_: req.query.no,
		   	Description: req.query.description,
		    "[Item Category Code]": req.query.item_category,
		    "[Manufacturer Code]": req.query.item_brand
	    },
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true
	 };
	 var options2 = {
 	    uri: 'http://10.29.87.5:8080/api/items/item-category-code',
 	    qs: {
 		    company: companyparam
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	var options3 = {
 	    uri: 'http://10.29.87.5:8080/api/items/Manufacturer-code',
 	    qs: {
 		    company: companyparam
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };



 	 async.series([
	    function(callback) {
	    	Company.find({})
	          .then(function (repos) {
	              callback(null,repos)
	          })
	          .catch(function (err) {
	              // API call failed...
	              res.send(err)
	        });
	    },function(callback) {
	      req_promise(options)
	        .then(function (repos) {
	            callback(null,repos)
	        })
	        .catch(function (err) {
	            // API call failed...
	            res.send(err)
	      });
			},function(callback) {
			 req_promise(options2)
				 .then(function (repos) {
						 callback(null,repos)
				 })
				 .catch(function (err) {
						 // API call failed...
						 res.send(err)
			 });
		 },function(callback) {
		 req_promise(options3)
			 .then(function (repos) {
					 callback(null,repos)
			 })
			 .catch(function (err) {
					 // API call failed...
					 res.send(err)
		 });
	    }
	 ], function (err, results) {
	 	if(err){
	 		res.send(err);
	 	}else{
		    	res.render('sales-item/sales-item',{
	          item:results[1],
	          category:results[2],
	          brand:results[3],
	          company: companyparam,
						department: deptCodeparam,
	          title: 'sales-item'
	        });
	    }
    })
 });


 router.get("/details/:company/:deptCode/:id",MiddleWare.isLoggedIn, function(req, res){
 			var options = {
			    uri: 'http://10.29.87.5:8080/api/items/list-items-price-detail',
			    qs: {
				    company: req.params.company,
				    deptCode: req.params.deptCode,
				    No_: req.params.id
			    },
			    headers: {
			        'User-Agent': 'Request-Promise'
			    },
			    json: true
			 };
			req_promise(options)
		        .then(function (results) {
							console.log(results);
						res.render('sales-item/sales-item-show',{
		          item:results,
		          title: 'sales-item',
							company_name:req.params.company,
							item_no:req.params.id,
							department:req.params.deptCode
		        });
		        })
		        .catch(function (err) {
		          	res.redirect('/sales_item');
		        });

		});


router.get("/excel/",MiddleWare.isLoggedIn, function(req, res){
	const styles = {
	  headerDark: {
	    fill: {
	      fgColor: {
	        rgb: 'E0FFFF'
	      }
	    },
	    font: {
	      color: {
	        rgb: '000000'
	      },
	      sz: 14,
	      bold: true
	    }
	  },
	  cellPink: {
	    fill: {
	      fgColor: {
	        rgb: 'FF4500'
	      }
	    }
	  },
	  cellGreen: {
	    fill: {
	      fgColor: {
	        rgb: 'FF4500'
	      }
	    }
	  }
	};

	const specification = {
	  No: {
	    displayName: 'Item No',
	    headerStyle: styles.headerDark,
	    width: 120
	  },
	  Description: {
	    displayName: 'Description',
	    headerStyle: styles.headerDark,
	    width: '50'
	  },
	   Description2: {
	    displayName: 'Description2',
	    headerStyle: styles.headerDark,
	    width: '50'
	  },
	   price: {
	    displayName: 'Retail Price',
	    headerStyle: styles.headerDark,
	    cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
	      return value.toLocaleString();
	    },
	    width: 110
	  },
	   UOM: {
	    displayName: 'UOM',
	    headerStyle: styles.headerDark,
	    width: 110
	  }
	}
	//var company = getData.getString(req.user.company);
	//var deptCode = getData.getString(req.user.department);
	var options = {
	    uri: 'http://10.29.87.5:8080/api/items/list-items-price',
	    qs: {
		    company: req.query.company,
		    deptCode: req.query.department,
		    No_: req.query.no,
		   	Description: req.query.description,
		    "[Item Category Code]": req.query.item_category,
		    "[Manufacturer Code]": req.query.item_brand
	    },
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true
	 };
	req_promise(options)
        .then(function (results) {

	        const report = excel.buildExport(
			  [
			    {
			      name: 'Sales Item List',
			      specification: specification,
			      data: results
			    }
			  ]
			);
			res.attachment('sales_item_list.xlsx');
			return res.send(report);
        })
        .catch(function (err) {
          	res.redirect('/sales_item');
        });

});


module.exports = router;
