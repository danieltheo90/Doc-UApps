//'use strict';

// app/routes.j
var express   = require("express");
var router    = express.Router();
var MiddleWare  = require("../middleware/index");
var validator = require('express-validator');
var Company   = require("../models/company");
var Dept    = require("../models/department");
var User     = require("../models/user");
var Role     = require("../models/role");
var async     = require("async");
var aclJson   = require("../config/acl.json");
//var req_promise = require('request-promise');
var fs = require('fs');
//var getData   = require('../helpers/getData');

//======================================== Company ===============================================
// show company
router.get('/company',MiddleWare.isLoggedIn,function (req, res) {
  Company.find({}, function(err, data){
      if(err){
        req.flash('error', err);
        console.log(err);
      } else {
        res.render('settings/company/company',{
          company:data,
          title: 'company'
        });
      }
  });
});

// show single company
router.get('/viewcompany/:id',MiddleWare.isLoggedIn, function(req,res) {
  Company.findOne({
    _id:req.params.id
  })
  .then(function(data) {
      res.render('settings/company/viewcompany', {
        company:data,
        title: 'company'
      });
  });
});

// add company
router.get('/addcompany',MiddleWare.isLoggedIn,function (req, res) {
    res.render('settings/company/addCompany',{
      title: 'company'
    });
});


// add company process
router.post("/addcompany",MiddleWare.isLoggedIn, function(req, res){

  req.checkBody('code','Column Code is Empty !!').notEmpty();
  req.checkBody('description','Column Description is Empty !!').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    return res.render("settings/company/addCompany", {
      error: errors,
      title: 'company'
    });
  }
  let newCompany =({
    code: req.body.code,
    description: req.body.description,
    address: req.body.address,
    address1: req.body.address1,
    phone: req.body.phone,
    vatregistration: req.body.vatregistration,
    vatname: req.body.vatname,
    vataddress: req.body.vataddress,
    vataddress1: req.body.vataddress1,
    vatinvoiceauthorizedname: req.body.vatinvoiceauthorizedname,
    vatinvoiceauthorizedposition: req.body.vatinvoiceauthorizedposition
  });
  Company.create(newCompany, function(err, newlyCreated){
    if(err){
      req.flash('error', err);
      return res.redirect("/settings/addcompany");
    } else {
      req.flash("success", "Successfully ! With CODE: "  + req.body.code);
      res.redirect("/settings/company");
    }
  });
});

// Delete compony
router.delete('/delete-company/:id',MiddleWare.isLoggedIn, function(req,res){
  Company.findByIdAndRemove({_id:req.params.id}, function(err, deleted){
    if(err){
        req.flash('error', err);
        return res.redirect("/settings/company");
    } else {
        req.flash('success', 'Successfully Delete! Company Code: '+ deleted.code);
        return res.redirect("/settings/company");
    }
  });
});

// Edit Company
router.get('/edit-company/:id',MiddleWare.isLoggedIn, function(req,res){
  Company.findOne({_id:req.params.id},function (err,data) {
    if(err){
      console.log(err);
    } else {
      res.render('settings/company/editCompany',{
        company:data,
        title:'company'
      });
    }
  });
});

// Edit Company Process
router.put('/editcompany/:id',MiddleWare.isLoggedIn, function(req, res){
  Company.findOne({
    _id:req.params.id
  })
  .then (company => {
  // New value
    company.description= req.body.description;
    company.address= req.body.address;
    company.address1= req.body.address1;
    company.phone= req.body.phone;
    company.vatregistration= req.body.vatregistration;
    company.vatname= req.body.vatname;
    company.vataddress= req.body.vataddress;
    company.vataddress1= req.body.vataddress1;
    company.vatinvoiceauthorizedname= req.body.vatinvoiceauthorizedname;
    company.vatinvoiceauthorizedposition= req.body.vatinvoiceauthorizedposition;

  company.save()
    .then(company => {
      req.flash("success", "Successfully Update ! With Description : "+req.body.description);
      res.redirect('/settings/company');
    });
  });
});
//======================================== DeptCode ===============================================
// show departement
router.get('/department',MiddleWare.isLoggedIn,function (req, res) {
  Dept.find({}, function(err, data){
    if(err){
      req.flash('error', err);
      console.log(err);
    } else {
      res.render('settings/department/department',{
        dept:data,
        title: 'department'
      });
    }
  });
});

// add departement
router.get('/add-department',MiddleWare.isLoggedIn,function (req, res) {
    res.render('settings/department/addDepartment',{
      title: 'department'
    });
});

// add departement process
router.post("/add-department",MiddleWare.isLoggedIn, function(req, res){

  req.checkBody('code','Column Code is Empty !!').notEmpty();
  req.checkBody('description','Column Description is Empty !!').notEmpty();

  let errors = req.validationErrors();
  if (errors) {
      return res.render("settings/departement/addDepartment", {
        error: errors,
        title: 'department'
      });
  }
    var newDept = ({
      code: req.body.code,
      description: req.body.description,
    });

    Dept.create(newDept, function(err, newlyCreated){
      if(err){
        req.flash('error', err);
        return res.redirect("/settings/add-department");
      } else {
        req.flash("success", "Successfully ! With CODE: "  + req.body.code);
        res.redirect("/settings/department");
      }
    });
});

