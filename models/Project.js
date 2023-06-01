const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  technology	: { type: String},
  assigned_to: {type: String},
  start_date: { type: Date },
  due_date: { type: Date },
  status: { type: String, enum: ["ongoing", "completed", "onhold"], default: "ongoing" },
});

module.exports = mongoose.model("Project", projectSchema);