const mongoose = require('mongoose');

const imageModel = mongoose.Schema({
  path: {
    type: String,
  },
  type: {
    type: String,
  },
  link: {
    type: String,
    unique: true,
  },
  Date: Date,
});
Picture = mongoose.model('Picture', imageModel);
module.exports = Picture;
