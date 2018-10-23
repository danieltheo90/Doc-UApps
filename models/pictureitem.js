var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ItemPictureSchema = new mongoose.Schema({
	company: {type: String, required: true},
    item_no: {type: String, required: true},
    item_picture: String
});

module.exports = mongoose.model("ItemPicture", ItemPictureSchema);
