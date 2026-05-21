'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2, ShieldCheck, Sparkles, UserCog } from 'lucide-react';
import Swal from 'sweetalert2';

type FormOverrideSkor = {
  user_id: string;
  eco_points: string;
  impact_score: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const formAwal: FormOverrideSkor = {
  user_id: '',
  eco_points: '',
  impact_score: '',
};

function getAdminToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_token') || '';
}

async function adminFetch<T>(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const raw = await response.text();
  let payload: any = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Permintaan gagal (status ${response.status})`);
  }

  return payload as T;
}

export default function HalamanOverrideSkorSuperAdmin() {
  const [form, setForm] = useState<FormOverrideSkor>(formAwal);
  const [sibuk, setSibuk] = useState(false);
  const [pesanError, setPesanError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSibuk(true);
    setPesanError('');

    try {
      if (!form.user_id.trim()) {
        throw new Error('User ID wajib diisi.');
      }

      const payload = {
        eco_points: Number(form.eco_points),
        impact_score: Number(form.impact_score),
      };

      const endpoints = [`/users/${form.user_id}/scores`, `/users/${form.user_id}/score-override`];

      let sukses = false;
      let errorTerakhir: unknown = null;

      for (const endpoint of endpoints) {
        try {
          await adminFetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          sukses = true;
          break;
        } catch (error) {
          errorTerakhir = error;
          const pesan = error instanceof Error ? error.message : '';
          if (!pesan.includes('404')) throw error;
        }
      }

      if (!sukses) {
        throw errorTerakhir instanceof Error ? errorTerakhir : new Error('Gagal mengupdate skor');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Override berhasil',
        text: 'Skor/Eco-point user berhasil diperbarui.',
        confirmButtonColor: '#059669',
      });

      setForm(formAwal);
    } catch (err) {
      const pesan = err instanceof Error ? err.message : 'Gagal mengupdate skor';
      setPesanError(pesan);
      await Swal.fire({
        icon: 'error',
        title: 'Override gagal',
        text: pesan,
        confirmButtonColor: '#059669',
      });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Super Admin • Manajemen Skor
          </div>
          <Link
            href="/super-admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-lg shadow-emerald-100/50 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Manual Override Skor</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fitur penyelamat untuk memperbaiki Eco-point atau skor dampak jika terjadi ketidaksinkronan data.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              EcoBank Nusantara
            </div>
          </div>

          {pesanError ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {pesanError}
            </div>
          ) : null}

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">User ID</label>
              <input
                value={form.user_id}
                onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Contoh: 12"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Eco Points</label>
              <input
                value={form.eco_points}
                onChange={(event) => setForm((prev) => ({ ...prev, eco_points: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Contoh: 2500"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Skor Dampak</label>
              <input
                value={form.impact_score}
                onChange={(event) => setForm((prev) => ({ ...prev, impact_score: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Contoh: 12.5"
                inputMode="decimal"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <UserCog className="h-4 w-4 text-emerald-600" />
                Endpoint: <span className="font-mono">{API_URL}/admin/users/:id/scores</span>
              </div>
              <button
                type="submit"
                disabled={sibuk}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sibuk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Terapkan Override
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

