import { useState } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Plus,
  Trash2,
  FileLock2,
  Wallet,
  Home,
  Car,
  CandlestickChart,
  Gem,
  StickyNote,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import useAppStore from "../store/useAppStore";

const ASSET_CATEGORIES = [
  { id: "cash", label: "Kas & Tabungan", icon: Wallet, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { id: "property", label: "Properti", icon: Home, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "vehicle", label: "Kendaraan", icon: Car, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "investment", label: "Investasi", icon: CandlestickChart, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { id: "valuables", label: "Barang Berharga", icon: Gem, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
];

const formatIDR = (num) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num || 0);

const INITIAL_ASSETS = [
  { id: 1, category: "cash", name: "BCA Tabungan", value: 15000000 },
  { id: 2, category: "investment", name: "Reksa Dana Syariah", value: 8500000 },
  { id: 3, category: "property", name: "Apartemen Studio (estimasi)", value: 350000000 },
];

const INITIAL_NOTES = [
  { id: 1, title: "PIN & Password Darurat", content: "Di simpan di safety deposit BCA. Hubungi notaris jika darurat.", hidden: true },
];

export default function VaultPage() {
  const { summary } = useAppStore();

  // --- Vault Lock State ---
  const [lockedAmount, setLockedAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // --- Asset Tracker State ---
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({ category: "cash", name: "", value: "" });
  const [expandedCat, setExpandedCat] = useState(null);

  // --- Secure Notes State ---
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [revealedNotes, setRevealedNotes] = useState({});

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.value), 0);
  const netWorthWithVault = totalAssets - (summary.total_utang || 0);

  const handleLock = (e) => {
    e.preventDefault();
    if (!inputAmount) return;
    setLockedAmount((p) => p + Number(inputAmount));
    setInputAmount("");
    toast.success("Dana diamankan ke Brankas.", { icon: "🔒" });
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (captchaAnswer === "144") {
      setLockedAmount(0);
      setUnlocking(false);
      setCaptchaAnswer("");
      toast.success("Brankas berhasil dibuka.", { icon: "🔓" });
    } else {
      toast.error("Jawaban salah. Brankas tetap terkunci.", { icon: "🚫" });
    }
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.value) return;
    setAssets((prev) => [...prev, { id: Date.now(), ...newAsset, value: Number(newAsset.value) }]);
    setNewAsset({ category: "cash", name: "", value: "" });
    setShowAddAsset(false);
    toast.success("Aset berhasil ditambahkan.");
  };

  const handleDeleteAsset = (id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    toast.success("Aset dihapus.");
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.title) return;
    setNotes((prev) => [...prev, { id: Date.now(), ...newNote, hidden: true }]);
    setNewNote({ title: "", content: "" });
    setShowAddNote(false);
    toast.success("Catatan aman disimpan.");
  };

  const toggleReveal = (id) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cardClass =
    "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Security
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Brankas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inventaris aset, dana terkunci, dan catatan rahasia Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-bold">
            Total Aset: {formatIDR(totalAssets)}
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-fintech-primary px-4 py-2 rounded-xl text-sm font-bold">
            Net Worth: {formatIDR(netWorthWithVault)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Asset Tracker + Secure Notes */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* ASSET TRACKER */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CandlestickChart size={18} className="text-fintech-primary" /> Inventaris Aset
              </h3>
              <button
                onClick={() => setShowAddAsset((p) => !p)}
                className="flex items-center gap-1.5 text-xs font-bold text-fintech-primary bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus size={14} /> Tambah Aset
              </button>
            </div>

            {/* Add Asset Form */}
            {showAddAsset && (
              <form onSubmit={handleAddAsset} className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                <select
                  value={newAsset.category}
                  onChange={e => setNewAsset(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fintech-primary"
                >
                  {ASSET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Nama aset (mis. BCA Tabungan)"
                  value={newAsset.name}
                  onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fintech-primary"
                  required
                />
                <input
                  type="number"
                  placeholder="Estimasi nilai (Rp)"
                  value={newAsset.value}
                  onChange={e => setNewAsset(p => ({ ...p, value: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fintech-primary"
                  required
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddAsset(false)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-fintech-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors">Simpan</button>
                </div>
              </form>
            )}

            {/* Asset List by Category */}
            <div className="flex flex-col gap-3">
              {ASSET_CATEGORIES.map(cat => {
                const catAssets = assets.filter(a => a.category === cat.id);
                if (catAssets.length === 0) return null;
                const catTotal = catAssets.reduce((s, a) => s + Number(a.value), 0);
                const Icon = cat.icon;
                const isExpanded = expandedCat === cat.id;

                return (
                  <div key={cat.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center`}>
                          <Icon size={18} className={cat.color} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.label}</div>
                          <div className="text-xs text-slate-400">{catAssets.length} item</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatIDR(catTotal)}</span>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {catAssets.map(asset => (
                          <div key={asset.id} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111827]">
                            <span className="text-sm text-slate-700 dark:text-slate-300">{asset.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatIDR(asset.value)}</span>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECURE NOTES */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileLock2 size={18} className="text-fintech-primary" /> Catatan Rahasia
              </h3>
              <button
                onClick={() => setShowAddNote((p) => !p)}
                className="flex items-center gap-1.5 text-xs font-bold text-fintech-primary bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus size={14} /> Tambah Catatan
              </button>
            </div>

            {showAddNote && (
              <form onSubmit={handleAddNote} className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Judul catatan..."
                  value={newNote.title}
                  onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fintech-primary"
                  required
                />
                <textarea
                  placeholder="Isi catatan rahasia..."
                  value={newNote.content}
                  onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))}
                  rows={3}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fintech-primary resize-none"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddNote(false)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-fintech-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors">Simpan</button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {notes.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <StickyNote size={32} className="mx-auto mb-2 opacity-40" />
                  Belum ada catatan rahasia.
                </div>
              )}
              {notes.map(note => (
                <div key={note.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <FileLock2 size={16} className="text-fintech-primary flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{note.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReveal(note.id)}
                        className="text-slate-400 hover:text-fintech-primary transition-colors"
                      >
                        {revealedNotes[note.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => setNotes(p => p.filter(n => n.id !== note.id))}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className={`text-sm text-slate-600 dark:text-slate-400 transition-all ${revealedNotes[note.id] ? "" : "blur-sm select-none"}`}>
                    {note.content || "— Tidak ada isi —"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Vault Lock */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* VAULT STATUS */}
          <div className={`${cardClass} flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px] p-6`}>
            <div className={`absolute inset-0 bg-slate-900 flex items-center justify-center transition-all duration-700 ${lockedAmount > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <div className="absolute w-64 h-64 border-[20px] border-fintech-primary rounded-full animate-spin" style={{ animationDuration: "10s" }} />
              <div className="absolute w-48 h-48 border-[10px] border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: "7s", animationDirection: "reverse" }} />
              <div className="relative z-10 flex flex-col items-center">
                <Lock size={56} className="text-white mb-3" />
                <div className="text-xs font-bold text-blue-300 tracking-widest uppercase mb-1">Dana Terkunci</div>
                <div className="text-4xl font-black text-white">{formatIDR(lockedAmount)}</div>
              </div>
            </div>
            <div className={`transition-all duration-700 ${lockedAmount > 0 ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
              <Unlock size={56} className="text-slate-300 dark:text-slate-600 mb-4 mx-auto" />
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Brankas Kosong</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                Kunci sebagian uang Anda untuk mencegah pengeluaran impulsif. Butuh soal matematika untuk membukanya kembali.
              </p>
            </div>
          </div>

          {/* VAULT CONTROLS */}
          <div className={`${cardClass} p-6 flex flex-col gap-5`}>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <KeyRound size={18} className="text-fintech-primary" /> Terminal Akses
              </h3>
              <p className="text-xs text-slate-500">Setorkan atau tarik dana dari Brankas.</p>
            </div>

            {!unlocking ? (
              <form onSubmit={handleLock} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Jumlah Setor (Rp)
                  </label>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputAmount}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Lock size={18} /> Kunci Dana
                </button>
                {lockedAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUnlocking(true)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold py-3.5 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
                  >
                    Ajukan Penarikan
                  </button>
                )}
              </form>
            ) : (
              <form
                onSubmit={handleUnlock}
                className="space-y-4 bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-200 dark:border-red-900/30"
              >
                <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                  <ShieldAlert size={24} className="flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">CAPTCHA Mental Diperlukan</h4>
                    <p className="text-xs mt-0.5 text-red-500 dark:text-red-400/80">
                      Buktikan ini bukan keputusan impulsif. Selesaikan persamaan:
                    </p>
                  </div>
                </div>
                <div className="text-center py-4 bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900/50">
                  <span className="text-3xl font-black font-mono tracking-wider">12 × 12 = ?</span>
                </div>
                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Masukkan jawaban"
                  className="w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setUnlocking(false); setCaptchaAnswer(""); }}
                    className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!captchaAnswer}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Verifikasi & Buka
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
