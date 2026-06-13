import express from 'express';
import multer from 'multer';
import axios from 'axios';
import cors from 'cors';
import pdf from 'pdf-parse-fork';

const app = express();
const port = 5002;

app.use(cors());
app.use(express.json());

// Configurazione di Multer per gestire i file in memoria
const upload = multer({ storage: multer.memoryStorage() });

// URL di Ollama locale
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

app.post('/api/parser/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato.' });
    }

    console.log(`[Parser] Ricevuto file: ${req.file.originalname}. Estrazione testo in corso...`);

    // 1. Estrazione del testo dal buffer del PDF
    let textExtracted = '';
    try {
      const pdfData = await pdf(req.file.buffer);
      textExtracted = pdfData.text;
    } catch (pdfError) {
      console.error('[PDF Extraction Error]:', pdfError.message);
      return res.status(422).json({ 
        error: 'Errore tecnico durante la lettura del PDF.', 
        details: pdfError.message 
      });
    }

    if (!textExtracted || !textExtracted.trim()) {
      return res.status(400).json({ error: 'Il PDF sembra vuoto o non contiene testo estraibile.' });
    }

    console.log('[Parser] Testo estratto con successo. Interrogazione di Ollama...');

    // 2. Definizione del prompt per Ollama
    const prompt = `
      Analizza il seguente testo estratto da un CV. Estrai le informazioni chiave e formattale ESCLUSIVAMENTE come un oggetto JSON valido. Non aggiungere introduzioni, spiegazioni o testo fuori dal JSON.

      Struttura JSON richiesta:
      {
        "nome_completo": "Nome del candidato",
        "email": "Email del candidato",
        "hard_skills": ["Skill1", "Skill2"],
        "soft_skills": ["Skill1", "Skill2"],
        "anni_esperienza_totali": 0,
        "ultimo_ruolo": "Titolo dell'ultimo lavoro",
        "riassunto_profilo": "Breve sintesi professionale"
      }

      Testo del CV:
      ${textExtracted}
    `;

    // 3. Chiamata a Ollama locale
    const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3', 
      prompt: prompt,
      stream: false,
      format: 'json' 
    });

    // 4. Parsing del risultato JSON inviato dall'IA
    const parsedData = JSON.parse(ollamaResponse.data.response);

    console.log('[Parser] Elaborazione completata con successo!');
    return res.json({
      success: true,
      fileName: req.file.originalname,
      profile: parsedData
    });

  } catch (error) {
    console.error('[Parser Error]:', error.message);
    return res.status(500).json({
      error: 'Errore durante l\'elaborazione dell\'IA.',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(` AI Parser Service attivo sulla porta ${port}`);
});