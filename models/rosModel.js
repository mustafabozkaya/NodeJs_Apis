const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');
const validator = require('validator');

////Position Marker

const positionMarker = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Position must have a Name'],
    unique: true,
  },
  x: {
    type: Decimal128,
    required: [true, 'Position must have an X coordinate'],
  },
  y: {
    type: Decimal128,
    required: [true, 'Position must have a Y coordinate'],
  },
  rotation: {
    type: Decimal128,
    required: [true, 'Position must have a Rotation'],
  },
  type: {
    type: String,
    default: 'normal',
    required: [false, ' Optional'],
  },
});
Position = mongoose.model('Position', positionMarker);
module.exports = Position;
