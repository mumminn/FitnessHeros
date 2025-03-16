const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExerciseSchema = new Schema(
  {
    concern: {
      type: String,
      required: true,
    },
    exe_name: {
      type: String,
      required: true,
    },
    episode: {
      type: Number,
      required: true,
    },
    gender: {
      type: Boolean,
      required: true,
    },
    exe_set: {
      type: Number,
      required: true,
    },
    exe_count: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

ExerciseSchema.index(
  { concern: 1, exe_name: 1, episode: 1, gender: 1 },
  { unique: true }
);

module.exports = mongoose.model("Exercise", ExerciseSchema, "Exercise");
