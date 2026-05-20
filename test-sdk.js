import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({});
const GEMINI_MODEL = "gemini-3.5-flash";

async function testMultimodal(label, base64Data, mimeType, prompt) {
  console.log(`Testing ${label} with mimeType: ${mimeType}...`);
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt, type: "text" },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ],
    });
    console.log(`Success! Result:`, response.text);
  } catch (e) {
    console.error(`Error during ${label} test:`, e.message);
  }
}

async function runAll() {
  // 1x1 transparent PNG
  const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  await testMultimodal("Image File", base64Image, "image/png", "What is in this image?");

  // Simple text file content ("Hello from Antigravity!")
  const base64Text = Buffer.from("Hello from Antigravity! This is a test document.").toString("base64");
  await testMultimodal("Text Document", base64Text, "text/plain", "Summarize this text in one sentence.");
}

runAll();
