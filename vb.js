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
