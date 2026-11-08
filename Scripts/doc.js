/* Back key + D-pad scrolling for the static pages (conduct, guidelines, 404) on KaiOS. */
(function () {
    'use strict';

    var box = document.getElementById('content');
    if (!box) return;

    var skLeft = document.getElementById('sk-left');
    var skCenter = document.getElementById('sk-center');
    var skRight = document.getElementById('sk-right');

    function items() {
        return Array.prototype.slice.call(document.querySelectorAll('.nav'));
    }

    function visible(el) {
        var top = el.offsetTop;
        var bottom = top + el.offsetHeight;
        return top >= box.scrollTop && bottom <= box.scrollTop + box.clientHeight;
    }

    function keepVisible(el) {
        var top = el.offsetTop;
        var bottom = top + el.offsetHeight;
        if (top < box.scrollTop) box.scrollTop = Math.max(0, top - 6);
        else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 6;
    }

    function goBack() {
        if (history.length > 1) history.back();
        else location.href = 'index.html';
    }

    function step(dir) {
        var list = items();
        var i = list.indexOf(document.activeElement);
        var next = list[i + dir];
        if (i === -1) next = dir > 0 ? list[0] : list[list.length - 1];

        if (next && visible(next)) {
            next.focus();
            keepVisible(next);
            return;
        }
        box.scrollTop += dir * 40;
        if (document.activeElement && document.activeElement !== document.body && !visible(document.activeElement)) {
            document.activeElement.blur();
        }
    }

    function open(el) {
        if (el && el.tagName === 'A' && el.getAttribute('href')) location.href = el.getAttribute('href');
    }

    if (skLeft) skLeft.textContent = 'Back';
    if (skCenter) skCenter.textContent = items().length ? 'Select' : '';

    var first = items()[0];
    if (first && visible(first)) first.focus();

    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); step(1); break;
            case 'ArrowUp':   e.preventDefault(); step(-1); break;
            case 'Enter':     e.preventDefault(); open(document.activeElement); break;
            case 'Backspace':
            case 'SoftLeft':
            case 'BrowserBack':
                e.preventDefault();
                goBack();
                break;
        }
    });

    if (skLeft) skLeft.addEventListener('click', goBack);
})();
