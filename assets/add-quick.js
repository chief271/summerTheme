
class QuickAdd {

    constructor() {

        this.modal = document.querySelector(
            '[data-quick-add-modal]'
        );

        if (!this.modal) return;

        this.closeButtons =
            this.modal.querySelectorAll(
                '[data-quick-add-close]'
            );

        this.image =
            this.modal.querySelector(
                '[data-quick-add-image]'
            );

        this.title =
            this.modal.querySelector(
                '[data-quick-add-title]'
            );

        this.price =
            this.modal.querySelector(
                '[data-quick-add-price]'
            );

        this.optionsContainer =
            this.modal.querySelector(
                '[data-quick-add-options]'
            );

        this.submitButton =
            this.modal.querySelector(
                '[data-quick-add-submit]'
            );

        this.product = null;

        // Example:
        // ["Black", "M"]
        this.selectedOptions = [];

        this.init();

    }


    init() {

        /*
        ------------------------------------------------
        OPEN QUICK ADD
        ------------------------------------------------
        */

        document.addEventListener(
            'click',
            async (event) => {

                const button =
                    event.target.closest(
                        '[data-quick-add]'
                    );

                if (!button) return;

                event.preventDefault();

                const handle =
                    button.dataset.productHandle;

                await this.open(handle);

            }
        );


        /*
        ------------------------------------------------
        CLOSE MODAL
        ------------------------------------------------
        */

        this.closeButtons.forEach(button => {

            button.addEventListener(
                'click',
                () => this.close()
            );

        });


        document.addEventListener(
            'keydown',
            (event) => {

                if (
                    event.key === 'Escape' &&
                    this.modal.classList.contains(
                        'is-open'
                    )
                ) {

                    this.close();

                }

            }
        );


        /*
        ------------------------------------------------
        OPTION SELECTION
        ------------------------------------------------
        */

        this.optionsContainer.addEventListener(
            'click',
            (event) => {

                const optionButton =
                    event.target.closest(
                        '[data-option-index]'
                    );

                if (!optionButton) return;

                this.selectOption(
                    optionButton
                );

            }
        );


        /*
        ------------------------------------------------
        ADD TO CART
        ------------------------------------------------
        */

        this.submitButton.addEventListener(
            'click',
            () => this.addToCart()
        );

    }


    /*
    ====================================================
    OPEN MODAL
    ====================================================
    */

    async open(handle) {

        try {

            const response =
                await fetch(
                    `/products/${handle}.js`
                );

            this.product =
                await response.json();


            /*
            Reset previous selections
            */

            this.selectedOptions =
                new Array(
                    this.product.options.length
                );


            this.renderProduct();


            this.modal.classList.add(
                'is-open'
            );


            document.body.classList.add(
                'quick-add-open'
            );

        } catch (error) {

            console.error(
                'Could not load product:',
                error
            );

        }

    }


    /*
    ====================================================
    RENDER PRODUCT
    ====================================================
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


        this.renderOptions();

    }


    /*
    ====================================================
    RENDER OPTIONS
    ====================================================
    */

