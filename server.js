const express = require('express');
const cors = require('cors')
const axios = require('axios')
const PORT = 3080;
const app = express();

// using dotenv package - npm install dotenv and then use .env file created
require("dotenv").config();

// data model (schema) for Questions/Answers
const OutputModel = require('./models/output')

// Middleware - json/urlencoded/cors
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


// API Key from the .env file 
// --- you will need to replace that one with your OWN!!! - Nick will be canceling this one after the lesson
const apiKey = process.env.OPENAI_API_KEY;

// Request Header for OpenAI API -- This is how we send the key
const headers = {headers: {Authorization: "Bearer " + apiKey,}}


// GET Request - Gets all Questions and Answers from MongoDB 
// Returns them to the Client



// POST Request - API CALL to OpenAI
// -- in Promise - use Mongoose to POST to Database




// MONGOOSE

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatgpt')

mongoose.connection.once('open', () => {
    console.log('connected to mongoDB....')
})

app.listen(PORT, () => {
    console.log('listening...')
})

