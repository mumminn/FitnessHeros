const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    birthdate: {
      type: Date,
    },
    gender: {
      type: Boolean,
    },
    concern: {
      type: String,
    },
    character: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", UserSchema, "User");
