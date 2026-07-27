(() => {

    const STORAGE_KEY = 'recentlyViewed';

    const MAX_STORE = 12;


    /*
    ========================================
    CURRENT PRODUCT
    ========================================
    */

    const currentProduct = {

        id: {{ product.id }
}
    },

title: { { product.title | json } },

price: { { product.price } },

url: { { product.url | json } },

image:
{ { product.featured_image | image_url: width: 600 | json } }

    };


/*
========================================
SAVE PRODUCT
========================================
*/

let storedProducts =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        ) || '[]'
    );


/*
Remove the product if it already exists
*/

storedProducts =
    storedProducts.filter(
        product => {

            return product.id !==
                currentProduct.id;

        }
    );


/*
Put current product first
*/

storedProducts.unshift(
    currentProduct
);


/*
Save only the latest 12 products
*/

localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(
        storedProducts.slice(
            0,
            MAX_STORE
        )
    )

);


/*
========================================
RENDER PRODUCTS
========================================
*/

function renderRecentlyViewed() {

    const section =
        document.querySelector(
            '#recently-viewed'
        );


    const grid =
        document.querySelector(
            '#recently-viewed-grid'
        );


    if (!section || !grid) return;


    const limit =
        parseInt(
            section.dataset.limit
        ) || 4;


    const currentId =
        parseInt(
            section.dataset.current
        );


    const products =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            ) || '[]'
        );


    const productsToShow =
        products
            .filter(
                product => {

                    return product.id !==
                        currentId;

                }
            )
            .slice(
                0,
                limit
            );


    /*
    Hide section if there
    are no products
    */

    if (
        productsToShow.length === 0
    ) {

        section.style.display =
            'none';

        return;

    }


    /*
    Create cards
    */

    productsToShow.forEach(
        product => {


            const card =
                document.createElement(
                    'div'
                );


            card.className =
                'recently-viewed__card';


            card.innerHTML = `

            <a
              href="${product.url}"
              class="recently-viewed__image-wrapper" 
            >

              <img
                src="${product.image}"
                alt="${product.title}"
                class="recently-viewed__image"
                loading="lazy"
              >

            </a>


            <div
              class="recently-viewed__info"
            >

              <p
                class="recently-viewed__product-title"
              >
                ${product.title}
              </p>


              <p
                class="recently-viewed__price"
              >
                ${formatMoney(product.price)}
              </p>

            </div>

          `;


            grid.appendChild(
                card
            );

        }
    );

}


/*
========================================
MONEY
========================================
*/

function formatMoney(
    cents
) {

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


/*
========================================
INIT
========================================
*/

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        renderRecentlyViewed
    );

} else {

    renderRecentlyViewed();

}

  }) ();