const mongoose = require("mongoose");

const listIDChat = new mongoose.Schema({
  chatID: {
    type: String,
  },
});

const ListChatID = mongoose.model("listChat", listIDChat);

module.exports = ListChatID;
