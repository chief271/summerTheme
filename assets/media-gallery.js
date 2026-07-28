if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();

        this.viewer = this.querySelector('[id^="GalleryViewer"]');
        this.liveRegion = this.querySelector('[id^="GalleryStatus"]');
        this.dots = this.querySelector('.gallery-dots');

        this.mediaItems = [...this.querySelectorAll('.product__media-item')];
        this.dotItems = this.dots
          ? [...this.dots.querySelectorAll('.gallery-dot')]
          : [];

        this.currentIndex = this.mediaItems.findIndex((item) =>
          item.classList.contains('is-active')
        );

        if (this.currentIndex === -1) this.currentIndex = 0;

        this.autoplayDelay = 4000;
        this.swipeThreshold = 50;
        this.touchStartX = 0;

        this.bindEvents();
        this.updateGallery();
      }

      connectedCallback() {
        this.startAutoplay();
      }

      disconnectedCallback() {
        this.stopAutoplay();
      }

      bindEvents() {
        this.dotItems.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            this.currentIndex = index;
            this.updateGallery();
            this.startAutoplay();
          });
        });

        if (this.viewer) {
          this.viewer.addEventListener(
            'touchstart',
            (e) => {
              this.touchStartX = e.touches[0].clientX;
              this.stopAutoplay();
            },
            { passive: true }
          );

          this.viewer.addEventListener(
            'touchend',
            (e) => {
              const diff = e.changedTouches[0].clientX - this.touchStartX;

              if (diff > this.swipeThreshold) {
                this.previous();
              } else if (diff < -this.swipeThreshold) {
                this.next();
              }

              this.startAutoplay();
            },
            { passive: true }
          );

          this.viewer.addEventListener('mouseenter', () => this.stopAutoplay());

          this.viewer.addEventListener('mouseleave', () =>
            this.startAutoplay()
          );
        }
      }

      next() {
        this.currentIndex =
          (this.currentIndex + 1) % this.mediaItems.length;

        this.updateGallery();
      }

      previous() {
        this.currentIndex =
          (this.currentIndex - 1 + this.mediaItems.length) %
          this.mediaItems.length;

        this.updateGallery();
      }

      updateGallery() {
        this.mediaItems.forEach((item, index) => {
          item.classList.toggle('is-active', index === this.currentIndex);
        });

        this.dotItems.forEach((dot, index) => {
          dot.classList.toggle('is-active', index === this.currentIndex);
        });

        this.playActiveMedia();
        this.announceLiveRegion();
      }

      playActiveMedia() {
        if (window.pauseAllMedia) {
          window.pauseAllMedia();
        }

        const activeItem = this.mediaItems[this.currentIndex];

        if (!activeItem) return;

        const deferredMedia = activeItem.querySelector('.deferred-media');

        if (deferredMedia) {
          deferredMedia.loadContent(false);
        }
      }

      announceLiveRegion() {
        if (!this.liveRegion) return;

        this.liveRegion.setAttribute('aria-hidden', false);

        this.liveRegion.textContent = `Image ${
          this.currentIndex + 1
        } of ${this.mediaItems.length}`;

        clearTimeout(this.liveRegionTimer);

        this.liveRegionTimer = setTimeout(() => {
          this.liveRegion.setAttribute('aria-hidden', true);
        }, 1500);
      }

      startAutoplay() {
        this.stopAutoplay();

        if (this.mediaItems.length <= 1) return;

        this.timer = setInterval(() => {
          this.next();
        }, this.autoplayDelay);
      }

      stopAutoplay() {
        clearInterval(this.timer);
      }
    }
  );
}