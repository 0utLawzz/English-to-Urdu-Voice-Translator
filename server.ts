import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Initialize Gemini SDK with telemetry header as requested
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined in the environment. Operating in client-side fallback mode.");
}

// ------------------------------------
// API ROUTES
// ------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', online: !!ai });
});

// Translation Endpoint
app.post('/api/translate', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text input is required and must be a string' });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: 'Gemini translation service is unavailable (API key missing). fallback to offline translation.' 
    });
  }

  try {
    const prompt = `Translate the following English text into native Urdu: "${text}".
Please provide the native Urdu script, Roman Urdu transliteration, phonetic pronunciation guide for English speakers, and a grammatical word breakdown dictionary for the major words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert English-to-Urdu linguist and translator. You provide highly accurate, grammatically correct translations in clean Urdu script, friendly transliterations in Roman script (using standard English alphabet), clear phonetic pronunciations, and an interactive dictionary breakdown of key vocabulary terms.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translated: { 
              type: Type.STRING, 
              description: "The translated Urdu text in beautiful native Urdu script" 
            },
            transliteration: { 
              type: Type.STRING, 
              description: "The transliteration of the translated text in Roman Urdu (e.g., 'Aap kaise hain?')" 
            },
            pronunciation: { 
              type: Type.STRING, 
              description: "Phonetic pronunciation syllable-by-syllable guide for English speakers (e.g., 'Aap kay-say hain?')" 
            },
            dictionary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "The original English word being translated" },
                  type: { type: Type.STRING, description: "Word type, e.g. noun, verb, pronoun, adjective, interjection" },
                  translation: { type: Type.STRING, description: "The Urdu word in native script with Roman text in parenthesis" },
                  context: { type: Type.STRING, description: "A brief contextual explanation of this word's usage" }
                },
                required: ["word", "type", "translation"]
              },
              description: "Grammatical breakdown of the main words in the translated sentence"
            },
            explanation: { 
              type: Type.STRING, 
              description: "Optional, brief friendly cultural or grammatical note about how Urdu handles this phrase." 
            }
          },
          required: ["translated", "transliteration", "pronunciation", "dictionary"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No content returned from Gemini model');
    }

    const parsedResult = JSON.parse(resultText);
    res.json({ original: text, ...parsedResult });

  } catch (error: any) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Translation failed: ' + error.message });
  }
});

// Text to Speech Endpoint
app.post('/api/tts', async (req, res) => {
  const { text, voice } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text input is required and must be a string' });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: 'Gemini Text-to-Speech is unavailable (API key missing).' 
    });
  }

  try {
    // We direct the model to speak with natural Urdu accent and cadence.
    const prompt = `Say this Urdu text with a clean, highly natural native Pakistani Urdu accent and clear cadence. Do not add any introduction, greeting, or trailing commentary. Just speak the Urdu text: "${text}"`;

    const selectedVoice = voice || 'Kore'; // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error('TTS model did not return audio data');
    }

    res.json({ audio: base64Audio });

  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'TTS generation failed: ' + error.message });
  }
});

// ------------------------------------
// FRONTEND INTEGRATION
// ------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled production assets from:", distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`English to Urdu Voice Translator listening on http://0.0.0.0:${PORT}`);
  });
}

start();
