// Scroll reveal
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);
document.querySelectorAll('.project-card, .feature-card, .timeline-content').forEach(el => observer.observe(el));

// Card tilt
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * 10;
    const rotateY = ((x - cx) / cx) * 10;
    card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(-8px) rotateX(0deg) rotateY(0deg)';
  });
});

// Fallback stars (hidden by CSS, aman dibiarkan)
const starsContainer = document.getElementById('stars');
if (starsContainer) {
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.width = Math.random() * 3 + 1 + 'px';
    star.style.height = star.style.width;
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = Math.random() * 2 + 2 + 's';
    starsContainer.appendChild(star);
  }
}

// Typing effect
const texts = ["Frontend Developer", "Web Designer", "UI/UX Enthusiast"];
let textIndex = 0, charIndex = 0, isDeleting = false;
const typingElement = document.getElementById('typingText');
function type() {
  const currentText = texts[textIndex];
  if (!isDeleting) {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentText.length) setTimeout(() => isDeleting = true, 2000);
  } else {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) { isDeleting = false; textIndex = (textIndex + 1) % texts.length; }
  }
  setTimeout(type, isDeleting ? 50 : 100);
}
type();

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// Mobile menu (dipanggil dari onclick HTML)
window.toggleMobileMenu = function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
};

// Lanyard 3D hover
const lanyardSystem = document.getElementById('lanyardSystem');
if (lanyardSystem) {
  let isHovering = false;
  lanyardSystem.addEventListener('mouseenter', () => { isHovering = true; lanyardSystem.style.animation = 'none'; });
  lanyardSystem.addEventListener('mouseleave', () => {
    isHovering = false;
    lanyardSystem.style.transform = 'rotateX(0deg) rotateY(0deg)';
    lanyardSystem.style.animation = 'swing 4s ease-in-out infinite';
  });
  lanyardSystem.addEventListener('mousemove', (e) => {
    if (!isHovering) return;
    const rect = lanyardSystem.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -15, ry = ((x - cx) / cx) * 15;
    lanyardSystem.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
}

// Contact form (EmailJS)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const submitBtn = document.querySelector('.submit-btn');

    if (!name || !email || !subject || !message) return showToast('Error', 'Semua field harus diisi!', 'error');
    if (!validateEmail(email)) return showToast('Error', 'Email tidak valid!', 'error');

    submitBtn.disabled = true; submitBtn.textContent = 'Mengirim...';
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_t9k3qg9',
          template_id: 'template_fi5c3ma',
          user_id: 'hZHOgu9e-XZtUWbjf',
          template_params: {
            to_email: 'your_email@gmail.com',
            from_name: name, from_email: email, subject, message
          }
        })
      });
      if (response.ok) { showToast('Sukses', 'Pesan Anda telah terkirim!', 'success'); contactForm.reset(); }
      else showToast('Error', 'Gagal mengirim pesan, coba lagi.', 'error');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Terjadi kesalahan, coba lagi.', 'error');
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = 'Kirim Pesan';
    }
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(title, message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const toastTitle = toast.querySelector('h4');
  const toastMessage = toast.querySelector('p');
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  if (type === 'error') {
    toast.style.background = 'hsl(0 84% 60% / 0.1)';
    toast.style.borderColor = 'hsl(0 84% 60%)';
    toastTitle.style.color = 'hsl(0 84% 60%)';
  } else {
    toast.style.background = 'hsl(var(--card))';
    toast.style.borderColor = 'hsl(var(--border))';
    toastTitle.style.color = 'hsl(var(--foreground))';
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}