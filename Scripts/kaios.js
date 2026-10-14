(function () {
    'use strict';

    var bootEl = document.getElementById('boot');
    if (bootEl) bootEl.textContent = 'v2.1.2 kaios.js started';

    var API_BASE = 'https://cobolt-1-xmcq.gaur-alnilam.ts.net';
    var MAX_POSTS = 20;

    var token = null;
    var username = null;
    var view = 'auth';
    var menuOpen = false;
    var shownPosts = MAX_POSTS;
    var allPosts = [];

    function $(id) { return document.getElementById(id); }

    function saveSession() {
        try {
            localStorage.setItem('kb_token', token);
            localStorage.setItem('kb_user', username);
        } catch (e) {}
    }
    function clearSession() {
        try {
            localStorage.removeItem('kb_token');
            localStorage.removeItem('kb_user');
        } catch (e) {}
    }
    function loadSession() {
        try {
            token = localStorage.getItem('kb_token');
            username = localStorage.getItem('kb_user');
        } catch (e) {}
    }

    function request(method, path, body, cb) {
        var xhr;
        try { xhr = new XMLHttpRequest({ mozSystem: true }); }
        catch (e) { xhr = new XMLHttpRequest(); }

        xhr.open(method, API_BASE + path, true);
        xhr.timeout = 20000;
        if (body) xhr.setRequestHeader('Content-Type', 'application/json');
        if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.onload = function () {
            var data = null;
            try { data = JSON.parse(xhr.responseText); } catch (e) {}
            cb(xhr.status >= 200 && xhr.status < 300 ? null : { status: xhr.status, error: data && data.error }, data);
        };
        xhr.onerror = function () { cb({ status: 0, error: 'No connection' }, null); };
        xhr.ontimeout = function () { cb({ status: 0, error: 'Timed out' }, null); };
        xhr.send(body ? JSON.stringify(body) : null);
    }

    var SOFTKEYS = {
        auth:    { l: 'Sign Up', c: 'Select', r: 'Sign In' },
        posts:   { l: 'New',     c: '',       r: 'Options' },
        compose: { l: 'Cancel',  c: '',       r: 'Post' }
    };

    function setSoftkeys(l, c, r) {
        $('sk-left').textContent = l;
        $('sk-center').textContent = c;
        $('sk-right').textContent = r;
    }

    function navItems() {
        var root = menuOpen ? $('menu') : $('view-' + view);
        var all = root.querySelectorAll('.nav');
        return Array.prototype.slice.call(all);
    }

    function keepVisible(el) {
        var box = $('content');
        var top = el.offsetTop - box.offsetTop;
        var bottom = top + el.offsetHeight;
        if (top < box.scrollTop) box.scrollTop = Math.max(0, top - 6);
        else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 6;
    }

    function focusEl(el) {
        if (!el) return;
        el.focus();
        keepVisible(el);
    }

    function move(delta) {
        var items = navItems();
        if (!items.length) return;
        var i = items.indexOf(document.activeElement);
        if (i === -1) i = delta > 0 ? -1 : items.length;
        i = Math.max(0, Math.min(items.length - 1, i + delta));
        focusEl(items[i]);
    }

    function show(name) {
        view = name;
        var views = document.querySelectorAll('.view');
        for (var i = 0; i < views.length; i++) {
            views[i].className = 'view' + (views[i].id === 'view-' + name ? ' active' : '');
        }
        var sk = SOFTKEYS[name];
        setSoftkeys(sk.l, sk.c, sk.r);
        $('content').scrollTop = 0;
        $('who').textContent = username && name !== 'auth' ? '@' + username : '';
        var items = navItems();
        focusEl(items[0]);
    }

    function say(id, text, ok) {
        var el = $(id);
        el.textContent = text;
        el.className = 'msg' + (ok ? ' ok' : '');
    }

    function toggleMenu(open) {
        menuOpen = open;
        $('menu').className = open ? 'open' : '';
        if (open) {
            setSoftkeys('', 'Select', 'Close');
            focusEl(navItems()[0]);
        } else {
            var sk = SOFTKEYS[view];
            setSoftkeys(sk.l, sk.c, sk.r);
            focusEl(navItems()[0]);
        }
    }

    function credentials() {
        return { username: $('username').value, password: $('password').value };
    }

    function signIn() {
        var c = credentials();
        if (!c.username || !c.password) { say('auth-message', 'Enter username and password.'); return; }
        say('auth-message', 'Signing in...', true);
        request('POST', '/api/login', c, function (err, data) {
            if (err) { say('auth-message', err.error || 'Sign in failed.'); return; }
            token = data.token;
            username = data.username;
            saveSession();
            $('password').value = '';
            say('auth-message', '');
            show('posts');
            loadPosts();
        });
    }

    function signUp() {
        var c = credentials();
        if (!c.username || !c.password) { say('auth-message', 'Enter username and password.'); return; }
        say('auth-message', 'Creating account...', true);
        request('POST', '/api/register', c, function (err) {
            if (err) { say('auth-message', err.error || 'Sign up failed.'); return; }
            say('auth-message', 'Account created. Press Sign In.', true);
        });
    }

    function signOut() {
        if (token) request('POST', '/api/logout', null, function () {});
        token = null;
        username = null;
        allPosts = [];
        clearSession();
        toggleMenu(false);
        $('post-list').innerHTML = '';
        show('auth');
    }

    function formatDate(s) {
        var d = new Date(s);
        if (isNaN(d.getTime())) return '';
        var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
        var mm = d.getMinutes();
        return m + ' ' + d.getDate() + ', ' + d.getHours() + ':' + (mm < 10 ? '0' : '') + mm;
    }

    function renderPosts() {
        var list = $('post-list');
        list.innerHTML = '';
        var n = Math.min(allPosts.length, shownPosts);
        for (var i = 0; i < n; i++) {
            var p = allPosts[i];
            var div = document.createElement('div');
            div.className = 'post nav';
            div.tabIndex = 0;
            var by = document.createElement('span');
            by.className = 'by';
            by.textContent = p.username || 'Anonymous';
            var when = document.createElement('span');
            when.className = 'when';
            when.textContent = ' ' + formatDate(p.created_at);
            var text = document.createElement('div');
            text.className = 'text';
            text.textContent = p.body;
            div.appendChild(by);
            div.appendChild(when);
            div.appendChild(text);
            list.appendChild(div);
        }
        if (allPosts.length > n) {
            var more = document.createElement('a');
            more.className = 'item nav';
            more.tabIndex = 0;
            more.setAttribute('data-action', 'more');
            more.textContent = 'Show more';
            list.appendChild(more);
        }
        if (!allPosts.length) {
            list.innerHTML = '<p class="small">No posts yet.</p>';
        }
    }

    function loadPosts() {
        say('posts-message', 'Loading...', true);
        request('GET', '/api/posts', null, function (err, data) {
            if (err) {
                if (err.status === 401) { signOut(); say('auth-message', 'Session expired. Sign in again.'); return; }
                say('posts-message', err.error || 'Could not load posts.');
                return;
            }
            say('posts-message', '');
            allPosts = data || [];
            shownPosts = MAX_POSTS;
            renderPosts();
        });
    }

    function sendPost() {
        var content = $('post-content').value.replace(/^\s+|\s+$/g, '');
        if (!content) { say('compose-message', 'Write something first.'); return; }
        say('compose-message', 'Posting...', true);
        request('POST', '/api/posts', { title: content.slice(0, 50), body: content }, function (err) {
            if (err) {
                if (err.status === 401) { signOut(); say('auth-message', 'Session expired. Sign in again.'); return; }
                say('compose-message', err.error || 'Post failed.');
                return;
            }
            $('post-content').value = '';
            say('compose-message', '');
            show('posts');
            loadPosts();
        });
    }

    function isTextField(el) {
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
    }

    function activate(el) {
        if (!el) return;
        var act = el.getAttribute('data-action');
        if (act === 'signin') signIn();
        else if (act === 'signup') signUp();
        else if (act === 'post') sendPost();
        else if (act === 'new') { show('compose'); focusEl($('post-content')); }
        else if (act === 'more') { shownPosts += MAX_POSTS; renderPosts(); }
        else if (act === 'refresh') { toggleMenu(false); loadPosts(); }
        else if (act === 'signout') signOut();
        else if (act === 'close') toggleMenu(false);
        else if (el.tagName === 'A' && el.getAttribute('href')) location.href = el.getAttribute('href');
    }

    function onLeft() {
        if (menuOpen) return;
        if (view === 'auth') signUp();
        else if (view === 'posts') { show('compose'); focusEl($('post-content')); }
        else if (view === 'compose') { say('compose-message', ''); show('posts'); }
    }

    function onRight() {
        if (menuOpen) { toggleMenu(false); return; }
        if (view === 'auth') signIn();
        else if (view === 'posts') toggleMenu(true);
        else if (view === 'compose') sendPost();
    }

    function onBack(e) {
        var el = document.activeElement;
        if (isTextField(el) && el.value.length) return;
        e.preventDefault();
        if (menuOpen) toggleMenu(false);
        else if (view === 'compose') { say('compose-message', ''); show('posts'); }
        else window.close();
    }

    document.addEventListener('keydown', function (e) {
        var el = document.activeElement;
        switch (e.key) {
            case 'SoftLeft':  e.preventDefault(); onLeft(); break;
            case 'SoftRight': e.preventDefault(); onRight(); break;
            case 'Backspace':
            case 'BrowserBack': onBack(e); break;
            case 'ArrowUp':
                if (el && el.tagName === 'TEXTAREA' && el.selectionStart > 0) return;
                e.preventDefault(); move(-1); break;
            case 'ArrowDown':
                if (el && el.tagName === 'TEXTAREA' && el.selectionEnd < el.value.length) return;
                e.preventDefault(); move(1); break;
            case 'Enter':
                if (el && el.tagName === 'TEXTAREA') return;
                if (el && el.tagName === 'INPUT') {
                    e.preventDefault();
                    if (el.id === 'password') signIn(); else move(1);
                    return;
                }
                e.preventDefault();
                activate(el);
                break;
        }
    });

    document.addEventListener('click', function (e) {
        var t = e.target;
        while (t && t !== document && !t.getAttribute('data-action') && !(t.tagName === 'A' && t.getAttribute('href'))) t = t.parentNode;
        if (t && t !== document) { e.preventDefault(); activate(t); }
    });
    $('sk-left').addEventListener('click', onLeft);
    $('sk-right').addEventListener('click', onRight);

    loadSession();
    if (token) { show('posts'); loadPosts(); }
    else show('auth');
    if (bootEl && bootEl.parentNode) bootEl.parentNode.removeChild(bootEl);
})();