    renderOptions() {

        this.optionsContainer.innerHTML =
            '';


        /*
        Example product:
 
        Color:
        Black
        White
 
        Size:
        S
        M
        L
        */


        this.product.options.forEach(
            (option, optionIndex) => {


                const optionWrapper =
                    document.createElement(
                        'div'
                    );


                optionWrapper.className =
                    'quick-add-option';


                const heading =
                    document.createElement(
                        'h3'
                    );


                heading.textContent =
                    option.name;


                const valuesContainer =
                    document.createElement(
                        'div'
                    );


                valuesContainer.className =
                    'quick-add-option__values';


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
                            'quick-add-option__value';


                        button.dataset.optionIndex =
                            optionIndex;


                        button.dataset.optionValue =
                            value;


                        /*
                        Disable options that do not
                        belong to any available variant
                        */


                        const isAvailable =
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


                        if (!isAvailable) {

                            button.disabled =
                                true;

                        }


                        valuesContainer.appendChild(
                            button
                        );

                    }
                );


                optionWrapper.appendChild(
                    heading
                );


                optionWrapper.appendChild(
                    valuesContainer
                );


                this.optionsContainer.appendChild(
                    optionWrapper
                );

            }
        );

    }


    /*
    ====================================================
    SELECT OPTION
    ====================================================
    */

    selectOption(button) {

        const optionIndex =
            Number(
                button.dataset.optionIndex
            );


        const value =
            button.dataset.optionValue;


        /*
        Save selection
 
        Example:
 
        selectedOptions = [
            "Black",
            "M"
        ]
        */


        this.selectedOptions[
            optionIndex
        ] = value;


        /*
        Remove selected state from
        other buttons in same option
        */


        const optionGroup =
            button.closest(
                '.quick-add-option'
            );


        optionGroup
            .querySelectorAll(
                '.quick-add-option__value'
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


        /*
        Update which combinations
        are still available
        */


        this.updateAvailableOptions();


        /*
        Check if an exact variant
        now exists
        */


        const variant =
            this.getSelectedVariant();


        if (variant) {

            this.submitButton.disabled =
                false;

            this.submitButton.textContent =
                'Add to cart';

        } else {

            this.submitButton.disabled =
                false;

            this.submitButton.textContent =
                'Select all options';

        }

    }


    /*
    ====================================================
    FIND EXACT VARIANT
    ====================================================
    */

    getSelectedVariant() {

        /*
        If the customer has not selected
        every option, no variant exists yet
        */


        if (
            this.selectedOptions.includes(
                undefined
            )
        ) {

            return null;

        }


        return this.product.variants.find(
            variant => {


                /*
                Compare every selected option
 
                Example:
 
                Variant:
                ["Black", "M"]
 
                Selected:
                ["Black", "M"]
 
                */


                return variant.options.every(
                    (
                        optionValue,
                        index
                    ) => {

                        return (
                            optionValue ===
                            this.selectedOptions[
                            index
                            ]
                        );

                    }
                ) && variant.available;

            }
        );

    }


    /*
    ====================================================
    UPDATE AVAILABLE OPTIONS
    ====================================================
    */

    updateAvailableOptions() {

        const buttons =
            this.optionsContainer
                .querySelectorAll(
                    '[data-option-index]'
                );


        buttons.forEach(button => {

            const optionIndex =
                Number(
                    button.dataset.optionIndex
                );


            const value =
                button.dataset.optionValue;


            /*
            Temporarily remove the option
            we are testing from the selection
            */


            const testSelections = [
                ...this.selectedOptions
            ];


            testSelections[
                optionIndex
            ] = value;


            /*
            Find a variant compatible with
            all current selections
            */


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


                                /*
                                No selection yet
                                */

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


            /*
            Keep selected button visually selected
            */

            if (
                this.selectedOptions[
                optionIndex
                ] === value
            ) {

                button.classList.add(
                    'is-selected'
                );

            }

        });

    }


    /*
    ====================================================
    ADD EXACT VARIANT TO CART
    ====================================================
    */

    async addToCart() {

        const variant =
            this.getSelectedVariant();


        /*
        No exact variant selected
        */

        if (!variant) {

            this.submitButton.textContent =
                'Select a variant';

            return;

        }


        this.submitButton.disabled =
            true;


        this.submitButton.textContent =
            'Adding...';


        try {


            const response =
                await fetch(
                    '/cart/add.js',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'Accept':
                                'application/json'

                        },

                        body: JSON.stringify({

                            items: [

                                {

                                    /*
                                    THIS IS THE IMPORTANT PART
 
                                    This is the exact
                                    selected variant ID
                                    */

                                    id: variant.id,

                                    quantity: 1

                                }

                            ]

                        })

                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    'Could not add product'
                );

            }


            /*
            Close modal
            */

            this.close();


            /*
            Refresh Dawn cart drawer
            */

            const cartDrawer =
                document.querySelector(
                    'cart-drawer'
                );


            if (
                cartDrawer
            ) {

                const response =
                    await fetch(
                        `${window.Shopify.routes.root}?sections=cart-drawer,cart-icon-bubble`
                    );


                const sections =
                    await response.json();


                cartDrawer.renderContents({

                    sections:
                        sections

                });

            }


        } catch (error) {

            console.error(
                error
            );


            this.submitButton.textContent =
                'Error';

        }


        this.submitButton.disabled =
            false;


        this.submitButton.textContent =
            'Add to cart';

    }


    /*
    ====================================================
    CLOSE
    ====================================================
    */

    close() {

        this.modal.classList.remove(
            'is-open'
        );


        document.body.classList.remove(
            'quick-add-open'
        );

    }


    /*
    ====================================================
    MONEY
    ====================================================
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

        new QuickAdd();

    }
);