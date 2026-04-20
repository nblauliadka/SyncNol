import { useState } from "react";
import {
  Users,
  Receipt,
  QrCode,
  ArrowRightLeft,
  UserPlus,
  CheckCircle2,
  X,
} from "lucide-react";

export default function WingmanPage() {
  const [billAmount, setBillAmount] = useState("");
  const [friends, setFriends] = useState([
    { name: "Me", share: 1 },
    { name: "Alex", share: 1 },
  ]);
  const [newFriend, setNewFriend] = useState("");
  const [splitGenerated, setSplitGenerated] = useState(false);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriend.trim()) return;
    setFriends([...friends, { name: newFriend, share: 1 }]);
    setNewFriend("");
    setSplitGenerated(false);
  };

  const handleRemoveFriend = (idx) => {
    if (friends.length <= 1) return;
    const f = [...friends];
    f.splice(idx, 1);
    setFriends(f);
    setSplitGenerated(false);
  };

  const totalShares = friends.reduce((acc, f) => acc + f.share, 0);
  const amountPerShare = billAmount ? Number(billAmount) / totalShares : 0;

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Social Finance
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Wingman Protocol
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* CONFIGURATION */}
        <div className={`${cardClass} xl:col-span-7 flex flex-col gap-6`}>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Receipt size={16} className="text-fintech-primary" /> Bill
              Details
            </h3>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => {
                  setBillAmount(e.target.value);
                  setSplitGenerated(false);
                }}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-3xl font-black outline-none focus:ring-2 focus:ring-fintech-primary text-slate-900 dark:text-white transition-all"
              />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                <span>Split Between ({friends.length})</span>
                <span>Share</span>
              </div>

              {friends.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-full bg-fintech-primary/20 text-fintech-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 font-semibold text-sm">{f.name}</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newF = [...friends];
                        newF[i].share = Math.max(1, newF[i].share - 1);
                        setFriends(newF);
                        setSplitGenerated(false);
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-sm font-bold">
                      {f.share}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newF = [...friends];
                        newF[i].share += 1;
                        setFriends(newF);
                        setSplitGenerated(false);
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(i)}
                    disabled={friends.length <= 1}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="Add friend's name..."
                className="flex-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-fintech-primary outline-none"
              />
              <button
                type="submit"
                disabled={!newFriend.trim()}
                className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <UserPlus size={18} />
              </button>
            </form>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSplitGenerated(true)}
              disabled={!billAmount || Number(billAmount) <= 0}
              className="w-full bg-fintech-primary hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <ArrowRightLeft size={20} /> Generate Split & QRIS
            </button>
          </div>
        </div>

        {/* OUTPUT / QRIS */}
        <div
          className={`${cardClass} xl:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none flex flex-col justify-center items-center text-center p-8`}
        >
          {!splitGenerated ? (
            <div className="opacity-50 flex flex-col items-center">
              <QrCode size={64} className="mb-4" />
              <p className="text-sm font-semibold max-w-[200px]">
                Enter bill details to generate collection links and QRIS code.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-2xl mb-6 shadow-2xl">
                {/* Mock QR Code */}
                <div className="w-48 h-48 bg-slate-100 border-8 border-fintech-primary relative flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-4 border-dashed border-slate-300 flex items-center justify-center">
                    <span className="text-slate-400 font-bold tracking-widest">
                      QRIS
                    </span>
                  </div>
                  <div className="absolute w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                    <div className="w-4 h-4 bg-fintech-primary rounded-sm" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black mb-1">Scan to Pay</h3>
              <p className="text-sm text-slate-400 mb-6">
                Standard split based on {totalShares} shares.
              </p>

              <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                {friends.map((f, i) => {
                  const shareAmount = amountPerShare * f.share;
                  return (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {f.name === "Me" ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        )}
                        <span className="font-medium text-sm">{f.name}</span>
                      </div>
                      <span className="font-bold">
                        Rp{" "}
                        {shareAmount.toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                Share Collection Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
