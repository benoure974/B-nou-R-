import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  User, 
  Award, 
  MapPin, 
  Mail, 
  Phone,
  Trash2, 
  Edit2, 
  CheckCircle,
  HelpCircle,
  Lock
} from 'lucide-react';
import { Visitor, Member } from '../types';

interface VisitorsListProps {
  currentUser: Member;
  visitors: Visitor[];
  onAddVisitor: (visitor: Visitor) => void;
  onUpdateVisitor: (visitor: Visitor) => void;
  onDeleteVisitor: (id: string) => void;
  onBack: () => void;
}

export default function VisitorsList({
  currentUser,
  visitors,
  onAddVisitor,
  onUpdateVisitor,
  onDeleteVisitor,
  onBack
}: VisitorsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Visitor>>({});

  const functionTrim = (currentUser.function || '').trim();
  const isAdmin = currentUser.isAdmin || false;
  const isSecOrVM = isAdmin || functionTrim.includes('Vénérable Maître') || functionTrim.includes('Secrétaire');

  if (!isSecOrVM) {
    return (
      <div className="min-h-screen bg-[#081619] text-[#E8E8E8] pb-12 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#122428] border border-red-500/20 rounded-2xl p-8 text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="font-sans text-lg font-bold text-white uppercase tracking-wider">Accès Restreint</h3>
          <p className="text-sm text-[#87A0A0] leading-relaxed">
            Seuls le <strong>Vénérable Maître</strong> et le <strong>Secrétaire</strong> sont habilités à consulter ou modifier les fiches des visiteurs de l'Atelier.
          </p>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition font-bold text-xs tracking-wider uppercase"
          >
            Retour au Parvis
          </button>
        </div>
      </div>
    );
  }

  const handleStartCreate = () => {
    setFormData({
      id: 'v_' + Date.now(),
      firstName: '',
      lastName: '',
      lodge: '',
      orient: '',
      obedience: '',
      email: '',
      phone: '',
      function: ''
    });
    setShowFormModal(true);
  };

  const handleStartEdit = (visitor: Visitor) => {
    setFormData(visitor);
    setShowFormModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.lodge) {
      alert('Veuillez remplir les champs obligatoires (Prénom, Nom, Loge).');
      return;
    }

    const isNew = !visitors.some(v => v.id === formData.id);
    const finalVisitor = formData as Visitor;

    if (isNew) {
      onAddVisitor(finalVisitor);
    } else {
      onUpdateVisitor(finalVisitor);
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment retirer ce visiteur du répertoire ?')) {
      onDeleteVisitor(id);
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const fullName = `${v.firstName} ${v.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || 
      v.lodge.toLowerCase().includes(query) || 
      v.orient.toLowerCase().includes(query) || 
      (v.email && v.email.toLowerCase().includes(query)) ||
      (v.phone && v.phone.toLowerCase().includes(query));
  });

  return (
    <div className="min-h-screen bg-[#081619] text-[#E8E8E8] pb-12 animate-fade-in select-none">
      {/* Header */}
      <header className="bg-[#122428] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-white">
              Répertoire des Visiteurs
            </h2>
          </div>

          {isSecOrVM && (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C7A7A] hover:bg-[#0A6868] text-white text-xs font-bold border border-amber-500/20 transition"
            >
              <Plus className="h-4 w-4 text-[#C5A059]" />
              NOUVEAU VISITEUR
            </button>
          )}
        </div>
      </header>

      {/* CREATE/EDIT DIALOG MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleSaveForm}
            className="w-full max-w-md bg-[#122428] border border-amber-500/20 rounded-2xl p-6 md:p-8 flex flex-col gap-5 relative text-white"
          >
            <h3 className="font-sans text-base font-bold text-amber-400 border-b border-[#87A0A0]/10 pb-2 uppercase tracking-wider">
              {visitors.some(v => v.id === formData.id) ? 'Modifier la fiche visiteur' : 'Nouvelle fiche visiteur'}
            </h3>

            {/* Form inputs */}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0]">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName || ''}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0]">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName || ''}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0]">Adresse Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0]">Téléphone</label>
                  <input
                    type="text"
                    placeholder="ex: 06 92 12 34 56"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0]">Loge maçonnique d'origine *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sous le Voile d'Isis"
                  value={formData.lodge || ''}
                  onChange={e => setFormData({ ...formData, lodge: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#87A0A0]">Fonction (ou Qualité)</label>
                <input
                  type="text"
                  placeholder="ex: Vénérable Maître, Hospitalier, Visiteur, Membre..."
                  value={formData.function || ''}
                  onChange={e => setFormData({ ...formData, function: e.target.value })}
                  className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0]">Orient (Ville) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Saint-Denis"
                    value={formData.orient || ''}
                    onChange={e => setFormData({ ...formData, orient: e.target.value })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#87A0A0]">Obédience</label>
                  <input
                    type="text"
                    placeholder="ex: GLFMM"
                    value={formData.obedience || ''}
                    onChange={e => setFormData({ ...formData, obedience: e.target.value })}
                    className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl px-3.5 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-3 mt-4 justify-end border-t border-[#87A0A0]/10 pt-4">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-600 text-sm hover:bg-gray-800 transition"
              >
                ANNULER
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0C7A7A] hover:bg-[#0A6868] text-white rounded-xl text-sm font-bold border border-amber-500/20 transition"
              >
                ENREGISTRER
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Search input bar */}
        <div className="bg-[#122428] border border-amber-500/15 rounded-2xl p-4 mb-6">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#C5A059]">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher un visiteur par son nom, sa loge, ou son orient..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#081619] border border-[#87A0A0]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E8E8E8] focus:border-[#C5A059] focus:outline-none"
            />
          </div>
        </div>

        {/* Visitors Directory Grid List */}
        <div className="space-y-4">
          {filteredVisitors.length === 0 ? (
            <div className="text-center py-12 bg-[#122428]/40 border border-dashed border-gray-800 rounded-2xl text-gray-500">
              Aucun visiteur enregistré ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVisitors.map(visitor => (
                <div
                  key={visitor.id}
                  className="p-5 rounded-2xl bg-[#122428] border border-amber-500/10 hover:border-amber-500/25 transition shadow-md flex justify-between items-start group"
                >
                  <div className="space-y-3">
                    {/* Visitor name */}
                    <div className="flex gap-2 items-center">
                      <div className="h-8 w-8 rounded-full border border-teal-500/20 flex items-center justify-center bg-[#081619] text-teal-400 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider group-hover:text-amber-300 transition">
                          {visitor.firstName} {visitor.lastName}
                        </h4>
                        {visitor.function && (
                          <span className="inline-block text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider mt-0.5">
                            {visitor.function}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lodge & Orient details */}
                    <div className="space-y-1.5 text-xs text-[#87A0A0]">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span>Loge : <strong>{visitor.lodge}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span>Orient : {visitor.orient} {visitor.obedience && `(${visitor.obedience})`}</span>
                      </div>
                      {visitor.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-[#C5A059]" />
                          <span className="truncate">{visitor.email}</span>
                        </div>
                      )}
                      {visitor.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-[#C5A059]" />
                          <span>{visitor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {isSecOrVM && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleStartEdit(visitor)}
                        className="p-1.5 rounded bg-teal-950/40 border border-teal-900/30 text-teal-400 hover:bg-teal-900/20 transition"
                        title="Modifier"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(visitor.id)}
                        className="p-1.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition"
                        title="Retirer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
