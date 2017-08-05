var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var imageSchema = new Schema({
  url: {
    type: String,
    unique: true
  }
});

var Image = mongoose.model('Image', imageSchema);

module.exports = Image;
