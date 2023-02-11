const mongoose = require("mongoose");
const user = new mongoose.Schema({
  username: String,
  password: String,
  role:String
});

module.exports = mongoose.model("User", user);