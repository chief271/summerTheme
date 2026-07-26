

class StickyAddToCart {

    constructor() {

        this.stickyBar = document.querySelector(
            '[data-sticky-add-to-cart]'
        );

        this.originalButton = document.querySelector(
            '[name="add"]'
        );

        if (!this.stickyBar || !this.originalButton) return;

        this.init();

    }

    init() {

        const observer = new IntersectionObserver(
            ([entry]) => {

                if (entry.isIntersecting) {
                    this.stickyBar.classList.remove('is-visible');
                } else {
                    this.stickyBar.classList.add('is-visible');
                }

            },
            {
                threshold: 0
            }
        );

        observer.observe(this.originalButton);

    }

}

new StickyAddToCart();

document.addEventListener('click', (event) => {

    const stickyButton = event.target.closest(
        '[data-sticky-add]'
    );

    if (!stickyButton) return;

    const originalButton = document.querySelector(
        '[name="add"]'
    );

    if (!originalButton) return;

    originalButton.click();

});