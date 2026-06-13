import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();
const port = 5003; // Il punto di ingresso unico risponderà alla porta 5003

app.use(cors());
// NOTA: Non usiamo app.use(express.json()) globalmente qui, altrimenti rischiamo 
// di corrompere lo streaming dei file binari (come i PDF) che passano attraverso il proxy.

// Configurazione degli indirizzi interni dei microservizi
const JOB_SERVICE_URL = process.env.JOB_SERVICE_URL || 'http://localhost:5001';
const PARSER_SERVICE_URL = process.env.PARSER_SERVICE_URL || 'http://localhost:5002';

console.log(`[Gateway] Configurato Job Service su: ${JOB_SERVICE_URL}`);
console.log(`[Gateway] Configurato Parser Service su: ${PARSER_SERVICE_URL}`);

// Rotta per i lavori e il matching -> Smista verso il Job Service
app.use('/api/jobs', proxy(JOB_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/jobs${req.url}`; // Ricostruisce l'URL esatto per il servizio di destinazione
  }
}));

// Rotta per l'upload e il parsing dei CV -> Smista verso il Parser Service
app.use('/api/parser', proxy(PARSER_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/parser${req.url}`;
  }
}));

app.listen(port, () => {
  console.log(`🛡️ API Gateway centralizzato attivo sulla porta ${port}`);
});