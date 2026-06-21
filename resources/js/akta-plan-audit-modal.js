const MODAL_CLOSE_DELAY = 180;

let modalSubmitLocked = false;
let restoreBodyOverflow = "";
let closeTimer = null;

function qs(id) {
    return document.getElementById(id);
}

function isModalOpen() {
    const modal = qs("planModal");
    return Boolean(modal && !modal.classList.contains("hidden"));
}

function setSaveState(isSaving) {
    const button = qs("savePlanButton");
    const idleText = qs("savePlanButtonText");
    const loadingText = qs("savePlanButtonLoading");

    modalSubmitLocked = isSaving;

    if (!button) {
        return;
    }

    button.disabled = isSaving;
    idleText?.classList.toggle("hidden", isSaving);
    loadingText?.classList.toggle("hidden", !isSaving);
}

function showModalError(message) {
    const alert = qs("planFormAlert");

    if (!alert || !message) {
        return;
    }

    alert.textContent = message;
    alert.classList.remove("hidden");
    alert.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setSaveState(false);
}

function hideModalError() {
    const alert = qs("planFormAlert");

    if (!alert) {
        return;
    }

    alert.textContent = "";
    alert.classList.add("hidden");
}

function animateModalOpen() {
    const modal = qs("planModal");
    const panel = qs("planModalPanel");

    if (!modal || !panel || modal.classList.contains("hidden")) {
        return;
    }

    clearTimeout(closeTimer);
    restoreBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    hideModalError();
    setSaveState(false);

    requestAnimationFrame(() => {
        modal.classList.remove("opacity-0");
        modal.classList.add("opacity-100");
        panel.classList.remove("translate-y-3", "scale-[0.98]", "opacity-0");
        panel.classList.add("translate-y-0", "scale-100", "opacity-100");
    });
}

function animateModalClose() {
    const modal = qs("planModal");
    const panel = qs("planModalPanel");

    if (!modal || !panel || modal.classList.contains("hidden")) {
        return;
    }

    clearTimeout(closeTimer);
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    panel.classList.remove("translate-y-0", "scale-100", "opacity-100");
    panel.classList.add("translate-y-3", "scale-[0.98]", "opacity-0");

    closeTimer = window.setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = restoreBodyOverflow;
        setSaveState(false);
        hideModalError();
    }, MODAL_CLOSE_DELAY);
}

function mirrorPageErrorToModal() {
    const pageAlert = qs("planAlert");

    if (!pageAlert || !isModalOpen()) {
        return;
    }

    const isError = pageAlert.classList.contains("text-red-200") ||
        pageAlert.classList.contains("bg-red-500/10");

    if (isError && pageAlert.textContent.trim()) {
        showModalError(pageAlert.textContent.trim());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = qs("planModal");
    const form = qs("planForm");
    const pageAlert = qs("planAlert");

    if (!modal || !form) {
        return;
    }

    new MutationObserver(() => {
        if (isModalOpen()) {
            animateModalOpen();
        } else {
            document.body.style.overflow = restoreBodyOverflow;
            setSaveState(false);
        }
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });

    if (pageAlert) {
        new MutationObserver(mirrorPageErrorToModal).observe(pageAlert, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        });
    }

    form.addEventListener("submit", (event) => {
        if (modalSubmitLocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }

        hideModalError();
        setSaveState(true);
    }, true);

    ["closePlanModalButton", "cancelPlanFormButton"].forEach((id) => {
        qs(id)?.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            animateModalClose();
        }, true);
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            event.preventDefault();
            event.stopImmediatePropagation();
            animateModalClose();
        }
    }, true);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isModalOpen() && !modalSubmitLocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            animateModalClose();
        }
    }, true);
});
