class ShopLookModal extends HTMLElement {
  constructor() {
    super();
    this.modal = this.querySelector("[data-modal]");
    this.closeBtn = this.querySelector("[data-modal-close]");
    this.content = this.querySelector("[data-modal-content]");

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.hide());
    }

    this.addEventListener("click", (e) => {
      if (e.target === this.modal) this.hide();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.classList.contains("is-open")) {
        this.hide();
      }
    });
  }

  show(productData) {
    if (!productData) return;
    this.render(productData);
    this.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  hide() {
    this.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  formatMoney(cents) {
    if (typeof cents === "string") return cents;
    return (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency: window.Shopify?.currency?.active || "USD"
    });
  }

  render(product) {
    const variants = product.variants || [];
    const initialVariant = variants.find((v) => v.available) || variants[0] || {};
    const hasMultipleVariants = variants.length > 1;

    let optionsHTML = "";

    if (hasMultipleVariants) {
      // Get option names (e.g. ["Size", "Color"]) or fallback gracefully
      const optionNames = product.options || ["Size", "Color", "Style"];

      const optionPositions = [1, 2, 3].filter(
        (pos) => initialVariant[`option${pos}`] !== undefined && initialVariant[`option${pos}`] !== null
      );

      optionsHTML = optionPositions
        .map((pos) => {
          const optionName = optionNames[pos - 1] || `Option ${pos}`;
          const values = [...new Set(variants.map((v) => v[`option${pos}`]))].filter(Boolean);
          const currentVal = initialVariant[`option${pos}`];

          const swatches = values
            .map((val) => {
              const isSelected = val === currentVal;
              return `
                <button 
                  type="button" 
                  class="modal-swatch ${isSelected ? "is-selected" : ""}" 
                  data-option-index="${pos}" 
                  data-value="${val}"
                >
                  ${val}
                </button>
              `;
            })
            .join("");

          return `
            <div class="quick-look-modal__option-group" data-option-group="${pos}">
              <span class="quick-look-modal__label">${optionName}: <strong data-selected-val-${pos}>${currentVal}</strong></span>
              <div class="quick-look-modal__swatches">
                ${swatches}
              </div>
            </div>
          `;
        })
        .join("");
    }

    this.content.innerHTML = `
      <div class="quick-look-modal__product">
        <div class="quick-look-modal__media">
          <img src="${initialVariant.featured_image?.src || product.image}" alt="${product.title}" data-modal-image>
        </div>
        <div class="quick-look-modal__details">
          <h3>${product.title}</h3>
          <div class="quick-look-modal__price" data-modal-price>${this.formatMoney(initialVariant.price || product.price)}</div>
          
          <form data-quick-add-form>
            <input type="hidden" name="id" value="${initialVariant.id || product.id}" data-variant-input>
            
            <div class="quick-look-modal__options-wrapper">
              ${optionsHTML}
            </div>
            
            <button type="submit" class="button button--full-width modal-submit-btn" ${!initialVariant.available ? "disabled" : ""}>
              <span>${initialVariant.available ? "Add to Cart" : "Sold Out"}</span>
            </button>
          </form>
          
          <div data-form-message class="quick-look-modal__message"></div>
        </div>
      </div>
    `;

    this.bindForm(product);
  }

  bindForm(product) {
    const form = this.content.querySelector("[data-quick-add-form]");
    const swatches = this.content.querySelectorAll(".modal-swatch");
    const variantInput = this.content.querySelector("[data-variant-input]");
    const priceDisplay = this.content.querySelector("[data-modal-price]");
    const imageDisplay = this.content.querySelector("[data-modal-image]");
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageContainer = this.content.querySelector("[data-form-message]");
    const variants = product.variants || [];

    const updateSelectedVariant = () => {
      const selectedOptions = {};

      [1, 2, 3].forEach((pos) => {
        const activeSwatch = this.content.querySelector(`.modal-swatch[data-option-index="${pos}"].is-selected`);
        if (activeSwatch) {
          selectedOptions[`option${pos}`] = activeSwatch.dataset.value;
          
          // Update label text next to option title
          const labelVal = this.content.querySelector(`[data-selected-val-${pos}]`);
          if (labelVal) labelVal.textContent = activeSwatch.dataset.value;
        }
      });

      const matchedVariant = variants.find((v) => {
        return Object.keys(selectedOptions).every((key) => v[key] === selectedOptions[key]);
      });

      if (matchedVariant) {
        variantInput.value = matchedVariant.id;
        priceDisplay.textContent = this.formatMoney(matchedVariant.price);

        if (matchedVariant.featured_image?.src) {
          imageDisplay.src = matchedVariant.featured_image.src;
        }

        if (matchedVariant.available) {
          submitBtn.removeAttribute("disabled");
          submitBtn.querySelector("span").textContent = "Add to Cart";
        } else {
          submitBtn.setAttribute("disabled", "true");
          submitBtn.querySelector("span").textContent = "Sold Out";
        }
      } else {
        submitBtn.setAttribute("disabled", "true");
        submitBtn.querySelector("span").textContent = "Unavailable";
      }
    };

    // Handle Swatch Clicks
    swatches.forEach((swatch) => {
      swatch.addEventListener("click", (e) => {
        const optionPos = swatch.dataset.optionIndex;
        
        // Deselect others in same option group
        this.content
          .querySelectorAll(`.modal-swatch[data-option-index="${optionPos}"]`)
          .forEach((s) => s.classList.remove("is-selected"));

        swatch.classList.add("is-selected");
        updateSelectedVariant();
      });
    });

    // Form submit to cart
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.setAttribute("disabled", "true");
      messageContainer.textContent = "";

      try {
        const formData = new FormData(form);
        formData.append("sections", "cart-drawer,cart-icon-bubble");
        formData.append("sections_url", window.location.pathname);

        const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: "POST",
          headers: { "X-Requested-With": "XMLHttpRequest" },
          body: formData,
        });

        if (response.ok) {
          const responseData = await response.json();

          messageContainer.textContent = "Added to cart!";
          messageContainer.style.color = "#2e7d32";

          const cartDrawer = document.querySelector("cart-drawer");
          if (cartDrawer && typeof cartDrawer.renderContents === "function") {
            cartDrawer.renderContents(responseData);
          } else if (cartDrawer) {
            cartDrawer.classList.add("animate", "active");
          }

          setTimeout(() => this.hide(), 1200);
        } else {
          const errData = await response.json();
          throw new Error(errData.description || "Could not add to cart.");
        }
      } catch (err) {
        messageContainer.textContent = err.message;
        messageContainer.style.color = "#d32f2f";
      } finally {
        submitBtn.removeAttribute("disabled");
      }
    });
  }
}

if (!customElements.get("shop-look-modal")) {
  customElements.define("shop-look-modal", ShopLookModal);
}