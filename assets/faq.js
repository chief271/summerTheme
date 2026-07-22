document.addEventListener('DOMContentLoaded', function () {
    const initFaq = () => {
        document.querySelectorAll('.faq-section').forEach(section => {
            const allowMultiple = section.getAttribute('data-allow-multiple') === 'true';
            const openFirst = section.getAttribute('data-open-first') === 'true';
            const questions = section.querySelectorAll('.faq__question');

            questions.forEach((question, index) => {
                // Open first item if set
                if (openFirst && index === 0) {
                    const answer = section.querySelector('#' + question.getAttribute('aria-controls'));
                    question.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }

                question.addEventListener('click', () => {
                    const isOpen = question.getAttribute('aria-expanded') === 'true';
                    const answer = section.querySelector('#' + question.getAttribute('aria-controls'));

                    // Close others if multiple not allowed
                    if (!allowMultiple && !isOpen) {
                        questions.forEach(otherQ => {
                            if (otherQ !== question) {
                                otherQ.setAttribute('aria-expanded', 'false');
                                const otherA = section.querySelector('#' + otherQ.getAttribute('aria-controls'));
                                otherA.style.maxHeight = null;
                            }
                        });
                    }

                    // Toggle current
                    if (!isOpen) {
                        question.setAttribute('aria-expanded', 'true');
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    } else {
                        question.setAttribute('aria-expanded', 'false');
                        answer.style.maxHeight = null;
                    }
                });
            });
        });
    };

    initFaq();

    // Support for Shopify Theme Editor
    document.addEventListener('shopify:section:load', initFaq);
});