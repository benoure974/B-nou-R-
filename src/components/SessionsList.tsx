import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Utensils, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Mail,
  Edit2,
  Trash2,
  PlusCircle,
  UserCheck,
  Award
} from 'lucide-react';
import { Session, Member, Visitor } from '../types';
import SignaturePad from './SignaturePad';

interface SessionsListProps {
  currentUser: Member;
  sessions: Session[];
  members: Member[];
  visitors: Visitor[];
  onAddSession: (session: Session) => void;
  onUpdateSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  onBack: () => void;
}

export default function SessionsList({
  currentUser,
  sessions,
  members,
  visitors,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onBack
}: SessionsListProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSignatureForId, setShowSignatureForId] = useState<string | null>(null);
  const [showMemberAppel, setShowMemberAppel] = useState(false);
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  const [pdfTypeToShow, setPdfTypeToShow] = useState<'convocation' | 'invitation' | 'presence' | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Session>>({});

  const isEditingExisting = sessions.some(s => s.id === formData.id);

  const functionTrim = (currentUser.function || '').trim();
  const isAdmin = currentUser.isAdmin || false;
  const isSecOrVM = isAdmin || functionTrim.includes('Vénérable Maître') || functionTrim.includes('Secrétaire');

  // Filter sessions visible to user grade
  const visibleSessions = sessions.filter(session => {
    if (isSecOrVM) return true;
    if (currentUser.grade === 'Maitre') return true;
    if (currentUser.grade === 'Compagnon') {
      return session.degree === 'Apprenti' || session.degree === 'Compagnon';
    }
    return session.degree === 'Apprenti'; // Standard Apprenti only sees Apprenti sessions
  });

  const handleOpenDetail = (session: Session) => {
    setSelectedSession(session);
    setIsEditing(false);
  };

  const handleStartCreate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const dateStr = today.toISOString().split('T')[0] + 'T16:30:00';

    setFormData({
      id: 's_' + Date.now(),
      date: dateStr,
      degree: 'Apprenti',
      type: 'Ordinaire',
      title: 'Tenue Ordinaire du ' + today.toLocaleDateString('fr-FR') + ' au degré d\'Apprenti',
      description: 'Reprise des travaux au premier degré',
      location: 'Temple Thérèse Eliseman à Saint-Pierre',
      presentIds: [],
      excusedIds: [],
      visitorIds: [],
      troncAmount: 0,
      signatures: {},
      closingTime: '18:30',
      agenda1: '16:30 Reprise des travaux au degré d\'Apprenti Rite Ancien et Primitif de Memphis-Misraïm',
      agenda2: 'Lecture de la planche thématique',
      agenda3: 'Circulation du tronc de la Veuve et du sac aux propositions',
      agenda4: '18:30 Suspension des travaux au degré d\'Apprenti Rite Ancien et Primitif de Memphis-Misraïm',
      hasAgape: true,
      agapeTime: '20:00',
      agapeType: 'Agape partage',
      agapePrice: 0
    });
    setSelectedSession(null);
    setIsEditing(true);
  };

  const handleStartEdit = (session: Session) => {
    setFormData(session);
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    // Build dynamic titles and automatic lines
    const sDate = new Date(formData.date || '');
    const dateShortStr = sDate.toLocaleDateString('fr-FR');
    const timeStr = sDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const degreePrep = formData.degree === 'Apprenti' ? "d'" : "de ";
    
    const autoTitle = `Tenue ${formData.type} du ${dateShortStr} au degré ${degreePrep}${formData.degree}`;
    const autoLine1 = `${formData.date?.split('T')[1].substring(0, 5)} Reprise des travaux au degré ${degreePrep}${formData.degree} Rite Ancien et Primitif de Memphis-Misraïm`;
    const autoLine4 = `${formData.closingTime} Suspension des travaux au degré ${degreePrep}${formData.degree} Rite Ancien et Primitif de Memphis-Misraïm`;

    const finalSession = {
      ...formData,
      title: autoTitle,
      agenda1: autoLine1,
      agenda4: autoLine4
    } as Session;

    const isNew = !sessions.some(s => s.id === finalSession.id);
    if (isNew) {
      onAddSession(finalSession);
    } else {
      onUpdateSession(finalSession);
    }

    setIsEditing(false);
    setSelectedSession(finalSession);
  };

  const handleToggleMyAttendance = (session: Session, isPresent: boolean) => {
    const pIds = [...session.presentIds];
    const eIds = [...session.excusedIds];

    if (isPresent) {
      if (!pIds.includes(currentUser.id)) pIds.push(currentUser.id);
      const idx = eIds.indexOf(currentUser.id);
      if (idx > -1) eIds.splice(idx, 1);
    } else {
      if (!eIds.includes(currentUser.id)) eIds.push(currentUser.id);
      const idx = pIds.indexOf(currentUser.id);
      if (idx > -1) pIds.splice(idx, 1);
      
      // Clear signature if excused
      const sigs = { ...session.signatures };
      delete sigs[currentUser.id];
      session.signatures = sigs;
    }

    onUpdateSession({
      ...session,
      presentIds: pIds,
      excusedIds: eIds
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tenue ?')) {
      onDeleteSession(id);
      setSelectedSession(null);
      setIsEditing(false);
    }
  };

  const handleSaveSignature = (base64: string) => {
    if (!selectedSession || !showSignatureForId) return;

    const updatedSigs = {
      ...selectedSession.signatures,
      [showSignatureForId]: base64
    };

    const updatedSession = {
      ...selectedSession,
      signatures: updatedSigs
    };

    onUpdateSession(updatedSession);
    setSelectedSession(updatedSession);
    setShowSignatureForId(null);
  };

  const handleToggleMemberAppel = (memberId: string) => {
    if (!selectedSession) return;
    const pIds = [...selectedSession.presentIds];
    const eIds = [...selectedSession.excusedIds];

    const isPresent = pIds.includes(memberId);
    if (isPresent) {
      // Remove from presents
      const idx = pIds.indexOf(memberId);
      pIds.splice(idx, 1);
      // Remove signature as well
      const sigs = { ...selectedSession.signatures };
      delete sigs[memberId];
      selectedSession.signatures = sigs;
    } else {
      // Add to presents, remove from excused
      pIds.push(memberId);
      const idx = eIds.indexOf(memberId);
      if (idx > -1) eIds.splice(idx, 1);
    }

    const updated = {
      ...selectedSession,
      presentIds: pIds,
      excusedIds: eIds
    };
    onUpdateSession(updated);
    setSelectedSession(updated);
  };

  const handleAddVisitorToSession = (visitorId: string) => {
    if (!selectedSession) return;
    const vIds = [...selectedSession.visitorIds];
    if (!vIds.includes(visitorId)) {
      vIds.push(visitorId);
    }
    const updated = {
      ...selectedSession,
      visitorIds: vIds
    };
    onUpdateSession(updated);
    setSelectedSession(updated);
    setShowVisitorSelector(false);
  };

  const handleRemoveVisitorFromSession = (visitorId: string) => {
    if (!selectedSession) return;
    const vIds = selectedSession.visitorIds.filter(id => id !== visitorId);
    const sigs = { ...selectedSession.signatures };
    delete sigs[visitorId];

    const updated = {
      ...selectedSession,
      visitorIds: vIds,
      signatures: sigs
    };
    onUpdateSession(updated);
    setSelectedSession(updated);
  };

  // Helper date conversions
  const formatDateFrench = (iso: string) => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#081619] text-[#E8E8E8] pb-12 animate-fade-in select-none">
      {/* Signature drawing overlay */}
      {showSignatureForId && (
        <SignaturePad
          onSave={handleSaveSignature}
          onCancel={() => setShowSignatureForId(null)}
          title={`ÉMARGEMENT DE ${
            members.find(m => m.id === showSignatureForId)?.firstName?.toUpperCase() ||
            visitors.find(v => v.id === showSignatureForId)?.firstName?.toUpperCase() ||
            'PARTICIPANT'
          } ${
            members.find(m => m.id === showSignatureForId)?.lastName?.toUpperCase() ||
            visitors.find(v => v.id === showSignatureForId)?.lastName?.toUpperCase() ||
            ''
          }`}
        />
      )}

      {/* PDF PRINT PREVIEW OVERLAY */}
      {pdfTypeToShow && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white text-black rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative my-8">
            <button
              onClick={() => setPdfTypeToShow(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl print:hidden"
            >
              ✕
            </button>

            {/* Print Action Header */}
            <div className="flex justify-between items-center border-b pb-4 print:hidden">
              <span className="text-xs font-mono text-amber-600 uppercase tracking-widest">Aperçu avant impression (Certificat Officiel)</span>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#0C7A7A] text-white hover:bg-[#0A6868] text-sm font-bold transition flex items-center gap-2 shadow"
              >
                <FileText className="h-4 w-4" />
                IMPRIMER LE DOCUMENT
              </button>
            </div>

            {/* Printable Layout Container */}
            <div className="print-document font-serif p-4 md:p-8 bg-white border border-gray-100 flex flex-col gap-6 text-sm leading-relaxed" id="printable-pdf-view">
              
              {/* Header block */}
              <div className="flex flex-col items-center text-center gap-1.5 border-b border-gray-200 pb-4">
                <span className="text-[10px] uppercase italic tracking-wide text-gray-500">A La Gloire Du Sublime Architecte des Mondes</span>
                <h1 className="text-base font-bold uppercase text-blue-900 leading-tight">Ordre Initiatique Ancien et Primitif de Memphis Misraïm</h1>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">Respectable Loge Bénou Ré (Orient de Saint-Pierre)</h2>
                <span className="text-[9px] italic text-gray-600">Non Nobis Domine, Non Nobis Sed Nomini Tuo Da Gloriam</span>
              </div>

              {/* Dynamic details */}
              {pdfTypeToShow === 'convocation' && (
                <div className="space-y-6">
                  <div className="text-center py-2 border-y border-gray-200 my-2">
                    <h3 className="text-lg font-bold text-amber-800 uppercase tracking-wide underline">CONVOCATION SOLENNELLE</h3>
                    <p className="text-xs text-gray-600 italic">Pour la tenue de Loge d'instruction au grade de {selectedSession.degree}</p>
                  </div>

                  <p className="font-semibold text-gray-800">Vv. . Mm. ., Mes Bbaass. ., Mes Tt. . Cca. . Ff. .,</p>
                  <p className="text-justify">
                    La Respectable Loge <strong>Bénou Ré</strong> vous informe de sa tenue du {formatDateFrench(selectedSession.date)} et vous convie fraternellement à ses travaux qui se tiendront de {formatTime(selectedSession.date).replace(':', 'h')} à {selectedSession.closingTime.replace(':', 'h')} au Temple Thérèse Eliseman de Saint-Pierre.
                  </p>

                  <div className="bg-gray-50 border p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-blue-900 border-b pb-1 text-xs uppercase tracking-wider">L'ordre du jour appellera :</h4>
                    <ul className="list-decimal list-inside space-y-1 text-xs">
                      <li>Ouverture des travaux au grade d'<strong>{selectedSession.degree}</strong>.</li>
                      {selectedSession.agenda2 && <li>{selectedSession.agenda2}</li>}
                      {selectedSession.agenda3 && <li>{selectedSession.agenda3}</li>}
                      <li>Suspension des travaux et fermeture rituelle à {selectedSession.closingTime.replace(':', 'h')}.</li>
                    </ul>
                  </div>

                  {selectedSession.hasAgape && (
                    <p className="text-xs italic bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-amber-900">
                      <strong>Agapes fraternelles :</strong> Suivies d'une {selectedSession.agapeType} à {selectedSession.agapeTime.replace(':', 'h')} 
                      {selectedSession.agapePrice > 0 ? ` (Participation demandée : ${selectedSession.agapePrice} €)` : ''}.
                    </p>
                  )}

                  <div className="text-center pt-4 border-t text-xs text-amber-900 font-bold space-y-1">
                    <p>Merci de confirmer ou d'infirmer impérativement votre présence.</p>
                    <p className="text-gray-500 font-normal">VM Bruno Gaudin : 06 92 87 38 83 • Secrétaire : 06 93 47 07 00</p>
                  </div>
                </div>
              )}

              {pdfTypeToShow === 'invitation' && (
                <div className="space-y-6">
                  <div className="text-center py-2 border-y border-gray-200 my-2">
                    <h3 className="text-lg font-bold text-emerald-800 uppercase tracking-wide underline">INVITATION FRATERNELLE</h3>
                    <p className="text-xs text-gray-600 italic">Aux dignitaires et visiteurs des loges amies</p>
                  </div>

                  <p className="font-semibold text-gray-800">Vv. . Mm. ., Mes Bbaass. ., Mes Tt. . Cca. . Ff. . Visiteurs,</p>
                  <p className="text-justify">
                    La Respectable Loge <strong>Bénou Ré</strong> a le plaisir de vous convier à sa tenue fraternelle de grade d'<strong>{selectedSession.degree}</strong>, qui se déroulera le {formatDateFrench(selectedSession.date)} à {formatTime(selectedSession.date).replace(':', 'h')} au Temple de Saint-Pierre de la Réunion.
                  </p>

                  <div className="bg-gray-50 border p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-emerald-900 border-b pb-1 text-xs uppercase tracking-wider">Ordre du jour résumé :</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Ouverture rituelle et accueil des visiteurs.</li>
                      {selectedSession.agenda2 && <li>{selectedSession.agenda2}</li>}
                      {selectedSession.agenda3 && <li>{selectedSession.agenda3}</li>}
                    </ul>
                  </div>

                  {selectedSession.hasAgape && (
                    <p className="text-xs bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-emerald-950">
                      Nous serons ravis de vous compter parmi nous lors de nos agapes ({selectedSession.agapeType}) prévues à {selectedSession.agapeTime.replace(':', 'h')}.
                    </p>
                  )}

                  <div className="text-center pt-4 border-t text-xs text-gray-500">
                    <p>En espérant partager la chaleur de notre chaîne d'union. Relevez la triple accolade.</p>
                  </div>
                </div>
              )}

              {pdfTypeToShow === 'presence' && (
                <div className="space-y-5">
                  <div className="text-center py-1.5 border-y border-gray-200 my-1">
                    <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">FEUILLE D'ÉMARGEMENT ET DE PRÉSENCE</h3>
                    <p className="text-[11px] text-gray-600">{selectedSession.title}</p>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-4 border p-3 rounded-xl bg-gray-50 text-xs">
                    <div>
                      <strong>Date :</strong> {formatDateFrench(selectedSession.date)}<br />
                      <strong>Lieu :</strong> {selectedSession.location}
                    </div>
                    <div className="text-right">
                      <strong>Degré :</strong> {selectedSession.degree}<br />
                      <strong>Type :</strong> {selectedSession.type}
                    </div>
                  </div>

                  {/* Present table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 border-b pb-1 uppercase tracking-wider">MEMBRES DE L'ATELIER PRÉSENTS</h4>
                    <table className="w-full border-collapse border border-gray-300 text-xs text-left">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2">Nom & Prénom</th>
                          <th className="border border-gray-300 p-2">Office / Fonction</th>
                          <th className="border border-gray-300 p-2 w-40">Signature Émargement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.filter(m => selectedSession.presentIds.includes(m.id)).map(m => (
                          <tr key={m.id}>
                            <td className="border border-gray-300 p-2 font-semibold">{m.firstName} {m.lastName}</td>
                            <td className="border border-gray-300 p-2 text-gray-600">{m.function !== 'Aucun' ? m.function : 'Membre'}</td>
                            <td className="border border-gray-300 p-1 h-12 relative">
                              {selectedSession.signatures[m.id] ? (
                                <img src={selectedSession.signatures[m.id]} alt="sig" className="max-h-full mx-auto object-contain max-w-[120px]" />
                              ) : (
                                <span className="text-gray-400 italic text-[10px] flex justify-center items-center h-full">Néant</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Visitors table */}
                  {selectedSession.visitorIds.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 border-b pb-1 uppercase tracking-wider">VISITEURS PRÉSENTS</h4>
                      <table className="w-full border-collapse border border-gray-300 text-xs text-left">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Nom & Prénom</th>
                            <th className="border border-gray-300 p-2">Loge & Orient</th>
                            <th className="border border-gray-300 p-2 w-40">Signature Émargement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitors.filter(v => selectedSession.visitorIds.includes(v.id)).map(v => (
                            <tr key={v.id}>
                              <td className="border border-gray-300 p-2 font-semibold">{v.firstName} {v.lastName}</td>
                              <td className="border border-gray-300 p-2 text-gray-600">{v.lodge} ({v.orient})</td>
                              <td className="border border-gray-300 p-1 h-12 relative">
                                {selectedSession.signatures[v.id] ? (
                                  <img src={selectedSession.signatures[v.id]} alt="sig" className="max-h-full mx-auto object-contain max-w-[120px]" />
                                ) : (
                                  <span className="text-gray-400 italic text-[10px] flex justify-center items-center h-full">Néant</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Finance / Tronc info */}
                  <div className="flex justify-between items-center bg-gray-100 border p-3 rounded-xl text-xs font-bold mt-4">
                    <span>TOTAL COMPTABILISÉ PRÉSENTS : {selectedSession.presentIds.length + selectedSession.visitorIds.length}</span>
                    <span className="text-red-800">TRONC DE LA VEUVE : {selectedSession.troncAmount.toFixed(2)} €</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 print:hidden">
              <button
                onClick={() => setPdfTypeToShow(null)}
                className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-semibold transition"
              >
                FERMER L'APERÇU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#122428] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={selectedSession || isEditing ? () => { setSelectedSession(null); setIsEditing(false); } : onBack}
              className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-white">
              {isEditing ? (formData.id && sessions.some(s => s.id === formData.id) ? 'Modifier la tenue' : 'Planifier une tenue') : selectedSession ? 'Détail de la Tenue' : 'Calendrier des Tenues'}
            </h2>
          </div>

          {isSecOrVM && !isEditing && !selectedSession && (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C7A7A] hover:bg-[#0A6868] text-white text-xs font-bold border border-amber-500/20 transition animate-pulse"
            >
              <Plus className="h-4 w-4 text-[#C5A059]" />
              CRÉER UNE TENUE
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* VIEW 1: FORM (CREATE / EDIT) */}
        {isEditing && (
          <form onSubmit={handleSaveForm} className="bg-[#122428] border border-amber-500/20 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-mono tracking-widest text-amber-500 uppercase border-b border-amber-500/10 pb-2">
              Planification des travaux rituels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0] block">Type de Tenue</label>
                <select
                  value={formData.type || 'Ordinaire'}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="Ordinaire">Ordinaire</option>
                  <option value="Solennelle">Solennelle</option>
                  <option value="Instruction">Instruction</option>
                  <option value="Banquet">Banquet</option>
                  <option value="Conseil">Conseil</option>
                </select>
              </div>

              {/* Degree */}
              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0] block">Degré de Travail</label>
                <select
                  value={formData.degree || 'Apprenti'}
                  onChange={e => setFormData({ ...formData, degree: e.target.value as any })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="Apprenti">Apprenti</option>
                  <option value="Compagnon">Compagnon</option>
                  <option value="Maitre">Maître</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0] block">Date & Heure de reprise</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date || ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Closing Time */}
              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0] block">Heure de suspension (Clôture)</label>
                <input
                  type="text"
                  placeholder="ex: 18:30"
                  required
                  value={formData.closingTime || ''}
                  onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-[#87A0A0] block">Lieu de Réunion</label>
                <input
                  type="text"
                  required
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Agenda 2 - Plan principal 1 */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-[#87A0A0] block">Travail Principal 1 (Ordre du jour Ligne 2)</label>
                <input
                  type="text"
                  value={formData.agenda2 || ''}
                  onChange={e => setFormData({ ...formData, agenda2: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Agenda 3 - Plan principal 2 */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-[#87A0A0] block">Travail Principal 2 (Ordre du jour Ligne 3)</label>
                <input
                  type="text"
                  value={formData.agenda3 || ''}
                  onChange={e => setFormData({ ...formData, agenda3: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Tronc Amount setup (for edit only) */}
              {isEditingExisting && (
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0] block">Tronc de la Veuve récolté (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.troncAmount || 0}
                    onChange={e => setFormData({ ...formData, troncAmount: Number(e.target.value) })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Agapes Settings */}
            <div className="border-t border-amber-500/10 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  Suivi d'agapes fraternelles ?
                </h4>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.hasAgape || false}
                    onChange={e => setFormData({ ...formData, hasAgape: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0C7A7A]"></div>
                </label>
              </div>

              {formData.hasAgape && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs text-[#87A0A0] block">Heure de l'agape</label>
                    <input
                      type="text"
                      placeholder="ex: 20:00"
                      value={formData.agapeTime || '20:00'}
                      onChange={e => setFormData({ ...formData, agapeTime: e.target.value })}
                      className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl p-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#87A0A0] block">Type de repas</label>
                    <select
                      value={formData.agapeType || 'Agape partage'}
                      onChange={e => setFormData({ ...formData, agapeType: e.target.value as any })}
                      className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl p-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                    >
                      <option value="Agape partage">Agape partage</option>
                      <option value="Agape offerte">Agape offerte</option>
                      <option value="Agape avec médaille">Agape avec médaille</option>
                    </select>
                  </div>

                  {formData.agapeType === 'Agape avec médaille' && (
                    <div className="space-y-1">
                      <label className="text-xs text-[#87A0A0] block">Montant participation (€)</label>
                      <input
                        type="number"
                        value={formData.agapePrice || 0}
                        onChange={e => setFormData({ ...formData, agapePrice: Number(e.target.value) })}
                        className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl p-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 border-t border-amber-500/10 pt-6 justify-end">
              <button
                type="button"
                onClick={() => { setIsEditing(false); if (formData.id && sessions.some(s => s.id === formData.id)) { setSelectedSession(formData as Session); } }}
                className="px-6 py-2.5 rounded-xl border border-gray-600 hover:bg-gray-800 text-sm font-semibold transition"
              >
                ANNULER
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-[#0C7A7A] hover:bg-[#0A6868] text-white text-sm font-bold border border-amber-500/20 transition hover:shadow-lg"
              >
                PLANIFIER
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: SESSION DETAILS */}
        {selectedSession && !isEditing && (
          <div className="space-y-6">
            {/* Session Detail Header Card */}
            <div className="bg-[#122428] border border-amber-500/20 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border tracking-wider ${
                  selectedSession.degree === 'Apprenti' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  selectedSession.degree === 'Compagnon' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  DEG. {selectedSession.degree.toUpperCase()}
                </span>
                
                {isSecOrVM && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartEdit(selectedSession)}
                      className="p-1.5 rounded bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
                      title="Modifier la tenue"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedSession.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition"
                      title="Supprimer la tenue"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="font-sans text-xl font-bold uppercase text-[#C5A059] tracking-wider mb-4 pr-24">
                {selectedSession.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#87A0A0] border-t border-[#87A0A0]/10 pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#C5A059]" />
                  <span>{formatDateFrench(selectedSession.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#C5A059]" />
                  <span>De {formatTime(selectedSession.date)} à {selectedSession.closingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#C5A059]" />
                  <span className="truncate" title={selectedSession.location}>{selectedSession.location}</span>
                </div>
              </div>
            </div>

            {/* Admin Document Generator block */}
            {isSecOrVM && (
              <div className="bg-[#122428]/40 border border-amber-500/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white">Chambre du Secrétariat (Documents Officiels)</h4>
                  <p className="text-xs text-[#87A0A0]">Générez et imprimez les convocations, invitations et listes rituelles en un clic.</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setPdfTypeToShow('convocation')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 text-xs font-bold transition"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    CONVOCATION
                  </button>
                  <button
                    onClick={() => setPdfTypeToShow('invitation')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 text-xs font-bold transition"
                  >
                    <Users className="h-3.5 w-3.5" />
                    INVITATION
                  </button>
                  <button
                    onClick={() => setPdfTypeToShow('presence')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C7A7A] hover:bg-[#0A6868] text-white text-xs font-bold transition border border-amber-500/10 shadow"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#C5A059]" />
                    FEUILLE D'ÉMARGEMENT
                  </button>
                </div>
              </div>
            )}

            {/* Ordre du jour (Agenda) */}
            <div className="bg-[#122428] border border-[#87A0A0]/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-[#87A0A0]/10 pb-1">
                Ordre du jour & Plan des travaux
              </h4>

              <div className="space-y-3 font-sans text-sm">
                <div className="flex items-start gap-2 text-gray-400">
                  <span className="font-mono text-xs w-4">1.</span>
                  <p className="italic">{selectedSession.agenda1}</p>
                </div>

                {selectedSession.agenda2 && (
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs w-4 text-amber-500">2.</span>
                    <p className="text-white font-medium">{selectedSession.agenda2}</p>
                  </div>
                )}

                {selectedSession.agenda3 && (
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs w-4 text-amber-500">3.</span>
                    <p className="text-white font-medium">{selectedSession.agenda3}</p>
                  </div>
                )}

                <div className="flex items-start gap-2 text-gray-400">
                  <span className="font-mono text-xs w-4">4.</span>
                  <p className="italic">{selectedSession.agenda4}</p>
                </div>
              </div>
            </div>

            {/* Agapes Info */}
            <div className="bg-[#122428]/80 border border-[#87A0A0]/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#87A0A0] font-mono tracking-widest uppercase">Repas d'agapes fraternelles</span>
                  {selectedSession.hasAgape && (
                    <span className="text-xs font-bold text-amber-400">{selectedSession.agapeTime}</span>
                  )}
                </div>
                {!selectedSession.hasAgape ? (
                  <p className="text-sm text-gray-500 italic">Pas d'agapes planifiées à la fin de cette tenue.</p>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedSession.agapeType}</p>
                    {selectedSession.agapeType === 'Agape avec médaille' && selectedSession.agapePrice > 0 && (
                      <p className="text-xs text-[#C5A059] font-mono mt-0.5">Participation requise : {selectedSession.agapePrice.toFixed(2)} €</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Attendance checklist sheet - VM/Secrétaire Appel */}
            {isSecOrVM && showMemberAppel && (
              <div className="bg-[#122428] border-2 border-amber-500/30 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#87A0A0]/10 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-amber-500" />
                    Appel Solennel de la Loge
                  </h4>
                  <button onClick={() => setShowMemberAppel(false)} className="text-xs text-amber-500 hover:underline">
                    Fermer l'appel
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-800 pr-2">
                  {members.map(member => {
                    const isChecked = selectedSession.presentIds.includes(member.id);
                    return (
                      <label key={member.id} className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-black/10 px-2 rounded-lg transition">
                        <div>
                          <p className="text-sm font-bold text-white uppercase">{member.firstName} {member.lastName}</p>
                          <p className="text-[10px] text-gray-400">{member.function !== 'Aucun' ? member.function : member.grade}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMemberAppel(member.id)}
                          className="rounded text-[#0C7A7A] focus:ring-[#0C7A7A] h-4.5 w-4.5 accent-[#0C7A7A]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Present Visitors Selector */}
            {isSecOrVM && showVisitorSelector && (
              <div className="bg-[#122428] border-2 border-amber-500/30 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#87A0A0]/10 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <PlusCircle className="h-4 w-4 text-amber-500" />
                    Attacher un Visiteur Maçon
                  </h4>
                  <button onClick={() => setShowVisitorSelector(false)} className="text-xs text-amber-500 hover:underline">
                    Fermer
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto pr-2 divide-y divide-gray-800">
                  {visitors.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">Aucun visiteur dans le répertoire. Créez-les d'abord.</p>
                  ) : (
                    visitors.map(visitor => {
                      const isAdded = selectedSession.visitorIds.includes(visitor.id);
                      return (
                        <div key={visitor.id} className="flex items-center justify-between py-2 px-2 rounded hover:bg-black/10 transition">
                          <div>
                            <p className="text-sm font-bold text-white">{visitor.firstName} {visitor.lastName}</p>
                            <p className="text-[10px] text-[#87A0A0]">{visitor.lodge} ({visitor.orient})</p>
                          </div>
                          <button
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddVisitorToSession(visitor.id)}
                            className={`px-3 py-1 rounded text-xs font-bold transition ${isAdded ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-teal-950 text-teal-400 border border-teal-800 hover:bg-teal-900'}`}
                          >
                            {isAdded ? 'DÉJÀ AJOUTÉ' : 'AJOUTER'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* List of present members with signatures / Émargement */}
            <div className="bg-[#122428] border border-[#87A0A0]/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#87A0A0]/10 pb-2">
                <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="h-4.5 w-4.5" />
                  Membres Émargés ({selectedSession.presentIds.length})
                </h4>

                {isSecOrVM && !showMemberAppel && (
                  <button
                    onClick={() => setShowMemberAppel(true)}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
                  >
                    📝 APPEL DE LOGE
                  </button>
                )}
              </div>

              {selectedSession.presentIds.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">Aucun membre n'a encore été coché présent pour cette tenue.</p>
              ) : (
                <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto pr-2">
                  {members
                    .filter(m => selectedSession.presentIds.includes(m.id))
                    .map(member => {
                      const hasSigned = !!selectedSession.signatures[member.id];
                      const isMe = member.id === currentUser.id;

                      return (
                        <div key={member.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-gray-400">{member.function !== 'Aucun' ? member.function : member.grade}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            {hasSigned ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                SIGNÉ
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowSignatureForId(member.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${isMe ? 'bg-[#0C7A7A] hover:bg-[#0A6868] text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                              >
                                {isMe ? 'SIGNER MA FICHE' : 'ÉMARGER'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* List of present visitors */}
            <div className="bg-[#122428] border border-[#87A0A0]/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#87A0A0]/10 pb-2">
                <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5" />
                  Visiteurs Émargés ({selectedSession.visitorIds.length})
                </h4>

                {isSecOrVM && !showVisitorSelector && (
                  <button
                    onClick={() => setShowVisitorSelector(true)}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
                  >
                    🤝 ATTACHER VISITEUR
                  </button>
                )}
              </div>

              {selectedSession.visitorIds.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">Aucun visiteur de loges amies n'est enregistré pour cette tenue.</p>
              ) : (
                <div className="divide-y divide-gray-800 pr-2">
                  {visitors
                    .filter(v => selectedSession.visitorIds.includes(v.id))
                    .map(visitor => {
                      const hasSigned = !!selectedSession.signatures[visitor.id];
                      return (
                        <div key={visitor.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-bold text-white">{visitor.firstName} {visitor.lastName}</p>
                            <p className="text-xs text-gray-400">{visitor.lodge} ({visitor.orient})</p>
                          </div>

                          <div className="flex items-center gap-3">
                            {hasSigned ? (
                              <div className="text-xs text-emerald-400 font-bold bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                ÉMARGÉ
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowSignatureForId(visitor.id)}
                                className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-bold transition"
                              >
                                ÉMARGER
                              </button>
                            )}

                            {isSecOrVM && (
                              <button
                                onClick={() => handleRemoveVisitorFromSession(visitor.id)}
                                className="p-1 rounded bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900/20 transition"
                                title="Retirer le visiteur"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* List of excused members */}
            <div className="bg-[#122428]/40 border border-[#87A0A0]/10 rounded-2xl p-5 space-y-3 text-sm">
              <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest pb-1 border-b border-[#87A0A0]/15">
                Excusés ({selectedSession.excusedIds.length})
              </h4>

              {selectedSession.excusedIds.length === 0 ? (
                <p className="text-xs text-gray-600 italic py-1">Aucun excusé renseigné.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {members
                    .filter(m => selectedSession.excusedIds.includes(m.id))
                    .map(m => (
                      <span key={m.id} className="px-3 py-1 rounded-full bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium">
                        {m.firstName} {m.lastName}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: FULL SESSIONS LIST VIEW */}
        {!selectedSession && !isEditing && (
          <div className="space-y-4">
            {visibleSessions.length === 0 ? (
              <div className="text-center py-12 bg-[#122428]/40 border border-dashed border-gray-800 rounded-2xl text-gray-500">
                Aucune tenue planifiée correspondant à votre grade de travail.
              </div>
            ) : (
              visibleSessions.map(session => {
                const isPresent = session.presentIds.includes(currentUser.id);
                const isExcused = session.excusedIds.includes(currentUser.id);

                return (
                  <div
                    key={session.id}
                    className="bg-[#122428] border border-amber-500/10 hover:border-amber-500/20 transition rounded-2xl overflow-hidden shadow-lg flex flex-col"
                  >
                    <button
                      onClick={() => handleOpenDetail(session)}
                      className="w-full text-left p-5 flex items-start gap-4"
                    >
                      {/* Degree Badge / Initials */}
                      <div className={`h-12 w-12 rounded-xl border flex items-center justify-center font-bold text-white shrink-0 mt-1 shadow-sm ${
                        session.degree === 'Apprenti' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        session.degree === 'Compagnon' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {session.degree[0]}
                      </div>

                      <div className="space-y-1.5 flex-grow min-w-0">
                        <h4 className="font-sans text-sm font-bold text-amber-400 uppercase tracking-wider group-hover:text-amber-300 transition truncate pr-6">
                          {session.title}
                        </h4>

                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-[#87A0A0]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                            {new Date(session.date).toLocaleDateString('fr-FR')} • {session.type}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]" title={session.location}>
                            <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                            {session.location}
                          </span>
                        </div>
                      </div>

                      <div className="text-amber-500/30 font-mono self-center">
                        →
                      </div>
                    </button>

                    {/* Attendance quick control footer bar */}
                    <div className="bg-black/15 border-t border-gray-800/40 px-5 py-3 flex items-center justify-between text-xs">
                      <span className="text-[#87A0A0] flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-teal-500" />
                        Présents : <strong className="text-white">{session.presentIds.length}</strong>
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleMyAttendance(session, true)}
                          className={`px-3 py-1 rounded-lg border text-[10px] font-bold tracking-wider transition ${isPresent ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300'}`}
                        >
                          JE SERAI PRÉSENT
                        </button>
                        <button
                          onClick={() => handleToggleMyAttendance(session, false)}
                          className={`px-3 py-1 rounded-lg border text-[10px] font-bold tracking-wider transition ${isExcused ? 'bg-rose-500/15 border-rose-500/35 text-rose-400' : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300'}`}
                        >
                          JE SERAI EXCUSÉ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
