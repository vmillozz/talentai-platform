import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Briefcase, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Recupera i lavori dal Job Service
  useEffect(() => {
    axios.get('http://localhost:5003/api/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error("Errore caricamento lavori", err));
  }, []);

  const handleUploadAndMatch = async (e) => {
    e.preventDefault();
    if (!file || !selectedJob) return;

    setLoading(true);
    setResult(null);

    try {
      // Passo 1: Invia il CV all'AI Parser Service
      const formData = new FormData();
      formData.append('cv', file);
      
      const parserResponse = await axios.post('http://localhost:5003/api/parser/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const candidateProfile = parserResponse.data.profile;

      // Passo 2: Invia il profilo estratto al Job Service per il matching
      const matchResponse = await axios.post(`http://localhost:5003/api/jobs/${selectedJob.id}/match`, {
        candidateProfile
      });

      setResult(matchResponse.data.match);
    } catch (error) {
      console.error(error);
      alert("Si è verificato un errore durante l'elaborazione del CV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Briefcase className="text-indigo-600" /> Bacheca Offerte di Lavoro
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Elenco dei lavori */}
        <div className="md:col-span-2 space-y-4">
          {jobs.map(job => (
            <div 
              key={job.id} 
              onClick={() => { setSelectedJob(job); setResult(null); }}
              className={`p-5 border rounded-xl cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
            >
              <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
              <p className="text-gray-600 mt-2 line-clamp-2 text-sm">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills_required.map(skill => (
                  <span key={skill} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pannello di candidatura e IA */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
          {selectedJob ? (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Candidati per:</h3>
              <p className="text-indigo-600 font-medium mb-4 text-sm">{selectedJob.title}</p>
              
              <form onSubmit={handleUploadAndMatch} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors relative">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-gray-400 mb-2" size={28} />
                  <p className="text-xs text-gray-500">{file ? file.name : "Trascina o seleziona il tuo CV (PDF)"}</p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !file}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="animate-spin" size={18} /> : "Invia ed Analizza con AI"}
                </button>
              </form>

              {/* Risultato del Match Istantaneo */}
              {result && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Punteggio di Compatibilità:</span>
                    <span className={`text-xl font-bold px-2 py-0.5 rounded ${result.punteggio_match >= 70 ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>
                      {result.punteggio_match}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">{result.motivazione_sintetica}</p>
                  
                  {result.skills_mancanti?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-red-600 mb-1">Skill consigliate da approfondire:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.skills_mancanti.map(s => <span key={s} className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Seleziona un'offerta di lavoro a sinistra per iniziare la candidatura.</p>
          )}
        </div>
      </div>
    </div>
  );
}