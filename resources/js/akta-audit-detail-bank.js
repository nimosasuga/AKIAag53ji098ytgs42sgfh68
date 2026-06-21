const SESSION_KEY = "akta_session";

let bankItems = [];
let plans = [];
let bankSummary = {};
let currentUser = null;

function getSession() {
    try {
        const rawSession = sessionStorage.getItem(SESSION_KEY);
        return rawSession ? JSON.parse(rawSession) : null;
    } catch {
        return null;
    }
}

function authHeaders() {
    const session = getSession();

    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `${session?.tokenType || "Bearer"} ${session?.token}`,
    };
}

function canManageBank() {
    return ["admin", "manajer", "auditor"].includes(currentUser?.role);
}

function normalizeListPayload(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    return payload.data || [];
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...authHeaders(),
            ...(options.headers || {}),
        },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const firstError = payload.errors
            ? Object.values(payload.errors).flat()[0]
            : null;

        throw new Error(firstError || payload.message || "Request gagal.");
    }

    return payload;
}

async function loadCurrentUser() {
    const payload = await fetchJson("/api/auth/me");
    currentUser = payload.user;
}

async function loadPlans() {
    const payload = await fetchJson("/api/plans");

    plans = normalizeListPayload(payload);

    fillPlanSelect("planAuditId", "Pilih Plan Audit");
    fillPlanSelect("bankPlanFilter", "Semua Plan Audit");
}

async function loadBankSummary() {
    const planAuditId = document.getElementById("bankPlanFilter")?.value || "";

    const params = new URLSearchParams();

    if (planAuditId) {
        params.set("plan_audit_id", planAuditId);
    }

    const url = params.toString()
        ? `/api/audit-detail/bank/summary?${params.toString()}`
        : "/api/audit-detail/bank/summary";

    const payload = await fetchJson(url);

    bankSummary = payload.data || {};

    renderSummary();
}

async function loadBankItems() {
    const q = document.getElementById("bankSearch")?.value || "";
    const hasSelisih =
        document.getElementById("bankSelisihFilter")?.value || "";
    const planAuditId = document.getElementById("bankPlanFilter")?.value || "";

    const params = new URLSearchParams();

    if (q) {
        params.set("q", q);
    }

    if (hasSelisih) {
        params.set("has_selisih", hasSelisih);
    }

    if (planAuditId) {
        params.set("plan_audit_id", planAuditId);
    }

    const url = params.toString()
        ? `/api/audit-detail/bank?${params.toString()}`
        : "/api/audit-detail/bank";

    const payload = await fetchJson(url);

    bankItems = normalizeListPayload(payload);

    renderBankItems();
}

function fillPlanSelect(elementId, firstLabel) {
    const select = document.getElementById(elementId);

    if (!select) {
        return;
    }

    select.innerHTML = `<option value="">${firstLabel}</option>`;

    plans.forEach((plan) => {
        const option = document.createElement("option");

        option.value = plan.id;
        option.textContent = planLabel(plan);

        select.appendChild(option);
    });
}

function planLabel(plan) {
    const noSpt = plan.noSpt || plan.no_spt || "-";
    const cabang = plan.cabang || plan.unitUsaha || plan.unit_usaha || "-";
    const status = plan.status || "-";

    return `#${plan.id} • ${noSpt} • ${cabang} • ${status}`;
}

function renderSummary() {
    setText("bankTotalRekeningStat", bankSummary.total_rekening || 0);
    setText(
        "bankSaldoBukuStat",
        formatRupiah(bankSummary.total_saldo_buku || 0),
    );
    setText(
        "bankSaldoBankStat",
        formatRupiah(bankSummary.total_saldo_bank || 0),
    );
    setText(
        "bankTotalSelisihStat",
        formatRupiah(bankSummary.total_selisih || 0),
    );
    setText("bankRekeningSelisihStat", bankSummary.rekening_selisih || 0);
}

