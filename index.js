import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
// import fs from 'fs/promises';
import multer from 'multer';
import express from 'express';

const ai = new GoogleGenAI({});
const app = express();
const upload = multer();

const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json());

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));


app.post('/generate-text', async (req, res) => {

  const { prompt } = req.body;

  try {

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    })

    res.status(200).json({ result: response.text });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }

});

const generateFromFileHandler = async (req, res) => {
  const { prompt } = req.body;
  const file = req.files?.[0] || req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded. Please upload a file." });
  }

  try {
    const base64Data = file.buffer.toString("base64");
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt || "Analyze this file and provide detailed information.", type: "text" },
        { inlineData: { data: base64Data, mimeType: file.mimetype } }
      ],
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

app.post("/generate-from-file", upload.any(), generateFromFileHandler);
app.post("/generate-from-image", upload.any(), generateFromFileHandler);


