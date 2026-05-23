import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import fs from "fs/promises";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import express from "express";

const ai = new GoogleGenAI({});
const app = express();
const upload = multer();

const GEMINI_MODEL = "gemini-3.5-flash";
const EMBEDDING_MODEL = "gemini-embedding-2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

let knowledgeBase = [];

async function initializeknowledgeBase() {
  try {
    console.log("Membuat dokumen dan membuat embedding...");
    const rawText = await fs.readFile(
      "./data/pengetahuan.txt",
      "utf-8",
    );
    const chunks = rawText
      .split("\n\n")
      .filter((chunk) => chunk.trim().length > 10);
    for (const chunk of chunks) {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: chunk,
      });

      knowledgeBase.push({
        text: chunk,
        embedding: response.embeddings[0].values,
      });
    }
    console.log(
      `Berhasil memuat ${knowledgeBase.length} chunk pengetahuan.`,
    );
  } catch (e) {
    console.error(
      "Gagal memuat knowledge base. Pastikan file data/pengetahuan.txt ada.",
      e,
    );
  }
}

initializeknowledgeBase();

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server ready on http://localhost:${PORT}`),
);

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    const lastUserMessage =
      conversation[conversation.length - 1].text;

    const queryEmbeddingResponse =
      await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: lastUserMessage,
      });
    const queryEmbedding =
      queryEmbeddingResponse.embeddings[0].values;

    const searchResults = knowledgeBase
      .map((doc) => ({
        text: doc.text,
        score: cosineSimilarity(
          queryEmbedding,
          doc.embedding,
        ),
      }))
      .sort((a, b) => b.score - a.score);

    const topContexts = searchResults
      .slice(0, 2)
      .map((result) => result.text)
      .join("\n\n");

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.5,
        systemInstruction: `Anda adalah AI Assistant resmi untuk INKA INTERIOR, perusahaan yang bergerak di bidang interior, desain, custom furniture, renovasi, dan layanan terkait lainnya.

TUGAS UTAMA:
- Jawab pertanyaan pengguna dengan ramah, profesional, natural, dan terasa seperti customer service manusia.
- Gunakan bahasa yang sopan, mudah dipahami, dan tidak terlalu formal.
- Berikan jawaban yang langsung ke inti tanpa bertele-tele.
- Pastikan format jawaban rapi dan mudah dibaca.
- Hindari jawaban dalam 1 paragraf panjang.

SUMBER INFORMASI:
Gunakan HANYA informasi dari konteks berikut:
${topContexts}

ATURAN PENTING:
1. Jangan membuat informasi yang tidak ada di konteks.
2. Jika informasi tidak tersedia, jawab:
   "Maaf, untuk informasi tersebut saya belum memiliki datanya. Tim INKA INTERIOR dapat membantu Anda lebih lanjut."
3. Jangan mengarang harga, alamat, estimasi waktu, promo, atau layanan jika tidak tertulis di konteks.
4. Jika pengguna bertanya di luar topik INKA INTERIOR, arahkan kembali secara sopan.
5. Jika memungkinkan, arahkan pengguna untuk konsultasi dengan tim.

CARA MENJAWAB:
- Jawaban harus terasa seperti admin WhatsApp.
- Jangan terdengar seperti company profile.
- Jangan menjelaskan semua layanan sekaligus.
- Fokus pada pertanyaan pengguna.
- Gunakan line break agar rapi.
- Maksimal 2 kalimat per paragraf.
- Jika menjelaskan beberapa poin gunakan bullet point.

GAYA KOMUNIKASI:
- Human-like dan conversational.
- Profesional tetapi tetap hangat.
- Tidak kaku seperti robot.
- Tidak menggunakan bahasa terlalu baku.
- Hindari pengulangan kalimat.

CONTOH GAYA JAWABAN:

User: "Apakah bisa custom kitchen set?"

Assistant:
"Tentu, INKA INTERIOR melayani pembuatan custom kitchen set sesuai kebutuhan dan ukuran ruangan Anda.

Anda juga bisa menyesuaikan desain, material, hingga warna agar lebih cocok dengan konsep interior yang diinginkan.

Jika diperlukan, tim kami dapat membantu konsultasi dan memberikan rekomendasi desain terbaik."


User: "Berapa harga interior kamar?"

Assistant:
"Untuk harga interior kamar menyesuaikan beberapa faktor, seperti:

• Ukuran ruangan  
• Material yang digunakan  
• Tingkat detail desain  

Tim INKA INTERIOR dapat membantu membuat estimasi sesuai kebutuhan Anda."


User: "Apakah ada layanan renovasi?"

Assistant:
"Ya, INKA INTERIOR juga melayani renovasi interior sesuai kebutuhan proyek.

Mulai dari renovasi ruangan rumah, kantor, hingga custom interior lainnya dapat dikonsultasikan lebih lanjut dengan tim kami."


User: "Apakah ada cabang di Bandung?"

Assistant:
"Maaf, saya belum menemukan informasi mengenai cabang di Bandung.

Tim INKA INTERIOR dapat membantu memberikan informasi lebih lanjut terkait lokasi dan layanan yang tersedia."


TUJUAN:
Buat pengguna merasa sedang berbicara dengan admin/customer service interior profesional yang:
- responsif
- membantu
- komunikatif
- rapi dalam menjawab
- mudah dipahami`,
      },
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// app.post('/generate-text', async (req, res) => {

//   const { prompt } = req.body;

//   try {

//     const response = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: prompt
//     })

//     res.status(200).json({ result: response.text });

//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: e.message });
//   }

// });

// const generateFromFileHandler = async (req, res) => {
//   const { prompt } = req.body;
//   const file = req.files?.[0] || req.file;

//   if (!file) {
//     return res.status(400).json({ message: "No file uploaded. Please upload a file." });
//   }

//   try {
//     const base64Data = file.buffer.toString("base64");
//     const response = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: [
//         { text: prompt || "Analyze this file and provide detailed information.", type: "text" },
//         { inlineData: { data: base64Data, mimeType: file.mimetype } }
//       ],
//     });

//     res.status(200).json({ result: response.text });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: e.message });
//   }
// };

// app.post("/generate-from-file", upload.any(), generateFromFileHandler);
// app.post("/generate-from-image", upload.any(), generateFromFileHandler);
