const mongoose = require("mongoose");
const { Schema } = mongoose;

const CharacterSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    character: {
      type: String,
      required: true,
    },
    coin: {
      type: Number,
    },
    skin: {
      type: Object,
      properties: {
        헬린이: { type: Number },
        초급자: { type: Number },
        중급자: { type: Number },
        고인물: { type: Number },
      }
    },
    currentSkin: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Character", CharacterSchema, "Character");
