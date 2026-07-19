import React from 'react';
import { 
  ArrowLeft, 
  FolderOpen, 
  Lock
} from 'lucide-react';
import { Member } from '../types';

interface LibraryViewerProps {
  currentUser: Member;
  type: 'Architecture' | 'Rituels' | 'Instructions';
  onBack: () => void;
  driveFiles?: any; // Kept for compatibility with App.tsx
}

export default function LibraryViewer({
  currentUser,
  type,
  onBack
}: LibraryViewerProps) {
  const userGrade = currentUser.grade;
  const isOfficer = currentUser.function !== 'Aucun' || currentUser.email === 'vm@loge.com';

  const isGradeAllowed = (folderGrade: 'Apprenti' | 'Compagnon' | 'Maitre') => {
    if (folderGrade === 'Apprenti') return true;
    if (folderGrade === 'Compagnon') {
      return userGrade === 'Compagnon' || userGrade === 'Maitre';
    }
    if (folderGrade === 'Maitre') {
      return userGrade === 'Maitre';
    }
    return false;
  };

  const googleDriveFolders = {
    Architecture: [
      { grade: 'Apprenti' as const, label: 'Dossier Planches - Apprentis', url: 'https://drive.google.com/drive/folders/16o7qUPDk31feVoX97NIB-JQezxGn9weV?usp=drive_link' },
      { grade: 'Compagnon' as const, label: 'Dossier Planches - Compagnons', url: 'https://drive.google.com/drive/folders/1EyL-gwEMrGy1vIMAWpd9narrne4yQEvZ?usp=drive_link' },
      { grade: 'Maitre' as const, label: 'Dossier Planches - Maîtres', url: 'https://drive.google.com/drive/folders/11ez4G3OmCVWNT1BbMDgHfcFYfbKgeqDS?usp=drive_link' }
    ],
    Rituels: [
      { grade: 'Apprenti' as const, label: 'Dossier Rituels - Apprentis', url: 'https://drive.google.com/drive/folders/1HUMlA7LU4p2H2q2irhzR0d9ZbrW0sqhR?usp=drive_link' },
      { grade: 'Compagnon' as const, label: 'Dossier Rituels - Compagnons', url: 'https://drive.google.com/drive/folders/1uwoZMDaD6tUp3FkTQAKwXlpEy7H2ETwy?usp=drive_link' },
      { grade: 'Maitre' as const, label: 'Dossier Rituels - Maîtres', url: 'https://drive.google.com/drive/folders/1VpvHOaxFNWbkeQHRCvr_pQI-iTSKe3_6?usp=drive_link' }
    ],
    Instructions: [
      { grade: 'Apprenti' as const, label: 'Dossier Instructions - Apprentis', url: 'https://drive.google.com/drive/folders/1qoK7fndJePm3DOxXeElXOowB8oPQB2v9?usp=drive_link' },
      { grade: 'Compagnon' as const, label: 'Dossier Instructions - Compagnons', url: 'https://drive.google.com/drive/folders/1n4fmiq36nQMu965bvKlpC5fiytQ_44oU?usp=drive_link' },
      { grade: 'Maitre' as const, label: 'Dossier Instructions - Maîtres', url: 'https://drive.google.com/drive/folders/1J_DvRYyy39Myz2t_IYq7Xi516PyUETTi?usp=drive_link' }
    ]
  };

  const getTypeNameFr = () => {
    if (type === 'Architecture') return "Morceaux d'Architecture";
    if (type === 'Rituels') return "Rituels";
    return "Instructions";
  };

  return (
    <div className="min-h-screen bg-[#081619] text-[#E8E8E8] pb-12 animate-fade-in select-none">
      {/* Header */}
      <header className="bg-[#122428] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
              id="library_back_button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-white">
              {getTypeNameFr()}
            </h2>
          </div>

          <div className="text-xs text-[#C5A059] font-mono border border-amber-500/20 bg-amber-500/5 px-3 py-1 rounded-lg">
            GRADE : {userGrade.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="space-y-8">
          {/* Header intro card */}
          <div className="bg-[#122428] border border-amber-500/15 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <h3 className="font-sans text-xl font-bold text-white uppercase tracking-wide">
              Bibliothèque Numérique de l'Atelier
            </h3>
            <p className="text-sm text-[#87A0A0] leading-relaxed max-w-3xl">
              Bienvenue sur l'espace d'archivage et de partage sécurisé de la Respectable Loge Bénou Ré. 
              Les répertoires ci-dessous sont hébergés sur Google Drive et régis par vos droits d'accès initiatiques. 
              Veuillez sélectionner le dossier correspondant à vos travaux.
            </p>
          </div>

          {/* Google Drive Folders Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-amber-500" />
              <h4 className="text-xs font-mono tracking-widest text-[#C5A059] uppercase">
                Répertoires Google Drive Sécurisés ({type === 'Architecture' ? 'Planches' : type})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {googleDriveFolders[type]?.map((folder) => {
                const allowed = isGradeAllowed(folder.grade);
                return (
                  <div
                    key={folder.grade}
                    id={`folder_${folder.grade.toLowerCase()}`}
                    className={`rounded-2xl border p-6 flex flex-col justify-between gap-6 transition duration-300 ${
                      allowed
                        ? 'bg-[#122428]/90 border-amber-500/20 shadow-md hover:border-amber-500/40 hover:-translate-y-1'
                        : 'bg-[#122428]/20 border-red-950/20 opacity-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                          folder.grade === 'Apprenti' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          folder.grade === 'Compagnon' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {folder.grade === 'Maitre' ? 'MAÎTRE' : folder.grade.toUpperCase()}
                        </span>
                        {!allowed && (
                          <span className="flex items-center gap-1 text-[9px] font-mono text-red-500 font-bold bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded">
                            <Lock className="h-2.5 w-2.5" />
                            VERROUILLÉ
                          </span>
                        )}
                      </div>
                      
                      <h5 className="font-sans text-sm font-bold text-white tracking-wide uppercase">
                        {folder.label}
                      </h5>
                      <p className="text-xs text-[#87A0A0] leading-relaxed">
                        {allowed 
                          ? `Contenu destiné aux membres initiés au grade d'${folder.grade === 'Maitre' ? 'Maître' : folder.grade.toLowerCase()}.` 
                          : `Réservé aux Frères possédant au moins le grade d'${folder.grade === 'Maitre' ? 'Maître' : folder.grade.toLowerCase()}.`}
                      </p>
                    </div>

                    {allowed ? (
                      <a
                        href={folder.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-3 rounded-xl bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-[#0C7A7A] hover:text-white transition duration-200 text-xs font-bold uppercase tracking-wider block"
                      >
                        Accéder au Dossier
                      </a>
                    ) : (
                      <div className="w-full text-center py-3 rounded-xl bg-black/20 border border-red-500/10 text-red-500/40 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2">
                        <Lock className="h-3.5 w-3.5" />
                        Accès Limité
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
