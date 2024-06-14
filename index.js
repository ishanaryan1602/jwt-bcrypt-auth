const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userModel = require("./models/users");
const bcrypt = require("bcrypt");

mongoose
  .connect("mongodb://localhost:27017/jwt-auth")
  .then(() => console.log("connect to MongoDB"))
  .catch((err) => console.log("this is the error for mongodb", err));

const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.render("home"));

app.post("/register", (req, res) => {
  let { username, email, password, age } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email }, "secret_key");
      res.cookie("token", token);
      res.send(user);
    });
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.render("login");
  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (result)
      res.render("wel", {user: user });
    else return res.render("login");
  });
});
app.get("/login", (req, res) => {
  return res.render("login");
});

app.listen(3000, () => {
  console.log("connected on port");
});
