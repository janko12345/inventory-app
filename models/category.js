const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true, minLength: 1 },
});

module.exports = mongoose.model("category", categorySchema);
