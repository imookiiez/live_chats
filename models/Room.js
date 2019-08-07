const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    roomId: {
      type: String
    },
    username: {
      type: String
    },
    roomStatus:{
      type: Boolean
    }
  },
  {
    timestamps: true
  }
);

let Room = mongoose.model("theRoom", roomSchema);

module.exports = Room;