import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FolderOpen, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Calendar, 
  User, 
  Eye, 
  ArrowRight,
  Lock,
  Sparkles,
  Search
} from 'lucide-react';
import { DriveFile, Member } from '../types';

interface LibraryViewerProps {
  currentUser: Member;
  driveFiles: DriveFile[];
  type: 'Architecture' | 'Rituels' | 'Instructions';
  onBack: () => void;
}

export default function LibraryViewer({
  currentUser,
  driveFiles,
  type,
  onBack
}: LibraryViewerProps) {
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Access rules:
  // - Apprenti can see 'Apprenti' files
  // - Compagnon can see 'Apprenti' & 'Compagnon' files
  // - Maitre can see 'Apprenti', 'Compagnon' & 'Maitre' files
  // - Officers (function !== 'Aucun' or VM/Sec) can see 'Officiers' files
  const userGrade = currentUser.grade;
  const isOfficer = currentUser.function !== 'Aucun' || currentUser.email === 'vm@loge.com';

  const isGradeAllowed = (fileGrade: DriveFile['grade']) => {
    if (fileGrade === 'Apprenti') return true;
    if (fileGrade === 'Compagnon') {
      return userGrade === 'Compagnon' || userGrade === 'Maitre';
    }
    if (fileGrade === 'Maitre') {
      return userGrade === 'Maitre';
    }
    if (fileGrade === 'Officiers') {
      return isOfficer && userGrade === 'Maitre';
    }
    return false;
  };

  const currentCategoryFiles = driveFiles.filter(file => file.type === type);

  const filteredFiles = currentCategoryFiles.filter(file => {
    const titleMatch = file.title.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = file.author.toLowerCase().includes(searchQuery.toLowerCase());
    const summaryMatch = file.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || authorMatch || summaryMatch;
  });

  return (
    <div className="min-h-screen bg-[#081619] text-[#E8E8E8] pb-12 animate-fade-in select-none">
      {/* Header */}
      <header className="bg-[#122428] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={selectedFile ? () => setSelectedFile(null) : onBack}
              className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-white">
              {selectedFile ? 'Lecture de la planche' : type === 'Architecture' ? 'Morceaux d\'Architecture' : type}
            </h2>
          </div>

          <div className="text-xs text-[#C5A059] font-mono border border-amber-500/20 bg-amber-500/5 px-3 py-1 rounded-lg">
            GRADE : {userGrade.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* VIEW 1: FILE READER PANEL */}
        {selectedFile ? (
          <div className="bg-[#122428] border border-amber-500/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in">
            {/* Meta header details */}
            <div className="border-b border-[#87A0A0]/10 pb-4 space-y-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                selectedFile.grade === 'Apprenti' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                selectedFile.grade === 'Compagnon' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                selectedFile.grade === 'Maitre' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                Niveau : {selectedFile.grade}
              </span>

              <h3 className="font-sans text-2xl font-bold text-white tracking-wide leading-tight">
                {selectedFile.title}
              </h3>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#87A0A0] pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#C5A059]" />
                  Auteur : <strong>{selectedFile.author}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#C5A059]" />
                  Déposé le : {new Date(selectedFile.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Main content body */}
            <div className="prose prose-invert prose-teal max-w-none text-[#E8E8E8] text-sm leading-relaxed text-justify space-y-6 font-serif pt-2 whitespace-pre-line border-b border-[#87A0A0]/10 pb-8">
              {selectedFile.content || selectedFile.summary}
            </div>

            {/* Read actions footer */}
            <div className="flex justify-between items-center text-xs text-[#87A0A0]/60">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Respectable Loge Bénou Ré — RAPMM
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-[#C5A059] hover:underline font-bold"
              >
                Retourner au dossier
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: DIRECTORY FILE BROWSER */
          <div className="space-y-6">
            {/* Search filter bar */}
            <div className="bg-[#122428] border border-amber-500/15 rounded-2xl p-4">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#C5A059]">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher par titre, auteur, ou mot-clé..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E8E8E8] focus:border-[#C5A059] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-4 w-4 text-[#C5A059]" />
              <h4 className="text-xs font-mono tracking-widest text-[#C5A059] uppercase">
                Dossiers partagés dans la bibliothèque
              </h4>
            </div>

            {/* Files List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredFiles.map(file => {
                const allowed = isGradeAllowed(file.grade);
                
                return (
                  <div
                    key={file.id}
                    className={`rounded-2xl border p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                      allowed 
                        ? 'bg-[#122428] border-amber-500/10 hover:border-amber-500/30 shadow-md' 
                        : 'bg-[#122428]/30 border-gray-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-2 flex-grow min-w-0">
                      {/* Title & Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                          file.grade === 'Apprenti' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          file.grade === 'Compagnon' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          file.grade === 'Maitre' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}>
                          {file.grade.toUpperCase()}
                        </span>
                        
                        <h4 className="font-sans text-sm font-bold text-white tracking-wide truncate">
                          {file.title}
                        </h4>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-[#87A0A0] line-clamp-2 max-w-2xl leading-relaxed">
                        {file.summary}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                        <span>Auteur : {file.author}</span>
                        <span>•</span>
                        <span>Déposé : {new Date(file.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {/* Action trigger */}
                    <div className="shrink-0 self-stretch md:self-auto flex items-center justify-end">
                      {allowed ? (
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-[#0C7A7A] hover:text-white transition text-xs font-bold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          LIRE
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-rose-500/80 bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/10 font-bold font-mono">
                          <Lock className="h-3.5 w-3.5" />
                          VERROUILLÉ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
