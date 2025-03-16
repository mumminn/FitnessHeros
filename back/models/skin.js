const mongoose = require("mongoose");

const { Schema } = mongoose;

const SkinSchema = new Schema(
  {
    skin_name: {
      type: String,
      required: true,
    },
    skin_price: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Skin", SkinSchema, "Skin");
