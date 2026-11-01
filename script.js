/* ============================================
   PORTFOLIO - main.js
   Navigatie, sterren, projectanimaties & detailpagina's
   ============================================ */

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page');
const pageButtons = document.querySelectorAll('[data-page]');
const workCards = document.querySelectorAll('.work-card');

// ============================================
// SOEPELE NAVIGATIE
// ============================================
if (navbar && sections.length > 0) {

  function goToPage(pageName) {
    const target = document.getElementById(`page-${pageName}`);

    if (!target) return;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // Navigatielinks & hero knoppen aanklikken
  pageButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      goToPage(button.dataset.page);
    });
  });

  // Actieve navigatielink bijwerken bij scrollen
  function updateActiveNav() {
    let currentSection = 'page-home';

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;

      if (sectionTop <= 150) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      const isActive = link.dataset.page === currentSection.replace('page-', '');
      link.classList.toggle('active', isActive);
    });

    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
}

// ============================================
// LETTERS HERO TITLE ANIMATIE
// ============================================
document.querySelectorAll('.hero-title .letter').forEach((letter, index) => {
  letter.style.animationDelay = `${index * 0.06}s`;
});

// ============================================
// 3D HOVER-EFFECT OP DE PROJECTKAARTEN
// ============================================
workCards.forEach(card => {
  card.addEventListener('mousemove', event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform =
      `translateY(-8px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ============================================
// DECORATIEVE STERREN INTERACTIE
// ============================================
document.querySelectorAll(
  '.deco-star, .deco-star-sm, .deco-star-lg'
).forEach(star => {
  star.addEventListener('mouseenter', () => {
    star.style.animationDuration = '0.8s';
  });

  star.addEventListener('mouseleave', () => {
    star.style.animationDuration = '';
  });
});

// ============================================
// PROJECT DETAILPAGINA'S OPENEN & SLUITEN
// ============================================
const detailPage = document.getElementById('work-detail');
const detailProjects = document.querySelectorAll('.detail-project');
const viewBtns = document.querySelectorAll('.view-work-btn');
const backBtns = document.querySelectorAll('[data-back]');

// De volgorde van de werken is de volgorde van de kaarten in My Work
const workOrder = Array.from(viewBtns).map(btn => Number(btn.dataset.work));
let currentWork = workOrder[0];
const totalWorks = workOrder.length;
const prevBtn = document.querySelector('[data-prev]');
const nextBtn = document.querySelector('[data-next]');
const counterCurrent = document.querySelector('[data-current]');
const counterTotal = document.querySelector('[data-total]');

if (counterTotal) counterTotal.textContent = totalWorks;
const detailTitle = document.querySelector('[data-detail-title]');

function openDetail(workId) {
  const target = document.querySelector(`.detail-project[data-detail="${workId}"]`);
  if (!detailPage || !target) return;

  currentWork = Number(workId);
  if (counterCurrent) counterCurrent.textContent = workOrder.indexOf(currentWork) + 1;

  // Titel van de challenge in de balk bovenaan zetten (+ pop-animatie)
  if (detailTitle) {
    detailTitle.textContent = target.dataset.title || '';
    detailTitle.classList.remove('pop');
    void detailTitle.offsetWidth; // animatie opnieuw starten
    detailTitle.classList.add('pop');
  }

  detailProjects.forEach(project => {
    project.hidden = project !== target;
  });

  detailPage.hidden = false;
  detailPage.scrollTop = 0;
  document.body.classList.add('detail-open');
}

function closeDetail() {
  if (!detailPage) return;
  detailPage.hidden = true;
  document.body.classList.remove('detail-open');
}

viewBtns.forEach(btn => {
  btn.addEventListener('click', event => {
    event.stopPropagation();
    openDetail(btn.dataset.work);
  });
});

backBtns.forEach(btn => btn.addEventListener('click', closeDetail));

// Vorige / volgende werk (na het laatste werk begint het weer bij 1)
function showRelativeWork(step) {
  if (!totalWorks) return;
  const position = workOrder.indexOf(currentWork);
  const next = (position + step + totalWorks) % totalWorks;
  openDetail(workOrder[next]);
}

if (prevBtn) prevBtn.addEventListener('click', () => showRelativeWork(-1));
if (nextBtn) nextBtn.addEventListener('click', () => showRelativeWork(1));

// Escape sluit de detailpagina ook
document.addEventListener('keydown', event => {
  if (!detailPage || detailPage.hidden) return;

  if (event.key === 'Escape') closeDetail();
  if (event.key === 'ArrowLeft') showRelativeWork(-1);
  if (event.key === 'ArrowRight') showRelativeWork(1);
});

// ============================================
// PROJECTKAARTEN ZICHTBAAR MAKEN BIJ SCROLLEN
// ============================================
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  workCards.forEach(card => observer.observe(card));
} else {
  workCards.forEach(card => card.classList.add('is-visible'));
};

/* ============================================
   BURG BURG: HORIZONTALE SLIDESHOW
   ============================================ */

document.querySelectorAll('[data-burgburg-slider]').forEach(slider => {

  const gallery = slider.querySelector('.burgburg-gallery');
  const nextButton = slider.querySelector('[data-burgburg-next]');

  if (!gallery || !nextButton) return;

  let showingMore = false;

  const arrow = nextButton.querySelector('.back-arrow');

  nextButton.addEventListener('click', () => {

    showingMore = !showingMore;

    // Bepaal waar het vierde vakje begint
    const secondSetStart = gallery.children[3].offsetLeft;

    // Schuif alleen de galerij naar links of terug
    gallery.style.transform = showingMore
      ? `translateX(-${secondSetStart}px)`
      : 'translateX(0)';

    // Verander de richting van de pijl
    arrow.textContent = showingMore ? '←' : '→';

    // Pas de beschrijving van de knop aan
    nextButton.setAttribute(
      'aria-label',
      showingMore
        ? 'Bekijk de eerste drie afbeeldingen'
        : 'Bekijk de volgende afbeeldingen'
    );

  });

});

/* ============================================
   MY WORK — PAGINERING
   Vier werken op pagina 1, werk 5 op pagina 2
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const projectsSection = document.getElementById('page-projects');

  if (!projectsSection) return;

  const worksGrid = projectsSection.querySelector('.works-grid');

  if (!worksGrid) return;

  // Voorkom dat de paginering dubbel wordt aangemaakt.
  if (worksGrid.dataset.paginationReady === 'true') return;

  worksGrid.dataset.paginationReady = 'true';

  // Verzamel alle bestaande werkkaarten.
  const cards = Array.from(
    worksGrid.querySelectorAll('.work-card')
  );

  if (cards.length <= 4) {
    console.warn(
      'My Work: voeg eerst de vijfde .work-card toe aan de HTML.'
    );
    return;
  }

  const cardsPerPage = 4;
  const pages = [];

  // Maak aparte pagina's met maximaal vier kaarten.
  for (let i = 0; i < cards.length; i += cardsPerPage) {
    const page = document.createElement('div');

    page.className = 'works-page';
    page.hidden = i !== 0;

    cards.slice(i, i + cardsPerPage).forEach(card => {
      page.appendChild(card);
    });

    worksGrid.appendChild(page);
    pages.push(page);
  }

  // Maak de navigatie onder de kaarten.
  const pagination = document.createElement('div');

  pagination.className = 'works-pagination';

  pagination.innerHTML = `
    <button
      class="works-page-arrow"
      type="button"
      data-works-prev
      aria-label="Bekijk de vorige pagina met werken"
      hidden
    >←</button>

    <span
      class="works-page-indicator"
      aria-live="polite"
    >01 / ${String(pages.length).padStart(2, '0')}</span>

    <button
      class="works-page-arrow"
      type="button"
      data-works-next
      aria-label="Bekijk de volgende pagina met werken"
    >→</button>
  `;

  worksGrid.insertAdjacentElement('afterend', pagination);

  const previousButton = pagination.querySelector('[data-works-prev]');
  const nextButton = pagination.querySelector('[data-works-next]');
  const indicator = pagination.querySelector('.works-page-indicator');

  let currentPage = 0;

  function showWorksPage(index) {
    if (index < 0 || index >= pages.length) return;

    currentPage = index;

    pages.forEach((page, pageIndex) => {
      page.hidden = pageIndex !== currentPage;
    });

    previousButton.hidden = currentPage === 0;
    nextButton.hidden = currentPage === pages.length - 1;

    indicator.textContent =
      `${String(currentPage + 1).padStart(2, '0')} / ` +
      `${String(pages.length).padStart(2, '0')}`;

    // Breng de bezoeker terug naar de titel van My Work.
    const heading = projectsSection.querySelector('.projects-header');

    if (heading) {
      heading.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  previousButton.addEventListener('click', () => {
    showWorksPage(currentPage - 1);
  });

  nextButton.addEventListener('click', () => {
    showWorksPage(currentPage + 1);
  });
});