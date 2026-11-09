const EMAIL = 'sathvikrinny@gmail.com';
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme toggle ---------- */
const themeBtn = document.querySelector('.theme-toggle');
const systemLight = window.matchMedia('(prefers-color-scheme: light)');

function currentTheme() {
    return root.getAttribute('data-theme') || (systemLight.matches ? 'light' : 'dark');
}

function updateThemeButton() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', `Switch to ${next} theme`);
    const meta = document.querySelectorAll('meta[name="theme-color"]');
    meta.forEach(m => m.setAttribute('content', currentTheme() === 'dark' ? '#0e0e11' : '#faf8f4'));
}

themeBtn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
    updateThemeButton();
});
systemLight.addEventListener('change', updateThemeButton);
updateThemeButton();

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector('.nav-toggle');
const panel = document.getElementById('nav-panel');
const desktopNav = window.matchMedia('(min-width: 900px)');

function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) panel.querySelector('a').focus({ preventScroll: true });
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
    }
});
desktopNav.addEventListener('change', () => setMenu(false));

/* ---------- Header border, active link, back-to-top ---------- */
const header = document.querySelector('.site-header');
const toTop = document.querySelector('.to-top');
const sections = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = Array.from(panel.querySelectorAll('.nav-links a'));
let ticking = false;

function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    toTop.classList.toggle('show', y > window.innerHeight * 0.9);

    let current = '';
    for (const s of sections) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s.id;
    }
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });
onScroll();

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}

/* ---------- Certificate lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbTitle = document.getElementById('lightbox-title');
const lbCount = document.getElementById('lightbox-count');
const certs = Array.from(document.querySelectorAll('.cert'));
let certIndex = 0;

function showCert(i) {
    certIndex = (i + certs.length) % certs.length;
    const card = certs[certIndex];
    lbImg.src = card.dataset.full;
    lbImg.alt = card.dataset.title;
    lbTitle.textContent = card.dataset.title;
    lbCount.textContent = `${certIndex + 1} / ${certs.length}`;
}

certs.forEach((card, i) => {
    card.addEventListener('click', () => {
        showCert(i);
        if (typeof lightbox.showModal === 'function') {
            lightbox.showModal();
            document.body.classList.add('menu-open');
        } else {
            window.open(card.dataset.full, '_blank');
        }
    });
});

lightbox.querySelectorAll('[data-step]').forEach(btn => {
    btn.addEventListener('click', () => showCert(certIndex + Number(btn.dataset.step)));
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-inner') || e.target.tagName === 'FIGURE') {
        lightbox.close();
    }
});
lightbox.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    certs[certIndex].focus({ preventScroll: true });
});
lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') showCert(certIndex + 1);
    if (e.key === 'ArrowLeft') showCert(certIndex - 1);
});

// Swipe left/right between certificates on touch screens
let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showCert(certIndex + (dx < 0 ? 1 : -1));
    touchX = null;
});

/* ---------- Contact form: opens the visitor's email app ---------- */
const form = document.getElementById('contactForm');
const status = form.querySelector('.form-status');

form.addEventListener('input', e => {
    if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false');
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const { name, email, message } = form.elements;
    const invalid = [];
    if (!name.value.trim()) invalid.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) invalid.push(email);
    if (!message.value.trim()) invalid.push(message);

    [name, email, message].forEach(f => f.setAttribute('aria-invalid', String(invalid.includes(f))));

    if (invalid.length) {
        status.textContent = 'Please fill in your name, a valid email and a message.';
        status.className = 'form-status error';
        invalid[0].focus();
        return;
    }

    const subject = `Portfolio enquiry from ${name.value.trim()}`;
    const body = `${message.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Opening your email app… If nothing happens, email me at ${EMAIL}.`;
    status.className = 'form-status';
});

document.getElementById('year').textContent = new Date().getFullYear();
