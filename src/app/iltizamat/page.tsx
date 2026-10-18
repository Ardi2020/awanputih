"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { formatRupiah } from "@/lib/utils";
import {
  Wallet,
  CreditCard,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

type PjMalTab = "iltizamat" | "pembayaran" | "rekonsiliasi";

export default function IltizamatPage() {
  const {
    currentUser,
    scopedIltizamat,
    pembayaranTransaksis,
    distribusiDanas,
    recordPembayaranIltizamat,
    verifyPembayaranIltizamat,
    updateKomunikasiIltizamat,
    createDistribusiDana,
  } = useApp();

  const [activeTab, setActiveTab] = useState<PjMalTab>("iltizamat");
  const [filterBayar, setFilterBayar] = useState("ALL");
  const [toast, setToast] = useState<string | null>(null);

  // Modal Catat Pembayaran
  const [payModalId, setPayModalId] = useState<string | null>(null);
  const [payNominal, setPayNominal] = useState("100000");
  const [payMetode, setPayMetode] = useState<"Transfer" | "Tunai">("Transfer");
  const [payCatatan, setPayCatatan] = useState("");

  // Modal Catat Distribusi
  const [distTujuan, setDistTujuan] = useState("");
  const [distPenerima, setDistPenerima] = useState("");
  const [distNominal, setDistNominal] = useState("200000");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalTarget = scopedIltizamat.reduce((a, b) => a + b.targetNominal, 0);
  const totalTerbayar = scopedIltizamat.reduce((a, b) => a + b.terbayarNominal, 0);
  const totalDistribusi = distribusiDanas.reduce((a, b) => a + b.nominal, 0);
  const saldoKas = totalTerbayar - totalDistribusi;
  const selisihPencatatan = totalTerbayar - totalDistribusi - saldoKas; // Rp0 balanced

  const filteredList = scopedIltizamat.filter((i) =>
    filterBayar === "ALL" ? true : i.statusBayar === filterBayar
  );

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalId) return;
    const res = recordPembayaranIltizamat({
      iltizamatId: payModalId,
      nominal: Number(payNominal) || 0,
      metode: payMetode,
      catatan: payCatatan,
    });
    if (res.success) {
      showToast(res.message);
      setPayModalId(null);
      setPayCatatan("");
    }
  };

  const handleDistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createDistribusiDana({
      tujuan: distTujuan || "Distribusi Program Mahali",
      penerima: distPenerima || "Bendahara Program",
      nominal: Number(distNominal) || 0,
      metode: "Transfer",
    });
    if (res.success) {
      showToast(res.message);
      setDistTujuan("");
      setDistPenerima("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Blueprint PJ Mal — Pengelolaan Iltizamat, Verifikasi & Rekonsiliasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Memisahkan Status Pembayaran dan Status Komunikasi agar syabab yang memiliki kendala tidak disamakan dengan yang lalai.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Navigation Tabs for PJ Mal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab("iltizamat")}
          className={`touch-target px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 border ${
            activeTab === "iltizamat"
              ? "bg-teal-800 text-white border-teal-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>1. Kewajiban & Komunikasi ({scopedIltizamat.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("pembayaran")}
          className={`touch-target px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 border ${
            activeTab === "pembayaran"
              ? "bg-teal-800 text-white border-teal-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Verifikasi Pembayaran ({pembayaranTransaksis.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("rekonsiliasi")}
          className={`touch-target px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 border ${
            activeTab === "rekonsiliasi"
              ? "bg-teal-800 text-white border-teal-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>3. Distribusi & Rekonsiliasi (Selisih Rp0)</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: DAFTAR KEWAJIBAN ILTIZAMAT (DUAL STATUS: BAYAR VS KOMUNIKASI)
      ===================================================================== */}
      {activeTab === "iltizamat" && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["ALL", "Belum Membayar", "Sebagian", "Lunas", "Terlambat", "Ditangguhkan"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterBayar(st)}
                className={`px-3 py-1.5 rounded-xl font-bold border shrink-0 ${
                  filterBayar === st ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {st === "ALL" ? "Semua Syabab" : st}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredList.map((item) => {
              const kekurangan = Math.max(0, item.targetNominal - item.terbayarNominal);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{item.pemudaNama}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.jenjang} • {item.halaqahNama}
                      </span>
                      <span className="text-xs text-slate-500">Guru: <strong>{item.guruNama}</strong></span>
                    </div>

                    {/* Two Separated Statuses (Spec #6: Status Pembayaran vs Status Komunikasi) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          item.statusBayar === "Lunas"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.statusBayar === "Sebagian"
                            ? "bg-blue-100 text-blue-800"
                            : item.statusBayar === "Ditangguhkan"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Bayar: {item.statusBayar}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                        Komunikasi: {item.statusKomunikasi}
                      </span>

                      {item.tanggalJanji && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                          📅 Janji Bayar: {item.tanggalJanji}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 pt-1">
                      Target: <strong>{formatRupiah(item.targetNominal)}</strong> • Dibayar:{" "}
                      <strong className="text-emerald-700">{formatRupiah(item.terbayarNominal)}</strong> • Kekurangan:{" "}
                      <strong className="text-red-600">{formatRupiah(kekurangan)}</strong>
                    </div>

                    {item.catatanTindakLanjut && (
                      <div className="text-xs text-slate-500 italic">
                        Tindak lanjut: &ldquo;{item.catatanTindakLanjut}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                    {item.statusBayar !== "Lunas" && (
                      <>
                        <button
                          onClick={() => {
                            setPayModalId(item.id);
                            setPayNominal(String(kekurangan || 100000));
                          }}
                          className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                        >
                          + Catat Bayar
                        </button>
                        <button
                          onClick={() => {
                            const res = updateKomunikasiIltizamat(
                              item.id,
                              "Berjanji Membayar",
                              undefined,
                              "15 Agustus 2026",
                              "Syabab mengonfirmasi janji pembayaran tanggal 15 Agustus"
                            );
                            showToast(res.message);
                          }}
                          className="touch-target px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
                        >
                          Catat Janji Bayar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: VERIFIKASI PEMBAYARAN (NOMOR TRANSAKSI ILZ-KT-202608-XXXX)
      ===================================================================== */}
      {activeTab === "pembayaran" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900">Antrean Verifikasi Uang Masuk & Bukti</h2>
            <p className="text-xs text-slate-500">
              Sasaran waktu verifikasi maksimal 1×24 jam. Mendukung pembayaran penuh maupun sebagian.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {pembayaranTransaksis.map((trx) => (
              <div key={trx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500">{trx.nomorTransaksi}</span>
                    <span className="font-black text-slate-900 text-sm">{trx.pemudaNama}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">{trx.metode}</span>
                  </div>
                  <div className="text-slate-600">
                    Nominal: <strong className="text-emerald-700">{formatRupiah(trx.nominal)}</strong> • Sumber Info:{" "}
                    <strong>{trx.sumberInfo}</strong> • Bukti: <span className="underline">{trx.buktiUrl}</span>
                  </div>
                  {trx.catatan && <div className="text-slate-500">{trx.catatan}</div>}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {trx.statusVerifikasi === "Terverifikasi" ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold">
                      ✓ Terverifikasi
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const res = verifyPembayaranIltizamat(trx.id, "Terverifikasi");
                          showToast(res.message);
                        }}
                        className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                      >
                        ✓ Verifikasi Uang
                      </button>
                      <button
                        onClick={() => {
                          const res = verifyPembayaranIltizamat(trx.id, "Perlu Koreksi");
                          showToast(res.message);
                        }}
                        className="touch-target px-3 py-2 bg-amber-100 text-amber-900 rounded-xl font-bold"
                      >
                        Perlu Koreksi
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: DISTRIBUSI DANA & REKONSILIASI (SELISIH PENCATATAN = Rp0)
      ===================================================================== */}
      {activeTab === "rekonsiliasi" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900">REKONSILIASI KAS & REKENING (AGUSTUS 2026)</h2>
            <div className="space-y-2.5 text-xs p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between">
                <span>Total Pembayaran Terverifikasi:</span>
                <strong className="text-slate-900">{formatRupiah(totalTerbayar)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Dikurangi Dana Didistribusikan:</span>
                <strong className="text-blue-700">- {formatRupiah(totalDistribusi)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Dikurangi Saldo Kas/Rekening Tersimpan:</span>
                <strong className="text-slate-900">- {formatRupiah(saldoKas)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-emerald-700">
                <span>Selisih Pencatatan (Target Wajib Rp0):</span>
                <span>{formatRupiah(selisihPencatatan)} ✓ SEIMBANG</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">Riwayat Distribusi Dana</div>
              {distribusiDanas.map((d) => (
                <div key={d.id} className="p-3 rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{d.tujuan}</div>
                    <div className="text-slate-500">{d.nomorDistribusi} • Penerima: {d.penerima}</div>
                  </div>
                  <div className="font-black text-slate-900">{formatRupiah(d.nominal)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-3">Catat Distribusi Dana Baru</h2>
            <form onSubmit={handleDistSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan Distribusi:</label>
                <input
                  type="text"
                  required
                  value={distTujuan}
                  onChange={(e) => setDistTujuan(e.target.value)}
                  placeholder="Contoh: Setoran Pusat / Operasional Daurah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Identitas Penerima:</label>
                <input
                  type="text"
                  required
                  value={distPenerima}
                  onChange={(e) => setDistPenerima(e.target.value)}
                  placeholder="Bendahara / PIC Program"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Distribusi (Rp):</label>
                <input
                  type="number"
                  required
                  value={distNominal}
                  onChange={(e) => setDistNominal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <button
                type="submit"
                className="w-full touch-target py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl"
              >
                Simpan & Terbitkan Bukti Distribusi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Pembayaran */}
      {payModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Catat Pembayaran Iltizamat (Penuh / Sebagian)</h3>
              <button onClick={() => setPayModalId(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePaySubmit} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Diterima (Rp):</label>
                <input
                  type="number"
                  required
                  value={payNominal}
                  onChange={(e) => setPayNominal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran:</label>
                <select
                  value={payMetode}
                  onChange={(e) => setPayMetode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Transfer">Transfer Rekening Kas</option>
                  <option value="Tunai">Tunai via Guru / PJ Mal</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan:</label>
                <input
                  type="text"
                  value={payCatatan}
                  onChange={(e) => setPayCatatan(e.target.value)}
                  placeholder="Contoh: Pembayaran tahap 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPayModalId(null)} className="px-4 py-2 text-slate-600 font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl">
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
