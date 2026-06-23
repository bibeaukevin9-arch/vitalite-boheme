// ─── CURSEUR OR ─────────────────────────────────────────────────────────────
(function() {
  var dot  = document.getElementById('curseur-or');
  var ring = document.getElementById('curseur-anneau');
  if (!dot || !ring) return;
  var mx = -200, my = -200, ax = -200, ay = -200;
  document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
  function tick() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    ax += (mx - ax) * 0.18; ay += (my - ay) * 0.18;
    ring.style.left = ax + 'px'; ring.style.top = ay + 'px';
    requestAnimationFrame(tick);
  }
  tick();
}());

// ─── CTA FLOTTANT ───────────────────────────────────────────────────────────
(function() {
  var cta  = document.getElementById('cta-flottant');
  var hero = document.getElementById('hero');
  if (!cta || !hero) return;
  window.addEventListener('scroll', function() {
    cta.classList.toggle('visible', window.scrollY > hero.offsetHeight * 0.6);
  }, { passive: true });
}());

// ─── NAV HAMBURGER ──────────────────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('hamburger-btn').classList.toggle('ouvert');
  document.getElementById('nav-menu').classList.toggle('mobile-ouvert');
}
function fermerMenu() {
  document.getElementById('hamburger-btn').classList.remove('ouvert');
  document.getElementById('nav-menu').classList.remove('mobile-ouvert');
}
document.addEventListener('click', function(e) {
  var nav = document.querySelector('nav');
  if (nav && !nav.contains(e.target)) fermerMenu();
});

// ─── LANGUE ─────────────────────────────────────────────────────────────────
var currentLang = 'fr';

function displayVal(el) {
  var tag = el.tagName.toLowerCase();
  return (tag==='span'||tag==='a'||tag==='em'||tag==='strong'||tag==='b'||tag==='i') ? 'inline' : 'block';
}

function applyLang(lang) {
  currentLang = lang;
  var isEn = (lang === 'en');
  document.querySelectorAll('[data-fr]').forEach(function(el) {
    el.style.display = isEn ? 'none' : displayVal(el);
  });
  document.querySelectorAll('[data-en]').forEach(function(el) {
    el.style.display = isEn ? displayVal(el) : 'none';
  });
  document.getElementById('lbl-fr').classList.toggle('actif', !isEn);
  document.getElementById('lbl-en').classList.toggle('actif', isEn);
  document.documentElement.lang = isEn ? 'en' : 'fr';
  try { localStorage.setItem('vb-lang', lang); } catch(e) {}
}

function toggleLang() {
  applyLang(currentLang === 'fr' ? 'en' : 'fr');
}

(function initLang() {
  var saved = '';
  try { saved = localStorage.getItem('vb-lang') || ''; } catch(e) {}
  applyLang(saved === 'en' ? 'en' : 'fr');
}());

