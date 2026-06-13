import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 5001; // Porta dedicata al Job Service

app.use(cors());
app.use(express.json());

// URL di Ollama locale
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Database in memoria (Mock) per simulare le posizioni aperte
const jobPositions = [
  {
    id: "job-1",
    title: "Sviluppatore Full-Stack Node/React",
    description: "Cerchiamo un programmatore con forte esperienza su Node.js (Express), architetture a microservizi e sviluppo frontend in React. Gradita la conoscenza di database relazionali e strumenti di IA.",
    skills_required: ["Node.js", "React", "Express", "Microservices", "JavaScript"]
  },
  {
    id: "job-2",
    title: "Product Manager - HR Tech",
    description: "La risorsa si occuperà di definire la roadmap del prodotto, gestire il backlog e coordinarsi con il team di sviluppo. Richieste soft skill di leadership e problem solving.",
    skills_required: ["Product Management", "Agile", "Scrum", "Leadership", "Problem Solving"]
  }
];

// 1. Rotta della Job Board: Ottieni tutti gli annunci di lavoro
app.get('/api/jobs', (req, res) => {
  res.json(jobPositions);
});

// 2. Rotta di Matching: Compara un profilo CV con una specifica posizione di lavoro
app.post('/api/jobs/:id/match', async (req, res) => {
  try {
    const jobId = req.params.id;
    const { candidateProfile } = req.body; // Riceve il JSON del profilo strutturato dall'AI Parser

    // Trova l'annuncio corrispondente
    const job = jobPositions.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ error: 'Annuncio di lavoro non trovato.' });
    }

    if (!candidateProfile) {
      return res.status(400).json({ error: 'Dati del candidato mancanti per effettuare il match.' });
    }

    console.log(`[Job Service] Avvio AI Matching per il candidato ${candidateProfile.nome_completo || 'Anonimo'} sul ruolo: ${job.title}`);

    // Costruiamo il prompt di valutazione per Ollama
    const matchingPrompt = `
      Agisci come un Recruiter Tecnico esperto. Devi valutare la compatibilità tra un annuncio di lavoro (Job Description) e il profilo strutturato di un candidato.
      
      ANNUNCIO DI LAVORO:
      Posizione: ${job.title}
      Descrizione: ${job.description}
      Skill Richieste: ${job.skills_required.join(', ')}

      PROFILO CANDIDATO:
      Ultimo Ruolo: ${candidateProfile.ultimo_ruolo}
      Anni Esperienza: ${candidateProfile.anni_esperienza_totali}
      Hard Skills: ${candidateProfile.hard_skills ? candidateProfile.hard_skills.join(', ') : 'Nessuna'}
      Soft Skills: ${candidateProfile.soft_skills ? candidateProfile.soft_skills.join(', ') : 'Nessuna'}
      Riassunto: ${candidateProfile.riassunto_profilo}

      Valuta la compatibilità ed esprimi il risultato ESCLUSIVAMENTE in formato JSON con la seguente struttura:
      {
        "punteggio_match": 85, // Un numero intero da 0 a 100
        "motivazione_sintetica": "Spiegazione in massimo due frasi dei punti di forza e debolezza rispetto al ruolo.",
        "skills_mancanti": ["SkillMancante1"] // Skill esplicitamente richieste nell'annuncio ma assenti nel profilo
      }
    `;

    // Interroghiamo Ollama locale
    const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3',
      prompt: matchingPrompt,
      stream: false,
      format: 'json'
    });

    const matchResult = JSON.parse(ollamaResponse.data.response);

    console.log(`[Job Service] Match calcolato: ${matchResult.punteggio_match}%`);

    return res.json({
      success: true,
      jobId: job.id,
      jobTitle: job.title,
      match: matchResult
    });

  } catch (error) {
    console.error('[Job Service Error]:', error.message);
    return res.status(500).json({
      error: 'Errore durante il calcolo del matching con l\'IA.',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(` Job Service attivo sulla porta ${port}`);
});