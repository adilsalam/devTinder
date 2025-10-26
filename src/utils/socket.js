const socket = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, toUserId }) => {
      const roomId = [userId, toUserId].sort().join("_");
      socket.join(roomId);
      console.log(firstName + " Joined room: " + roomId);
    });

    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      try {
        const roomId = [userId, toUserId].sort().join("_");
        console.log(firstName + " : " + text);
        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }

        chat.messages.push({ senderId: userId, text });
        await chat.save();
        io.to(roomId).emit("messageReceived", { firstName, text });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("exitChat", () => {});
  });
};

module.exports = initializeSocket;
