var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RoleSchema = new mongoose.Schema({
    code: {type: String, unique: true, required: true},
    description: String
});

module.exports = mongoose.model("Role", RoleSchema);