function renderBankItems() {
    const tbody = document.getElementById("bankTableBody");

    if (!tbody) {
        return;
    }

    if (!bankItems.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-6 text-center text-sm text-slate-400">
                    Belum ada pemeriksaan bank.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = bankItems
        .map((item) => {
            const plan = item.plan_audit || item.planAudit || {};
            const selisihValue = Number(item.selisih || 0);
            const selisihClass =
                selisihValue === 0 ? "text-emerald-300" : "text-red-300";

            const actions = canManageBank()
                ? `
                    <button type="button" class="view-bank rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800" data-id="${item.id}">
                        Detail
                    </button>

                    <button type="button" class="edit-bank ml-2 rounded-lg border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/10" data-id="${item.id}">
                        Edit
                    </button>

                    <button type="button" class="delete-bank ml-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10" data-id="${item.id}">
                        Hapus
                    </button>
                `
                : `
                    <button type="button" class="view-bank rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800" data-id="${item.id}">
                        Detail
                    </button>
                `;

            return `
                <tr class="hover:bg-slate-950/50">
                    <td class="px-4 py-4">
                        <div class="font-semibold text-slate-100">${escapeHtml(item.nama_bank || "-")}</div>
                        <div class="text-xs text-slate-500">
                            Rekening: ${escapeHtml(item.no_rekening || "-")}
                        </div>
                        <div class="text-xs text-slate-500">
                            Tgl Periksa: ${escapeHtml(formatDate(item.tgl_periksa))}
                        </div>
                    </td>

                    <td class="px-4 py-4 text-sm text-slate-300">
                        <div>${escapeHtml(item.no_spt || plan.noSpt || plan.no_spt || "-")}</div>
                        <div class="text-xs text-slate-500">${escapeHtml(item.cabang || plan.cabang || "-")}</div>
                    </td>

                    <td class="px-4 py-4 text-right text-sm font-semibold text-blue-300">
                        ${escapeHtml(formatRupiah(item.saldo_buku || 0))}
                    </td>

                    <td class="px-4 py-4 text-right text-sm font-semibold text-amber-300">
                        ${escapeHtml(formatRupiah(item.saldo_bank || 0))}
                    </td>

                    <td class="px-4 py-4 text-right text-sm font-bold ${selisihClass}">
                        ${escapeHtml(formatRupiah(item.selisih || 0))}
                    </td>

                    <td class="px-4 py-4 text-sm text-slate-300">
                        <div>${escapeHtml(item.auditee || "-")}</div>
                        <div class="mt-1 max-w-sm text-xs text-slate-500 line-clamp-2">
                            ${escapeHtml(item.keterangan || "-")}
                        </div>
                    </td>

                    <td class="px-4 py-4 text-right">
                        ${actions}
                    </td>
                </tr>
            `;
        })
        .join("");
}

function openModal(item = null) {
    const modal = document.getElementById("bankModal");
    const title = document.getElementById("bankModalTitle");

    document.getElementById("bankForm").reset();

    if (item) {
        title.textContent = "Edit Pemeriksaan Bank";

        document.getElementById("bankId").value = item.id;
        document.getElementById("planAuditId").value = item.plan_audit_id || "";
        document.getElementById("namaBank").value = item.nama_bank || "";
        document.getElementById("noRekening").value = item.no_rekening || "";
        document.getElementById("saldoBuku").value = item.saldo_buku || 0;
        document.getElementById("saldoBank").value = item.saldo_bank || 0;
        document.getElementById("tglPeriksa").value = onlyDate(
            item.tgl_periksa,
        );
        document.getElementById("auditee").value = item.auditee || "";
        document.getElementById("keterangan").value = item.keterangan || "";
        document.getElementById("detailJson").value = item.detail_json
            ? JSON.stringify(item.detail_json, null, 2)
            : "";
    } else {
        title.textContent = "Tambah Pemeriksaan Bank";

        document.getElementById("bankId").value = "";
        document.getElementById("saldoBuku").value = 0;
        document.getElementById("saldoBank").value = 0;
        document.getElementById("detailJson").value = JSON.stringify(
            {
                rekening_koran: [],
                buku_besar: [],
            },
            null,
            2,
        );
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    const modal = document.getElementById("bankModal");

    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function openDetail(item) {
    if (!item) {
        showAlert("Data pemeriksaan bank tidak ditemukan.", "error");
        return;
    }

    setText("bankDetailTitle", item.nama_bank || "Detail Pemeriksaan Bank");
    setText(
        "bankDetailSubtitle",
        `${item.no_rekening || "-"} • ${item.no_spt || "-"} • ${item.cabang || "-"}`,
    );

    setText("detailSaldoBuku", formatRupiah(item.saldo_buku || 0));
    setText("detailSaldoBank", formatRupiah(item.saldo_bank || 0));
    setText("detailSelisih", formatRupiah(item.selisih || 0));

    const info = document.getElementById("detailInfo");

    if (info) {
        info.innerHTML = `
            ${infoItem("Plan Audit ID", item.plan_audit_id)}
            ${infoItem("No SPT", item.no_spt)}
            ${infoItem("Cabang", item.cabang)}
            ${infoItem("Jenis Audit", item.jenis_audit)}
            ${infoItem("Nama Bank", item.nama_bank)}
            ${infoItem("No Rekening", item.no_rekening)}
            ${infoItem("Tanggal Periksa", formatDate(item.tgl_periksa))}
            ${infoItem("Auditee", item.auditee)}
            ${infoItem("Created By", item.created_by)}
            ${infoItem("Updated By", item.updated_by)}
            ${infoItem("Created At", formatDateTime(item.created_at))}
            ${infoItem("Updated At", formatDateTime(item.updated_at))}
            ${infoItem("Keterangan", item.keterangan)}
        `;
    }

    const preview = document.getElementById("detailJsonPreview");

    if (preview) {
        preview.textContent = item.detail_json
            ? JSON.stringify(item.detail_json, null, 2)
            : "{}";
    }

    const modal = document.getElementById("bankDetailModal");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeDetail() {
    const modal = document.getElementById("bankDetailModal");

    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function getFormPayload() {
    const planAuditId = document.getElementById("planAuditId").value;
    const rawDetailJson = document.getElementById("detailJson").value.trim();

    let detailJson = null;

    if (rawDetailJson) {
        try {
            detailJson = JSON.parse(rawDetailJson);
        } catch {
            throw new Error("Detail JSON tidak valid.");
        }
    }

    return {
        plan_audit_id: planAuditId ? Number(planAuditId) : null,
        nama_bank: document.getElementById("namaBank").value.trim(),
        no_rekening: emptyToNull(document.getElementById("noRekening").value),
        saldo_buku: Number(document.getElementById("saldoBuku").value || 0),
        saldo_bank: Number(document.getElementById("saldoBank").value || 0),
        tgl_periksa: emptyToNull(document.getElementById("tglPeriksa").value),
        auditee: emptyToNull(document.getElementById("auditee").value),
        keterangan: emptyToNull(document.getElementById("keterangan").value),
        detail_json: detailJson,
    };
}

async function saveBank(event) {
    event.preventDefault();

    if (!canManageBank()) {
        showAlert("Role kamu hanya boleh melihat data.", "error");
        return;
    }

    const id = document.getElementById("bankId").value;
    const isEdit = Boolean(id);

    const payload = await fetchJson(
        isEdit ? `/api/audit-detail/bank/${id}` : "/api/audit-detail/bank",
        {
            method: isEdit ? "PUT" : "POST",
            body: JSON.stringify(getFormPayload()),
        },
    );

    closeModal();
    showAlert(payload.message || "Pemeriksaan bank berhasil disimpan.");
    await reloadBankData();
}

async function deleteBank(id) {
    const item = bankItems.find((row) => String(row.id) === String(id));

    if (!item) {
        return;
    }

    const confirmed = confirm(`Hapus pemeriksaan bank "${item.nama_bank}"?`);

    if (!confirmed) {
        return;
    }

    const payload = await fetchJson(`/api/audit-detail/bank/${id}`, {
        method: "DELETE",
    });

    showAlert(payload.message || "Pemeriksaan bank berhasil dihapus.");
    await reloadBankData();
}

async function reloadBankData() {
    await loadBankSummary();
    await loadBankItems();
}

function setupFilters() {
    let timer = null;

    document.getElementById("bankSearch")?.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(
            () =>
                loadBankItems().catch((error) =>
                    showAlert(error.message, "error"),
                ),
            300,
        );
    });

    document
        .getElementById("bankSelisihFilter")
        ?.addEventListener("change", () => {
            loadBankItems().catch((error) => showAlert(error.message, "error"));
        });

    document
        .getElementById("bankPlanFilter")
        ?.addEventListener("change", () => {
            reloadBankData().catch((error) =>
                showAlert(error.message, "error"),
            );
        });
}

function setupTableActions() {
    document
        .getElementById("bankTableBody")
        ?.addEventListener("click", async (event) => {
            const viewButton = event.target.closest(".view-bank");
            const editButton = event.target.closest(".edit-bank");
            const deleteButton = event.target.closest(".delete-bank");

            if (viewButton) {
                const item = bankItems.find(
                    (row) => String(row.id) === String(viewButton.dataset.id),
                );
                openDetail(item);
                return;
            }

            if (editButton) {
                const item = bankItems.find(
                    (row) => String(row.id) === String(editButton.dataset.id),
                );
                openModal(item);
                return;
            }

            if (deleteButton) {
                try {
                    await deleteBank(deleteButton.dataset.id);
                } catch (error) {
                    showAlert(
                        error.message || "Gagal menghapus pemeriksaan bank.",
                        "error",
                    );
                }
            }
        });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "-";
    }
}

function infoItem(label, value) {
    return `
        <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">${escapeHtml(label)}</div>
            <div class="mt-1 break-words text-sm font-semibold text-slate-200">${escapeHtml(value || "-")}</div>
        </div>
    `;
}

function emptyToNull(value) {
    const clean = String(value || "").trim();

    return clean === "" ? null : clean;
}

function onlyDate(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 10);
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return String(value).slice(0, 10);
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    return String(value).replace("T", " ").slice(0, 19);
}

function formatRupiah(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(number);
}

function showAlert(message, type = "success") {
    const alert = document.getElementById("bankAlert");

    if (!alert) {
        return;
    }

    alert.textContent = message;
    alert.classList.remove(
        "hidden",
        "border-emerald-500/30",
        "bg-emerald-500/10",
        "text-emerald-200",
        "border-red-500/30",
        "bg-red-500/10",
        "text-red-200",
    );

    if (type === "error") {
        alert.classList.add(
            "border-red-500/30",
            "bg-red-500/10",
            "text-red-200",
        );
    } else {
        alert.classList.add(
            "border-emerald-500/30",
            "bg-emerald-500/10",
            "text-emerald-200",
        );
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", async () => {
    document
        .getElementById("openCreateBankButton")
        ?.addEventListener("click", () => openModal());

    document
        .getElementById("closeBankModalButton")
        ?.addEventListener("click", closeModal);

    document
        .getElementById("cancelBankFormButton")
        ?.addEventListener("click", closeModal);

    document
        .getElementById("closeBankDetailButton")
        ?.addEventListener("click", closeDetail);

    document
        .getElementById("bankForm")
        ?.addEventListener("submit", async (event) => {
            try {
                await saveBank(event);
            } catch (error) {
                showAlert(
                    error.message || "Gagal menyimpan pemeriksaan bank.",
                    "error",
                );
            }
        });

    setupFilters();
    setupTableActions();

    try {
        await loadCurrentUser();

        if (!canManageBank()) {
            document
                .getElementById("openCreateBankButton")
                ?.classList.add("hidden");
        }

        await loadPlans();
        await reloadBankData();
    } catch (error) {
        showAlert(error.message || "Gagal memuat pemeriksaan bank.", "error");
    }
});
