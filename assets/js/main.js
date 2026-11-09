const EMAIL = 'sathvikrinny@gmail.com';

// ----- Mobile menu -----
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('open', open);
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ----- Header border + active nav link -----
const header = document.querySelector('.site-header');
const sections = Array.from(document.querySelectorAll('main section[id]'));
const links = Array.from(navLinks.querySelectorAll('a[href^="#"]'));

function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
    let current = '';
    for (const s of sections) {
        if (s.getBoundingClientRect().top <= 120) current = s.id;
    }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ----- Reveal on scroll -----
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}

// ----- Certificate lightbox -----
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbTitle = document.getElementById('lightbox-title');

document.querySelectorAll('.cert').forEach(card => {
    card.addEventListener('click', () => {
        lbImg.src = card.dataset.full;
        lbImg.alt = card.dataset.title;
        lbTitle.textContent = card.dataset.title;
        if (typeof lightbox.showModal === 'function') lightbox.showModal();
        else window.open(card.dataset.full, '_blank');
    });
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

// ----- Contact form: opens the visitor's email app with the message filled in -----
const form = document.getElementById('contactForm');
const status = form.querySelector('.form-status');

form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;

    const invalid = [];
    [name, email, message].forEach(f => f.setAttribute('aria-invalid', 'false'));
    if (!name.value.trim()) invalid.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) invalid.push(email);
    if (!message.value.trim()) invalid.push(message);

    if (invalid.length) {
        invalid.forEach(f => f.setAttribute('aria-invalid', 'true'));
        status.textContent = 'Please fill in your name, a valid email and a message.';
        status.className = 'form-status error';
        invalid[0].focus();
        return;
    }

    const subject = `Portfolio enquiry from ${name.value.trim()}`;
    const body = `${message.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app… If nothing happens, email me directly at ' + EMAIL + '.';
    status.className = 'form-status';
});

document.getElementById('year').textContent = new Date().getFullYear();
