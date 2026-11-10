var bootEl = document.getElementById('boot');
if (bootEl) bootEl.textContent = 'v1.0.3 debug.js ok';
window.onerror = function (msg, src, line) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:24px;left:0;right:0;z-index:99;background:#b71c1c;color:#fff;font-size:11px;padding:4px;word-wrap:break-word';
    d.textContent = msg + ' @' + line;
    document.body.appendChild(d);
};
