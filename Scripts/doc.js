(function () {
    'use strict';
    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowDown': window.scrollBy(0, 40); e.preventDefault(); break;
            case 'ArrowUp':   window.scrollBy(0, -40); e.preventDefault(); break;
            case 'Backspace':
            case 'SoftLeft':
                e.preventDefault();
                if (history.length > 1) history.back(); else location.href = 'index.html';
                break;
        }
    });
})();
