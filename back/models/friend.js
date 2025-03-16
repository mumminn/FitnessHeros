const mongoose = require("mongoose");

const { Schema } = mongoose;

const FriendSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    friend: {
      type: Array,
    },
    win: {
      type: Number,
    },
    draw: {
      type: Number,
    },
    lose: {
      type: Number,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Friend", FriendSchema, "Friend");
