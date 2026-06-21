@extends('akta.layouts.app')

@section('title', 'Plan Audit - AKTA IAT')
@section('page_title', 'Plan Audit')
@section('page_description', 'Manajemen rencana pelaksanaan audit')

@section('content')
<section class="space-y-5">
    <div class="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h2 class="text-xl font-bold text-slate-100">Plan Audit</h2>
            <p class="mt-1 text-sm text-slate-400">Manajemen rencana pelaksanaan audit</p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button id="exportPlansExcelButton" type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <path d="M8 3v18M16 3v18M3 9h18M3 15h18"></path>
                </svg>
                Excel
            </button>

            <button id="exportPlansPdfButton" type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                PDF
            </button>

            <button id="openCreatePlanButton" type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Buat Plan Baru
            </button>
        </div>
    </div>

    <div id="planAlert" class="hidden rounded-xl border px-4 py-3 text-sm"></div>

    <div id="planSummaryGrid" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="h-4 w-28 animate-pulse rounded bg-slate-800"></div>
            <div class="mt-3 h-7 w-16 animate-pulse rounded bg-slate-800"></div>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="h-4 w-28 animate-pulse rounded bg-slate-800"></div>
            <div class="mt-3 h-7 w-16 animate-pulse rounded bg-slate-800"></div>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="h-4 w-28 animate-pulse rounded bg-slate-800"></div>
            <div class="mt-3 h-7 w-16 animate-pulse rounded bg-slate-800"></div>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="h-4 w-28 animate-pulse rounded bg-slate-800"></div>
            <div class="mt-3 h-7 w-16 animate-pulse rounded bg-slate-800"></div>
        </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div class="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                <div>
                    <h3 class="text-sm font-bold uppercase tracking-wide text-slate-100">Daftar Plan Audit</h3>
                    <p id="planTableInfo" class="mt-0.5 text-xs text-slate-500">Memuat data plan audit...</p>
                </div>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input id="planSearch" type="search" placeholder="Cari no SPT / cabang..."
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 sm:w-64">

                <select id="planStatusFilter"
                    class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="running">Running</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-800">
                <thead class="bg-slate-950/60">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">No</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">No SPT</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Jenis Audit</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Tgl Plan</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Kepala Tim</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">TIM Audit</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Cabang</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Aksi</th>
                    </tr>
                </thead>

                <tbody id="planTableBody" class="divide-y divide-slate-800">
                    <tr>
                        <td colspan="9" class="px-4 py-6 text-center text-sm text-slate-400">
                            Memuat plan audit...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<div id="planModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 px-4 py-8">
    <div class="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
                <h3 id="planModalTitle" class="text-lg font-bold text-slate-100">Tambah Plan Audit</h3>
                <p class="text-sm text-slate-400">Isi data rencana audit.</p>
            </div>

            <button id="closePlanModalButton" type="button"
                class="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800">
                Tutup
            </button>
        </div>

        <form id="planForm" class="space-y-4 px-5 py-5">
            <input type="hidden" id="planId">

            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">No SPT</label>
                    <input id="noSpt" type="text"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Jenis Audit</label>
                    <select id="jenisAudit" required
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                        <option value="Reguler">Reguler</option>
                        <option value="Khusus">Khusus</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Investigasi">Investigasi</option>
                    </select>
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Cabang</label>
                    <input id="cabang" type="text" required
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Cabang Area</label>
                    <input id="cabangArea" type="text"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Tanggal Mulai</label>
                    <input id="tglMulai" type="date"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Tanggal Selesai</label>
                    <input id="tglSelesai" type="date"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Kepala Tim</label>
                    <input id="kepalaTim" type="text"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Status</label>
                    <select id="status" required
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="running">Running</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div class="sm:col-span-2">
                    <label class="mb-1 block text-sm font-medium text-slate-300">Tim Audit</label>
                    <input id="tim" type="text" placeholder="Pisahkan dengan koma. Contoh: Budi, Sari, Andi"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500">
                </div>

                <div class="sm:col-span-2">
                    <label class="mb-1 block text-sm font-medium text-slate-300">Keterangan</label>
                    <textarea id="keterangan" rows="3"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"></textarea>
                </div>
            </div>

            <div class="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button type="button" id="cancelPlanFormButton"
                    class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">
                    Batal
                </button>

                <button type="submit" id="savePlanButton"
                    class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                    Simpan
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/akta-plan-audit.js')
@endpush
