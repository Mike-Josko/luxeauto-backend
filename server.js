require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors'); // <-- ADD THIS LINE

const app = express();
app.use(cors()); // <-- AND ADD THIS LINE
const port = 3000;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
// This route will handle the AI chat requests
app.post('/generate', async (req, res) => {
  try {
    // Get the entire chat history from the request
    const history = req.body.history;

    // The Gemini API requires the history for context, and the new message to be sent separately.
    // The last message in our history array is the new one from the user.
    const lastUserMessage = history.pop(); // Remove the last message to send it separately
    
    // Start a chat session with the AI, providing the previous context
    const chat = model.startChat({
      history: history, // The conversation history
    });

    // Send the user's newest message to the chat session
    const result = await chat.sendMessage(lastUserMessage.parts);
    const response = result.response;
    const text = response.text();

    res.json({ message: text }); // Send the AI's new response back

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});