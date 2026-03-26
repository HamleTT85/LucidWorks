import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Referenz } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { clearAdminSession } from './AdminLogin';
import ReferenceForm from './ReferenceForm';

export default function AdminDashboard() {
  const [referenzen, setReferenzen] = useState<Referenz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Referenz | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const { data, error } = await supabase
      .from('referenzen')
      .select('*')
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReferenzen(data);
    }
    setLoading(false);
  }

  async function toggleVisibility(id: string, current: boolean) {
    await supabase.from('referenzen').update({ sichtbar: !current }).eq('id', id);
    setReferenzen((prev) =>
      prev.map((r) => (r.id === id ? { ...r, sichtbar: !current } : r))
    );
    showToast(`Status geändert`);
  }

  async function deleteItem(id: string) {
    if (!confirm('Referenz wirklich löschen?')) return;
    await supabase.from('referenzen').delete().eq('id', id);
    setReferenzen((prev) => prev.filter((r) => r.id !== id));
    showToast('Referenz gelöscht');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleSave() {
    setShowForm(false);
    setEditItem(null);
    loadAll();
    showToast(editItem ? 'Referenz aktualisiert' : 'Referenz gespeichert');
  }

  function handleLogout() {
    clearAdminSession();
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#12122a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-[#e8e4df]">Admin Dashboard</h1>
            <p className="text-[#b0aaa2] text-sm">Portfolio Management</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 text-sm border border-white/10 text-[#b0aaa2] rounded-lg
                       hover:border-white/20 transition-colors"
            >
              ← Website
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-lg
                       hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#b0aaa2]">
            {referenzen.length} Referenz{referenzen.length !== 1 ? 'en' : ''}
          </p>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="px-5 py-2.5 bg-[#c8a45c] text-[#0a0a1a] font-heading font-semibold
                     rounded-lg hover:bg-[#d4b876] transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Neue Referenz
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#1a1a2e] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : referenzen.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#b0aaa2] text-lg mb-4">Noch keine Referenzen vorhanden</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-[#c8a45c] text-[#0a0a1a] font-semibold rounded-lg
                       hover:bg-[#d4b876] transition-colors"
            >
              Erste Referenz hinzufügen
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {referenzen.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center gap-4 p-4 bg-[#1a1a2e] border border-white/5 rounded-xl
                         hover:border-white/10 transition-colors"
              >
                {/* Thumbnail */}
                <img
                  src={ref.thumbnail_url}
                  alt={ref.titel}
                  className="w-20 h-12 object-cover rounded-lg flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#e8e4df] font-medium text-sm truncate">{ref.titel}</h3>
                  <p className="text-[#b0aaa2] text-xs">
                    {ref.kunde} · {ref.kategorie}
                    {ref.datum && ` · ${formatDate(ref.datum)}`}
                  </p>
                </div>

                {/* Status */}
                <button
                  onClick={() => toggleVisibility(ref.id, ref.sichtbar)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    ref.sichtbar
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}
                >
                  {ref.sichtbar ? 'Öffentlich' : 'Entwurf'}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditItem(ref); setShowForm(true); }}
                    className="p-2 text-[#b0aaa2] hover:text-[#c8a45c] transition-colors"
                    title="Bearbeiten"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteItem(ref.id)}
                    className="p-2 text-[#b0aaa2] hover:text-red-400 transition-colors"
                    title="Löschen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ReferenceForm
          editItem={editItem}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-[#1a1a2e] border border-[#c8a45c]/30
                      text-[#e8e4df] rounded-xl shadow-xl text-sm animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}
