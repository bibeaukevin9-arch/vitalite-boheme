// FICHE-SCRIPT.JS — Vitalité Bohème questionnaire de santé

// ─── DATE SIGNATURE — remplissage automatique à l'ouverture ───
// Exposee globalement : form.reset() vide ce champ apres un envoi reussi, et
// il faut pouvoir le re-remplir pour qu'un 2e questionnaire (un couple sur le
// meme telephone, par exemple) ne bloque pas sur « Date de signature ».
function setDateAujourdhui() {
  var champ = document.getElementById('date_signature');
  if (champ && !champ.value) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    champ.value = yyyy + '-' + mm + '-' + dd;
  }
}
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setDateAujourdhui);
  } else {
    setDateAujourdhui();
  }
})();

// ─── DATE MANUELLE — formatage automatique AAAA-MM-JJ ─────────
(function() {
  function formatDate(e) {
    var input = e.target;
    var digits = input.value.replace(/\D/g, '');
    if (digits.length > 8) digits = digits.slice(0, 8);
    var out = digits;
    if (digits.length > 4) out = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length > 6) out = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
    input.value = out;
  }
  document.querySelectorAll('.date-manuelle').forEach(function(inp) {
    inp.addEventListener('input', formatDate);
  });
})();

// ─── EMAILJS CONFIG ────────────────────────────────────────────
var EMAILJS_PUBLIC_KEY  = 'nDDa_zp8R1h9YR_Df';
var EMAILJS_SERVICE_ID  = 'service_w78vr2g';
var EMAILJS_TEMPLATE_ID = 'template_iumkg2s';
// Banque de clients : quand le questionnaire part, on signale l'identite au programme de reservation
// (prenom, nom, courriel, telephone, langue). Jamais une reponse de sante. Si ca echoue, rien ne change.
var BANQUE_URL = 'https://script.google.com/macros/s/AKfycby217WbbU_K_cAUy9L1H96Yseh376VTAyT8eYxd2dCNl8Gw6pMmQEO8pi2P0rud6FLG/exec';
function signalerBanque(identite) {
  try {
    if (!BANQUE_URL || !window.fetch) return;
    fetch(BANQUE_URL, { method: 'POST', redirect: 'follow', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'fiche', prenom: identite.prenom, nom: identite.nom, courriel: identite.courriel, tel: identite.tel, lang: identite.lang, site_web: '' }) })
      .catch(function(e) { console.warn('banque clients :', e); });
  } catch (e) { console.warn('banque clients :', e); }
}
if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ─── LANGUE ────────────────────────────────────────────────────
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
  var lblFr = document.getElementById('lbl-fr'); if (lblFr) lblFr.classList.toggle('actif', !isEn);
  var lblEn = document.getElementById('lbl-en'); if (lblEn) lblEn.classList.toggle('actif', isEn);
  document.documentElement.lang = isEn ? 'en' : 'fr';
  try { localStorage.setItem('vb-lang', lang); } catch(e) {}
  if (typeof renderZoneTags === 'function' && Array.isArray(zonesDouleur)) renderZoneTags();
}

function toggleLang() { applyLang(currentLang === 'fr' ? 'en' : 'fr'); }

(function initLang() {
  var saved = '';
  try { saved = localStorage.getItem('vb-lang') || ''; } catch(e) {}
  applyLang(saved === 'en' ? 'en' : 'fr');
})();

// Date de naissance : max = aujourd'hui (pas de date future)
(function() {
  var ddnInput = document.getElementById('ddn');
  if (ddnInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    ddnInput.max = yyyy + '-' + mm + '-' + dd;
  }
})();

// ─── TRADUCTION ZONES CORPORELLES ──────────────────────────────
var ZONE_EN = {
  // Face — bras gauche patient (côté droit de l'image)
  'Deltoïde gauche':           'Left deltoid',
  'Biceps brachial gauche':    'Left biceps',
  'Avant-bras gauche':         'Left forearm',
  'Poignet gauche':            'Left wrist',
  // Face — bras droit patient (côté gauche de l'image)
  'Deltoïde droit':            'Right deltoid',
  'Biceps brachial droit':     'Right biceps',
  'Avant-bras droit':          'Right forearm',
  'Poignet droit':             'Right wrist',
  // Face — tronc
  'Grand pectoral gauche':     'Left pectoralis major',
  'Grand pectoral droit':      'Right pectoralis major',
  // Face — jambes
  'Hanche gauche':             'Left hip',
  'Hanche droite':             'Right hip',
  'Quadriceps gauche':         'Left quadriceps',
  'Quadriceps droit':          'Right quadriceps',
  'Genou gauche':              'Left knee',
  'Genou droit':               'Right knee',
  'Tibia gauche':              'Left tibia',
  'Tibia droit':               'Right tibia',
  'Pied gauche':               'Left foot',
  'Pied droit':                'Right foot',
  // Dos — centré
  'Nuque':                     'Neck',
  // Dos — trapèze
  'Trapèze gauche':            'Left trapezius',
  'Trapèze droit':             'Right trapezius',
  // Dos — épaules et bras
  'Deltoïde gauche (dos)':     'Left deltoid (back)',
  'Deltoïde droit (dos)':      'Right deltoid (back)',
  'Triceps brachial gauche':   'Left triceps',
  'Triceps brachial droit':    'Right triceps',
  'Avant-bras gauche (dos)':   'Left forearm (back)',
  'Avant-bras droit (dos)':    'Right forearm (back)',
  'Poignet gauche (dos)':      'Left wrist (back)',
  'Poignet droit (dos)':       'Right wrist (back)',
  // Dos — lombaires et fessier
  'Lombaires gauche':          'Left lumbar',
  'Lombaires droit':           'Right lumbar',
  'Fessier gauche':            'Left gluteus',
  'Fessier droit':             'Right gluteus',
  // Dos — jambes
  'Ischio-jambiers gauche':    'Left hamstrings',
  'Ischio-jambiers droit':     'Right hamstrings',
  'Mollet gauche':             'Left calf',
  'Mollet droit':              'Right calf',
  'Cheville gauche':           'Left ankle',
  'Cheville droite':           'Right ankle'
};

