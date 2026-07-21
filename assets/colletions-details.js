document.addEventListener('DOMContentLoaded', function () {

    var roots = document.querySelectorAll('[data-section-id]');

    roots.forEach(function (root) {

        var tabs = Array.prototype.slice.call(
            root.querySelectorAll('.lookbook__tab')
        );

        var panels = root.querySelectorAll('.lookbook__panel');

        var indicator = root.querySelector(
            '.lookbook__nav-indicator'
        );

        function moveIndicator(tab) {

            if (!indicator) return;

            var offset =
                tab.offsetLeft - tabs[0].offsetLeft;

            indicator.style.transform =
                'translateX(' + offset + 'px)';

            indicator.style.width =
                tab.offsetWidth + 'px';
        }

        tabs.forEach(function (tab) {

            tab.addEventListener('click', function () {

                var targetId =
                    tab.getAttribute('data-target');

                tabs.forEach(function (t) {

                    var isActive = t === tab;

                    t.classList.toggle(
                        'is-active',
                        isActive
                    );

                    t.setAttribute(
                        'aria-pressed',
                        isActive ? 'true' : 'false'
                    );
                });

                panels.forEach(function (panel) {

                    var isActive =
                        panel.id === targetId;

                    panel.classList.toggle(
                        'is-active',
                        isActive
                    );

                    panel.setAttribute(
                        'aria-hidden',
                        isActive ? 'false' : 'true'
                    );
                });

                moveIndicator(tab);
            });
        });

        if (tabs.length) {
            moveIndicator(tabs[0]);
        }

        window.addEventListener('resize', function () {

            var active =
                root.querySelector(
                    '.lookbook__tab.is-active'
                );

            if (active) {
                moveIndicator(active);
            }
        });

    });

});