const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const token = "6214124878:AAGFFNSs1Kng4K1syskjxK9eEvyvPV9tMak";

// const token = "6212119379:AAEi1kYrKksfMziyfd_p7B7E203sniB09Gg";
const mongoose = require("mongoose");
const ejs = require("ejs");

const url =
  "mongodb+srv://tuehd:0917977835aa@cluster0.r5mdp.mongodb.net/?retryWrites=true&w=majority";
const KeoToday = require("./src/model/keo");

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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

var listChatID = [];

app.get("/", (req, res) => {
  res.render("index", { options: {} });
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

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

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

          if (!listChatID.includes(msg.chat.id)) {
            listChatID.push(msg.chat.id);
          }
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