function zoneLabel(nomFr) {
  return (currentLang === 'en' && ZONE_EN[nomFr]) ? ZONE_EN[nomFr] : nomFr;
}

// ─── ZONES CORPORELLES ─────────────────────────────────────────
var zonesDouleur = [];
var corpsMode = 'douleur';
var stickerMode = false;
var stickers = [];

// ─── TRADUCTION ZONES INTERDITES ───────────────────────────────
var ZONE_INTERDITES_EN = {
  'Tête':                                   'Head',
  'Nuque':                                  'Neck',
  'Torse':                                  'Torso',
  'Ventre':                                 'Abdomen',
  'Zone génitale (on ne touche jamais)':    'Genital area (never touch)',
  'Lombaires':                              'Lumbar',
  'Trapèze gauche':                         'Left trapezius',
  'Trapèze droit':                          'Right trapezius',
  'Trapèzes':                               'Trapezii (both)',
  'Lombaires gauche':                       'Left lumbar',
  'Lombaires droit':                        'Right lumbar',
  'Fessier gauche':                         'Left gluteus',
  'Fessier droit':                          'Right gluteus',
  'Deltoïde gauche':                         'Left deltoid',
  'Deltoïde droit':                          'Right deltoid',
  'Biceps brachial gauche':                  'Left biceps',
  'Biceps brachial droit':                   'Right biceps',
  'Triceps brachial gauche':                 'Left triceps',
  'Triceps brachial droit':                  'Right triceps',
  'Avant-bras gauche':                       'Left forearm',
  'Avant-bras droit':                        'Right forearm',
  'Poignet gauche':                          'Left wrist',
  'Poignet droit':                           'Right wrist',
  'Quadriceps gauche':                      'Left quadriceps',
  'Quadriceps droit':                       'Right quadriceps',
  'Genou gauche':                           'Left knee',
  'Genou droit':                            'Right knee',
  'Tibia gauche':                           'Left shin',
  'Tibia droit':                            'Right shin',
  'Ischio-jambiers gauche':                 'Left hamstring',
  'Ischio-jambiers droit':                  'Right hamstring',
  'Mollet gauche':                          'Left calf',
  'Mollet droit':                           'Right calf',
  'Pied gauche':                            'Left foot',
  'Pied droit':                             'Right foot',
  'Corps':                                  'Body'
};

function translateZoneInterditEN(nom) {
  return ZONE_INTERDITES_EN[nom] || nom;
}

// Détection automatique de la zone en fonction des coordonnées %
function detectZoneInterdite(xPct, yPct) {
  var isFront = xPct < 50;

  if (isFront) {
    // Vue de face — centre horizontal du corps ~27%
    // x < 27 = côté droit du patient (à gauche de l'image)
    // x > 27 = côté gauche du patient (à droite de l'image)
    var isArmZone = (xPct < 22) || (xPct > 31);  // fix: élargi pour couvrir deltoïdes
    var side = (xPct < 27) ? 'droit' : 'gauche';

    if (yPct < 14)              return 'Tête';
    if (isArmZone && yPct < 21) {
      return xPct < 22 ? 'Deltoïde droit' : 'Deltoïde gauche';
    }
    if (yPct < 21)              return 'Nuque';
    if (isArmZone && yPct < 28) {
      if (xPct < 22) {
        if (xPct > 19) return 'Deltoïde droit';
        if (xPct > 14) return 'Biceps brachial droit';
        if (xPct > 10) return 'Avant-bras droit';
        return 'Poignet droit';
      } else {
        if (xPct < 35) return 'Deltoïde gauche';
        if (xPct < 40) return 'Biceps brachial gauche';
        if (xPct < 45) return 'Avant-bras gauche';
        return 'Poignet gauche';
      }
    }
    if (yPct < 28)              return 'Torse';
    if (yPct < 38)              return 'Ventre';
    if (yPct < 49)              return 'Ventre';
    if (yPct < 59)              return 'Quadriceps ' + side;
    if (yPct < 70)              return 'Genou ' + side;
    if (yPct < 86)              return 'Tibia ' + side;
    return 'Pied ' + side;

  } else {
    // Vue de dos — centre horizontal du corps ~74%
    // x < 74 = côté gauche du patient (à gauche de l'image, vue de dos)
    // x > 74 = côté droit du patient (à droite de l'image, vue de dos)
    var isArmZoneBack = (xPct < 69) || (xPct > 79);  // fix: élargi pour couvrir deltoïdes dos
    var side = (xPct < 74) ? 'gauche' : 'droit';

    if (yPct < 14)                    return 'Tête';
    if (yPct < 21)                    return 'Nuque';
    if (isArmZoneBack && yPct < 28) {
      if (xPct < 69) {
        if (xPct > 66) return 'Deltoïde gauche';
        if (xPct > 62) return 'Triceps brachial gauche';
        if (xPct > 58) return 'Avant-bras gauche';
        return 'Poignet gauche';
      } else {
        if (xPct < 82) return 'Deltoïde droit';
        if (xPct < 86) return 'Triceps brachial droit';
        if (xPct < 90) return 'Avant-bras droit';
        return 'Poignet droit';
      }
    }
    if (yPct < 32) {
      if (xPct < 72)  return 'Trapèze gauche';
      if (xPct <= 75) return 'Trapèzes';
      return 'Trapèze droit';
    }
    if (yPct < 44) {
      if (xPct < 72)  return 'Lombaires gauche';
      if (xPct <= 75) return 'Lombaires';
      return 'Lombaires droit';
    }
    if (yPct < 52)                    return 'Fessier ' + side;
    if (yPct < 68)                    return 'Ischio-jambiers ' + side;
    if (yPct < 86)                    return 'Mollet ' + side;
    return 'Pied ' + side;
  }
}

