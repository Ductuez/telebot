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
  doi1: {
    type: String,
  },
  doi2: {
    type: String,
  },
  keoTX: {
    type: String,
  },
  keoChap: {
    type: String,
  },
  createDate: {
    type: Date,
  },
});

const KeoToday = mongoose.model("keoToDay", keoToday);

module.exports = KeoToday;
