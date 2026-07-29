class ShopTheLook {
  constructor(section) {
    this.section = section;
    this.slides = [...section.querySelectorAll("[data-look-slide]")];
    this.card = section.querySelector("[data-look-card]");
    this.prevButton = section.querySelector(".look-slider__button--prev");
    this.nextButton = section.querySelector(".look-slider__button--next");

    this.currentSlide = 0;
    this.currentProduct = 0;

    if (this.slides.length > 0) {
      this.init();
    }
  }

  init() {
    this.showSlide(0);
    this.bindDots();
    this.bindSliderButtons();
    this.bindQuickAdd();
  }

  bindDots() {
    this.slides.forEach((slide) => {
      slide.querySelectorAll("[data-dot]").forEach((dot, index) => {
        dot.addEventListener("click", () => {
          this.currentProduct = index;
          slide.querySelectorAll("[data-dot]").forEach((d) => d.classList.remove("is-active"));
          dot.classList.add("is-active");
          this.renderProduct();
        });
      });
    });
  }

  bindSliderButtons() {
    if (this.prevButton) {
      this.prevButton.addEventListener("click", () => this.showSlide(this.currentSlide - 1));
    }
    if (this.nextButton) {
      this.nextButton.addEventListener("click", () => this.showSlide(this.currentSlide + 1));
    }
  }

  bindQuickAdd() {
    if (!this.card) return;

    const quickAddBtn = this.card.querySelector("[data-add-cart-quick]");
    if (!quickAddBtn) return;

    quickAddBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = this.getCurrentProduct();
      const modal = document.querySelector("shop-look-modal");

      if (modal && product) {
        modal.show(product);
      }
    });
  }

  showSlide(index) {
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    this.currentSlide = index;
    this.currentProduct = 0;

    this.slides.forEach((slide) => slide.classList.remove("is-active"));
    this.slides[index].classList.add("is-active");

    this.slides.forEach((slide) => {
      slide.querySelectorAll("[data-dot]").forEach((dot) => dot.classList.remove("is-active"));
    });

    const firstDot = this.slides[index].querySelector("[data-dot]");
    if (firstDot) firstDot.classList.add("is-active");

    this.renderProduct();
  }

  getCurrentProduct() {
    const json = this.slides[this.currentSlide]?.querySelector(".look-slide-data");
    if (!json) return null;

    try {
      const data = JSON.parse(json.textContent);
      return data.products ? data.products[this.currentProduct] : null;
    } catch (e) {
      console.error("Error parsing product JSON:", e);
      return null;
    }
  }

  renderProduct() {
    if (!this.card) return;

    const product = this.getCurrentProduct();
    if (!product) {
      this.card.style.display = "none";
      return;
    }

    this.card.style.display = "";

    this.card.classList.remove("is-updating");
    void this.card.offsetWidth; 
    this.card.classList.add("is-updating");

    const image = this.card.querySelector("[data-product-image]");
    if (image) {
      image.src = product.image || "";
      image.alt = product.title || "";
    }

    const title = this.card.querySelector("[data-product-title]");
    if (title) {
      title.textContent = product.title || "";
      title.href = product.url || "#";
    }

    const price = this.card.querySelector("[data-product-price]");
    if (price) {
      price.innerHTML = product.price || "";
    }
  }
}

document.querySelectorAll(".shop-look").forEach((section) => {
  new ShopTheLook(section);
});