function setCorpsMode(mode) {
  corpsMode = mode;
  document.getElementById('btn-mode-douleur').className = 'mode-corps-btn' + (mode === 'douleur' ? ' active-douleur' : '');
  if (mode === 'douleur' && stickerMode) toggleStickerMode();
}

function getNom(el) {
  if (el.getAttribute('data-nom')) return el.getAttribute('data-nom');
  var m = (el.getAttribute('onclick')||'').match(/toggleZone\(this,'(.*)'\)/);
  return m ? m[1].replace(/\\'/g,"'") : '';
}

function renderZoneTags() {
  var noms = zonesDouleur.map(getNom);
  var container = document.getElementById('zones-tags');
  document.getElementById('zones-input').value = noms.join(', ');
  if (!noms.length) {
    container.innerHTML = '<em style="color:#c0b0a0;font-size:13px">' + (currentLang === 'en' ? 'No area selected' : 'Aucune zone sélectionnée') + '</em>';
    return;
  }
  container.innerHTML = noms.map(function(z) { return '<span class="zone-tag">' + zoneLabel(z) + '</span>'; }).join('');
}

function toggleZone(btn, nom) {
  if (stickerMode) return;
  var idx = zonesDouleur.indexOf(btn);
  if (idx === -1) { zonesDouleur.push(btn); btn.classList.add('actif'); }
  else { zonesDouleur.splice(idx, 1); btn.classList.remove('actif'); }
  renderZoneTags();
}

// ─── MODE COLLANTS ⊘ ───────────────────────────────────────────
function toggleStickerMode() {
  stickerMode = !stickerMode;
  var btn = document.getElementById('btn-mode-interdit');
  btn.className = 'mode-corps-btn' + (stickerMode ? ' active-interdit' : '');
  document.getElementById('sticker-tools').style.display = stickerMode ? 'flex' : 'none';
  document.getElementById('corps-wrap').style.cursor = stickerMode ? 'crosshair' : '';
  document.querySelectorAll('.zone-btn').forEach(function(z) {
    z.style.pointerEvents = stickerMode ? 'none' : '';
  });
  if (stickerMode) document.getElementById('btn-mode-douleur').className = 'mode-corps-btn';
  else setCorpsMode('douleur');
}

function makeStickerSVG() {
  return '<svg viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg">'
    + '<circle cx="20" cy="20" r="17" fill="rgba(204,68,68,0.18)" stroke="#cc2222" stroke-width="4"/>'
    + '<line x1="8" y1="8" x2="32" y2="32" stroke="#cc2222" stroke-width="4" stroke-linecap="round"/>'
    + '</svg>';
}

function placerSticker(e) {
  if (!stickerMode) return;
  if (e.target.closest && e.target.closest('.zone-interdit-sticker')) return;
  var wrap = document.getElementById('corps-wrap');
  var rect = wrap.getBoundingClientRect();
  var src = e.touches ? e.touches[0] : e;
  var xPct = (src.clientX - rect.left) / rect.width * 100;
  var yPct = (src.clientY - rect.top)  / rect.height * 100;
  var zoneName = detectZoneInterdite(xPct, yPct);
  // Blocage zone génitale — zone élargie (entre hanches et quadriceps, centre)
  if (xPct >= 21 && xPct <= 33 && yPct >= 44 && yPct <= 49) return;
  var sticker = document.createElement('div');
  sticker.className = 'zone-interdit-sticker';
  sticker.style.left = xPct.toFixed(2) + '%';
  sticker.style.top  = yPct.toFixed(2) + '%';
  sticker.dataset.zone = zoneName;
  sticker.innerHTML = makeStickerSVG();
  sticker.title = (currentLang === 'en' ? translateZoneInterditEN(zoneName) : zoneName) + ' — cliquer pour retirer';
  sticker.addEventListener('click', function(ev) {
    ev.stopPropagation();
    if (stickerMode) {
      wrap.removeChild(sticker);
      stickers = stickers.filter(function(s) { return s !== sticker; });
      updateStickerInput();
    }
  });
  wrap.appendChild(sticker);
  stickers.push(sticker);
  updateStickerInput();
}

function clearStickers() {
  stickers.forEach(function(s) { if (s.parentNode) s.parentNode.removeChild(s); });
  stickers = [];
  updateStickerInput();
}

function updateStickerInput() {
  var inp = document.getElementById('zones-interdites-input');
  var container = document.getElementById('zones-interdites-container');
  var tagsDiv = document.getElementById('zones-interdites-tags');

  if (!stickers.length) {
    if (inp) inp.value = '';
    if (container) container.style.display = 'none';
    return;
  }

  // Collecte les noms de zones uniques depuis les stickers
  var zones = [];
  stickers.forEach(function(s) {
    var z = s.dataset.zone || '';
    if (z && zones.indexOf(z) === -1) zones.push(z);
  });

  if (inp) inp.value = zones.join(', ');

  if (container) container.style.display = 'block';
  if (tagsDiv) {
    tagsDiv.innerHTML = zones.map(function(z) {
      var label = (currentLang === 'en') ? translateZoneInterditEN(z) : z;
      return '<span class="zone-tag-interdit">⊘ ' + label + '</span>';
    }).join('');
  }
}

// ─── SIGNATURE ─────────────────────────────────────────────────
var canvas = document.getElementById('sigCanvas');
var ctx = canvas.getContext('2d');
var drawing = false;
ctx.strokeStyle = '#3a2e28'; ctx.lineWidth = 2; ctx.lineCap = 'round';

function getPos(e) {
  var r = canvas.getBoundingClientRect();
  var s = e.touches ? e.touches[0] : e;
  return { x: (s.clientX - r.left) * (canvas.width / r.width), y: (s.clientY - r.top) * (canvas.height / r.height) };
}

canvas.addEventListener('mousedown', function(e) { drawing = true; var p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
canvas.addEventListener('mousemove', function(e) { if (!drawing) return; var p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
canvas.addEventListener('mouseup', function() { drawing = false; document.getElementById('sig-input').value = canvas.toDataURL(); });
canvas.addEventListener('touchstart', function(e) { e.preventDefault(); drawing = true; var p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }, { passive: false });
canvas.addEventListener('touchmove', function(e) { e.preventDefault(); if (!drawing) return; var p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }, { passive: false });
canvas.addEventListener('touchend', function() { drawing = false; document.getElementById('sig-input').value = canvas.toDataURL(); });

function effacerSignature() { ctx.clearRect(0, 0, canvas.width, canvas.height); document.getElementById('sig-input').value = ''; }

// ─── Signature compressee, pour le courriel de la clinique ─────────────────
// Le PDF du client garde la signature PNG pleine qualite. Pour le courriel, on
// la redessine plus petite, sur fond blanc, et on la compresse en JPEG :
// les variables EmailJS sont plafonnees a 50 Ko et le PNG brut en pese ~28.
// Le fond blanc est obligatoire — le JPEG ne gere pas la transparence, et sans
// lui le trace fonce se retrouverait sur du noir, donc invisible.
function signatureCompressee() {
  var champ = document.getElementById('sig-input');
  if (!canvas || !champ || !champ.value) return '';
  try {
    var mini = document.createElement('canvas');
    var largeur = 520;
    mini.width  = largeur;
    mini.height = Math.max(1, Math.round(canvas.height * (largeur / canvas.width)));
    var mctx = mini.getContext('2d');
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, mini.width, mini.height);
    mctx.drawImage(canvas, 0, 0, mini.width, mini.height);
    return mini.toDataURL('image/jpeg', 0.6);
  } catch (eSig) {
    console.error('Signature compressee :', eSig);
    return '';
  }
}

// ─── MOINS DE 18 ANS ───────────────────────────────────────────
function toggleMineur() {
  var c = document.getElementById('mineur'), z = document.getElementById('mineur-champs');
  if (z) z.style.display = (c && c.checked) ? 'block' : 'none';
}

// ─── SOUMISSION ────────────────────────────────────────────────
function soumettreFormulaire(e) {
  e.preventDefault();
  var isEn = (currentLang === 'en');
  var form = e.target;
  var fd = new FormData(form);
  var v = function(n) { return (fd.get(n) || '').toString().trim(); };
  var all = function(n) { return fd.getAll(n).map(function(x) { return x.toString(); }); };

  // ─── VALIDATION ────────────────────────────────────────────────
  var erreurs = [];
  var premierChamp = null;

  function marqueFin(id, ok) {
    var el = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
    if (!el) return;
    el.style.outline = ok ? '' : '2.5px solid #c44';
    el.style.background = ok ? '' : '#fff0f0';
    if (!ok && !premierChamp) premierChamp = el;
  }

  // Champs obligatoires texte
  // Sexe et adresse sont exigés nommément par l'article 9.1.1 du code de déontologie du RMPQ ;
  // les allergies sont la contre-indication qui peut se déclencher pendant la séance elle-même.
  // Les trois manquaient jusqu'au 2026-09-10.
  var champsTxt = [
    { n: 'nom',            fr: 'Nom',               en: 'Last name' },
    { n: 'prenom',         fr: 'Prénom',            en: 'First name' },
    { n: 'sexe',           fr: 'Sexe',              en: 'Sex' },
    { n: 'ddn',            fr: 'Date de naissance', en: 'Date of birth' },
    { n: 'adresse',        fr: 'Adresse',           en: 'Address' },
    { n: 'telephone',      fr: 'Téléphone',         en: 'Phone' },
    { n: 'allergies',      fr: 'Allergies (écris « aucune » s\'il n\'y en a pas)', en: 'Allergies (write “none” if there are none)' },
    { n: 'date_signature', fr: 'Date de signature', en: 'Signature date' }
  ];
  champsTxt.forEach(function(c) {
    var ok = v(c.n) !== '';
    marqueFin(c.n, ok);
    if (!ok) erreurs.push(isEn ? c.en : c.fr);
  });

  // Email (obligatoire pour envoi)
  var emailOk = v('email') !== '' && v('email').indexOf('@') > 0;
  marqueFin('email', emailOk);
  if (!emailOk) erreurs.push(isEn ? 'Email (required for sending)' : 'Courriel (requis pour l\'envoi)');

  // Consentement — LE PLUS IMPORTANT
  var consentOk = !!fd.get('consentement_global');
  var consentEl = document.querySelector('[name="consentement_global"]');
  if (consentEl) {
    consentEl.style.outline = consentOk ? '' : '3px solid #c44';
    var labelConsent = consentEl.closest('label') || consentEl.parentElement;
    if (labelConsent) labelConsent.style.background = consentOk ? '' : '#fff0f0';
    if (!consentOk && !premierChamp) premierChamp = consentEl;
  }
  if (!consentOk) erreurs.push(isEn ? '✅ Consent checkbox (mandatory)' : '✅ Case «J\'accepte» (obligatoire)');

  // Moins de 18 ans : parent ou tuteur identifié, consentement parental coché
  var mineur = !!fd.get('mineur');
  if (mineur) {
    [{ n: 'parent_nom', fr: 'Nom du parent ou tuteur', en: 'Parent or guardian name' },
     { n: 'parent_lien', fr: 'Lien avec le client', en: 'Relationship to the client' },
     { n: 'parent_tel', fr: 'Téléphone du parent ou tuteur', en: 'Parent or guardian phone' }].forEach(function(c) {
      var ok = v(c.n) !== '';
      marqueFin(c.n, ok);
      if (!ok) erreurs.push(isEn ? c.en : c.fr);
    });
    var pcOk = !!fd.get('parent_consent');
    var pcEl = document.getElementById('parent_consent');
    if (pcEl) { pcEl.style.outline = pcOk ? '' : '3px solid #c44'; if (!pcOk && !premierChamp) premierChamp = pcEl; }
    if (!pcOk) erreurs.push(isEn ? '✅ Parental consent (under 18)' : '✅ Consentement parental (moins de 18 ans)');
  }

  // Signature
  var sigOk = v('signature') !== '';
  var sigCanvas = document.getElementById('sigCanvas');
  if (sigCanvas) sigCanvas.style.outline = sigOk ? '' : '2.5px solid #c44';
  if (!sigOk) {
    erreurs.push(isEn ? 'Signature (required)' : 'Signature (requise)');
    if (!premierChamp) premierChamp = sigCanvas;
  }

  // Affichage des erreurs
  var errDiv = document.getElementById('validation-erreurs');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'validation-erreurs';
    errDiv.style.cssText = 'background:#fff0f0;border:2px solid #c44;border-radius:12px;padding:16px 20px;margin:0 0 24px;display:none;';
    form.insertBefore(errDiv, form.firstChild);
  }

  if (erreurs.length > 0) {
    errDiv.innerHTML = '<strong style="color:#c44;font-size:14px;">'
      + (isEn ? '⚠️ Please fill in the required fields:' : '⚠️ Veuillez remplir les champs obligatoires :')
      + '</strong><ul style="margin:8px 0 0;padding-left:20px;color:#8b2222;font-size:13px;">'
      + erreurs.map(function(e) { return '<li>' + e + '</li>'; }).join('')
      + '</ul>';
    errDiv.style.display = 'block';
    if (premierChamp) {
      premierChamp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function() { premierChamp.focus(); }, 400);
    } else {
      errDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return; // bloquer la soumission
  }

  // Tout est OK — cacher le bloc d'erreurs
  errDiv.style.display = 'none';
  // ─── FIN VALIDATION ────────────────────────────────────────────

  // ─── CONTRE-INDICATIONS ────────────────────────────────────────
  var santeChecked = all('sante');
  var CI = [];
  var ciRules = [
    { kw: ['Cancer'],               label: 'Cancer (actuel ou passe) — consulter le medecin traitant avant la seance; eviter les zones tumorales' },
    { kw: ['Problemes cardiaques', 'Problèmes cardiaques'], label: 'Problemes cardiaques — pression legere uniquement; eviter decubitus ventral prolonge' },
    { kw: ['Chirurgie recente', 'Chirurgie récente'], label: 'Chirurgie recente (< 2 ans) — eviter la zone operee' },
    { kw: ['Osteoporose', 'Ostéoporose'], label: 'Osteoporose — pressions tres legeres; pas de manoeuvres articulaires forcees' },
    { kw: ['Grossesse'],            label: 'Grossesse — techniques adaptees requises; eviter certains points reflexes' },
    { kw: ['Hernie discale', 'sciatalgie'], label: 'Hernie discale / sciatalgie — eviter tractions et pressions directes sur la zone' },
    { kw: ['Hypertension'],         label: 'Hypertension / hypotension — surveiller le positionnement; eviter forte pression cervicale' },
    { kw: ['Diabete', 'Diabète'],   label: 'Diabete — surveiller la sensibilite des extremites; eviter chaleur intense' },
    { kw: ['Problemes neurologiques', 'Problèmes neurologiques'], label: 'Problemes neurologiques — adapter la technique selon la condition specifique' },
  ];
  ciRules.forEach(function(rule) {
    if (santeChecked.some(function(s) {
      return rule.kw.some(function(kw) { return s.toLowerCase().includes(kw.toLowerCase()); });
    })) { CI.push(rule.label); }
  });
  // Les allergies ne sont pas une case cochee : elles montent en tete des contre-indications,
  // parce que c'est la seule qui peut se declencher pendant la seance, huile a la main.
  var allergiesTxt = v('allergies');
  if (allergiesTxt && !/^(aucune?|non|none|no|n\/a|-)$/i.test(allergiesTxt.trim())) {
    CI.unshift('ALLERGIES — ' + allergiesTxt + ' : verifier l\'huile et les produits avant la seance');
  }
  var contre_indications_str = CI.length > 0
    ? CI.map(function(c) { return '* ' + c; }).join('\n')
    : (isEn ? 'None detected' : 'Aucune detectee');
  // ──────────────────────────────────────────────────────────────

  var T = isEn ? {
    title: 'Health Intake Form', sub: 'Vitalite Boheme - Massage Therapy',
    s1: 'Personal information', s2: 'Emergency contact', s3: 'Reason for visit',
    s4: 'Pain & sensitive areas', s5: 'Health history', s6: 'Medication & treatments',
    s7: 'Consent & policies', s8: 'Signature',
    nom: 'Last name:', prenom: 'First name:', ddn: 'Date of birth:', tel: 'Phone:',
    email: 'Email:', sexe: 'Sex:', adr: 'Address:', prof: 'Occupation:', mineur: 'Under 18:', parent: 'Parent/guardian (stays in the room):', un: 'Name:', ul: 'Relationship:', ut: 'Phone:',
    motif: 'Reason:', motifd: 'Details:', zones: 'Selected areas:', none: 'None',
    allerg: 'Allergies:', sante: 'Conditions:', santea: 'Other:', santed: 'Details:',
    med: 'Medication:', medd: 'Which:', autre: 'Other treatment:',
    consok: 'Consent:', yes: 'Yes', no: 'No',
    date: 'Date:', sig: 'Signature:', gen: 'Generated on'
  } : {
    title: 'Questionnaire de sante', sub: 'Vitalite Boheme - Massotherapie',
    s1: 'Informations personnelles', s2: "Contact d'urgence", s3: 'Motif de consultation',
    s4: 'Douleurs et zones sensibles', s5: 'Historique de sante', s6: 'Medication et traitements',
    s7: 'Consentement et politiques', s8: 'Signature',
    nom: 'Nom :', prenom: 'Prenom :', ddn: 'Date de naissance :', tel: 'Telephone :',
    email: 'Courriel :', sexe: 'Sexe :', adr: 'Adresse :', prof: 'Profession :', mineur: 'Moins de 18 ans :', parent: 'Parent/tuteur (reste dans la piece) :', un: 'Nom :', ul: 'Lien :', ut: 'Telephone :',
    motif: 'Motif :', motifd: 'Precisions :', zones: 'Zones :', none: 'Aucune',
    allerg: 'Allergies :', sante: 'Conditions :', santea: 'Autre :', santed: 'Precisions :',
    med: 'Medicaments :', medd: 'Lesquels :', autre: 'Autre traitement :',
    consok: 'Consentement :', yes: 'Oui', no: 'Non',
    date: 'Date :', sig: 'Signature :', gen: 'Genere le'
  };

  // PDF
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ unit: 'pt', format: 'a4' });
  var pageW = doc.internal.pageSize.getWidth();
  var pageH = doc.internal.pageSize.getHeight();
  var M = 48; var yy = M;
  var ensure = function(h) { if (yy + h > pageH - M) { doc.addPage(); yy = M; } };

  doc.setFillColor(58, 46, 40); doc.rect(0, 0, pageW, 70, 'F');
  doc.setTextColor(201, 169, 110); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text(T.title, M, 34);
  doc.setTextColor(225, 210, 190); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(T.sub, M, 52);
  yy = 96;

  function heading(txt) {
    ensure(34);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(122, 79, 45);
    doc.text(txt, M, yy); yy += 7;
    doc.setDrawColor(201, 169, 110); doc.setLineWidth(1); doc.line(M, yy, pageW - M, yy);
    yy += 16;
  }
  function field(label, val) {
    if (!val) return;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    var lw = doc.getTextWidth(label + ' ');
    var wrapped = doc.splitTextToSize(String(val), pageW - M * 2 - lw);
    ensure(13 * wrapped.length + 4);
    doc.setTextColor(90, 70, 60); doc.text(label, M, yy);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(wrapped, M + lw, yy);
    yy += 13 * wrapped.length + 5;
  }

  heading(T.s1);
  field(T.nom, v('nom')); field(T.prenom, v('prenom')); field(T.sexe, v('sexe')); field(T.ddn, v('ddn'));
  field(T.tel, v('telephone')); field(T.email, v('email')); field(T.adr, v('adresse')); field(T.prof, v('profession'));
  if (v('mineur')) { field(T.mineur, T.yes); field(T.parent, v('parent_nom') + ' (' + v('parent_lien') + ') ' + v('parent_tel')); }

  if (v('urgence_nom') || v('urgence_lien') || v('urgence_tel')) {
    yy += 6; heading(T.s2);
    field(T.un, v('urgence_nom')); field(T.ul, v('urgence_lien')); field(T.ut, v('urgence_tel'));
  }
  yy += 6; heading(T.s3);
  field(T.motif, all('motif').join(', ')); field(T.motifd, v('motif_detail'));

  yy += 6; heading(T.s4);
  field(T.zones, v('zones') || T.none);
  var interdites = v('zones_interdites');
  if (interdites) field(isEn ? 'Areas to avoid:' : 'Zones a eviter :', interdites);

  yy += 6; heading(T.s5);
  // Les allergies passent AVANT la liste des conditions : c'est la ligne que Kevin doit voir
  // en premier, huile a la main.
  field(T.allerg, v('allergies') || T.none);
  field(T.sante, all('sante').join(', ') || T.none);
  field(T.santea, v('sante_autre')); field(T.santed, v('sante_detail'));

  yy += 6; heading(T.s6);
  field(T.med, v('medicaments'));
  field(T.medd, v('medicaments_detail')); field(T.autre, v('autre_traitement'));

  yy += 6; heading(T.s7);
  var consentOk = fd.get('consentement_global') ? '[X]' : '[ ]';
  field(consentOk, isEn ? 'All conditions read, understood and accepted' : 'Toutes les conditions lues, comprises et acceptees');

  yy += 6; heading(T.s8);
  var sig = v('signature');
  if (sig) {
    field(T.sig, ''); ensure(50);
    try { doc.addImage(sig, 'PNG', M, yy, 220, 28); } catch(err) {}
    yy += 40;
  }
  field(T.date, v('date_signature'));

  var now = new Date();
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(150, 140, 130);
  ensure(20);
  doc.text(T.gen + ' ' + now.toLocaleDateString(isEn ? 'en-CA' : 'fr-CA') + ' - bibeaukevin9@gmail.com - 438-368-3282', M, pageH - 28);

  // ─── Calcul de l'âge depuis la date de naissance ──────────────
  var ageStr = '';
  var ddnVal = v('ddn');
  if (ddnVal) {
    var partsDdn = ddnVal.split('-');
    if (partsDdn.length === 3) {
      var bYear = parseInt(partsDdn[0], 10);
      var bMonth = parseInt(partsDdn[1], 10) - 1;
      var bDay = parseInt(partsDdn[2], 10);
      var today = new Date();
      var age = today.getFullYear() - bYear;
      if (today.getMonth() < bMonth || (today.getMonth() === bMonth && today.getDate() < bDay)) age--;
      ageStr = age + 'ans';
    }
  }

  // ─── Nom du fichier : Nom_Prenom_Ageans_Metier.pdf ─────────────
  // Trie automatiquement par nom de famille dans le dossier Questionnaires
  var profStr = v('profession') || '';
  var nomFichier = [v('nom'), v('prenom'), ageStr, profStr]
    .filter(function(s) { return s && s.trim(); })
    .join('_')
    .replace(/[^a-zA-ZÀ-ÿ0-9_-]/g, '_')
    .replace(/__+/g, '_')
    + '.pdf';

  // ─── PDF : copie client seulement, JAMAIS dans le courriel ────────────────
  // ⚠ NE PAS remettre le PDF en base64 dans les variables EmailJS.
  // EmailJS refuse toute requete dont les variables depassent 50 Ko
  // (reponse HTTP 413 « Variables size limit »). Un questionnaire signe pese
  // ~430 Ko en base64, soit 8 a 9 fois la limite : le 28 juillet 2026, ajouter
  // pdf_data a bloque 100 % des envois, dans tous les navigateurs.
  // Le courriel transporte deja tout le contenu du questionnaire en texte
  // (incluant les contre-indications). La personne garde sa copie PDF via le
  // bouton de telechargement affiche apres l'envoi.
  //
  // Le telechargement vient APRES l'envoi, volontairement : dans les
  // navigateurs integres (Facebook, Messenger, Instagram), doc.save() peut
  // faire quitter la page vers une URL blob et le questionnaire serait perdu.
  window.__vbPdfDoc = doc;
  window.__vbPdfNom = nomFichier;

  // EmailJS
  var btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳ Envoi en cours…</span>';

  var templateParams = {
    client_nom:         v('prenom') + ' ' + v('nom') + (v('mineur') ? (isEn ? ' — UNDER 18' : ' — MOINS DE 18 ANS') : ''),
    name:               v('prenom') + ' ' + v('nom'),
    client_tel:         v('telephone') || '-',
    client_email:       v('email') || '-',
    email:              v('email') || '',
    motif:              all('motif').join(', ') || '-',
    motif_detail:       (v('mineur') ? (isEn ? '[UNDER 18 — parental consent signed, parent stays in the room: ' : '[MOINS DE 18 ANS — consentement parental signé, parent présent dans la pièce : ') + v('parent_nom') + ' (' + v('parent_lien') + ') ' + v('parent_tel') + '] ' : '') + (v('motif_detail') || '-'),
    zones:              v('zones') || '-',
    zones_interdites:   v('zones_interdites') || '-',
    sante:              all('sante').join(', ') || '-',
    sante_autre:        v('sante_autre') || '-',
    sante_detail:       v('sante_detail') || '-',
    medicaments:        v('medicaments') || '-',
    medicaments_detail: v('medicaments_detail') || '-',
    autre_traitement:   v('autre_traitement') || '-',
    date_signature:     v('date_signature') || '-',
    pdf_filename:       nomFichier,
    contre_indications: contre_indications_str,
    langue:             isEn ? 'EN' : 'FR',
    // Signature compressee (~10 Ko) : c'est la trace signee que la clinique
    // conserve. Le PDF complet, lui, reste chez le client.
    signature_image:    signatureCompressee()
  };

  // ─── Garde-fou : ne jamais depasser la limite de 50 Ko d'EmailJS ──────────
  // Filet de securite au cas ou quelqu'un colle un texte enorme dans un champ
  // libre. On tronque plutot que de laisser l'envoi echouer.
  (function limiterTaille() {
    var LIMITE = 45000;
    function taille() { return JSON.stringify(templateParams).length; }
    if (taille() <= LIMITE) return;

    // 1. Tronquer les champs texte. La signature est epargnee : une image
    //    coupee en deux ne s'affiche pas, autant la garder entiere ou pas du tout.
    Object.keys(templateParams).forEach(function(k) {
      var val = templateParams[k];
      if (k !== 'signature_image' && typeof val === 'string' && val.length > 2000) {
        templateParams[k] = val.slice(0, 2000) + (isEn ? ' […truncated]' : ' […tronque]');
      }
    });
    // 2. Toujours trop gros : on sacrifie la signature, pas le questionnaire.
    if (taille() > LIMITE) templateParams.signature_image = '';
    // 3. Dernier recours.
    if (taille() > LIMITE) {
      ['motif_detail', 'sante_detail', 'medicaments_detail', 'autre_traitement'].forEach(function(k) {
        templateParams[k] = isEn ? '[Too long — ask the client]' : '[Trop long — a demander au client]';
      });
    }
    console.warn('Variables tronquees pour respecter la limite EmailJS (50 Ko).');
  })();

  // Affiche le bouton « Télécharger ma copie PDF ». Le téléchargement est
  // déclenché par un vrai clic : c'est ce qui passe le mieux dans les
  // navigateurs intégrés. Et si ça échoue quand même, l'envoi est déjà fait.
  function preparerTelechargement() {
    var zone  = document.getElementById('dl-zone');
    var btnDl = document.getElementById('btn-dl-pdf');
    if (!zone || !btnDl || !window.__vbPdfDoc) return;
    zone.style.display = 'block';
    btnDl.onclick = function() {
      try {
        window.__vbPdfDoc.save(window.__vbPdfNom);
      } catch (e1) {
        try {
          window.open(window.__vbPdfDoc.output('bloburl'), '_blank');
        } catch (e2) {
          alert(isEn
            ? 'Download is not available in this browser. Your form was sent successfully.'
            : "Le telechargement n'est pas disponible dans ce navigateur. Votre questionnaire a bien ete envoye.");
        }
      }
    };
  }

  var LIBELLE_BOUTON = isEn
    ? '<span>📨 Submit my intake form</span>'
    : '<span>📨 Envoyer mon questionnaire</span>';

  // Message d'echec persistant : une alerte se ferme et ne laisse aucune
  // trace. Ici la personne garde sous les yeux quoi faire et comment joindre
  // la clinique.
  function afficherEchec(statut, detail) {
    var boite = document.getElementById('echec-msg');
    if (!boite) {
      boite = document.createElement('div');
      boite.id = 'echec-msg';
      boite.style.cssText = 'margin:20px 0;padding:18px 20px;border:2px solid #c0392b;'
        + 'border-radius:10px;background:#fdf0ee;color:#7b241c;line-height:1.5;font-size:15px;';
      btn.parentNode.insertBefore(boite, btn);
    }
    boite.innerHTML = (isEn
      ? '<strong>Your form could not be sent.</strong><br>'
        + 'Download your PDF copy with the button below and send it to us — '
        + 'or simply call us, we will complete it together.<br>'
      : "<strong>Votre questionnaire n'a pas pu etre envoye.</strong><br>"
        + 'Telechargez votre copie PDF avec le bouton ci-dessous et faites-la nous parvenir — '
        + 'ou appelez-nous simplement, on le remplira ensemble.<br>')
      + '<a href="mailto:bibeaukevin9@gmail.com" style="color:#7b241c;font-weight:600;">bibeaukevin9@gmail.com</a>'
      + ' &nbsp;·&nbsp; '
      + '<a href="tel:+14383683282" style="color:#7b241c;font-weight:600;">438-368-3282</a>'
      + '<br><span style="font-size:12px;opacity:.75;">Code technique : ' + (statut || '?') + ' ' + (detail || '') + '</span>';
    boite.style.display = 'block';
    boite.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function onSuccess() {
    // Identite capturee AVANT form.reset(), puis envoyee a la banque de clients sans bloquer.
    try { signalerBanque({ prenom: v('prenom'), nom: v('nom'), courriel: v('email'), tel: v('telephone'), lang: (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en' : 'fr' }); } catch (eB) {}
    var echec = document.getElementById('echec-msg');
    if (echec) echec.style.display = 'none';
    document.getElementById('succes-msg').style.display = 'block';
    form.reset();
    // form.reset() vide la date de signature et laisse le trace de signature
    // dessine a l'ecran : on remet la page dans un etat coherent pour un
    // eventuel 2e questionnaire.
    try { effacerSignature(); } catch (eSig) {}
    try { setDateAujourdhui(); } catch (eDate) {}
    btn.disabled = false;
    btn.innerHTML = LIBELLE_BOUTON;
    preparerTelechargement();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onError(err) {
    var statut = (err && err.status) || 0;
    var detail = (err && (err.text || err.message)) || '';
    console.error('EmailJS error:', statut, detail, err);
    btn.disabled = false;
    btn.innerHTML = LIBELLE_BOUTON;
    preparerTelechargement();
    afficherEchec(statut, detail);
  }

  // Une seule nouvelle tentative en cas de coupure reseau ou d'erreur
  // temporaire du serveur. Les erreurs de configuration (400, 413, 422) ne
  // sont pas rejouees : elles echoueraient exactement pareil.
  function envoyer(essai) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(onSuccess, function(err) {
        var statut = (err && err.status) || 0;
        var temporaire = (statut === 0 || statut === 408 || statut === 429 || statut >= 500);
        if (essai < 2 && temporaire) {
          setTimeout(function() { envoyer(essai + 1); }, 1500);
          return;
        }
        onError(err);
      });
  }

  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'VOTRE_CLE_PUBLIQUE') {
    envoyer(1);
  } else {
    onSuccess();
  }
}


// ─── ANIMATIONS AU SCROLL ──────────────────────────────────────────────────
// ⚠ Les .anim-entree sont a opacity:0 en CSS. Si rien ne leur ajoute la classe
// .visible, TOUT le questionnaire est invisible et personne ne peut le remplir.
// D'ou le filet de securite plus bas : si au bout de 3 secondes l'observateur
// n'a revele aucune section, on les affiche toutes d'un coup.
(function() {
  var elems = document.querySelectorAll('.anim-entree');
  if (!elems.length) return;

  function toutAfficher() {
    for (var i = 0; i < elems.length; i++) elems[i].classList.add('visible');
  }

  // Filet de securite — ne se declenche que si l'animation a completement
  // echoue. Si au moins une section est apparue, l'observateur fonctionne et
  // on laisse l'animation se derouler normalement au fil du defilement.
  setTimeout(function() {
    if (!document.querySelector('.anim-entree.visible')) {
      console.warn('Animation d\'entree inactive — affichage force du questionnaire.');
      toutAfficher();
    }
  }, 3000);

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elems.forEach(function(el) { obs.observe(el); });
  } else {
    // Navigateur sans IntersectionObserver : tout visible immédiatement
    toutAfficher();
  }
})();


// ─── NAVIGATEUR INTÉGRÉ (Facebook, Messenger, Instagram…) ──────────────────
// Ces navigateurs ne gèrent pas les téléchargements de fichiers générés
// dans la page. Le questionnaire part quand même, mais on prévient la
// personne avant qu'elle remplisse, pas après.
(function() {
  var ua = navigator.userAgent || '';
  var inApp = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram|Line\/|Snapchat|TikTok|Twitter/i.test(ua)
              || (/Android/i.test(ua) && /; wv\)/i.test(ua));
  if (!inApp) return;
  var el = document.getElementById('inapp-warn');
  if (el) el.style.display = 'block';
})();
