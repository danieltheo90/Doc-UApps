var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var DepSchema = new mongoose.Schema({
    code: {type: String, unique: true, required: true},
    description: String,
    status: {type:Boolean, default:false}
});

module.exports = mongoose.model("DepartmentCode", DepSchema);
