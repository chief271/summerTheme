document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".countdown-section").forEach(section => {

        const endDate = new Date(section.dataset.endDate).getTime();

        if (isNaN(endDate)) return;

        const days = section.querySelector("[data-days]");
        const hours = section.querySelector("[data-hours]");
        const minutes = section.querySelector("[data-minutes]");
        const seconds = section.querySelector("[data-seconds]");

        const timer = section.querySelector(".countdown-timer");
        const expired = section.querySelector("[data-expired-message]");

        const hideSection = section.dataset.hide === "true";

        function pad(value) {
            return String(value).padStart(2, "0");
        }

        function updateCountdown() {

            const now = Date.now();

            const distance = endDate - now;

            if (distance <= 0) {

                clearInterval(interval);

                if (hideSection) {
                    section.style.display = "none";
                } else {

                    timer.style.display = "none";

                    if (expired) {
                        expired.classList.remove("hidden");
                    }

                }

                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));

            const h = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );

            const m = Math.floor(
                (distance % (1000 * 60 * 60)) /
                (1000 * 60)
            );

            const s = Math.floor(
                (distance % (1000 * 60)) /
                1000
            );

            days.textContent = pad(d);
            hours.textContent = pad(h);
            minutes.textContent = pad(m);
            seconds.textContent = pad(s);

        }

        updateCountdown();

        const interval = setInterval(updateCountdown, 1000);

    });

});