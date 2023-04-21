const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const token = "6214124878:AAGFFNSs1Kng4K1syskjxK9eEvyvPV9tMak";
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
    text: "Chelsea vs MU",
    callback_data: "1",
    data1: "Chelsea",
    data2: "MU",
  },
  {
    text: "Manchester City vs Duy",
    callback_data: "2",
    data1: "Manchester City",
    data2: "Duy",
  },
  {
    text: "Chelsea vs MU 2",
    callback_data: "3",
    data1: "Chelsea",
    data2: "MU 2",
  },
];

var keyboard = {
  inline_keyboard: [
    [
      {
        text: "Chelsea vs MU",
        callback_data: "1",
        data1: "Chelsea",
        data2: "MU",
      },
      {
        text: "Manchester City vs Duy",
        callback_data: "2",
        data1: "Manchester City",
        data2: "Duy",
      },
      {
        text: "Chelsea vs MU 2",
        callback_data: "3",
        data1: "Chelsea",
        data2: "MU 2",
      },
    ],
  ],
};

app.get("/", (req, res) => {
  console.log(options);
  res.render("index", { options });
});

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bạn muốn hỏi kèo nào: ", {
    reply_markup: JSON.stringify(keyboard),
  });

  if (!listChatID.includes(msg.chat.id)) {
    listChatID.push(msg.chat.id);
  }
});

// Handle callback queries
bot.on("callback_query", (query) => {
  const { chat, message_id, text } = query.message;
  const option = options.find((option) => option.callback_data === query.data);

  console.log(option);

  bot.editMessageText(
    `${text}\n\n"${option.text}", kèo hôm nay   ${option.data1} chấp ${option.data2} 10 trái, chọn kèo ${option.data2}`,
    {
      chat_id: chat.id,
      message_id: message_id,
    }
  );
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "/start") {
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
    // const newData = new KeoToday(req.body.data[0]);

    // const a = await newData.save();

    console.log(req.body);

    res.render("index", { options });
  } catch (err) {
    console.error(`Error inserting data: ${err.message}`);
    res.status(500).send(`Error inserting data: ${err.message}`);
  }
});

app.get("/listKeo", async (req, res) => {
  try {
    const listKeo = await KeoToday.find({});
    console.log(listKeo);
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