// Edit departement
router.get('/edit-department/:id',MiddleWare.isLoggedIn, function(req,res){
  Dept.findOne({_id:req.params.id},function (err,data) {
    if(err){
      console.log(err);
    } else {
      res.render('settings/department/editDepartment',{
        dept:data,
        title: 'department'
      });
    }
  });
});

// Edit departement Process
router.put('/edit-department/:id',MiddleWare.isLoggedIn, function(req, res){
  Dept.findOne({
    _id:req.params.id
  })
  .then (dep => {
  // New value
    dep.description= req.body.description;

  dep.save()
    .then(dep => {
      req.flash("success", "Successfully Update ! With Description : "+req.body.description);
      res.redirect('/settings/department');
    });
  });
});


// Delete Departement
router.delete('/delete-department/:id',MiddleWare.isLoggedIn, function(req,res){
  Dept.findByIdAndRemove({_id:req.params.id}, function(err, deleted){
    if(err){
        req.flash('error', err);
        return res.redirect("/settings/department");
    } else {
        req.flash('success', 'Successfully Delete! Department Code: '+ deleted.code);
        return res.redirect("/settings/department");
    }
  });
});
//======================================== Role ===============================================
// show user role
router.get('/role',MiddleWare.isLoggedIn,function (req, res) {

  Role.find({}, function(err, data){
    if(err){
      req.flash('error', err);
      console.log(err);
    } else {
      res.render('settings/role/role',{
        role:data,
        title: 'role'
      });
    }
  });
});

// add role
router.get('/add-role',MiddleWare.isLoggedIn,function (req, res) {

    let access    = aclJson;
    let codeRole  = 'administrator'

    var roleGroup =access.filter((data) => data.group === codeRole);
    res.render('settings/role/addRole',{
      title: 'role',
      dataRole: roleGroup
    });
    //console.log(roleGroup);
});

// add role process
router.post("/add-role",MiddleWare.isLoggedIn, function(req, res){

  req.checkBody('code','Column Code is Empty !!').notEmpty();
  req.checkBody('description','Column Description is Empty !!').notEmpty();

  let errors = req.validationErrors();
  if (errors) {
      return res.render("settings/role/addRole", {
        error: errors,
        title: 'role'
    });
  }
  let newRole = ({
    code: req.body.code[0],
    description: req.body.description,
  });

  Role.create(newRole, function(err, newlyCreated){
    if(err){
      req.flash('error', err);
      console.log(err)
    } else {
      var dataTable = fs.readFileSync('./config/acl.json');
      var arrResource = req.body.resource;
      var arrMethod = req.body.methods;
      var code = req.body.code;
      var data = {};
      var arr=[];
      data.permissions=[];

      code.forEach(function(k){
          data.group = k;
          arrResource.forEach(function(i){
            if (i !== "") {
              var objhttps=[];
              arrMethod[i].forEach(function(l){
                if (l !== "") {
                  var objTemp={
                    http:l
                  }
                }else{
                  return;
                }
                objhttps.push(objTemp);
              })
              var obj={
                resource:i
                ,methods :objhttps
              }
            }else{
              return;
            }
            data.permissions.push(obj);
          })
          try {
            var dataTable = fs.readFileSync('./config/acl.json');
            arr = JSON.parse(dataTable);
          } catch (e) {
            //return;
          }
          var duplicateGroup = arr.filter((data) => data.group === k);
          if (duplicateGroup == 0) {
            arr.push(data);
            fs.writeFileSync('./config/acl.json', JSON.stringify(arr));

          }
      })
      req.flash("success", "Successfully ! With Role Code: "  + req.body.code[0]);
      res.redirect("/settings/role");
    }
  });
});

// Edit roleuser
router.get('/edit-role/:id',MiddleWare.isLoggedIn, function(req,res){
   Role.findOne({_id:req.params.id},function (err,data) {
    if(err){
      console.log(err);
    } else {
      var access = aclJson;
      var codeRole = data.code;

      var code = data.code;
      var dataTable = fs.readFileSync('./config/acl.json');
      arr = JSON.parse(dataTable);
      var getData = arr.filter((data) => data.group !== code);
      //console.log(code,duplicateGroup);
      delete getData;
      //arr.push(duplicateGroup);
      fs.writeFileSync('./config/acl.json', JSON.stringify(getData));

      var adminGroup =access.filter((data) => data.group === "administrator");
      res.render('settings/role/editRole',{
        role:data,
        title: 'role',
        newRoleData: adminGroup
      });
    }
  });
});

