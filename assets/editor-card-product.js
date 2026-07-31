class PremiumProductCard {

    constructor(card) {

        this.card = card;

        this.chooseButton = card.querySelector('.premium-card__choose-options');

        this.bindEvents();

    }

    bindEvents() {

        if (!this.chooseButton) return;

        this.chooseButton.addEventListener('click', () => {

            document.dispatchEvent(
                new CustomEvent('premium:product:open', {
                    detail: {
                        handle: this.chooseButton.dataset.productHandle
                    }
                })
            );

        });

    }

}

document.addEventListener('DOMContentLoaded', () => {

    document
        .querySelectorAll('.premium-card')
        .forEach(card => new PremiumProductCard(card));

});