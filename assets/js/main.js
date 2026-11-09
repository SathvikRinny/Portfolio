const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mobile menu ---------- */
const menuButton = document.querySelector('.menu-button');
const nav = document.getElementById('site-nav');

function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('open', open);
}

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        menuButton.focus();
    }
});

/* ---------- Current section in nav ---------- */
const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
sections.unshift(document.getElementById('top')); // no link is current while the hero is in view

if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(a => {
                const match = a.getAttribute('href') === `#${entry.target.id}`;
                if (match) a.setAttribute('aria-current', 'true');
                else a.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => sectionObserver.observe(s));
}

/* ---------- Projector screen ---------- */
const screen = document.getElementById('screen');
const slides = Array.from(screen.querySelectorAll('.slide'));
const blankNote = screen.querySelector('.screen-blank');
const slideNum = document.getElementById('slide-num');
const blankKey = document.querySelector('[data-action="blank"]');
const prevKey = document.querySelector('.console [data-action="prev"]');
const nextKey = document.querySelector('.console [data-action="next"]');
const onAir = document.querySelector('.on-air');
const onAirText = onAir.querySelector('.on-air-text');
let current = 0;
let blank = false;
let autoplay = null;

function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
        const live = i === current;
        slide.hidden = !live;
        slide.classList.toggle('is-live', live);
    });
    slideNum.textContent = String(current + 1);
    prevKey.disabled = current === 0;
    nextKey.disabled = current === slides.length - 1;
    if (blank) setBlank(false);
}

function setBlank(on) {
    blank = on;
    screen.classList.toggle('is-blank', on);
    blankNote.hidden = !on;
    blankKey.setAttribute('aria-pressed', String(on));
    onAir.classList.toggle('screen-off', on);
    onAirText.textContent = on ? 'Blank' : 'Live';
}

function stopAutoplay() {
    clearInterval(autoplay);
    autoplay = null;
}

function act(action) {
    stopAutoplay();
    if (action === 'next') show(current + 1);
    if (action === 'prev') show(current - 1);
    if (action === 'blank') setBlank(!blank);
}

document.querySelectorAll('.console [data-action]').forEach(button => {
    button.addEventListener('click', () => act(button.dataset.action));
});

// Arrow keys and B work anywhere on the page, except while typing or with the viewer open.
document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (document.querySelector('dialog[open]')) return;
    const rect = screen.getBoundingClientRect();
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
    if (!onScreen) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); act('next'); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); act('prev'); }
    if (e.key === 'b' || e.key === 'B') act('blank');
});

// Swipe on the screen for touch devices
let touchStartX = null;
screen.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
screen.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) act(dx < 0 ? 'next' : 'prev');
    touchStartX = null;
});

show(0);

// Play through the slides once on load, then hand control to the visitor.
if (!reduceMotion) {
    autoplay = setInterval(() => {
        if (current >= slides.length - 1) { stopAutoplay(); return; }
        show(current + 1);
    }, 3600);
    screen.addEventListener('pointerenter', stopAutoplay, { once: true });
}

/* ---------- Image viewer (project screenshots) ---------- */
const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewer-img');
const viewerTitle = document.getElementById('viewer-title');
const viewerCount = document.getElementById('viewer-count');
const viewerNav = viewer.querySelector('.viewer-nav');
let gallery = [];
let galleryIndex = 0;
let opener = null;

function renderViewer() {
    const item = gallery[galleryIndex];
    viewerImg.src = item.src;
    viewerImg.alt = item.title;
    viewerTitle.textContent = item.title;
    viewerCount.textContent = `${galleryIndex + 1} of ${gallery.length}`;
    viewerNav.hidden = gallery.length < 2;
}

function openViewer(items, index, trigger) {
    gallery = items;
    galleryIndex = index;
    opener = trigger;
    renderViewer();
    if (typeof viewer.showModal === 'function') viewer.showModal();
    else window.open(items[index].src, '_blank');
}

function stepViewer(step) {
    galleryIndex = (galleryIndex + step + gallery.length) % gallery.length;
    renderViewer();
}

document.querySelectorAll('[data-zoom]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const title = link.closest('.project').querySelector('h3').textContent;
        openViewer([{ src: link.getAttribute('href'), title }], 0, link);
    });
});

viewer.querySelectorAll('[data-step]').forEach(b => {
    b.addEventListener('click', () => stepViewer(Number(b.dataset.step)));
});
viewer.addEventListener('keydown', e => {
    if (gallery.length < 2) return;
    if (e.key === 'ArrowRight') stepViewer(1);
    if (e.key === 'ArrowLeft') stepViewer(-1);
});
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });

let viewerTouchX = null;
viewer.addEventListener('touchstart', e => { viewerTouchX = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener('touchend', e => {
    if (viewerTouchX === null || gallery.length < 2) return;
    const dx = e.changedTouches[0].clientX - viewerTouchX;
    if (Math.abs(dx) > 50) stepViewer(dx < 0 ? 1 : -1);
    viewerTouchX = null;
});

/* ---------- Copy email ---------- */
const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');

copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    try {
        await navigator.clipboard.writeText(email);
        copyButton.textContent = 'Copied';
        copyStatus.textContent = 'Email address copied to your clipboard.';
    } catch {
        copyStatus.textContent = `Couldn’t copy automatically. The address is ${email}.`;
    }
    setTimeout(() => {
        copyButton.textContent = 'Copy email';
        copyStatus.textContent = '';
    }, 2500);
});

document.getElementById('year').textContent = new Date().getFullYear();
