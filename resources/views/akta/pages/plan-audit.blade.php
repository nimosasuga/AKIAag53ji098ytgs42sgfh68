@extends('akta.layouts.app')

@section('title', 'Plan Audit - AKTA IAT')
@section('page_title', 'Plan Audit')
@section('page_description', 'Perencanaan audit, jadwal, cabang, tim, dan status')

@section('content')
<section class="space-y-5">
    <div
        class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h2 class="text-lg font-bold">Daftar Plan Audit</h2>
            <p class="mt-1 text-sm text-slate-400">
                Kelola rencana audit berdasarkan no SPT, cabang, jadwal, kepala tim, dan status.
            </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
            <input id="planSearch" type="search" placeholder="Cari cabang / no SPT..."
                class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 sm:w-64">

            <select id="planStatusFilter"
                class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <button id="openCreatePlanButton" type="button"
                class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                Tambah Plan
            </button>
        </div>
    </div>

    <div id="planAlert" class="hidden rounded-xl border px-4 py-3 text-sm"></div>

    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-800">
                <thead class="bg-slate-950/60">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Plan</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Cabang</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Jadwal</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Tim
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Aksi</th>
                    </tr>
                </thead>

                <tbody id="plansTableBody" class="divide-y divide-slate-800">
                    <tr>
                        <td colspan="6" class="px-4 py-6 text-center text-sm text-slate-400">
                            Memuat plan audit...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<div id="planModal"
    class="fixed inset-0 z-50 hidden items-start justify-center overflow-y-auto bg-black/70 px-4 py-6 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-out sm:items-center sm:py-8"
    role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="planModalTitle">
    <div id="planModalPanel"
        class="my-auto w-full max-w-3xl translate-y-3 scale-[0.98] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 opacity-0 shadow-2xl transition duration-200 ease-out">
        <div class="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
            <div>
                <h3 id="planModalTitle" class="text-lg font-bold text-slate-100">Tambah Plan Audit</h3>
                <p class="text-sm text-slate-400">Isi data rencana audit.</p>
            </div>

            <button id="closePlanModalButton" type="button" aria-label="Tutup popup plan audit"
                class="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800">
                Tutup
            </button>
        </div>

        <form id="planForm" class="max-h-[calc(100vh-9rem)] space-y-4 overflow-y-auto px-5 py-5 sm:max-h-[76vh]">
            <input type="hidden" id="planId">

            <div id="planFormAlert" class="hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"></div>

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
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500">
                </div>

                <div class="sm:col-span-2">
                    <label class="mb-1 block text-sm font-medium text-slate-300">Keterangan</label>
                    <textarea id="keterangan" rows="3"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"></textarea>
                </div>
            </div>

            <div class="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-slate-800 bg-slate-900/95 px-5 pt-4 backdrop-blur">
                <button type="button" id="cancelPlanFormButton"
                    class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">
                    Batal
                </button>

                <button type="submit" id="savePlanButton"
                    class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                    <span id="savePlanButtonText">Simpan</span>
                    <span id="savePlanButtonLoading" class="hidden">Menyimpan...</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
@vite(['resources/js/akta-plan-audit.js', 'resources/js/akta-plan-audit-modal.js'])
@endpush
