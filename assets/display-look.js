class DisplayLook {
    constructor(root) {
        this.root = root;
        this.track = root; // .display_look itself is the scroll track
        this.containers = Array.from(root.querySelectorAll('.display_container'));

        if (!this.containers.length) return;

        this.buildDots();
        this.bindScroll();
    }

    buildDots() {
        this.containers.forEach((container, index) => {
            const dots = container.querySelector('.navigation-bolts');
            if (!dots) return;

            dots.innerHTML = '';

            this.containers.forEach((_, dotIndex) => {
                const bolt = document.createElement('button');
                bolt.type = 'button';
                bolt.className = 'bolt';
                bolt.setAttribute('aria-label', `Go to look ${dotIndex + 1}`);
                if (dotIndex === index) bolt.classList.add('is-active');

                bolt.addEventListener('click', () => {
                    this.containers[dotIndex].scrollIntoView({
                        behavior: 'smooth',
                        inline: 'start',
                        block: 'nearest',
                    });
                });

                dots.appendChild(bolt);
            });
        });
    }

    bindScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const activeIndex = this.containers.indexOf(entry.target);
                    this.updateActiveDot(activeIndex);
                });
            },
            { root: this.root, threshold: 0.6 }
        );

        this.containers.forEach((container) => observer.observe(container));
    }

    updateActiveDot(activeIndex) {
        this.containers.forEach((container) => {
            const bolts = container.querySelectorAll('.navigation-bolts .bolt');
            bolts.forEach((bolt, i) => {
                bolt.classList.toggle('is-active', i === activeIndex);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.display_look').forEach((el) => new DisplayLook(el));
});