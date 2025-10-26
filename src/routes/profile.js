const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditFields } = require("../utils/validate");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditFields(req)) {
      throw new Error("Invalid edit request");
    }
    const currentUser = req.user;
    Object.keys(req.body).forEach((key) => (currentUser[key] = req.body[key]));

    await currentUser.save();

    res.json({
      message: "Edit successful " + currentUser.firstName,
      data: currentUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error: " + err.message);
  }
});

module.exports = profileRouter;
