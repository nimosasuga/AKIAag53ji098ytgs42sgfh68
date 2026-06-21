document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("planModal");

    if (!modal) {
        return;
    }

    const releaseScrollWhenClosed = () => {
        window.setTimeout(() => {
            if (modal.classList.contains("hidden")) {
                document.body.style.overflow = "";
                modal.setAttribute("aria-hidden", "true");
            } else {
                modal.setAttribute("aria-hidden", "false");
            }
        }, 220);
    };

    new MutationObserver(releaseScrollWhenClosed).observe(modal, {
        attributes: true,
        attributeFilter: ["class"],
    });
});
