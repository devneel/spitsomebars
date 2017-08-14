const mongoose = require('mongoose');
const voting = require('mongoose-voting');


const BarsSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  bars: String,
  createdOn:{type: Date, default: Date.now()},
  updatedOn: {type: Date, default: Date.now()},
  anon_author: {type: String, default: null}
});

BarsSchema.plugin(voting);

const Bars = mongoose.model('Bars', BarsSchema);
module.exports = Bars;
