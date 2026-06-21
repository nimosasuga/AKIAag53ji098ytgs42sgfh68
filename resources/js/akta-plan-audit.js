const SESSION_KEY = "akta_session";

let plans = [];
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

function canManagePlans() {
    const role = String(currentUser?.role || "").toLowerCase();
    return ["admin", "manajer", "auditor"].includes(role);
}

function showAlert(message, type = "success") {
    const alert = document.getElementById("planAlert");

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

function statusBadge(status) {
    const map = {
        draft: "bg-slate-500/10 text-slate-300 border-slate-500/20",
        scheduled: "bg-blue-500/10 text-blue-300 border-blue-500/20",
        running: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        done: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        cancelled: "bg-red-500/10 text-red-300 border-red-500/20",
    };

    return map[status] || map.draft;
}

function statusLabel(status) {
    const labels = {
        draft: "Draft",
        scheduled: "Scheduled",
        running: "Running",
        done: "Done",
        cancelled: "Cancelled",
    };

    return labels[status] || "Draft";
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatPlanDate(plan) {
    const start = formatDate(plan.tglMulai);
    const end = formatDate(plan.tglSelesai);

    if (start === "—" && end === "—") {
        return "—";
    }

    if (end === "—") {
        return start;
    }

    return `${start} - ${end}`;
}

function formatTeam(plan) {
    if (Array.isArray(plan.tim)) {
        return plan.tim.length ? plan.tim.join(", ") : "—";
    }

    return plan.tim || "—";
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
    const q = document.getElementById("planSearch")?.value || "";
    const status = document.getElementById("planStatusFilter")?.value || "";

    const params = new URLSearchParams();

    if (q) {
        params.set("q", q);
    }

    if (status) {
        params.set("status", status);
    }

    const url = params.toString()
        ? `/api/plans?${params.toString()}`
        : "/api/plans";
    const payload = await fetchJson(url);

    plans = payload.data || [];
    renderPlanSummary();
    renderPlans();
}

function summaryCard(title, value, caption, tone = "slate") {
    const tones = {
        slate: "border-slate-800 bg-slate-900 text-slate-300",
        blue: "border-blue-500/20 bg-blue-500/10 text-blue-300",
        amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
        emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        red: "border-red-500/20 bg-red-500/10 text-red-300",
    };

    return `
        <div class="rounded-2xl border ${tones[tone] || tones.slate} p-4">
            <div class="text-xs font-bold uppercase tracking-wide opacity-80">${escapeHtml(title)}</div>
            <div class="mt-2 text-3xl font-black text-slate-100">${escapeHtml(value)}</div>
            <div class="mt-1 text-xs text-slate-500">${escapeHtml(caption)}</div>
        </div>
    `;
}

function renderPlanSummary() {
    const grid = document.getElementById("planSummaryGrid");

    if (!grid) {
        return;
    }

    const total = plans.length;
    const draft = plans.filter((plan) => plan.status === "draft").length;
    const scheduled = plans.filter((plan) => plan.status === "scheduled").length;
    const running = plans.filter((plan) => plan.status === "running").length;
    const done = plans.filter((plan) => plan.status === "done").length;
    const cancelled = plans.filter((plan) => plan.status === "cancelled").length;

    grid.innerHTML = [
        summaryCard("Total Plan", total, "Seluruh rencana audit", "slate"),
        summaryCard("Draft", draft, "Belum dijadwalkan final", "blue"),
        summaryCard("Scheduled / Running", scheduled + running, `${scheduled} scheduled · ${running} running`, "amber"),
        summaryCard("Done / Cancelled", done + cancelled, `${done} done · ${cancelled} cancelled`, done >= cancelled ? "emerald" : "red"),
    ].join("");
}

function renderPlans() {
    const tbody = document.getElementById("planTableBody");
    const tableInfo = document.getElementById("planTableInfo");

    if (!tbody) {
        return;
    }

    if (tableInfo) {
        tableInfo.textContent = `${plans.length} plan audit ditampilkan`;
    }

    if (!plans.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-6 text-center text-sm text-slate-400">
                    Belum ada plan audit.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = plans
        .map((plan, index) => {
            const actions = canManagePlans()
                ? `
                    <div class="flex justify-end gap-2">
                        <button type="button" class="edit-plan rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800" data-id="${plan.id}">
                            Edit
                        </button>
                        <button type="button" class="delete-plan rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10" data-id="${plan.id}">
                            Hapus
                        </button>
                    </div>
                `
                : '<span class="text-xs text-slate-500">Read only</span>';

            return `
                <tr class="hover:bg-slate-950/50">
                    <td class="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-400">${index + 1}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-sm font-bold text-slate-100">${escapeHtml(plan.noSpt || "—")}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-300">${escapeHtml(plan.jenisAudit || "—")}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-300">${escapeHtml(formatPlanDate(plan))}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-sm text-slate-300">${escapeHtml(plan.kepalaTim || "—")}</td>
                    <td class="min-w-52 px-4 py-4 text-sm text-slate-400">${escapeHtml(formatTeam(plan))}</td>
                    <td class="min-w-48 px-4 py-4">
                        <div class="text-sm font-semibold text-slate-200">${escapeHtml(plan.cabang || "—")}</div>
                        <div class="text-xs text-slate-500">${escapeHtml(plan.cabangArea || "—")}</div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-4">
                        <span class="inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(plan.status)}">
                            ${escapeHtml(statusLabel(plan.status))}
                        </span>
                    </td>
                    <td class="whitespace-nowrap px-4 py-4 text-right">${actions}</td>
                </tr>
            `;
        })
        .join("");
}

function openModal(plan = null) {
    const modal = document.getElementById("planModal");
    const title = document.getElementById("planModalTitle");
    const form = document.getElementById("planForm");

    if (!modal || !title || !form) {
        return;
    }

    form.reset();

    if (plan) {
        title.textContent = "Edit Plan Audit";

        document.getElementById("planId").value = plan.id;
        document.getElementById("noSpt").value = plan.noSpt || "";
        document.getElementById("jenisAudit").value =
            plan.jenisAudit || "Reguler";
        document.getElementById("cabang").value = plan.cabang || "";
        document.getElementById("cabangArea").value = plan.cabangArea || "";
        document.getElementById("tglMulai").value = plan.tglMulai || "";
        document.getElementById("tglSelesai").value = plan.tglSelesai || "";
        document.getElementById("kepalaTim").value = plan.kepalaTim || "";
        document.getElementById("status").value = plan.status || "draft";
        document.getElementById("tim").value = Array.isArray(plan.tim)
            ? plan.tim.join(", ")
            : plan.tim || "";
        document.getElementById("keterangan").value = plan.keterangan || "";
    } else {
        title.textContent = "Tambah Plan Audit";

        document.getElementById("planId").value = "";
        document.getElementById("jenisAudit").value = "Reguler";
        document.getElementById("status").value = "draft";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    const modal = document.getElementById("planModal");

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function getFormPayload() {
    const tim = document
        .getElementById("tim")
        .value.split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return {
        no_spt: document.getElementById("noSpt").value.trim(),
        jenis_audit: document.getElementById("jenisAudit").value,
        cabang: document.getElementById("cabang").value.trim(),
        cabang_area: document.getElementById("cabangArea").value.trim(),
        tgl_mulai: document.getElementById("tglMulai").value || null,
        tgl_selesai: document.getElementById("tglSelesai").value || null,
        kepala_tim: document.getElementById("kepalaTim").value.trim(),
        tim,
        status: document.getElementById("status").value,
        keterangan: document.getElementById("keterangan").value.trim(),
    };
}

async function savePlan(event) {
    event.preventDefault();

    if (!canManagePlans()) {
        showAlert("Role kamu hanya boleh melihat data.", "error");
        return;
    }

    const id = document.getElementById("planId").value;
    const isEdit = Boolean(id);

    const payload = await fetchJson(
        isEdit ? `/api/plans/${id}` : "/api/plans",
        {
            method: isEdit ? "PUT" : "POST",
            body: JSON.stringify(getFormPayload()),
        },
    );

    closeModal();
    showAlert(payload.message || "Plan audit berhasil disimpan.");
    await loadPlans();
}

async function deletePlan(id) {
    if (!canManagePlans()) {
        showAlert("Role kamu hanya boleh melihat data.", "error");
        return;
    }

    const plan = plans.find((item) => String(item.id) === String(id));

    if (!plan) {
        return;
    }

    const confirmed = confirm(`Hapus plan audit ${plan.noSpt || plan.cabang}?`);

    if (!confirmed) {
        return;
    }

    const payload = await fetchJson(`/api/plans/${id}`, {
        method: "DELETE",
    });

    showAlert(payload.message || "Plan audit berhasil dihapus.");
    await loadPlans();
}

function csvCell(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
}

function exportPlansCsv() {
    if (!plans.length) {
        showAlert("Tidak ada data plan audit untuk diexport.", "error");
        return;
    }

    const headers = [
        "No",
        "No SPT",
        "Jenis Audit",
        "Tgl Plan",
        "Kepala Tim",
        "TIM Audit",
        "Cabang",
        "Cabang Area",
        "Status",
    ];

    const rows = plans.map((plan, index) => [
        index + 1,
        plan.noSpt || "",
        plan.jenisAudit || "",
        formatPlanDate(plan),
        plan.kepalaTim || "",
        formatTeam(plan),
        plan.cabang || "",
        plan.cabangArea || "",
        statusLabel(plan.status),
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map(csvCell).join(","))
        .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `plan-audit-${stamp}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showAlert("Export Excel sederhana berhasil dibuat dalam format CSV.");
}

function exportPlansPrint() {
    if (!plans.length) {
        showAlert("Tidak ada data plan audit untuk dicetak.", "error");
        return;
    }

    const rows = plans
        .map(
            (plan, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(plan.noSpt || "—")}</td>
                    <td>${escapeHtml(plan.jenisAudit || "—")}</td>
                    <td>${escapeHtml(formatPlanDate(plan))}</td>
                    <td>${escapeHtml(plan.kepalaTim || "—")}</td>
                    <td>${escapeHtml(formatTeam(plan))}</td>
                    <td>${escapeHtml(plan.cabang || "—")}</td>
                    <td>${escapeHtml(statusLabel(plan.status))}</td>
                </tr>
            `,
        )
        .join("");

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
        window.print();
        return;
    }

    printWindow.document.write(`
        <!doctype html>
        <html lang="id">
        <head>
            <meta charset="utf-8">
            <title>Plan Audit - AKTA IAT</title>
            <style>
                body { font-family: Arial, sans-serif; color: #111827; margin: 28px; }
                h1 { margin: 0; font-size: 22px; }
                p { margin: 6px 0 18px; color: #4b5563; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
                th { background: #f3f4f6; text-transform: uppercase; font-size: 11px; }
                @media print { body { margin: 12mm; } }
            </style>
        </head>
        <body>
            <h1>Plan Audit</h1>
            <p>Manajemen rencana pelaksanaan audit</p>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>No SPT</th>
                        <th>Jenis Audit</th>
                        <th>Tgl Plan</th>
                        <th>Kepala Tim</th>
                        <th>TIM Audit</th>
                        <th>Cabang</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <script>
                window.onload = function() { window.print(); };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function setupFilters() {
    let timer = null;

    document.getElementById("planSearch")?.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(
            () =>
                loadPlans().catch((error) => showAlert(error.message, "error")),
            300,
        );
    });

    document
        .getElementById("planStatusFilter")
        ?.addEventListener("change", () => {
            loadPlans().catch((error) => showAlert(error.message, "error"));
        });
}

document.addEventListener("DOMContentLoaded", async () => {
    document
        .getElementById("openCreatePlanButton")
        ?.addEventListener("click", () => openModal());
    document
        .getElementById("closePlanModalButton")
        ?.addEventListener("click", closeModal);
    document
        .getElementById("cancelPlanFormButton")
        ?.addEventListener("click", closeModal);
    document
        .getElementById("exportPlansExcelButton")
        ?.addEventListener("click", exportPlansCsv);
    document
        .getElementById("exportPlansPdfButton")
        ?.addEventListener("click", exportPlansPrint);

    document
        .getElementById("planForm")
        ?.addEventListener("submit", async (event) => {
            try {
                await savePlan(event);
            } catch (error) {
                showAlert(
                    error.message || "Gagal menyimpan plan audit.",
                    "error",
                );
            }
        });

    document
        .getElementById("planTableBody")
        ?.addEventListener("click", async (event) => {
            const editButton = event.target.closest(".edit-plan");
            const deleteButton = event.target.closest(".delete-plan");

            if (editButton) {
                const plan = plans.find(
                    (item) => String(item.id) === String(editButton.dataset.id),
                );
                openModal(plan);
                return;
            }

            if (deleteButton) {
                try {
                    await deletePlan(deleteButton.dataset.id);
                } catch (error) {
                    showAlert(
                        error.message || "Gagal menghapus plan audit.",
                        "error",
                    );
                }
            }
        });

    setupFilters();

    try {
        await loadCurrentUser();

        if (!canManagePlans()) {
            document
                .getElementById("openCreatePlanButton")
                ?.classList.add("hidden");
        }

        await loadPlans();
    } catch (error) {
        showAlert(error.message || "Gagal memuat plan audit.", "error");
    }
});
