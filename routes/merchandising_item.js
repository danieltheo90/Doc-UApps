'use strict';
// app/routes.js
var express   = require("express");
var router    = express.Router();
var passport  = require("passport");
var MiddleWare  = require("../config/middleware/index");
var getData   = require('../helpers/getData');
var async     = require("async");
var req_promise = require('request-promise');
var Company   = require("../models/company");
var Dept    = require("../models/department");
var salesPrice    = require("../models/salesprice");
var ItemPicture   = require("../models/pictureitem");
const excel 	= require('node-excel-export');

var path        = require('path');
const multer 	= require('multer');
var sharp 		= require('sharp');

router.get("/",MiddleWare.isLoggedIn, function(req, res){

	var company = getData.getString(req.user.company);
	var options = {
	    uri: 'http://localhost:8080/api/items/list-items',
	    qs: {
		    company: req.query.company,
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
 	    uri: 'http://localhost:8080/api/items/item-category-code',
 	    qs: {
 		    company: company
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	 var options3 = {
 	    uri: 'http://localhost:8080/api/items/Manufacturer-code',
 	    qs: {
 		    company: company
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
		    	res.render('merchandising-item/md-item',{
	          item:results[1],
	          category:results[2],
	          brand:results[3],
	          company:results[0],
	          title: 'md-item',
	          company_name: req.query.company
	        });
	    }
    })
 });

router.post('/item_picture/:company_param', function(req, res) {
	var company = req.params.company_param;
	var storage	=	multer.diskStorage({
	 	destination: function (req, file, callback) {
	    	callback(null, `./public/img/${company}/item/`);
	  	},
	  	filename: function (req, file, callback) {
	    	callback(null, file.fieldname+path.extname(file.originalname));
	  	}
	});
	var upload = multer({
		storage : storage ,
		limits: { fileSize: 1000000 },
		fileFilter: function (req, file, callback) {
    		var ext = path.extname(file.originalname);
    		if(ext !== '.jpg') {
        		return callback(new Error('Only images are allowed'))
    		}
			callback(null, true)
		}
	}).any('itemPhoto');

	upload(req,res,function(err) {
		if(err) {
			let backURL=req.header('Referer') || '/';
  			return	res.redirect(backURL);
		}

		sharp(`./public/img/${company}/item/${req.files[0].filename}`)
            .resize(250,250)
            .toFile(`./public/img/${company}/item_small/${req.files[0].filename}`,(err1,info)=>{
                if(err1) console.log(err1);
        });
		let newItem =({
		   company: company,
		   item_no:  req.files[0].fieldname,
		   item_picture: req.files[0].filename
		  });
		 let options = { upsert: true, new: true, setDefaultsOnInsert: true };

		  ItemPicture.findOneAndUpdate({"item_no": req.files[0].fieldname}, {$set: newItem}, options, function(error, result) {
		    if(err){
		   	console.log(err);
		   		return res.send(err)
		    } else {
		      	let backURL=req.header('Referer') || '/';
  				res.redirect(backURL);
		    }
		  });

	});
})

//================================product & Spesific ======================================
router.get("/product_item_mongodb",MiddleWare.isLoggedIn, function(req, res){
	var companyparam = getData.getString(req.user.company);
	var deptCodeparam = getData.getString(req.user.department);
	 var options2 = {
 	    uri: 'http://localhost:8080/api/items/item-category-code',
 	    qs: {
 		    company: companyparam
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	var options3 = {
 	    uri: 'http://localhost:8080/api/items/Manufacturer-code',
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
	   		if(Object.keys(req.query).length !== 0){
	        	salesPrice.find(req.query)
		          .then(function (repos) {
		              callback(null,repos)
		          })
		          .catch(function (err) {
		              // API call failed...
		              res.send(err)
		    	});
	        }else{
	        	callback(null,null)
	        }
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
	 		if(req.device.type.toUpperCase() ==='DESKTOP'){
			   	res.render('merchandising-item/product-item-mongo',{
		        	item:results[0],
		        	category:results[1],
		        	brand:results[2],
		          	company: companyparam,
					department: deptCodeparam,
		          	title: 'product-item-mongo'
		        });
		  	 }else if(req.device.type.toUpperCase() ==='PHONE'){
		  	 	res.render('merchandising-item/product-item-mongo-mobile',{
		        	item:results[0],
		        	category:results[1],
		        	brand:results[2],
		          	company: companyparam,
					department: deptCodeparam,
		          	title: 'product-item-mongo'
		        });
		  	 }
	    }
    })
 });

router.get("/product_item",MiddleWare.isLoggedIn, function(req, res){
	var companyparam =getData.getString(req.user.company);
	var deptCodeparam =getData.getString(req.user.department);
	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-price',
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
 	    uri: 'http://localhost:8080/api/items/item-category-code',
 	    qs: {
 		    company: companyparam
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	var options3 = {
 	    uri: 'http://localhost:8080/api/items/Manufacturer-code',
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
	 		if(req.device.type.toUpperCase() ==='DESKTOP'){
		    	res.render('merchandising-item/product-item',{
	          	item:results[1],
	          	category:results[2],
	          	brand:results[3],
	          	company: companyparam,
				department: deptCodeparam,
	          	title: 'product-item'
	        	});
		    }else if(req.device.type.toUpperCase() ==='PHONE'){
		    	res.render('merchandising-item/product-item-mobile',{
	          	item:results[1],
	          	category:results[2],
	          	brand:results[3],
	          	company: companyparam,
				department: deptCodeparam,
	          	title: 'product-item'
	        	});
		    }
	    }
    })
 });

 router.get("/product_item/details/:company/:deptCode/:id",MiddleWare.isLoggedIn, function(req, res){
 			var options = {
			    uri: 'http://localhost:8080/api/items/list-items-price-detail',
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
						res.render('merchandising-item/product-item-show',{
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

//================================Item Card General & Spesific ======================================
router.get("/merchandising_item_card",MiddleWare.isLoggedIn, function(req, res){
	var company = getData.getString(req.user.company);

	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-general',
	    qs: {
		    company: req.query.company,
		    No_: req.query.no,
		   	"Description": req.query.description,
		    "[Item Category Code]": req.query.item_category,
		    "[Manufacturer Code]": req.query.item_brand
	    },
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true
	 };

	 var options2 = {
 	    uri: 'http://localhost:8080/api/items/item-category-code',
 	    qs: {
 		    company: company
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	 var options3 = {
 	    uri: 'http://localhost:8080/api/items/Manufacturer-code',
 	    qs: {
 		    company: company
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
		    	res.render('merchandising-item/md-item-card',{
	          item:results[1],
	          category:results[2],
	          brand:results[3],
	          company:results[0],
	          title: 'md-item-card'
	        });
	    }
    })
 });

//================================Item Card Purchasing & Standar Cost  ======================================
router.get("/item_card_sku",MiddleWare.isLoggedIn, function(req, res){
	var company = getData.getString(req.user.company);

	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-purchasing',
	    qs: {
		    company: req.query.company,
		    deptCode: req.query.dept,
		    No_: req.query.no,
		   	"Description": req.query.description,
		    "[Item Category Code]": req.query.item_category,
		    "[Manufacturer Code]": req.query.item_brand
	    },
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true
	 };

	 var options2 = {
 	    uri: 'http://localhost:8080/api/items/item-category-code',
 	    qs: {
 		    company: company
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	 var options3 = {
 	    uri: 'http://localhost:8080/api/items/Manufacturer-code',
 	    qs: {
 		    company: company
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
	    },
	     function(callback) {
	    	Dept.find({})
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
		    	res.render('merchandising-item/md-item-sku',{
	          item:results[1],
	          category:results[2],
	          brand:results[3],
	          company:results[0],
	          dept:results[4],
	          title: 'md-item-sku'
	        });
	    }
    })
 });

//================================Item Card Replenishment & Forecast  ======================================
router.get("/item_card_replenishment",MiddleWare.isLoggedIn, function(req, res){
	var company = getData.getString(req.user.company);

	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-replenishment',
	    qs: {
		    company: req.query.company,
		    deptCode: req.query.dept,
		    No_: req.query.no,
		   	"Description": req.query.description,
		    "[Item Category Code]": req.query.item_category,
		    "[Manufacturer Code]": req.query.item_brand
	    },
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true
	 };

	 var options2 = {
 	    uri: 'http://localhost:8080/api/items/item-category-code',
 	    qs: {
 		    company: company
 	    },
 	    headers: {
 	        'User-Agent': 'Request-Promise'
 	    },
 	    json: true
 	 };

	 var options3 = {
 	    uri: 'http://localhost:8080/api/items/Manufacturer-code',
 	    qs: {
 		    company: company
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
	    },
	     function(callback) {
	    	Dept.find({})
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
		    	res.render('merchandising-item/md-item-replenishment',{
	          item:results[1],
	          category:results[2],
	          brand:results[3],
	          company:results[0],
	          dept:results[4],
	          title: 'md-item-replenishment'
	        });
	    }
    })
 });

//================================Export Purchase Item List ==============================================
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
	//Array of objects representing heading rows (very top)

	//Here you specify the export structure
	const specification = {
	  No: { // <- the key should match the actual data key
	    displayName: 'Item No', // <- Here you specify the column header
	    headerStyle: styles.headerDark, // <- Header style
	    width: 120 // <- width in pixels
	  },
	  Description: {
	    displayName: 'Description',
	    headerStyle: styles.headerDark,
	    width: '50' // <- width in chars (when the number is passed as string)
	  },
	   Description2: {
	    displayName: 'Description2',
	    headerStyle: styles.headerDark,
	    // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
	    //   return (value == 1) ? 'Active' : 'Inactive';
	    // },
	    width: '50' // <- width in chars (when the number is passed as string)
	  },
	  ItemCategory: {
	    displayName: 'Item Category',
	    headerStyle: styles.headerDark,
	    // cellStyle: styles.cellPink, // <- Cell style
	    width: 110 // <- width in pixels
	  },
	  ManufactureCode: {
	    displayName: 'Item Brand',
	    headerStyle: styles.headerDark,
	    // cellStyle: styles.cellPink, // <- Cell style
	    width: 110 // <- width in pixels
	  }
	}
	// let companyParam = 'CRONUS';
	var options = {
	    uri: 'http://localhost:8080/api/items/list-items',
	    qs: {
		    company: req.query.company,
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
			  [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
			    {
			      name: 'merchandising Item List', // <- Specify sheet name (optional)
			     // heading: heading, // <- Raw heading array (optional)
			     // merges: merges, // <- Merge cell ranges
			      specification: specification, // <- Report specification
			      data: results // <-- Report data
			    }
			  ]
			);

	// You can then return this straight
			res.attachment('merchandising_item_list.xlsx'); // This is sails.js specific (in general you need to set headers)
			return res.send(report);
        })
        .catch(function (err) {
          	res.redirect('/merchandising_item');
        });
});
//===================================Export Excel Item card general =============================
router.get("/merchandising_item_card/excel/",MiddleWare.isLoggedIn, function(req, res){
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
	   Barcode: {
	    displayName: 'Barcode No',
	    headerStyle: styles.headerDark,
	    width: 120
	  },
	   VariantCode: {
	    displayName: 'Variant No',
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
	  DivisionCode: {
	    displayName: 'Division Code',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   ProductGroup: {
	    displayName: 'Product Group',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  ItemCategory: {
	    displayName: 'Item Category',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  ManufactureCode: {
	    displayName: 'Item Brand',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  UOM: {
	    displayName: 'UOM',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  InteriorFurniture: {
	    displayName: 'Interior Furniture',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Advertising: {
	    displayName: 'Advertising',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Aluminium: {
	    displayName: 'Aluminium',
	    headerStyle: styles.headerDark,
	    width: 110
	  }
	}
	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-general',
	    qs: {
		    company: req.query.company,
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
			      name: 'merchandising Item Card',
			      specification: specification,
			      data: results
			    }
			  ]
			);
		res.attachment('merchandising_item_card.xlsx');
			return res.send(report);
        })
        .catch(function (err) {
          	res.redirect('/merchandising_item/merchandising_item_card');
        });
});

//===================================Export Excel Item card Purchasing =============================
router.get("/item_card_sku/excel/",MiddleWare.isLoggedIn, function(req, res){
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
	   VariantCode: {
	    displayName: 'Variant No',
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
	  UOM: {
	    displayName: 'UOM',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  VendorNo: {
	    displayName: 'Vendor No.',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   VendorName: {
	    displayName: 'Vendor Name',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   PurchasePrice: {
	    displayName: 'Purchase Price',
	    headerStyle: styles.headerDark,
	    cellFormat: function(value, row) {
	      return value.toLocaleString();
	    },
	    width: 110
	  },
	  StandarCost: {
	    displayName: 'Standard Cost',
	    headerStyle: styles.headerDark,
	    cellFormat: function(value, row) {
	      return value.toLocaleString();
	    },
	    width: 110
	  }
	}
	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-purchasing',
	   	qs: {
		    company: req.query.company,
		    deptCode: req.query.dept,
		    No_: req.query.no,
		   	"Description": req.query.description,
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
			      name: 'Item Card sku',
			      specification: specification,
			      data: results
			    }
			  ]
			);
		res.attachment('sku_item_card_purchasing.xlsx');
			return res.send(report);
        })
        .catch(function (err) {
          	res.redirect('/merchandising/item_card_sku');
        });
});

//===================================Export Excel Item card Replenishment =============================
router.get("/item_card_replenishment/excel/",MiddleWare.isLoggedIn, function(req, res){
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
	   VariantCode: {
	    displayName: 'Variant No',
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
	  UOM: {
	    displayName: 'UOM',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  GrossWeight: {
	    displayName: 'Gross Weight',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   LeadTime: {
	    displayName: 'Lead Time',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	  SCD: {
	    displayName: 'SCD',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Januari: {
	    displayName: 'Januari',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Februari: {
	    displayName: 'Februari',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Maret: {
	    displayName: 'Maret',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   April: {
	    displayName: 'April',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Mei: {
	    displayName: 'Mei',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Juni: {
	    displayName: 'Juni',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Juli: {
	    displayName: 'Juli',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Agustus: {
	    displayName: 'Agustus',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   September: {
	    displayName: 'September',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Oktober: {
	    displayName: 'Oktober',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   November: {
	    displayName: 'November',
	    headerStyle: styles.headerDark,
	    width: 110
	  },
	   Desember: {
	    displayName: 'Desember',
	    headerStyle: styles.headerDark,
	    width: 110
	  }
	}
	var options = {
	    uri: 'http://localhost:8080/api/items/list-items-replenishment',
	   	qs: {
		    company: req.query.company,
		    deptCode: req.query.dept,
		    No_: req.query.no,
		   	"Description": req.query.description,
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
			      name: 'Item Card purchasing',
			      specification: specification,
			      data: results
			    }
			  ]
			);
		res.attachment('merchandising_item_card_replenishment.xlsx');
			return res.send(report);
        })
        .catch(function (err) {
          	res.redirect('/merchandising_item/item_card_replenishment');
        });
});

module.exports = router;
