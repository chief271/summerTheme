class QuickView {

    constructor() {

        this.modal =
            document.querySelector(
                '[data-quick-view-modal]'
            );

        if (!this.modal) return;


        this.image =
            this.modal.querySelector(
                '[data-quick-view-image]'
            );

        this.title =
            this.modal.querySelector(
                '[data-quick-view-title]'
            );

        this.price =
            this.modal.querySelector(
                '[data-quick-view-price]'
            );

        this.description =
            this.modal.querySelector(
                '[data-quick-view-description]'
            );

        this.options =
            this.modal.querySelector(
                '[data-quick-view-options]'
            );

        this.productLink =
            this.modal.querySelector(
                '[data-quick-view-link]'
            );

        this.closeButtons =
            this.modal.querySelectorAll(
                '[data-quick-view-close]'
            );


        this.product = null;

        this.selectedOptions = [];

        this.quantity = 1;


        this.init();

    }


    init() {

        /*
        OPEN QUICK VIEW
        */

        document.addEventListener(
            'click',
            async (event) => {

                const button =
                    event.target.closest(
                        '[data-quick-view]'
                    );

                if (!button) return;

                event.preventDefault();

                const handle =
                    button.dataset.productHandle;

                await this.open(handle);

            }
        );


        /*
        CLOSE MODAL
        */

        this.closeButtons.forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => this.close()
                );

            }
        );


        document.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Escape'
                ) {

                    this.close();

                }

            }
        );


        /*
        OPTION SELECTION
        */

        this.options.addEventListener(
            'click',
            event => {

                const button =
                    event.target.closest(
                        '[data-option-index]'
                    );

                if (!button) return;

                this.selectOption(button);

            }
        );

    }


    /*
    ========================================
    OPEN
    ========================================
    */

    async open(handle) {

        try {

            const response =
                await fetch(
                    `/products/${handle}.js`
                );

            this.product =
                await response.json();


            this.selectedOptions =
                new Array(
                    this.product.options.length
                );


            this.quantity = 1;


            this.renderProduct();


            this.modal.classList.add(
                'is-open'
            );


            document.body.classList.add(
                'quick-view-open'
            );


        } catch (error) {

            console.error(
                'Quick View error:',
                error
            );

        }

    }


    /*
    ========================================
    RENDER PRODUCT
    ========================================
    */

    renderProduct() {

        this.image.src =
            this.product.featured_image;

        this.image.alt =
            this.product.title;


        this.title.textContent =
            this.product.title;


        this.price.textContent =
            this.formatMoney(
                this.product.price
            );


        this.description.innerHTML =
            this.product.description;


        this.productLink.href =
            `/products/${this.product.handle}`;


        this.renderOptions();

    }


    /*
    ========================================
    RENDER VARIANTS
    ========================================
    */

    renderOptions() {

        this.options.innerHTML =
            '';


        this.product.options.forEach(
            (option, optionIndex) => {


                const wrapper =
                    document.createElement(
                        'div'
                    );

                wrapper.className =
                    'quick-view-option';


                const heading =
                    document.createElement(
                        'h3'
                    );

                heading.textContent =
                    option.name;


                const values =
                    document.createElement(
                        'div'
                    );

                values.className =
                    'quick-view-option__values';


                option.values.forEach(
                    value => {

                        const button =
                            document.createElement(
                                'button'
                            );


                        button.type =
                            'button';


                        button.textContent =
                            value;


                        button.className =
                            'quick-view-option__value';


                        button.dataset.optionIndex =
                            optionIndex;


                        button.dataset.optionValue =
                            value;


                        const available =
                            this.product.variants.some(
                                variant => {

                                    return (
                                        variant.available &&
                                        variant.options[
                                        optionIndex
                                        ] === value
                                    );

                                }
                            );


                        if (!available) {

                            button.disabled =
                                true;

                        }


                        values.appendChild(
                            button
                        );

                    }
                );


                wrapper.appendChild(
                    heading
                );


                wrapper.appendChild(
                    values
                );


                this.options.appendChild(
                    wrapper
                );

            }
        );

    }


    /*
    ========================================
    SELECT OPTION
    ========================================
    */

    selectOption(button) {

        const optionIndex =
            Number(
                button.dataset.optionIndex
            );


        const value =
            button.dataset.optionValue;


        this.selectedOptions[
            optionIndex
        ] = value;


        const group =
            button.closest(
                '.quick-view-option'
            );


        group
            .querySelectorAll(
                '.quick-view-option__value'
            )
            .forEach(
                optionButton => {

                    optionButton.classList.remove(
                        'is-selected'
                    );

                }
            );


        button.classList.add(
            'is-selected'
        );


        this.updateAvailableOptions();

    }


    /*
    ========================================
    UPDATE AVAILABLE OPTIONS
    ========================================
    */

    updateAvailableOptions() {

        this.options
            .querySelectorAll(
                '[data-option-index]'
            )
            .forEach(button => {


                const optionIndex =
                    Number(
                        button.dataset.optionIndex
                    );


                const value =
                    button.dataset.optionValue;


                const testSelections =
                    [
                        ...this.selectedOptions
                    ];


                testSelections[
                    optionIndex
                ] = value;


                const available =
                    this.product.variants.some(
                        variant => {


                            if (
                                !variant.available
                            ) {

                                return false;

                            }


                            return variant.options.every(
                                (
                                    variantOption,
                                    index
                                ) => {


                                    const selected =
                                        testSelections[
                                        index
                                        ];


                                    if (
                                        selected ===
                                        undefined
                                    ) {

                                        return true;

                                    }


                                    return (
                                        variantOption ===
                                        selected
                                    );

                                }
                            );

                        }
                    );


                button.disabled =
                    !available;

            });

    }


    /*
    ========================================
    CLOSE
    ========================================
    */

    close() {

        this.modal.classList.remove(
            'is-open'
        );


        document.body.classList.remove(
            'quick-view-open'
        );

    }


    /*
    ========================================
    MONEY
    ========================================
    */

    formatMoney(cents) {

        return new Intl.NumberFormat(
            'en-US',
            {

                style: 'currency',

                currency: 'USD'

            }
        ).format(
            cents / 100
        );

    }

}


document.addEventListener(
    'DOMContentLoaded',
    () => {

        new QuickView();

    }
);