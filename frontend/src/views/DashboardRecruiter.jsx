import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Award, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardRecruiter() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Simulazione di un database storicizzato di candidature ricevute dall'API Gateway
  // Nelle architetture reali, questi dati arriverebbero da un database condiviso o da un servizio 'application-service'
  const [applications, setApplications] = useState([
    {
      id: "app-1",
      jobId: "job-1",
      candidateName: "Vito Millozza",
      email: "vito@example.com",
      ultimoRuolo: "Developer Node.js",
      score: 92,
      motivazione: "Il candidato ha un'eccellente padronanza di Node.js ed Express, coprendo interamente lo stack richiesto. Ha già lavorato con architetture a microservizi.",
      skillsMancanti: []
    },
    {
      id: "app-2",
      jobId: "job-1",
      candidateName: "Mario Rossi",
      email: "mario.rossi@example.com",
      ultimoRuolo: "Frontend Dev (React)",
      score: 65,
      motivazione: "Buona conoscenza di React, ma background debole sul lato backend (Node.js/Express) richiesto come core dall'annuncio.",
      skillsMancanti: ["Node.js", "Express", "Microservices"]
    },
    {
      id: "app-3",
      jobId: "job-2",
      candidateName: "Anna Verdi",
      email: "anna.verdi@example.com",
      ultimoRuolo: "Project Manager",
      score: 85,
      motivazione: "Forte esperienza nella gestione Agile e Scrum. Ottime doti comunicative e di leadership riscontrate nel profilo.",
      skillsMancanti: ["Product Management"]
    }
  ]);

  useEffect(() => {
    // Recupera i ruoli disponibili dal Gateway per popolare il filtro
    axios.get('http://localhost:5003/api/jobs')
      .then(res => {
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJobId(res.data[0].id);
      })
      .catch(err => console.error("Errore nel recupero dei job per la dashboard", err));
  }, []);

  // Filtra le candidature in base al lavoro selezionato nel menu a tendina
  const filteredApplications = applications.filter(app => app.jobId === selectedJobId)
    .sort((a, b) => b.score - a.score); // Ordina automaticamente dal punteggio AI più alto al più basso

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Statistiche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Dashboard Recruiter
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitoraggio dei candidati e screening automatico effettuato dall'IA</p>
        </div>

        {/* Selettore Ruolo */}
        <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase px-2">Filtra per Ruolo:</span>
          <select 
            value={selectedJobId} 
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-sm font-medium bg-transparent border-none text-gray-700 focus:ring-0 cursor-pointer outline-none"
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista dei candidati valutati */}
      <div className="space-y-6">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app, index) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              {/* Badge Podio (Primo in classifica) */}
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Award size={12} /> Top Match
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Dati Anagrafici */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-800">{app.candidateName}</h3>
                  <p className="text-sm text-gray-600 font-medium">Ultimo Ruolo: <span className="text-gray-900">{app.ultimoRuolo}</span></p>
                  <p className="text-xs text-gray-400">{app.email}</p>
                </div>

                {/* Grafico circolare o Badge Punteggio AI */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-lg ${getScoreBadgeColor(app.score)}`}>
                  <TrendingUp size={20} />
                  <span>{app.score}% Match</span>
                </div>
              </div>

              {/* Motivazione dell'IA */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Analisi Sintetica dell'IA:</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{app.motivazione}</p>
              </div>

              {/* Tag Skills Mancanti */}
              {app.skillsMancanti.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle size={14} /> Gap rilevati:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {app.skillsMancanti.map(skill => (
                      <span key={skill} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 text-sm">Nessuna candidatura ricevuta per questa posizione.</p>
          </div>
        )}
      </div>
    </div>
  );
}