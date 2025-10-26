const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const e = require("express");
const userRouter = express.Router();

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName about photoURL");

    res.json({ message: "Retrieval Successful", data: connectionRequests });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName about photoURL")
      .populate("toUserId", "firstName lastName about photoURL");

    const data = connections.map((key) => {
      if (key.toUserId._id.equals(loggedInUser._id)) {
        return key.fromUserId;
      }
      return key.toUserId;
    });

    res.json({ message: "Retrieval Successful", data: data });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // const data = connectionRequests.map((request) => {
    //   if (request.fromUserId._id.equals(loggedInUser._id)) {
    //     return request.toUserId._id;
    //   }
    //   return request.fromUserId._id;
    // });

    // const excludeIds = [loggedInUser._id, ...data];

    const excludeIds = new Set();

    connectionRequests.forEach((request) => {
      excludeIds.add(request.fromUserId.toString());
      excludeIds.add(request.toUserId.toString());
    });

    const feedList = await User.find({
      $and: [
        { _id: { $nin: Array.from(excludeIds) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName photoURL about gender")
      .skip(skip)
      .limit(limit);

    res.json({ message: "Data Retrieved", data: feedList });
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = userRouter;
