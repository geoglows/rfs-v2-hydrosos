export function setupAccordion() {

    const headers =
        document.querySelectorAll(".accordion-header");

    headers.forEach(header => {

        if (header.dataset.initialized) return;
        header.dataset.initialized = "true";

        header.addEventListener("click", () => {

            const item = header.parentElement;

            // Toggle this section instead of closing all others
            item.classList.toggle("active");

            // Chart.js resizes itself when the container becomes visible,
            // so nothing else to do here.

        });

    });

}
