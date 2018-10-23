var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CompanySchema = new mongoose.Schema({
    code: {type: String, unique: true, required: true},
    description: String,
    address: String,
    address1: String,
    phone: String,
    vatregistration: String,
    vatname: String,
    vataddress: String,
    vataddress1: String,
    vatinvoiceauthorizedname: String,
    vatinvoiceauthorizedposition: String,
    status: {type:Boolean, default:false}

});

module.exports = mongoose.model("Company", CompanySchema);
