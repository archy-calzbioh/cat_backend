const mongoose = require('mongoose');

const outputSchema = new mongoose.Schema({
    question: String,
    answer: String
})

const OutputModel = mongoose.model('Output', outputSchema);

module.exports = OutputModel;