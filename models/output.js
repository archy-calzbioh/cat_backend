const mongoose = require('mongoose');

const outputSchema = new mongoose.Schema({
  question: String,
  answer: String,
  imageUrl: String, // Add a new field for the generated image URL
});


const OutputModel = mongoose.model('Output', outputSchema);

module.exports = OutputModel;