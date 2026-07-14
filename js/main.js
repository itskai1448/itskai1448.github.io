const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const toast = document.querySelector('[data-toast]');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Close' : 'Menu';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

const recordChoices = [...document.querySelectorAll('.record-choice')];
const largeVinyl = document.querySelector('[data-large-vinyl]');
const linerTitle = document.querySelector('[data-liner-title]');
const linerSubtitle = document.querySelector('[data-liner-subtitle]');
const linerNumber = document.querySelector('[data-liner-number]');
let currentRecord = 0;

function selectRecord(index) {
  if (!recordChoices.length) return;
  currentRecord = (index + recordChoices.length) % recordChoices.length;
  const choice = recordChoices[currentRecord];
  const vinyl = choice.querySelector('.vinyl');
  recordChoices.forEach((item) => item.classList.remove('selected'));
  choice.classList.add('selected');
  linerTitle.textContent = choice.dataset.title;
  linerSubtitle.textContent = choice.dataset.subtitle;
  linerNumber.textContent = 'Record ' + String(currentRecord + 1).padStart(2, '0');
  largeVinyl.style.setProperty('--vinyl', choice.style.getPropertyValue('--vinyl'));
  largeVinyl.style.setProperty('--vinyl2', choice.style.getPropertyValue('--vinyl2'));
  largeVinyl.classList.toggle('splatter', vinyl.classList.contains('splatter'));
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === choice.dataset.album);
  });
  choice.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  largeVinyl.classList.remove('spinning');
}

recordChoices.forEach((choice, index) => choice.addEventListener('click', () => selectRecord(index)));
document.querySelector('[data-prev-record]')?.addEventListener('click', () => selectRecord(currentRecord - 1));
document.querySelector('[data-next-record]')?.addEventListener('click', () => selectRecord(currentRecord + 1));
document.querySelector('[data-spin-record]')?.addEventListener('click', (event) => {
  const spinning = largeVinyl.classList.toggle('spinning');
  event.currentTarget.textContent = spinning ? 'Ⅱ' : '▶';
  showToast(spinning ? 'Record spinning' : 'Record paused');
});

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('[data-category]').forEach((card) => {
      const categories = card.dataset.category.split(' ');
      card.hidden = category !== 'all' && !categories.includes(category);
    });
  });
});

document.querySelector('[data-download]')?.addEventListener('click', () => showToast('Résumé downloading'));
