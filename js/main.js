const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const soundButton = document.querySelector('[data-sound]');
const record = document.querySelector('[data-record]');
const playerState = document.querySelector('[data-player-state]');
const toast = document.querySelector('[data-toast]');
let soundOn = false;

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Close' : 'Menu';
});

function beep(frequency = 520, duration = .07) {
  if (!soundOn || !window.AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.045, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.onended = () => context.close();
}

soundButton?.addEventListener('click', () => {
  soundOn = !soundOn;
  soundButton.textContent = 'Sound: ' + (soundOn ? 'on' : 'off');
  soundButton.setAttribute('aria-pressed', String(soundOn));
  beep(620, .1);
});

record?.addEventListener('click', () => {
  const playing = record.classList.toggle('playing');
  playerState.textContent = playing ? 'PLAYING' : 'PAUSED';
  record.setAttribute('aria-label', playing ? 'Pause record' : 'Play record');
  beep(playing ? 660 : 330, .12);
});

document.querySelectorAll('a, button').forEach((item) => item.addEventListener('pointerenter', () => beep(440, .035)));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('[data-category]').forEach((card) => {
      const categories = card.dataset.category.split(' ');
      const shouldHide = category !== 'all' && !categories.includes(category);
      card.classList.toggle('is-hidden', shouldHide);
      card.hidden = shouldHide;
    });
    showToast(category === 'all' ? 'All releases loaded' : button.textContent + ' shelf loaded');
    beep(700, .08);
  });
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelector('[data-download]')?.addEventListener('click', () => showToast('Resume unlocked — no trivia required'));
