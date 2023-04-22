const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const request = require("request");
const multer = require("multer");
const token = "5947988756:AAFeV5JHHwNmowx2HFSLhAG_MWZ3hrjBswI";

// const token = "6212119379:AAEi1kYrKksfMziyfd_p7B7E203sniB09Gg";
const mongoose = require("mongoose");
const ejs = require("ejs");

const url =
  "mongodb+srv://tuehd:0917977835aa@cluster0.r5mdp.mongodb.net/?retryWrites=true&w=majority";
const KeoToday = require("./src/model/keo");
const ListChatID = require("./src/model/listIDChat");

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const upload = multer({ dest: "uploads/" });

const connectDB = () => {
  try {
    mongoose
      .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("oke db");
      })
      .catch((error) => console.log(error));
  } catch (error) {
    console.log(error);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.render("index", { options: {} });
});

app.get("/edit", async (req, res) => {
  KeoToday.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { options: docs });
    }
  });
});

app.post("/delete/:id", function (req, res) {
  const id = req.params.id;
  KeoToday.findByIdAndRemove(id, function (err) {
    if (err) {
      console.log("Error deleting item with ID:", id, err);
      res.send("Error deleting item");
    } else {
      console.log("Successfully deleted item with ID:", id);
      res.redirect("/");
    }
  });
});

bot.on("callback_query", async (query) => {
  const { chat, message_id, text } = query.message;

  const listKeo = await KeoToday.find()
    .sort({ createDate: -1 })
    .limit(3)
    .then((result) => {
      const option = result.find((item) => item.callback_data === query.data);

      bot.editMessageText(`${option.textKeoChap}  \n\n ${option.textKeoTX}`, {
        chat_id: chat.id,
        message_id: message_id,
      });
    });
});

const themChatID = async (chatId, username) => {
  try {
    const doc = await ListChatID.findOne({ chatID: chatId });

    if (doc) {
      console.log(`Chat ID '${chatId}' đã tồn tại trong cơ sở dữ liệu`);
      return doc;
    } else {
      const newDoc = new ListChatID({ chatID: chatId, username });
      await newDoc.save();
      console.log(`Thêm chat ID '${chatId}' vào cơ sở dữ liệu thành công`);
      return newDoc;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;

  themChatID(chatId, username);

  if (msg.text === "/start") {
    try {
      const listKeo = await KeoToday.find()
        .sort({ createDate: -1 })
        .limit(4)
        .then((result) => {
          bot.sendMessage(
            chatId,
            "Nhận full kèo tại nhóm vip . Đăng kí tài link: https://tk888.org/?proxy=link14,\n\n IB CHO TELEGRAM : https://t.me/phuongduypro",
            {
              reply_markup: {
                keyboard: [["/start"]],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );
          const result1 = JSON.stringify(result);
          const result2 = JSON.parse(result1);

          const reply_markup = {
            inline_keyboard: [result2],
          };

          bot.sendMessage(msg.chat.id, "Bạn muốn hỏi kèo nào: ", {
            reply_markup,
          });
        });
    } catch (err) {
      console.error(err.message);
    }
  }
});

app.post("/", async (req, res) => {
  try {
    const {
      textKeoTX = "",
      textKeoChap = "",
      doi1 = "",
      doi2 = "",
      keoTX = "",
      keoChap = "",
      text = "",
    } = req.body;

    const newData = new KeoToday({
      createDate: new Date(),
      textKeoTX,
      textKeoChap,
      doi1,
      doi2,
      keoTX,
      keoChap,
      callback_data: new Date().getTime(),
      text,
    });

    const a = await newData.save().then((result) => {
      res.render("index", { options: result });
    });
  } catch (err) {
    console.error(`Error inserting data: ${err.message}`);
    res.status(500).send(`Error inserting data: ${err.message}`);
  }
});

app.post("/text", async (req, res) => {
  try {
    const chatIDs = await ListChatID.find({});
    const listID = chatIDs.map((item) => item.chatID);

    const { duLieu } = req.body;
    console.log(duLieu, "req.body");

    for (let i = 0; i < listID.length; i++) {
      bot.sendMessage(listID[i], decodeURIComponent(duLieu));
    }

    res.render("index", { options: {} });
  } catch (err) {
    console.error(`Error inserting data: ${err.message}`);
    res.status(500).send(`Error inserting data: ${err.message}`);
  }
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const chatIDs = await ListChatID.find({});
    const listID = chatIDs.map((item) => item.chatID);
    const file = req.file;

    if (!file) {
      console.log("Không tìm thấy file");
      return res.status(400).send("Không tìm thấy file");
    }

    let buffer;
    if (file.buffer) {
      buffer = Buffer.from(file.buffer);
    } else {
      buffer = fs.readFileSync(file.path);
    }

    console.log(buffer);

    for (let i = 0; i < listID.length; i++) {
      bot.sendPhoto(listID[i], buffer, { caption: "" });
    }

    res.send("Đã gửi thành công");
  } catch (err) {
    console.log(err);
    res.status(500).send("Lỗi server");
  }
});

app.get("/listKeo", async (req, res) => {
  try {
    const listKeo = await KeoToday.find({});
    res.send(listKeo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
