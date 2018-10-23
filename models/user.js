var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true
    },
    password: String,
    // company: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'company'
    // }],
    // department: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'department'
    // }],
    company: {
      code: String
    },
    department: {
      code: String
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      code: String
    }
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);