// ─── MODAL SERVICES ─────────────────────────────────────────────────────────
var servicesData = {
  relaxation: {
    icon: '🌿',
    fr: {
      titre: 'Relaxation Suédoise',
      tag: 'Détente & douceur',
      desc: `Le massage relaxation est une invitation à lâcher prise. Des mouvements lents, fluides et enveloppants sur l'ensemble du corps libèrent les tensions accumulées, calment le système nerveux et invitent à une profonde tranquillité.`,
      bienfaits: `<strong>Bienfaits :</strong> réduction du stress et de l'anxiété, amélioration du sommeil, relâchement musculaire, bien-être général.`
    },
    en: {
      titre: 'Swedish Relaxation',
      tag: 'Relaxation & softness',
      desc: 'The relaxation massage is an invitation to let go. Slow, fluid and enveloping movements over the entire body release accumulated tension, calm the nervous system and invite a state of deep tranquility.',
      bienfaits: '<strong>Benefits:</strong> stress and anxiety reduction, improved sleep, muscle relaxation, general sense of wellbeing.'
    }
  },
  therapeutique: {
    icon: '💆',
    fr: {
      titre: 'Massage Thérapeutique',
      tag: 'Ciblé & efficace',
      desc: `Le massage thérapeutique s'adresse aux douleurs musculaires, aux tensions chroniques et aux inconforts physiques. Chaque séance est personnalisée avec des techniques spécifiques pour cibler les zones problématiques.`,
      bienfaits: '<strong>Bienfaits :</strong> soulagement des douleurs, amélioration de la mobilité, réduction des tensions chroniques, récupération accélérée.'
    },
    en: {
      titre: 'Therapeutic Massage',
      tag: 'Targeted & effective',
      desc: 'The therapeutic massage addresses muscle pain, chronic tension and physical discomfort. Each session is personalized using specific techniques to target problem areas and promote recovery.',
      bienfaits: '<strong>Benefits:</strong> pain relief, improved mobility, reduced chronic tension, accelerated recovery.'
    }
  },
  signature: {
    icon: '🌊',
    fr: {
      titre: 'Inspiration Lomi Lomi',
      tag: '⚠ Pour public averti',
      desc: `Inspiré des traditions hawaïennes, le Lomi Lomi est une expérience sensorielle à part entière. Un soin qui voyage à travers le corps avec une fluidité rare — plus proche d'une méditation en mouvement que d'un massage traditionnel.

⚠ À noter : ce soin implique un drapage très minimaliste. Le toucher couvre de nombreuses zones du corps et peut être considéré comme invasif. Réservé à un public averti.`,
      bienfaits: '<strong>Bienfaits :</strong> détente profonde, circulation améliorée, relâchement du fascia, sentiment de légèreté et de fluidité.'
    },
    en: {
      titre: 'Lomi Lomi Inspired',
      tag: '⚠ For informed clients',
      desc: 'Rooted in Hawaiian tradition, Lomi Lomi is a sensory experience unlike any other. A treatment that moves through the body with rare fluidity — closer to a moving meditation than a traditional massage.

⚠ Please note: this treatment involves very minimal draping. Touch covers many areas of the body and may be considered invasive. For informed clients only.',
      bienfaits: '<strong>Benefits:</strong> deep relaxation, improved circulation, fascial release, feeling of lightness and fluidity.'
    }
  },
  couple: {
    icon: '💑',
    fr: {
      titre: 'Cours de massage en couple',
      tag: 'Connexion & partage',
      desc: `Une activité de connexion de 3 heures pour les couples qui souhaitent se retrouver autrement. Sous la guidance de votre massothérapeute, vous apprendrez à vous toucher avec intention — un toucher ancré, thérapeutique et profondément humain. Chaque participant reçoit environ 1h15 de massage. Note : cette formation n'est pas certifiée.`,
      bienfaits: '<strong>Bienfaits :</strong> renforcement du lien affectif, apprentissage de techniques réelles, détente partagée, cadeau parfait pour deux.'
    },
    en: {
      titre: 'Couples Massage Course',
      tag: 'Connection & sharing',
      desc: "A 3-hour connection experience for couples looking to reconnect differently. Under the guidance of your massage therapist, you'll learn to touch with intention — a grounded, therapeutic and deeply human touch. Each participant receives approximately 1h15 of massage. Note: this course is not a certified training.",
      bienfaits: '<strong>Benefits:</strong> strengthened emotional bond, real massage techniques, shared relaxation, the perfect gift for two.'
    }
  }
};

function ouvrirService(type) {
  var data = servicesData[type];
  if (!data) return;
  var isEn = (currentLang === 'en');
  var d = isEn ? data.en : data.fr;
  document.getElementById('modal-icon').innerHTML = data.icon;
  document.getElementById('modal-titre').textContent = d.titre;
  document.getElementById('modal-tag').textContent = d.tag;
  document.getElementById('modal-desc').innerHTML = d.desc.replace(/\n\n/g, '<br><br>');
  document.getElementById('modal-bienfaits').innerHTML = d.bienfaits;
  var cta = document.getElementById('modal-cta');
  cta.textContent = isEn ? 'Health Questionnaire' : 'Questionnaire santé';
  document.getElementById('modal-service').classList.add('ouvert');
  document.body.classList.add('modal-ouvert');
}

function _fermerModal() {
  document.getElementById('modal-service').classList.remove('ouvert');
  document.body.classList.remove('modal-ouvert');
  document.body.style.overflow = '';
}

function fermerService(e, force) {
  if (force || !e || e.target === document.getElementById('modal-service')) {
    _fermerModal();
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') _fermerModal();
});

window.addEventListener('pageshow', function() { _fermerModal(); });

// ─── ANIMATIONS AU SCROLL ────────────────────────────────────────────────────
(function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0 });
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.querySelectorAll('.anim-entree').forEach(function(el) { observer.observe(el); });
    });
  });
  // Fallback: forcer visible apres 1.5s pour tout element non encore anime
  setTimeout(function() {
    document.querySelectorAll('.anim-entree:not(.visible)').forEach(function(el) {
      el.classList.add('visible');
    });
  }, 1500);
}());