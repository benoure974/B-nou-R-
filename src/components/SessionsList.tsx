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
  CheckCircle2,
  Check,
  AlertCircle,
  FileText,
  Mail,
  Edit2,
  Trash2,
  PlusCircle,
  UserCheck,
  Award,
  Coins
} from 'lucide-react';
import { Session, Member, Visitor } from '../types';
import SignaturePad from './SignaturePad';
import { getSessionChronoFromFirestore, incrementSessionChronoInFirestore } from '../lib/firebaseSync';

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
  const [isShowingEmargement, setIsShowingEmargement] = useState(false);
  const [localTronc, setLocalTronc] = useState<number>(0);

  // PDF customizer states
  const [sessionNumber, setSessionNumber] = useState('2°');
  const [deityName, setDeityName] = useState('NEPHTHYS');
  const [egyptianYear, setEgyptianYear] = useState('3318');
  const [vmName, setVmName] = useState('Bruno GAU∴');
  const [customLines, setCustomLines] = useState<string[]>([
    'Lecture d’un morceau d’architecture de la S ∴ Aure COS ∴ « La Divine Proportion : l’architecture de la juste mesure »',
    'Lecture d’un morceau d’architecture du V∴M∴ Bruno GAU∴ « Le Temps Nilotique »',
    '',
    '',
    '',
    ''
  ]);
  const [agapeText, setAgapeText] = useState('Les Travaux seront suivis d’Agapes au nom de la Fraternité en Salle Humide. La médaille est de 15 euros.');
  const [contactText, setContactText] = useState('Merci aux SS∴ et FF∴ Invités de s’annoncer afin d’ajuster au mieux les Agapes. Tél : 06 93 470 700');
  const [formattedHeaderDate, setFormattedHeaderDate] = useState('');
  const [openingTime, setOpeningTime] = useState('10h00');
  const [invitationMainLine, setInvitationMainLine] = useState('');

  // Logo Customizer states
  const [customLeftLogo, setCustomLeftLogo] = useState(localStorage.getItem('logo_left') || '');
  const [customRightLogo, setCustomRightLogo] = useState(localStorage.getItem('logo_right') || '');
  const [leftLogoError, setLeftLogoError] = useState(false);
  const [rightLogoError, setRightLogoError] = useState(false);

  const getFormattedHeaderDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const dateObj = new Date(isoDate);
      return dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).toUpperCase() + ' E∴V∴';
    } catch (e) {
      return '';
    }
  };

  const getSessionStartHour = (isoDate: string) => {
    if (!isoDate) return '10h00';
    try {
      const dateObj = new Date(isoDate);
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${hours}h${minutes}`;
    } catch (e) {
      return '10h00';
    }
  };

  React.useEffect(() => {
    if (selectedSession) {
      setFormattedHeaderDate(getFormattedHeaderDate(selectedSession.date));
      setOpeningTime(getSessionStartHour(selectedSession.date));
      
      const num = selectedSession.sessionNumber || '2°';
      setSessionNumber(num);
      setDeityName(selectedSession.deityName || 'NEPHTHYS');
      setEgyptianYear(selectedSession.egyptianYear || '3318');
      setVmName(selectedSession.vmName || 'Bruno GAU∴');
      
      let initLines = selectedSession.customLines || [];
      // Pad to ensure exactly 6 items
      while (initLines.length < 6) {
        initLines.push('');
      }
      if (!selectedSession.customLines) {
        initLines = [
          'Lecture d’un morceau d’architecture de la S ∴ Aure COS ∴ « La Divine Proportion : l’architecture de la juste mesure »',
          'Lecture d’un morceau d’architecture du V∴M∴ Bruno GAU∴ « Le Temps Nilotique »',
          '',
          '',
          '',
          ''
        ];
      }
      setCustomLines([...initLines]);
      
      setAgapeText(selectedSession.agapeText || 'Les Travaux seront suivis d’Agapes au nom de la Fraternité en Salle Humide. La médaille est de 15 euros.');
      setContactText(selectedSession.contactText || 'Merci aux SS∴ et FF∴ Invités de s’annoncer afin d’ajuster au mieux les Agapes. Tél : 06 93 470 700');
      
      const degreeFr = selectedSession.degree === 'Apprenti' ? '1er DEGRE' : selectedSession.degree === 'Compagnon' ? '2e DEGRE' : '3e DEGRE';
      setInvitationMainLine(`${num} TENUE REGULIERE au ${degreeFr} qui se déroulera au ${selectedSession.location || 'Temple Thérèse Eliseman à Saint-Pierre'} :`);
      
      setLeftLogoError(false);
      setRightLogoError(false);
      setLocalTronc(selectedSession.troncAmount || 0);
    }
  }, [selectedSession]);

  // Dynamically update invitationMainLine if sessionNumber changes
  React.useEffect(() => {
    if (selectedSession) {
      const degreeFr = selectedSession.degree === 'Apprenti' ? '1er DEGRE' : selectedSession.degree === 'Compagnon' ? '2e DEGRE' : '3e DEGRE';
      setInvitationMainLine(`${sessionNumber} TENUE REGULIERE au ${degreeFr} qui se déroulera au ${selectedSession.location || 'Temple Thérèse Eliseman à Saint-Pierre'} :`);
    }
  }, [sessionNumber]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePdfConfig = () => {
    if (!selectedSession) return;
    const updated: Session = {
      ...selectedSession,
      sessionNumber,
      deityName,
      egyptianYear,
      vmName,
      customLines,
      agapeText,
      contactText
    };
    onUpdateSession(updated);
    setSelectedSession(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

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

  const handleStartCreate = async () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const dateStr = today.toISOString().split('T')[0] + 'T16:30:00';

    // Get current session count from firebase and add 1
    const currentChrono = await getSessionChronoFromFirestore();
    const nextChrono = currentChrono + 1;
    const chronoStr = `${nextChrono}°`;

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
      agapePrice: 0,
      sessionNumber: chronoStr,
      customLines: [
        'Lecture d’un morceau d’architecture de la S ∴ Aure COS ∴ « La Divine Proportion : l’architecture de la juste mesure »',
        'Lecture d’un morceau d’architecture du V∴M∴ Bruno GAU∴ « Le Temps Nilotique »',
        '',
        '',
        '',
        ''
      ]
    });
    setSelectedSession(null);
    setIsEditing(true);
  };

  const handleStartEdit = (session: Session) => {
    const updatedSession = { ...session };
    if (!updatedSession.customLines || updatedSession.customLines.length === 0) {
      updatedSession.customLines = [
        'Lecture d’un morceau d’architecture de la S ∴ Aure COS ∴ « La Divine Proportion : l’architecture de la juste mesure »',
        'Lecture d’un morceau d’architecture du V∴M∴ Bruno GAU∴ « Le Temps Nilotique »',
        '',
        '',
        '',
        ''
      ];
    }
    setFormData(updatedSession);
    setIsEditing(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none">
          <div className={`w-full ${pdfTypeToShow === 'presence' ? 'max-w-2xl bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl relative my-8' : 'max-w-7xl bg-[#0c1a1d] border border-amber-500/20 text-[#E8E8E8] rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[95vh] relative print:h-auto print:border-none print:bg-white print:text-black'}`}>
            
            {/* Top Bar for Convocation / Invitation editor */}
            {pdfTypeToShow !== 'presence' && (
              <div className="flex justify-between items-center bg-[#122428] border-b border-amber-500/20 px-6 py-4 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full border border-amber-500/30 flex items-center justify-center bg-[#081619]">
                    <span className="text-amber-500 text-xs font-mono">✦</span>
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">
                      Éditeur de {pdfTypeToShow === 'convocation' ? 'Convocation' : 'Invitation'} Officielle
                    </h3>
                    <p className="text-[10px] text-[#87A0A0] font-mono uppercase tracking-widest">Ajustez les textes puis lancez l'impression</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-xl bg-[#0C7A7A] text-white hover:bg-[#0A6868] text-xs font-bold transition flex items-center gap-2 shadow border border-amber-500/20"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#C5A059]" />
                    IMPRIMER LE DOCUMENT
                  </button>
                  <button
                    onClick={() => setPdfTypeToShow(null)}
                    className="px-4 py-2 rounded-xl bg-[#081619] border border-gray-700 hover:bg-[#122428] text-xs font-bold transition"
                  >
                    FERMER
                  </button>
                </div>
              </div>
            )}

            {/* Content Container */}
            {pdfTypeToShow === 'presence' ? (
              // Presence preview has no editor side-bar, just print preview like before but beautifully styled
              <div className="flex flex-col gap-6 relative">
                <button
                  onClick={() => setPdfTypeToShow(null)}
                  className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 font-bold text-xl print:hidden"
                >
                  ✕
                </button>
                <div className="flex justify-between items-center border-b pb-4 print:hidden">
                  <span className="text-xs font-mono text-amber-600 uppercase tracking-widest">Feuille de présence (Émargement de tenue)</span>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-xl bg-[#0C7A7A] text-white hover:bg-[#0A6868] text-sm font-bold transition flex items-center gap-2 shadow"
                  >
                    <FileText className="h-4 w-4" />
                    IMPRIMER
                  </button>
                </div>
                
                <div className="print-document font-serif p-4 md:p-8 bg-white border border-gray-100 flex flex-col gap-6 text-sm leading-relaxed text-black" id="printable-pdf-view">
                  {/* Header block with logos */}
                  <div className="flex items-center justify-between border-b border-black pb-4 mb-4">
                    <img src="/assets/.aistudio/logo_rapmm_1721295744888.png" alt="RAPMM" className="h-16 w-16 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} referrerPolicy="no-referrer" />
                    <div className="text-center font-serif flex-grow px-4">
                      <span className="text-[9px] uppercase italic tracking-wider text-gray-500 block">A La Gloire Du Sublime Architecte des Mondes</span>
                      <h1 className="text-sm font-bold uppercase text-blue-900 leading-tight">Ordre Initiatique Ancien et Primitif de Memphis Misraïm</h1>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">Respectable Loge Bénou Ré (Orient de Saint-Pierre)</h2>
                      <span className="text-[9px] italic text-gray-600">Ex Cineribus, Ad Lucem Perpetuam</span>
                    </div>
                    <img src="/assets/.aistudio/logo_benou_re_1721295744888.png" alt="Bénou Ré" className="h-16 w-16 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} referrerPolicy="no-referrer" />
                  </div>

                  <div className="space-y-5">
                    <div className="text-center py-1.5 border-y border-gray-200 my-1">
                      <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">FEUILLE D'ÉMARGEMENT ET DE PRÉSENCE</h3>
                      <p className="text-[11px] text-gray-600">{selectedSession.title}</p>
                    </div>

                    {/* Summary grid */}
                    <div className="grid grid-cols-2 gap-4 border p-3 rounded-xl bg-gray-50 text-xs text-black">
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
                          <tr className="bg-gray-100 text-black">
                            <th className="border border-gray-300 p-2">Nom & Prénom</th>
                            <th className="border border-gray-300 p-2">Office / Fonction</th>
                            <th className="border border-gray-300 p-2 w-40">Signature Émargement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.filter(m => selectedSession.presentIds.includes(m.id)).map(m => (
                            <tr key={m.id} className="text-black">
                              <td className="border border-gray-300 p-2 font-semibold">{m.firstName} {m.lastName}</td>
                              <td className="border border-gray-300 p-2 text-gray-600">{m.function !== 'Aucun' ? m.function : 'Membre'}</td>
                              <td className="border border-gray-300 p-1 h-12 relative">
                                {selectedSession.signatures[m.id] ? (
                                  <img src={selectedSession.signatures[m.id]} alt="sig" className="max-h-full mx-auto object-contain max-w-[120px]" referrerPolicy="no-referrer" />
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
                            <tr className="bg-gray-100 text-black">
                              <th className="border border-gray-300 p-2">Nom & Prénom</th>
                              <th className="border border-gray-300 p-2">Loge & Orient</th>
                              <th className="border border-gray-300 p-2 w-40">Signature Émargement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visitors.filter(v => selectedSession.visitorIds.includes(v.id)).map(v => (
                              <tr key={v.id} className="text-black">
                                <td className="border border-gray-300 p-2 font-semibold">{v.firstName} {v.lastName}</td>
                                <td className="border border-gray-300 p-2 text-gray-600">{v.lodge} ({v.orient})</td>
                                <td className="border border-gray-300 p-1 h-12 relative">
                                  {selectedSession.signatures[v.id] ? (
                                    <img src={selectedSession.signatures[v.id]} alt="sig" className="max-h-full mx-auto object-contain max-w-[120px]" referrerPolicy="no-referrer" />
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
                    <div className="flex justify-between items-center bg-gray-100 border p-3 rounded-xl text-xs font-bold mt-4 text-black">
                      <span>TOTAL COMPTABILISÉ PRÉSENTS : {selectedSession.presentIds.length + selectedSession.visitorIds.length}</span>
                      <span className="text-red-800">TRONC DE LA VEUVE : {selectedSession.troncAmount.toFixed(2)} €</span>
                    </div>
                  </div>
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
            ) : (
              // Convocation & Invitation split view
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-grow overflow-hidden print:block">
                
                {/* LEFT PANEL: CONFIGURATION CONTROLS */}
                <div className="lg:col-span-5 border-r border-[#1e2e38] p-5 overflow-y-auto space-y-5 bg-[#122428]/40 print:hidden flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-amber-500/10 pb-2">
                      <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">1. En-tête & Lieu</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">N° de Tenue</label>
                        <input
                          type="text"
                          value={sessionNumber}
                          onChange={(e) => setSessionNumber(e.target.value)}
                          className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">Heure d'ouverture</label>
                        <input
                          type="text"
                          value={openingTime}
                          onChange={(e) => setOpeningTime(e.target.value)}
                          className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">Date de Tenue (Texte de l'En-tête)</label>
                      <input
                        type="text"
                        value={formattedHeaderDate}
                        onChange={(e) => setFormattedHeaderDate(e.target.value)}
                        className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">Formule principale d'invitation</label>
                      <textarea
                        value={invitationMainLine}
                        onChange={(e) => setInvitationMainLine(e.target.value)}
                        rows={2}
                        className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none resize-none"
                      />
                    </div>

                    <div className="border-b border-amber-500/10 pb-2 pt-2">
                      <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">2. Calendrier Égyptien & VM</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">Nom de Divinité</label>
                        <input
                          type="text"
                          value={deityName}
                          onChange={(e) => setDeityName(e.target.value)}
                          className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">An de la Lumière</label>
                        <input
                          type="text"
                          value={egyptianYear}
                          onChange={(e) => setEgyptianYear(e.target.value)}
                          className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#87A0A0] uppercase tracking-wider block">Vénérable Maître (Signature/Fermeture)</label>
                      <input
                        type="text"
                        value={vmName}
                        onChange={(e) => setVmName(e.target.value)}
                        className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>

                    <div className="border-b border-amber-500/10 pb-2 pt-2">
                      <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">3. Ordre du Jour (Feuille de Saisie)</span>
                    </div>

                    <div className="space-y-3">
                      {/* Ligne 1 - Fixe/Auto */}
                      <div className="bg-[#081619] border border-amber-500/5 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-500/80 font-mono font-bold">LIGNE 1 — AUTOMATIQUE</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">Lecture seule</span>
                        </div>
                        <p className="text-xs text-gray-400 font-serif leading-snug">
                          1. <span className="text-amber-300 font-semibold">{openingTime}</span> Ouverture des Travaux au {selectedSession.degree === 'Apprenti' ? "1er Degré" : selectedSession.degree === 'Compagnon' ? "2ème Degré" : "3ème Degré"} symbolique par le V∴M∴ <span className="text-amber-300 font-semibold">{vmName}</span>
                        </p>
                      </div>

                      {/* Ligne 2 - Fixe */}
                      <div className="bg-[#081619] border border-amber-500/5 rounded-lg p-2.5 space-y-1 opacity-75">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-mono font-bold">LIGNE 2 — TEMPLATE FIXE</span>
                          <span className="text-[9px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded font-mono">Lecture seule</span>
                        </div>
                        <p className="text-xs text-gray-400 font-serif leading-snug">
                          2. Appel des FF et SS ∴ de la loge.
                        </p>
                      </div>

                      {/* Ligne 3 - Fixe */}
                      <div className="bg-[#081619] border border-amber-500/5 rounded-lg p-2.5 space-y-1 opacity-75">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-mono font-bold">LIGNE 3 — TEMPLATE FIXE</span>
                          <span className="text-[9px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded font-mono">Lecture seule</span>
                        </div>
                        <p className="text-xs text-gray-400 font-serif leading-snug">
                          3. Lecture de la planche tracée de nos derniers travaux au {selectedSession.degree === 'Apprenti' ? "1er Degré" : selectedSession.degree === 'Compagnon' ? "2ème Degré" : "3ème Degré"} symbolique.
                        </p>
                      </div>

                      {/* Ligne 4 - Fixe */}
                      <div className="bg-[#081619] border border-amber-500/5 rounded-lg p-2.5 space-y-1 opacity-75">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-mono font-bold">LIGNE 4 — TEMPLATE FIXE</span>
                          <span className="text-[9px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded font-mono">Lecture seule</span>
                        </div>
                        <p className="text-xs text-gray-400 font-serif leading-snug">
                          4. Lecture de la correspondance et des affaires diverses.
                        </p>
                      </div>

                      {/* Lignes 5 à 10 - Saisie Libre */}
                      <div className="space-y-2 pt-2 border-t border-amber-500/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">LIGNES 5 À 10 — SAISIE MANUELLE (4-5 lignes demandées)</span>
                          <span className="text-[9px] bg-teal-400/10 text-teal-300 px-1.5 py-0.5 rounded font-mono">Saisie libre</span>
                        </div>
                        
                        {customLines.map((line, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-teal-400/80 font-mono w-5 shrink-0 text-right">{idx + 5}.</span>
                            <input
                              type="text"
                              placeholder={`Ordre du jour optionnel (ex: Morceau d'architecture...)`}
                              value={line}
                              onChange={(e) => {
                                const newLines = [...customLines];
                                newLines[idx] = e.target.value;
                                setCustomLines(newLines);
                              }}
                              className="flex-grow bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none transition"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Ligne de clôture */}
                      <div className="bg-[#081619] border border-amber-500/5 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-500/80 font-mono font-bold">LIGNE FINALE — AUTOMATIQUE</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">Lecture seule</span>
                        </div>
                        <p className="text-xs text-gray-400 font-serif leading-snug">
                          {5 + customLines.filter(line => line.trim() !== '').length}. Clôture des Travaux au {selectedSession.degree === 'Apprenti' ? "1er Degré" : selectedSession.degree === 'Compagnon' ? "2ème Degré" : "3ème Degré"} symbolique par le V∴M∴ <span className="text-amber-300 font-semibold">{vmName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="border-b border-amber-500/10 pb-2 pt-2">
                      <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">4. Agapes & Renseignements</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="space-y-0.5">
                        <label className="text-[10px] text-[#87A0A0] uppercase tracking-wider block">Texte des Agapes</label>
                        <textarea
                          value={agapeText}
                          onChange={(e) => setAgapeText(e.target.value)}
                          rows={2}
                          className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#C5A059] focus:outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] text-[#87A0A0] uppercase tracking-wider block">Texte de contact</label>
                        <textarea
                          value={contactText}
                          onChange={(e) => setContactText(e.target.value)}
                          rows={2}
                          className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#C5A059] focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="border-b border-amber-500/10 pb-2 pt-2">
                      <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">5. Logos de l'En-tête</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#87A0A0] uppercase tracking-wider block font-bold">Logo Gauche</label>
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const base64 = ev.target?.result as string;
                                  setCustomLeftLogo(base64);
                                  localStorage.setItem('logo_left', base64);
                                  setLeftLogoError(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg p-1 text-[10px] text-gray-400 focus:outline-none cursor-pointer"
                          />
                          {customLeftLogo && (
                            <button
                              onClick={() => {
                                setCustomLeftLogo('');
                                localStorage.removeItem('logo_left');
                              }}
                              className="text-[9px] text-red-400 hover:underline block text-left"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#87A0A0] uppercase tracking-wider block font-bold">Logo Droit</label>
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const base64 = ev.target?.result as string;
                                  setCustomRightLogo(base64);
                                  localStorage.setItem('logo_right', base64);
                                  setRightLogoError(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-lg p-1 text-[10px] text-gray-400 focus:outline-none cursor-pointer"
                          />
                          {customRightLogo && (
                            <button
                              onClick={() => {
                                setCustomRightLogo('');
                                localStorage.removeItem('logo_right');
                              }}
                              className="text-[9px] text-red-400 hover:underline block text-left"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSavePdfConfig}
                        className={`w-full py-2 px-4 rounded-lg shadow-lg text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-1.5 ${
                          saveSuccess 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse' 
                            : 'bg-[#C5A059] hover:bg-[#D9B56D] text-[#0A1214]'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" /> 
                        {saveSuccess ? '✓ Modifications Enregistrées !' : 'Sauvegarder l\'Ordre du Jour'}
                      </button>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-amber-500/10 text-center text-[10px] text-[#87A0A0]">
                    L'en-tête, le temple, les loges et les grades de travail s'adaptent selon les règles initiatiques de l'atelier.
                  </div>
                </div>

                {/* RIGHT PANEL: LIVE HIGH-FIDELITY PDF PREVIEW */}
                <div className="lg:col-span-7 p-6 overflow-y-auto flex justify-center bg-[#081619]/95 print:bg-white print:p-0 print:overflow-visible print:block w-full">
                  
                  {/* The A4-like Document Container */}
                  <div 
                    className="print-document bg-white text-black p-8 md:p-12 shadow-2xl rounded-sm border border-gray-200 flex flex-col justify-between font-serif text-[11px] leading-relaxed w-full max-w-[210mm] min-h-[297mm] print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:min-h-0"
                    id="printable-pdf-view"
                  >
                    <div>
                      {/* 1. Header with Logos and Rites Grid */}
                      <div className="flex items-start justify-between w-full border-b border-gray-300 pb-2 mb-4">
                        {/* Left Logo (RAPMM scarab) */}
                        <div className="w-20 shrink-0 flex items-center justify-center min-h-[64px]">
                          {customLeftLogo ? (
                            <img 
                              src={customLeftLogo} 
                              alt="Logo Gauche" 
                              className="max-w-[70px] max-h-[70px] object-contain mx-auto"
                              referrerPolicy="no-referrer"
                            />
                          ) : !leftLogoError ? (
                            <img 
                              src="/assets/.aistudio/logo_rapmm_1721295744888.png" 
                              alt="Logo RAPMM" 
                              className="max-w-[70px] max-h-[70px] object-contain mx-auto"
                              onError={() => setLeftLogoError(true)}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            /* GORGEOUS INLINE GOLD MEDALLION SVG FALLBACK */
                            <svg viewBox="0 0 100 100" className="w-14 h-14 mx-auto text-amber-600 fill-current">
                              <polygon points="50,15 15,80 85,80" stroke="#d97706" strokeWidth="2.5" fill="none" />
                              <circle cx="50" cy="55" r="10" stroke="#d97706" strokeWidth="2" fill="none" />
                              <circle cx="50" cy="55" r="3" fill="#d97706" />
                              <line x1="50" y1="15" x2="50" y2="35" stroke="#d97706" strokeWidth="2" />
                            </svg>
                          )}
                        </div>

                        {/* Center Text Block */}
                        <div className="text-center flex-grow flex flex-col items-center px-2">
                          <h1 className="text-sm font-bold uppercase tracking-wider text-black font-sans">GRANDE LOGE DE BOURBON</h1>
                          <span className="text-[7.5px] font-sans font-bold tracking-wide text-gray-800 uppercase block leading-tight text-center max-w-sm mb-2">
                            FRANCS-MAÇONS TRAVAILLANT AU RITE ANCIEN ET PRIMITIF DE MEMPHIS MISRAÏM
                          </span>

                          {/* 5-Column Rites list */}
                          <div className="grid grid-cols-5 gap-1.5 text-[6.5px] border-t border-b border-gray-300 py-1.5 w-full text-center font-sans text-gray-700">
                            <div>
                              <strong>Rite Primitif,</strong><br/>Paris 1721
                            </div>
                            <div className="border-l border-gray-300 pl-1">
                              <strong>Rite Primitif des Philadelphes,</strong><br/>Narbonne 1779
                            </div>
                            <div className="border-l border-gray-300 pl-1">
                              <strong>Rite de Memphis,</strong><br/>Montauban 1815
                            </div>
                            <div className="border-l border-gray-300 pl-1">
                              <strong>Rite de Misraïm,</strong><br/>Venise 1788
                            </div>
                            <div className="border-l border-gray-300 pl-1">
                              <strong>Rite Ancien et Primitif,</strong><br/>Manchester 1876
                            </div>
                          </div>

                          {/* Filiations */}
                          <div className="text-[6.5px] font-sans italic text-gray-600 mt-1.5 leading-tight">
                            <p>Filiation directe Robert Ambelain</p>
                            <p>Filiation Directe Gérard Kloppel</p>
                            <p>Filiation Directe Joseph Tsang Mang Kin</p>
                          </div>
                        </div>

                        {/* Right Logo (Bénou Ré heron) */}
                        <div className="w-20 shrink-0 flex items-center justify-center min-h-[64px]">
                          {customRightLogo ? (
                            <img 
                              src={customRightLogo} 
                              alt="Logo Droit" 
                              className="max-w-[70px] max-h-[70px] object-contain mx-auto"
                              referrerPolicy="no-referrer"
                            />
                          ) : !rightLogoError ? (
                            <img 
                              src="/assets/.aistudio/logo_benou_re_1721295744888.png" 
                              alt="Logo Bénou Ré" 
                              className="max-w-[70px] max-h-[70px] object-contain mx-auto"
                              onError={() => setRightLogoError(true)}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            /* GORGEOUS INLINE HERON/PHOENIX SVG FALLBACK */
                            <svg viewBox="0 0 100 100" className="w-14 h-14 mx-auto text-amber-600 fill-current">
                              <circle cx="50" cy="50" r="42" stroke="#d97706" strokeWidth="2.5" fill="none" />
                              <path d="M 50,18 C 42,32 46,50 36,72 C 46,67 54,67 64,72 C 54,50 58,32 50,18 Z" fill="#d97706" opacity="0.85" />
                              <circle cx="50" cy="32" r="3.5" fill="white" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Blue Separator Line */}
                      <div className="w-full h-[3px] bg-[#1d4ed8] mb-6"></div>

                      {/* 2. Lodge Details & Title Box */}
                      <div className="text-center space-y-1 mb-5">
                        <h2 className="text-base font-bold tracking-wider text-black">R ∴ L∴ Bénou Ré N°5</h2>
                        <h3 className="text-xs font-semibold text-gray-800">O∴ de Saint Pierre – Île de la Réunion</h3>
                      </div>

                      {/* Ordre du jour box */}
                      <div className="border-2 border-black p-4 text-center my-5 max-w-xl mx-auto">
                        <h4 className="text-xs font-sans font-bold tracking-widest text-black">ORDRE DU JOUR DE LA TENUE RÉGULIÈRE DU</h4>
                        <p className="text-sm font-sans font-extrabold tracking-wider mt-1.5 text-black">
                          {formattedHeaderDate}
                        </p>
                      </div>

                      {/* 3. Invitation Formulas */}
                      <div className="text-center space-y-1.5 my-6 text-[#701a75] font-serif italic text-xs leading-relaxed max-w-xl mx-auto">
                        <p>A la Gloire Du Grand Architecte De l’Univers,</p>
                        <p className="font-bold">Mes TT∴CC∴SS∴ et TT∴CC∴FF∴,</p>
                        <p>La R∴L∴ Bénou Ré a la grande joie de vous convier fraternellement à participer aux Travaux de sa</p>
                      </div>

                      {/* Invitation Main Custom Line */}
                      <div className="text-center max-w-xl mx-auto text-xs font-bold text-purple-950 mb-6">
                        <p>{invitationMainLine}</p>
                      </div>

                      {/* Egyptian Date */}
                      <div className="text-center text-[#1d4ed8] font-bold italic text-sm space-y-1 my-6">
                        <p>Le jour de naissance de {deityName}</p>
                        <p>De l’an {egyptianYear} de la Lumière d’Egypte</p>
                      </div>

                      {/* 4. The Agenda Section */}
                      <div className="max-w-xl mx-auto mt-8 space-y-4 text-left">
                        <h5 className="font-bold underline text-xs uppercase tracking-wider text-black">L'ordre du jour appellera :</h5>

                        <ul className="space-y-2.5 text-[11px] text-black">
                          {/* Item 1: Opening */}
                          <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>
                              <strong>{openingTime}</strong> Ouverture des Travaux au {selectedSession.degree === 'Apprenti' ? '1er Degré' : selectedSession.degree === 'Compagnon' ? '2ème Degré' : '3ème Degré'} symbolique du R∴A∴P∴M∴M∴ par le V∴M∴ {vmName}
                            </span>
                          </li>

                          {/* Item 2: Appel */}
                          <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Appel des FF et SS ∴ de la loge.</span>
                          </li>

                          {/* Item 3: Planche tracee */}
                          <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>Lecture de la planche tracée de nos derniers travaux au {selectedSession.degree === 'Apprenti' ? '1er Degré' : selectedSession.degree === 'Compagnon' ? '2ème Degré' : '3ème Degré'} symbolique.</span>
                          </li>

                          {/* Item 4: Correspondence */}
                          <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>Lecture de la correspondance et des affaires diverses.</span>
                          </li>

                          {/* Items 5+ : Custom Manual Lines */}
                          {customLines
                            .filter(line => line.trim() !== '')
                            .map((line, index) => (
                              <li key={index} className="flex items-start gap-2 animate-fade-in text-black font-medium">
                                <span className="font-bold">{index + 5}.</span>
                                <span>{line}</span>
                              </li>
                            ))}

                          {/* Last Item: Cloture */}
                          <li className="flex items-start gap-2">
                            <span className="font-bold">
                              {5 + customLines.filter(line => line.trim() !== '').length}.
                            </span>
                            <span>
                              Clôture des Travaux au {selectedSession.degree === 'Apprenti' ? '1er Degré' : selectedSession.degree === 'Compagnon' ? '2ème Degré' : '3ème Degré'} symbolique du R∴A∴P∴M∴M∴ par le V∴M∴ {vmName}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* 5. Agapes Footer */}
                    <div className="max-w-xl mx-auto mt-10 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-800 space-y-1.5 leading-relaxed font-sans">
                      <p className="font-bold text-gray-900">{agapeText}</p>
                      <p className="text-gray-700">{contactText}</p>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#122428] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={isShowingEmargement ? () => setIsShowingEmargement(false) : (selectedSession || isEditing ? () => { setSelectedSession(null); setIsEditing(false); setIsShowingEmargement(false); } : onBack)}
              className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-white">
              {isShowingEmargement ? "Émargement & Tronc" : (isEditing ? (formData.id && sessions.some(s => s.id === formData.id) ? 'Modifier la tenue' : 'Planifier une tenue') : selectedSession ? 'Détail de la Tenue' : 'Calendrier des Tenues')}
            </h2>
          </div>

          {isSecOrVM && !isEditing && !selectedSession && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C7A7A] hover:bg-[#0A6868] text-white text-xs font-bold border border-amber-500/20 transition animate-pulse"
              >
                <Plus className="h-4 w-4 text-[#C5A059]" />
                CRÉER UNE TENUE
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* VIEW 1: FORM (CREATE / EDIT) */}
        {isEditing && (
          <form onSubmit={handleSaveForm} className="bg-[#122428] border border-amber-500/20 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-mono tracking-widest text-amber-500 uppercase border-b border-amber-500/10 pb-2 flex justify-between items-center flex-wrap gap-2">
              <span>Planification de la {formData.sessionNumber || '3°'} Tenue</span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-mono">
                Prochaine Tenue : {formData.sessionNumber || '3°'}
              </span>
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

              {/* Session Number */}
              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0] block">Numéro de la Tenue</label>
                <input
                  type="text"
                  placeholder="ex: 3°"
                  required
                  value={formData.sessionNumber || '3°'}
                  onChange={e => setFormData({ ...formData, sessionNumber: e.target.value })}
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

              {/* Ordres du jour complémentaires (Lignes 5 à 10) */}
              <div className="space-y-3 md:col-span-2 border-t border-amber-500/10 pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-amber-500 uppercase tracking-widest block font-bold">
                    [ + ] Ordres du jour complémentaires / Textes libres (Lignes 5 à 10)
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const currentLines = formData.customLines || [
                      'Lecture d’un morceau d’architecture de la S ∴ Aure COS ∴ « La Divine Proportion : l’architecture de la juste mesure »',
                      'Lecture d’un morceau d’architecture du V∴M∴ Bruno GAU∴ « Le Temps Nilotique »',
                      '',
                      '',
                      '',
                      ''
                    ];
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#87A0A0] font-mono w-5 shrink-0 text-right">{idx + 5}.</span>
                        <input
                          type="text"
                          placeholder="ex: Lecture de planche..."
                          value={currentLines[idx] || ''}
                          onChange={(e) => {
                            const newLines = [...currentLines];
                            newLines[idx] = e.target.value;
                            setFormData({ ...formData, customLines: newLines });
                          }}
                          className="flex-grow bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-4 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
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
        {selectedSession && !isEditing && !isShowingEmargement && (
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

            {/* Tenue Validation Block */}
            {isSecOrVM && (
              <div className={`rounded-2xl p-5 border flex flex-col md:flex-row items-center justify-between gap-4 transition ${
                selectedSession.isValidated
                  ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-500/20 text-amber-300'
              }`}>
                <div className="space-y-1 text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <CheckCircle2 className={`h-5 w-5 ${selectedSession.isValidated ? 'text-emerald-400' : 'text-amber-500'}`} />
                    <h4 className="text-sm font-bold text-white">
                      {selectedSession.isValidated ? 'Cette tenue est validée' : 'Validation de la tenue requise'}
                    </h4>
                  </div>
                  <p className="text-xs text-[#87A0A0]">
                    {selectedSession.isValidated
                      ? 'Cette tenue a été officiellement validée. Le numéro de la tenue a été incrémenté dans le système.'
                      : 'Une fois planifiée, veuillez valider cette tenue. Cela incrémentera automatiquement le numéro de la tenue pour les prochaines planifications.'}
                  </p>
                </div>

                <div>
                  {!selectedSession.isValidated ? (
                    <button
                      onClick={async () => {
                        if (window.confirm('Voulez-vous valider cette tenue ? Le numéro de la prochaine tenue sera incrémenté.')) {
                          const updated: Session = {
                            ...selectedSession,
                            isValidated: true,
                            plancheValidated: true
                          };
                          await incrementSessionChronoInFirestore();
                          onUpdateSession(updated);
                          setSelectedSession(updated);
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black tracking-wider transition uppercase hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Check className="h-4 w-4 stroke-[3px]" />
                      VALIDER LA TENUE
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                      ✓ VALIDÉE
                    </span>
                  )}
                </div>
              </div>
            )}

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

            {/* Entry Card for Émargement & Tronc de la Veuve */}
            <div className="bg-[#122428] border border-amber-500/25 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition hover:border-amber-500/45">
              <div className="space-y-1 text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Émargement & Saisie du Tronc de la Veuve
                  </h4>
                </div>
                <p className="text-xs text-[#87A0A0]">
                  Accédez à la feuille d'émargement séparée pour enregistrer les présences, recueillir les signatures, et saisir le montant du Tronc de la Veuve.
                </p>
                
                {/* Quick summary metrics */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-mono text-[#87A0A0]">
                  <span className="bg-black/20 px-2 py-0.5 rounded border border-[#87A0A0]/15">
                    Membres : <strong className="text-white">{selectedSession.presentIds.length}</strong>
                  </span>
                  <span className="bg-black/20 px-2 py-0.5 rounded border border-[#87A0A0]/15">
                    Visiteurs : <strong className="text-white">{selectedSession.visitorIds.length}</strong>
                  </span>
                  <span className="bg-black/20 px-2 py-0.5 rounded border border-[#87A0A0]/15">
                    Tronc : <strong className="text-amber-400">{selectedSession.troncAmount ? `${selectedSession.troncAmount.toFixed(2)} €` : 'Non saisi'}</strong>
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsShowingEmargement(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black tracking-wider transition uppercase hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FileText className="h-4 w-4 stroke-[3px]" />
                  OUVRIR LA FEUILLE
                </button>
              </div>
            </div>

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

                {selectedSession.agenda4 && (
                  <div className="flex items-start gap-2 text-gray-400">
                    <span className="font-mono text-xs w-4">4.</span>
                    <p className="italic">{selectedSession.agenda4}</p>
                  </div>
                )}

                {/* Travaux complémentaires */}
                {(selectedSession.customLines || [])
                  .filter(line => line && line.trim() !== '')
                  .map((line, index) => (
                    <div key={index} className="flex items-start gap-2 border-l-2 border-amber-500/30 pl-2 ml-1 animate-fade-in">
                      <span className="font-mono text-xs w-4 text-amber-500 font-bold">{index + 5}.</span>
                      <p className="text-[#C5A059] font-medium">{line}</p>
                    </div>
                  ))}
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

        {/* VIEW 4: ÉMARGEMENT & TRONC DE LA VEUVE (SEPARATE SHEET) */}
        {selectedSession && !isEditing && isShowingEmargement && (
          <div className="space-y-6 animate-fade-in">
            {/* Back & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#122428] border border-amber-500/20 rounded-2xl p-6">
              <div>
                <span className="text-[10px] text-[#87A0A0] font-mono tracking-widest uppercase">
                  Tenue {selectedSession.sessionNumber} du {formatDateFrench(selectedSession.date)}
                </span>
                <h3 className="font-sans text-xl font-bold uppercase text-[#C5A059] tracking-wider mt-1">
                  Émargement & Saisie du Tronc
                </h3>
              </div>
              <button
                onClick={() => setIsShowingEmargement(false)}
                className="px-4 py-2 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 hover:bg-teal-900 text-xs font-bold transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                REVENIR AU DÉTAIL
              </button>
            </div>

            {/* Tronc de la Veuve Saisie Card */}
            <div className="bg-[#122428] border border-amber-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#87A0A0]/10 pb-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Saisie du Tronc de la Veuve
                </h4>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end gap-3 max-w-md">
                <div className="space-y-1 flex-grow w-full">
                  <label className="text-xs text-[#87A0A0] block">
                    Montant du Tronc récolté (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localTronc}
                      onChange={(e) => setLocalTronc(Number(e.target.value))}
                      className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white font-mono focus:border-[#C5A059] focus:outline-none"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-[#87A0A0] font-mono font-bold">€</span>
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    const updated: Session = {
                      ...selectedSession,
                      troncAmount: localTronc
                    };
                    onUpdateSession(updated);
                    setSelectedSession(updated);
                    alert("Montant du Tronc de la Veuve enregistré avec succès !");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black tracking-wider transition uppercase shrink-0"
                >
                  Enregistrer
                </button>
              </div>
            </div>

            {/* Members/Visitors Attendance checklists */}
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
