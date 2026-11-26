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
