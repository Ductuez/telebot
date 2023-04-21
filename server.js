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
var options = [
  {
    textKeoTX: "đây là text kèo tài xỉu",
    textKeoChap: "đây là text kèo  kèo chấp",
    doi1: "Đội 1: ",
    doi2: "Đội 2 ",
    keoTX: "2.5",
    keoChap: "2.0",
    createDate: "2023-04-21T13:15:08.405Z",
    text: "11313",
    __v: 0,
  },
  {
    textKeoTX: "1",
    textKeoChap: "2",
    doi1: "5",
    doi2: "7",
    keoTX: "3",
    keoChap: "4",
    createDate: "2023-04-21T10:56:06.024Z",
    text: "11313",

    __v: 0,
  },
  {
    textKeoTX: "1",
    textKeoChap: "2",
    doi1: "5",
    doi2: "7",
    keoTX: "3",
    keoChap: "4",
    createDate: "2023-04-21T10:55:37.424Z",
    text: "11313",

    __v: 0,
  },
];

var keyboard = {
  inline_keyboard: [
    [
      {
        textKeoTX: "đây là text kèo tài xỉu",
        textKeoChap: "đây là text kèo  kèo chấp",
        doi1: "Đội 1: ",
        doi2: "Đội 2 ",
        keoTX: "2.5",
        keoChap: "2.0",
        createDate: "2023-04-21T13:15:08.405Z",
        text: "11313",
        __v: 0,
        callback_data: "12",
      },
      {
        textKeoTX: "1",
        textKeoChap: "2",
        doi1: "5",
        doi2: "7",
        keoTX: "3",
        keoChap: "4",
        createDate: "2023-04-21T10:56:06.024Z",
        text: "11313",
        callback_data: "12",
        __v: 0,
      },
      {
        textKeoTX: "1",
        textKeoChap: "2",
        doi1: "5",
        doi2: "7",
        keoTX: "3",
        keoChap: "4",
        createDate: "2023-04-21T10:55:37.424Z",
        text: "11313",
        callback_data: "12",
        __v: 0,
      },
    ],
  ],
};

app.get("/", (req, res) => {
  res.render("index", { options });
});

// Handle the /start command

// Handle callback queries
bot.on("callback_query", (query) => {
  const { chat, message_id, text } = query.message;

  console.log(query);
  // const option = options.find((option) => option.callback_data === query.data);

  // bot.editMessageText(
  //   `${text}\n\n"${option.keoChap}", kèo hôm nay   ${option.keoTX} chấp ${option.keoTX} 10 trái, chọn kèo ${option.keoTX}`,
  //   {
  //     chat_id: chat.id,
  //     message_id: message_id,
  //   }
  // );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "/start") {
    try {
      const listKeo = await KeoToday.find()
        .sort({ createDate: -1 })
        .limit(3)
        .then((result) => {
          const result1 = JSON.stringify(result);
          const result2 = JSON.parse(result1);

          console.log(result);

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
  }
});

app.post("/", async (req, res) => {
  try {
    const { textKeoTX, textKeoChap, doi1, doi2, keoTX, keoChap } = req.body;

    const newData = new KeoToday({
      createDate: new Date(),
      textKeoTX,
      textKeoChap,
      doi1,
      doi2,
      keoTX,
      keoChap,
      callback_data: new Date().getTime(),
      text: textKeoTX + " " + textKeoChap,
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
