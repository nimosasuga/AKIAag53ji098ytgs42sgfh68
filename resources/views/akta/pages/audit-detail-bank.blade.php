@extends('akta.layouts.app')

@section('title', 'Audit Detail Bank - AKTA IAT')
@section('page_title', 'Audit Detail Bank')
@section('page_description', 'Pemeriksaan dan rekonsiliasi bank berdasarkan Plan Audit')

@section('content')
<section class="space-y-5">
    <div
        class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
            <h2 class="text-lg font-bold">Pemeriksaan Bank</h2>
            <p class="mt-1 text-sm text-slate-400">
                Kelola saldo buku, saldo bank, selisih, rekening, auditee, dan detail rekonsiliasi bank per Plan Audit.
            </p>
        </div>

        <div class="flex flex-col gap-3 lg:flex-row">
            <input id="bankSearch" type="search" placeholder="Cari bank / rekening / no SPT / cabang..."
                class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 lg:w-80">

            <select id="bankSelisihFilter"
                class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                <option value="">Semua</option>
                <option value="true">Ada Selisih</option>
            </select>

            <button id="openCreateBankButton" type="button"
                class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                Tambah
            </button>
        </div>
    </div>

    <div id="bankAlert" class="hidden rounded-xl border px-4 py-3 text-sm"></div>

    <div class="grid gap-4 md:grid-cols-5">
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Rekening</div>
            <div id="bankTotalRekeningStat" class="mt-2 text-2xl font-bold text-slate-100">0</div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo Buku</div>
            <div id="bankSaldoBukuStat" class="mt-2 text-lg font-bold text-blue-300">Rp0</div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo Bank</div>
            <div id="bankSaldoBankStat" class="mt-2 text-lg font-bold text-amber-300">Rp0</div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Selisih</div>
            <div id="bankTotalSelisihStat" class="mt-2 text-lg font-bold text-red-300">Rp0</div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Rekening Selisih</div>
            <div id="bankRekeningSelisihStat" class="mt-2 text-2xl font-bold text-red-300">0</div>
        </div>
    </div>

    <div class="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <label class="mb-2 block text-sm font-medium text-slate-300">Filter Plan Audit</label>
        <select id="bankPlanFilter"
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
            <option value="">Semua Plan Audit</option>
        </select>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-800">
                <thead class="bg-slate-950/60">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Bank
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Plan Audit
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Saldo Buku
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Saldo Bank
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Selisih
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Auditee
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Aksi
                        </th>
                    </tr>
                </thead>

                <tbody id="bankTableBody" class="divide-y divide-slate-800">
                    <tr>
                        <td colspan="7" class="px-4 py-6 text-center text-sm text-slate-400">
                            Memuat pemeriksaan bank...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<div id="bankModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 px-4 py-8">
    <div
        class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
                <h3 id="bankModalTitle" class="text-lg font-bold">Tambah Pemeriksaan Bank</h3>
                <p class="text-sm text-slate-400">Data wajib terhubung ke Plan Audit.</p>
            </div>

            <button id="closeBankModalButton" type="button"
                class="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Tutup
            </button>
        </div>

        <form id="bankForm" class="space-y-4 px-5 py-5">
            <input type="hidden" id="bankId">

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                    <label class="mb-1 block text-sm font-medium text-slate-300">Plan Audit</label>
                    <select id="planAuditId" required
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                        <option value="">Pilih Plan Audit</option>
                    </select>
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Nama Bank</label>
                    <input id="namaBank" type="text" required placeholder="Contoh: Bank Mandiri"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">No Rekening</label>
                    <input id="noRekening" type="text"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Saldo Buku</label>
                    <input id="saldoBuku" type="number" step="0.01" min="0"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Saldo Bank</label>
                    <input id="saldoBank" type="number" step="0.01" min="0"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Tanggal Periksa</label>
                    <input id="tglPeriksa" type="date"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Auditee</label>
                    <input id="auditee" type="text"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500">
                </div>

                <div class="sm:col-span-2">
                    <label class="mb-1 block text-sm font-medium text-slate-300">Keterangan</label>
                    <textarea id="keterangan" rows="3"
                        class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"></textarea>
                </div>

                <div class="sm:col-span-2">
                    <label class="mb-1 block text-sm font-medium text-slate-300">Detail JSON</label>
                    <textarea id="detailJson" rows="8"
                        class="font-mono w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500"
                        placeholder='{"rekening_koran":[],"buku_besar":[]}'></textarea>
                    <p class="mt-2 text-xs text-slate-500">
                        Field ini disimpan ke kolom detail_json. Format harus JSON valid.
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button type="button" id="cancelBankFormButton"
                    class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">
                    Batal
                </button>

                <button type="submit" id="saveBankButton"
                    class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                    Simpan
                </button>
            </div>
        </form>
    </div>
</div>

<div id="bankDetailModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 px-4 py-8">
    <div
        class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
                <h3 id="bankDetailTitle" class="text-lg font-bold">Detail Pemeriksaan Bank</h3>
                <p id="bankDetailSubtitle" class="text-sm text-slate-400">-</p>
            </div>

            <button id="closeBankDetailButton" type="button"
                class="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Tutup
            </button>
        </div>

        <div class="space-y-5 px-5 py-5">
            <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo Buku</div>
                    <div id="detailSaldoBuku" class="mt-2 text-xl font-bold text-blue-300">Rp0</div>
                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo Bank</div>
                    <div id="detailSaldoBank" class="mt-2 text-xl font-bold text-amber-300">Rp0</div>
                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Selisih</div>
                    <div id="detailSelisih" class="mt-2 text-xl font-bold text-red-300">Rp0</div>
                </div>
            </div>

            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 class="font-bold text-slate-100">Informasi</h4>
                <div id="detailInfo" class="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-3"></div>
            </div>

            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 class="font-bold text-slate-100">Detail JSON</h4>
                <pre id="detailJsonPreview"
                    class="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300"></pre>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/akta-audit-detail-bank.js')
@endpush
