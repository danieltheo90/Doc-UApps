'use strict';

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    validator   = require('express-validator'),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    User        = require("./models/user"),
    Company        = require("./models/company"),
    acl         = require('./config/acl/acl'),
    session     = require("express-session"),
    MiddleWare  = require("./config/middleware/index"),
    path        = require('path'),
    port     		= process.env.PORT || 8000,
    methodOverride = require("method-override"),
    device      = require('express-device'),
    MongoDBStore = require('connect-mongodb-session')(session);
// configure dotenv
require('dotenv').load();

app.use(device.capture());
app.set('views', [path.join(__dirname, 'views')]);

//requiring routes
var accountsRoutes       = require("./routes/accounts"),
    settingsRoutes    = require("./routes/settings"),
    salesRoutes       = require("./routes/dashboard_sales"),
    adminRoutes       = require("./routes/dashboard"),
    posRoutes         = require("./routes/dashboard_pos"),
    mdRoutes         = require("./routes/dashboard_merchandising"),
    salesItemRoutes   = require("./routes/sales_item"),
    mdItemRoutes = require("./routes/merchandising_item");

var store = new MongoDBStore(
      {
        uri: 'mongodb://localhost:27017/UnicoRaya',
        collection: 'mySessions'
      });
mongoose.connect("mongodb://localhost:27017/UnicoRaya");

app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: 'UR,STI,KLASSEN,LAP',
    key: 'PT.UnicoRayaKey',
    store: store,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 3600000,
    },
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

app.get("/", function(req, res){
  res.redirect("/accounts/login");
});

app.use("/error-page", function(req, res){
  res.render("dashboard/errorPage",{
    title: 'error-page'
  });
});
app.use("/accounts", accountsRoutes);
app.use("/welcome", adminRoutes);

// middleware config acl
acl.config({
  baseUrl: '/',
  filename:'acl.json',
  path:'config'
});

// acl
app.use(function(req, res, next){
  req.decoded = req.user;
  next();
});

app.use(acl.authorize);

// routing with Acl
app.use("/settings", settingsRoutes);
app.use("/dashboard_sales", salesRoutes);
app.use("/dashboard_pos", posRoutes);
app.use("/sales_item", salesItemRoutes);
app.use("/merchandising_item", mdItemRoutes);
app.use("/dashboard_merchandising", mdRoutes);

// error handling ACL
app.use(function(request, response, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, request, response, next) {
  response.status(err.status || 500).redirect('/error-page');
});

app.listen(port);
console.log('Server is Running :' + port);
