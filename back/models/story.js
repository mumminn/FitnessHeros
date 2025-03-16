const mongoose = require("mongoose");

const { Schema } = mongoose;

const StorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    concern: {
      type: String,
      required: true,
    },
    exe_name: {
      type: String,
    },
    episode: {
      type: Number,
      required: true,
    },
    exe_set: {
      type: Number,
    },
    exe_count: {
      type: Number,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { versionKey: false }
);

StorySchema.index({ id: 1, concern: 1, episode: 1 }, { unique: true });

module.exports = mongoose.model("Story", StorySchema, "Story");
