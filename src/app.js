require("dotenv").config();
const connectDB = require("./config/database");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors");
const http = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(process.env.PORT, () => {
      console.log("Server is listening on port:", process.env.PORT);
    });
  } catch (err) {
    console.log("Failed to start server due to DB connection error:", err);
  }
};

startServer();
