const express = require("express");
const cors = require("cors");
const axios = require("axios");
const PORT = process.env.PORT || 3080;
const app = express();
// const { OpenAI } = require("openai-streams");
const fs = require("fs");

// Read the content of the prompt.txt file
const promptText = fs.readFileSync("prompt.txt", "utf8");



// Configure CORS to allow requests from multiple specified origins
const corsOptions = {
  origin: ['https://cat-frontend.herokuapp.com', 'http://localhost:3000'],
  optionsSuccessStatus: 200
};

// Apply the CORS middleware with the specified options
app.use(cors(corsOptions));

// using dotenv package - npm install dotenv and then use .env file created
require("dotenv").config();

// data model (schema) for Questions/Answers
const OutputModel = require("./models/output");

// Middleware - json/urlencoded/cors
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
  // Extract the 'question' property from req.body
  const originalQuestion = req.body.question;

  // Prepend the string to the original question
  const imageUrl = req.body.imageUrl; // Extract the imageUrl

  // Prepend the string to the original question
  const question = `${promptText}${originalQuestion}`;

  console.log("Received question from client:", question);
  axios
    .post(
      "https://api.openai.com/v1/completions",
      {
        prompt: `${question}`,
        model: "text-davinci-003",
        max_tokens: 1500,
        temperature: 0.1,
        // format: "markdown"
        format: "text",
      },
      headers
    )
    .then((response) => {
      const api_response = response.data.choices[0].text;
      console.log("Recieved response from API: ", api_response);
      // Include the imageUrl field when creating a new document in the OutputModel collection
      OutputModel.create({
        question: originalQuestion,
        answer: api_response,
        imageUrl: imageUrl,
      })
        .then((response) => {
          console.log("Saved data to database:", response);
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

// DELETE endpoint to delete an answer by ID
app.delete('/gpt/:id', async (req, res) => {
  try {
    const answerId = req.params.id; // Get the ID from the request parameters
    // Use OutputModel's findByIdAndDelete method to delete the document by ID
    const deletedAnswer = await OutputModel.findByIdAndDelete(answerId);
    if (deletedAnswer) {
      res.json({ message: 'Answer deleted successfully', deletedAnswer });
    } else {
      res.status(404).json({ message: 'Answer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting answer' });
  }
});



// Define a route to handle image generation requests
app.post('/generate-image', async (req, res) => {
  try {

    // Define the OpenAI API endpoint and API key
    const openaiUrl = 'https://api.openai.com/v1/images/generations';

    // Make a POST request to the OpenAI API
    const openaiResponse = await axios.post(
      openaiUrl,
      {
        prompt: "A cat hacking a computer.",
        n: 1,
        size: "256x256",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Send the response from the OpenAI API back to the client
    res.json(openaiResponse.data);
  } catch (error) {
    // Handle errors and send an error response to the client
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the image.' });
  }
});


// MONGOOSE

const mongoose = require("mongoose");

// Use the MONGODB_URI environment variable for the MongoDB connection URL
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.once("open", () => {
  console.log("connected to mongoDB....");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});