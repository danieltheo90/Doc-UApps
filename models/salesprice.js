var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SalesPriceSchema = new mongoose.Schema({
    No: {type: String,  required: true},
    Description: String,
    Description2: String,
    ItemCategory: String,
    ManufactureCode: String,
    UOM: String,
    price: [Number],
    actualStock: [Number],
    company: String,
    deptCode: String
});

module.exports = mongoose.model("salesPrice", SalesPriceSchema);
