const mongoose = require("mongoose");

const keoToday = new mongoose.Schema({
  textKeoTX: {
    type: String,
  },
  textKeoChap: {
    type: String,
  },
  callback_data: {
    type: String,
  },
  data1: {
    type: String,
  },
  data2: {
    type: String,
  },
  keoTX: {
    type: String,
  },
  createDate: {
    type: Date,
  },
});

const KeoToday = mongoose.model("keoToDay", keoToday);

module.exports = KeoToday;