// Edit roleuser Process
router.put('/editroleuser/:id',MiddleWare.isLoggedIn, function(req, res){
  Role.findOne({
    _id:req.params.id
  })
  .then (role => {
  // New value
    role.description= req.body.description;

  role.save()
    .then(role => {
      req.flash("success", "Successfully Update !  With Description : "+req.body.description);

      var data = {}
      var arr=[]
      data.permissions=[]
      var arrResource = req.body.resource;
      var arrMethod = req.body.methods ;
      var code = req.body.code;
      //
      // var dataTable = fs.readFileSync('./config/acl.json');
      // arr = JSON.parse(dataTable);
      // var duplicateGroup = arr.filter((data) => data.group !== req.body.code[0]);
      // delete duplicateGroup;
      //
      // fs.writeFileSync('./config/acl.json', JSON.stringify(duplicateGroup));

      code.forEach(function(k){
          data.group = k;
          arrResource.forEach(function(i){
            if (i !== "") {
              var objhttps=[]
              arrMethod[i].forEach(function(l){
                if (l !== "") {
                 var objTemp={
                    http:l
                  }
                }else{
                  return;
                }
                objhttps.push(objTemp);
              })

              var obj={
                resource:i
                ,methods :objhttps
              }
            }else{
              return;
            }
            data.permissions.push(obj);
          })
          try {
            var dataTable = fs.readFileSync('./config/acl.json');
            arr = JSON.parse(dataTable);
          } catch (e) {
            //return;
          }
          var duplicateGroup = arr.filter((data) => data.group === k);
          if (duplicateGroup == 0) {
            arr.push(data);
            fs.writeFileSync('./config/acl.json', JSON.stringify(arr));
            //res.send('success');
          }
      })
    res.redirect('/settings/role');
    });
  });

});

// show single role
router.get('/viewrole/:id',MiddleWare.isLoggedIn, function(req,res){
   Role.findOne({_id:req.params.id},function (err,data) {
    if(err){
      console.log(err);
    } else {
      
      var access = aclJson;
      var access2 = aclJson;
      var codeRole = data.code

      var adminGroup =access.filter((data) => data.group === "administrator");
      var roleGroup =access2.filter((data) => data.group === codeRole);
      //console.log(roleGroup);
      res.render('settings/role/show',{
        role:data,
        title: 'role',
        dataRole: roleGroup,
        newRoleData: adminGroup
      });
    }
  });
});

// Delete Role User
router.delete('/delete-role/:id',MiddleWare.isLoggedIn, function(req,res){
   Role.findByIdAndRemove({_id:req.params.id}, function(err, deleted){
    if(err){
        req.flash('error', err);
        return res.redirect("/settings/role");
    } else {
        req.flash('success', 'Successfully Delete! Role Code: '+ deleted.code);

        var code = deleted.code;
        var dataTable = fs.readFileSync('./config/acl.json');
        arr = JSON.parse(dataTable);
        var getData = arr.filter((data) => data.group !== code);
        //console.log(code,duplicateGroup);
        delete getData;
        //arr.push(duplicateGroup);

        fs.writeFileSync('./config/acl.json', JSON.stringify(getData));
        return res.redirect("/settings/role");
    }
  });

});
//======================================== User Profile ===============================================
// show User Profile
router.get('/userprofile',MiddleWare.isLoggedIn,function (req, res) {
  User.find().exec(function(err, allUser){
  //.populate('company', 'code', Company).populate('department', 'code', Dept).exec(function(err, allUser){
     if(err){
         console.log(err);
     } else {
          res.render("settings/userprofile/userprofile",{
            user:allUser,
            title: 'userprofile'
          });
      }
    });
});

// add userprofile
router.get("/:id/edit-userprofile", MiddleWare.isLoggedIn, function(req, res){

    async.series([
      done => Company.find({}, done),
      done => Role.find({}, done),
      done => Dept.find({}, done),
      done => User.findById(req.params.id, done),
    ], (err, results) => {
        res.render("settings/userprofile/edit", {
          user: results[3],
          role: results[1],
          company:results[0],
          dep:results[2],
          title: 'userprofile'
        });
    })
});

router.put("/:id/edit-userprofile",MiddleWare.isLoggedIn, function(req, res){
  let newData = {
    company: req.body.company,
    department: req.body.department,
    role: req.body.role
  };
  User.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, role){
      if(err){
          req.flash('error', err);
          res.redirect("back");
      } else {
          req.flash("success","Successfully Updated!  With Email : "+req.body.email);
          res.redirect("/settings/userprofile");
      }
  });
});

router.delete('/delete-userprofile/:_id',MiddleWare.isLoggedIn,function (req, res) {
    User.findByIdAndRemove({_id:req.params._id}, function(err, deleted){
        if(err){
            req.flash('error', err);
            return res.redirect("/settings/userprofile");
        } else {
            req.flash('success', 'Successfully Delete! User Code: '+ deleted.code);
            return res.redirect("/settings/userprofile");
        }
    });
});

module.exports = router;
