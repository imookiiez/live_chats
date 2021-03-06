const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String
    },
    password:{
      type: String
    },
    position:{
      type: String
    },
    team:{
      type: String
    }
  },
  {
    timestamps: true
  }
);

let User = mongoose.model("User", UserSchema);

module.exports = User;