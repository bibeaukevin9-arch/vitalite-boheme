/* Vitalité Bohème · la barre commune : le menu à trois traits sur téléphone. */
(function () {
  var btn = document.getElementById('hamburger-btn');
  var menu = document.getElementById('nav-menu');
  if (!btn || !menu || !btn.closest('.vb-barre')) return;
  function poser(ouvert) {
    btn.classList.toggle('ouvert', ouvert);
    menu.classList.toggle('mobile-ouvert', ouvert);
    btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); poser(!menu.classList.contains('mobile-ouvert')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) poser(false); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.vb-barre')) poser(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') poser(false); });
  /* La page où on est s'allume en or. */
  var ici = location.pathname.split('/').pop() || 'index.html';
  menu.querySelectorAll('a').forEach(function (a) {
    var cible = (a.getAttribute('href') || '').split('#')[0];
    if (cible && cible === ici && !a.getAttribute('href').includes('#')) a.setAttribute('aria-current', 'page');
  });
})();

/* Le curseur : un petit point qui devient doré sur ce qui se clique, et la pastille « Voir » sur [data-voir].
   Ordinateur seulement (souris) ; les champs et les zones de dessin gardent le curseur de l'ordinateur. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var point = document.createElement('div'), mot = document.createElement('span');
  point.className = 'vb-curseur cache'; point.setAttribute('aria-hidden', 'true');
  point.appendChild(mot); document.body.appendChild(point);
  document.documentElement.classList.add('vb-curseur-actif');
  var natif = 'input, textarea, select, canvas, iframe';
  document.addEventListener('mousemove', function (e) {
    point.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    var el = e.target && e.target.closest ? e.target : document.body;
    var voir = el.closest('[data-voir]');
    point.classList.toggle('cache', !!el.closest(natif));
    point.classList.toggle('voir', !!voir);
    point.classList.toggle('lien', !voir && !!el.closest('a, button, [role="button"], label, summary'));
    mot.textContent = voir ? (document.documentElement.lang === 'en' ? 'See' : 'Voir') : '';
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { point.classList.add('cache'); });
})();

/* L'or de lingot : chaque bouton doré prend un coin différent du métal, et ce coin change à chaque visite. */
(function () {
  var hasard = function (a, b) { return Math.round(a + Math.random() * (b - a)); };
  document.querySelectorAll('.vb-resa, .vb-b-or, .vb-lingot, .caisse, #btn-dl-pdf, .cta-flottant').forEach(function (e) {
    e.style.backgroundPosition = hasard(0, 100) + '% ' + hasard(0, 100) + '%';
    e.style.backgroundSize = hasard(260, 400) + 'px';
  });
})();

/* Black Friday d'ATP Lab, jusqu'au 30 novembre 2026 : le code VB15 ne s'ajoute pas à leur rabais. */
(function () {
  if (Date.now() >= Date.parse('2026-12-01T05:00:00Z')) return;
  document.documentElement.classList.add('vb-bf');
  document.querySelectorAll('.vb-tampon, .gros-tampon').forEach(function (e) { e.style.display = 'none'; });
  /* La boutique : ces phrases sont dans la page dès le départ, qu'ATP réponde ou non. */
  var remplacer = function (sel, avant, apres) {
    document.querySelectorAll(sel).forEach(function (e) { if (e.innerHTML.indexOf(avant) > -1) e.innerHTML = e.innerHTML.replace(avant, apres); });
  };
  remplacer('.mention p', 'Les prix affichés incluent ton code VB15, avant les taxes et la livraison.', 'Les prix affichés sont ceux d’ATP Lab, avant leur rabais du Black Friday, les taxes et la livraison.');
  remplacer('li', 'Ton panier s’ouvre chez ATP Lab, avec le code VB15 déjà appliqué.', 'Ton panier s’ouvre chez ATP Lab, où leur rabais du Black Friday s’applique.');
  remplacer('.fin p', 'Le prix Vitalité Bohème est le prix d’ATP moins 15 %, calculé comme à leur caisse.', 'Jusqu’au 30 novembre, les prix affichés sont ceux d’ATP Lab, et leur rabais du Black Friday s’applique à leur caisse.');
  var tr = document.getElementById('t-rabais'); if (tr) tr.parentNode.style.display = 'none';
  var b = document.querySelector('section[aria-label="La boutique"]');
  if (!b) return;
  b.querySelectorAll('.sur').forEach(function (e) { e.style.display = 'none'; });
  var fr = b.querySelector('p[data-fr]'), en = b.querySelector('p[data-en]');
  if (fr) fr.textContent = 'Les suppléments d’ATP Lab, une entreprise de Granby. Black Friday chez eux jusqu’au 30 novembre.';
  if (en) en.textContent = 'ATP Lab supplements, from a Granby company. Black Friday at their store until November 30.';
})();
