const express = require("express");
const cors = require("cors");
const axios = require("axios");
const PORT = 3080;
const app = express();


// using dotenv package - npm install dotenv and then use .env file created
require("dotenv").config();

// data model (schema) for Questions/Answers
const OutputModel = require("./models/output");

// Middleware - json/urlencoded/cors
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Key from the .env file
// --- you will need to replace that one with your OWN!!! - Nick will be canceling this one after the lesson
const apiKey = process.env.OPENAI_API_KEY;

// Request Header for OpenAI API -- This is how we send the key
const headers = { headers: { Authorization: "Bearer " + apiKey } };

// GET Request - Gets all Questions and Answers from MongoDB
// Returns them to the Client
app.get("/gpt", async (req, res) => {
  const foundResponses = await OutputModel.find({});
  res.json(foundResponses);
});

// POST Request - API CALL to OpenAI
// -- in Promise - use Mongoose to POST to Database

app.post("/gpt", async (req, res) => {
  const { question } = req.body;
  axios
    .post(
      "https://api.openai.com/v1/completions",
      {
        prompt: `${question}`,
        model: "text-davinci-003",
        max_tokens: 30,
        temperature: 1.0,
      },
      headers
    )
    .then((response) => {
      const api_response = response.data.choices[0].text;
      console.log(api_response);
      OutputModel.create({ question: question, answer: api_response })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// PUT endpoint to update an answer by ID
app.put('/gpt/:id', async (req, res) => {
  try {
    const answerId = req.params.id;
    const newContent = req.body.answer;
    // Use OutputModel instead of Answer
    const updatedAnswer = await OutputModel.findByIdAndUpdate(answerId, { answer: newContent }, { new: true });
    res.json(updatedAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating answer' });
  }
});




// MONGOOSE

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/chatgpt");

mongoose.connection.once("open", () => {
  console.log("connected to mongoDB....");
});

app.listen(PORT, () => {
  console.log("listening...");
});
