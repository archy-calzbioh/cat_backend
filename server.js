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
  // Extract the 'question' property from req.body
  const originalQuestion = req.body.question;

  // Prepend the string to the original question
  const imageUrl = req.body.imageUrl; // Extract the imageUrl

  // Prepend the string to the original question
  const question = `As a programmer who loves to use leetspeak slang, I often write comments in my code using leetspeak. Given a piece of code, I want you to add comments to it using leetspeak slang. Make sure each comment is placed on a separate line above the relevant code, and the comments are indented to match the code they are commenting on. Here's an example:

Input:
:

  console.log("Received question from client:", question);
  axios
    .post(
      "https://api.openai.com/v1/completions",
      {
        prompt: ,
        model: "text-davinci-003",
        max_tokens: 1500,
        temperature: 0.1,
        // format: "markdown"
        format: "text"
      },
      headers
    )
    .then((response) => {
      const api_response = response.data.choices[0].text;
      console.log("Recieved response from API: ", api_response);
      OutputModel.create({ question: question, answer: api_response })
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
Output:
  // c0ns0l3 l0g th3 qu3st10n r3c31v3d fr0m cl13nt
  console.log("Received question from client:", question);
  // m4k3 4 p0st r3qu3st t0 0p3n41 4p1
  axios
    .post(
      "https://api.openai.com/v1/completions",
      {
        prompt: ,
        model: "text-davinci-003",
        max_tokens: 1500,
        temperature: 0.1,
        // f0rm4t: "m4rkdown"
        format: "text"
      },
      headers
    )
    .then((response) => {
      // 3xtr4ct th3 4p1 r3sp0ns3
      const api_response = response.data.choices[0].text;
      // c0ns0l3 l0g th3 r3sp0ns3 fr0m 4p1
      console.log("Recieved response from API: ", api_response);
      // cr34t3 4 n3w 3ntry 1n th3 0utputM0d3l c0ll3ct10n
      OutputModel.create({ question: question, answer: api_response })
        .then((response) => {
          // c0ns0l3 l0g th3 d4t4 s4v3d t0 d4t4b4s3
          console.log("Saved data to database:", response);
        })
        .catch((err) => {
          // l0g 4ny 3rr0rs
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

Now, please add leetspeak comments to the following code: ${originalQuestion}`;

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

mongoose.connect("mongodb://localhost:27017/chatgpt");

mongoose.connection.once("open", () => {
  console.log("connected to mongoDB....");
});

app.listen(PORT, () => {
  console.log("listening...");
});
