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

// ─── PROGRAMME DE RESERVATION ──────────────────────────────────
// ⛔ EmailJS a ete retire le 2026-09-10 a 22 h 45, apres le deploiement de la
// version 10 du programme. Le questionnaire part maintenant ici, avec son PDF signe.
// ⚠️ REGLE D'ORDRE, apprise a la dure le meme jour : ce fichier et le programme Google
// sont deux deploiements separes. Le site se pousse en une minute, le programme demande
// une authentification Google. Si un jour ce fichier attend une nouveaute du programme,
// DEPLOYER LE PROGRAMME D'ABORD — l'inverse casse le questionnaire en production, en
// silence, pendant que le site est ouvert au public.
var BANQUE_URL = 'https://script.google.com/macros/s/AKfycby217WbbU_K_cAUy9L1H96Yseh376VTAyT8eYxd2dCNl8Gw6pMmQEO8pi2P0rud6FLG/exec';

function signalerBanque(identite) {
  try {
    if (!BANQUE_URL || !window.fetch) return;
    fetch(BANQUE_URL, { method: 'POST', redirect: 'follow', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'fiche', prenom: identite.prenom, nom: identite.nom, courriel: identite.courriel, tel: identite.tel, lang: identite.lang, site_web: '' }) })
      .catch(function(e) { console.warn('banque clients :', e); });
  } catch (e) { console.warn('banque clients :', e); }
}

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
  // Les options d'un <select> ne peuvent pas etre doublees en data-fr / data-en : masquer
  // une <option> ne marche pas partout. Elles portent donc leur traduction sur elles-memes.
  // Sans ces deux lignes, le menu Sexe restait en francais sur toute la version anglaise.
  document.querySelectorAll('option[data-en-txt]').forEach(function(o) {
    var t = o.getAttribute(isEn ? 'data-en-txt' : 'data-fr-txt');
    if (t) o.textContent = t;
  });
  try { localStorage.setItem('vb-lang', lang); } catch(e) {}
  if (typeof renderZoneTags === 'function' && Array.isArray(zonesDouleur)) renderZoneTags();
  if (typeof updateStickerInput === 'function' && Array.isArray(stickers)) updateStickerInput();   // au chargement, les collants n'existent pas encore
  // Les infobulles des collants ⊘ sont ecrites a la main a la pose : on les repasse
  // dans la nouvelle langue, sinon elles restent dans celle du moment ou on a clique.
  try {
    document.querySelectorAll('.collant-douleur').forEach(function(c) {
      c.title = (c.dataset.zones || '').split('|').map(zoneLabel).join(', ') + (isEn ? ' — tap to remove' : ' — toucher pour retirer');
    });
    document.querySelectorAll('.zone-interdit-sticker').forEach(function(s) {
      var z = s.dataset.zone || '';
      s.title = (isEn ? translateZoneInterditEN(z) + ' — click to remove' : z + ' — cliquer pour retirer');
    });
  } catch (e) {}
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
  if (currentLang !== 'en') return nomFr;
  return ZONE_EN[nomFr] || REGIONS_EN[nomFr] || nomFr;
}

// ─── LE CORPS : un point qui grandit, des étiquettes unies, les muscles dessous ──────────────
// images/corps-regions.png, 768 × 512 :
//   alpha = le corps ; rouge = n° de la région × 8 (REGIONS, ne pas réordonner : 26 et 27 ajoutés à la fin) ;
//   vert  = n° du groupe musculaire (GROUPES).
// La carte des groupes est tirée de BodyParts3D (© DBCLS, CC BY 4.0) : son crédit est DANS le fichier PNG.
var REGIONS = ["Tête", "Cou", "Nuque", "Épaule droite", "Épaule gauche", "Bras droit", "Bras gauche",
  "Main droite", "Main gauche", "Poitrine", "Ventre", "Haut du dos", "Bas du dos",
  "Hanche droite", "Hanche gauche", "Fessier droit", "Fessier gauche", "Cuisse droite",
  "Cuisse gauche", "Genou droit", "Genou gauche", "Jambe droite", "Jambe gauche",
  "Pied droit", "Pied gauche", "Avant-bras droit", "Avant-bras gauche"];
var REGIONS_EN = { "Tête": "Head", "Cou": "Neck (front)", "Nuque": "Back of the neck", "Épaule droite": "Right shoulder",
  "Épaule gauche": "Left shoulder", "Bras droit": "Right upper arm", "Bras gauche": "Left upper arm", "Main droite": "Right hand",
  "Main gauche": "Left hand", "Poitrine": "Chest", "Ventre": "Abdomen", "Haut du dos": "Upper back", "Bas du dos": "Lower back",
  "Hanche droite": "Right hip", "Hanche gauche": "Left hip", "Fessier droit": "Right glute", "Fessier gauche": "Left glute",
  "Cuisse droite": "Right thigh", "Cuisse gauche": "Left thigh", "Genou droit": "Right knee", "Genou gauche": "Left knee",
  "Jambe droite": "Right lower leg", "Jambe gauche": "Left lower leg", "Pied droit": "Right foot", "Pied gauche": "Left foot",
  "Avant-bras droit": "Right forearm", "Avant-bras gauche": "Left forearm",
  // les noms unis
  "Épaules": "Shoulders", "Les deux bras": "Both upper arms", "Les deux avant-bras": "Both forearms", "Mains": "Hands",
  "Hanches": "Hips", "Fessiers": "Glutes", "Cuisses": "Thighs", "Genoux": "Knees", "Jambes": "Lower legs", "Pieds": "Feet",
  "Dos": "Back", "Tout le cou": "Whole neck", "Tout le bras droit": "Whole right arm", "Tout le bras gauche": "Whole left arm",
  "Toute la jambe droite": "Whole right leg", "Toute la jambe gauche": "Whole left leg",
  "Les deux bras au complet": "Both arms, whole", "Les deux jambes au complet": "Both legs, whole", "Corps entier": "Whole body" };
// n° du groupe → [clé, côté] (58 groupes)
var GROUPES = {1: ['achille', 'droit'], 2: ['achille', 'gauche'], 3: ['adducteurs', 'droit'], 4: ['adducteurs', 'gauche'], 5: ['biceps', 'droit'], 6: ['biceps', 'gauche'], 7: ['cou', ''], 8: ['deltoide_arriere', 'droit'], 9: ['deltoide_arriere', 'gauche'], 10: ['deltoide_avant', 'droit'], 11: ['deltoide_avant', 'gauche'], 12: ['dessus_pied', 'droit'], 13: ['dessus_pied', 'gauche'], 14: ['dos_main', 'droit'], 15: ['dos_main', 'gauche'], 16: ['extenseurs_ab', 'droit'], 17: ['extenseurs_ab', 'gauche'], 18: ['flechisseurs_ab', 'droit'], 19: ['flechisseurs_ab', 'gauche'], 20: ['flechisseurs_hanche', 'droit'], 21: ['flechisseurs_hanche', 'gauche'], 22: ['genou', 'droit'], 23: ['genou', 'gauche'], 24: ['grand_dorsal', 'droit'], 25: ['grand_dorsal', 'gauche'], 26: ['grand_droit', ''], 27: ['grand_fessier', 'droit'], 28: ['grand_fessier', 'gauche'], 29: ['ischio', 'droit'], 30: ['ischio', 'gauche'], 31: ['jambier', 'droit'], 32: ['jambier', 'gauche'], 33: ['lombaires', 'droit'], 34: ['lombaires', 'gauche'], 35: ['machoire', 'droit'], 36: ['machoire', 'gauche'], 37: ['mollet', 'droit'], 38: ['mollet', 'gauche'], 39: ['moyen_fessier', 'droit'], 40: ['moyen_fessier', 'gauche'], 41: ['nuque', ''], 42: ['obliques', 'droit'], 43: ['obliques', 'gauche'], 44: ['omoplate', 'droit'], 45: ['omoplate', 'gauche'], 46: ['paume', 'droit'], 47: ['paume', 'gauche'], 48: ['pectoral', 'droit'], 49: ['pectoral', 'gauche'], 50: ['quadriceps', 'droit'], 51: ['quadriceps', 'gauche'], 52: ['tete', ''], 53: ['trapeze_moyen', 'droit'], 54: ['trapeze_moyen', 'gauche'], 55: ['trapeze_sup', 'droit'], 56: ['trapeze_sup', 'gauche'], 57: ['triceps', 'droit'], 58: ['triceps', 'gauche']};
// Les mots des muscles (les mots du massothérapeute), [un côté, les deux côtés]. Vide = déjà dit par l'étiquette.
var MUSCLES_FR = {
  tete: ['', ''], machoire: ['masséter et temporal', 'masséters et temporaux'], cou: ['SCM et scalènes', 'SCM et scalènes'],
  nuque: ['cervicales', 'cervicales'], trapeze_sup: ['trapèze supérieur', 'trapèzes supérieurs'],
  trapeze_moyen: ['trapèze moyen', 'trapèzes moyens'], omoplate: ['infra-épineux et ronds', 'infra-épineux et ronds'],
  deltoide_avant: ['deltoïde antérieur', 'deltoïdes antérieurs'], deltoide_arriere: ['deltoïde postérieur', 'deltoïdes postérieurs'],
  pectoral: ['grand pectoral', 'grands pectoraux'], grand_dorsal: ['grand dorsal', 'grands dorsaux'],
  biceps: ['biceps', 'biceps'], triceps: ['triceps', 'triceps'], flechisseurs_ab: ['fléchisseurs', 'fléchisseurs'],
  extenseurs_ab: ['extenseurs', 'extenseurs'], paume: ['paume', 'paumes'], dos_main: ['dos de la main', 'dos des mains'],
  grand_droit: ['grand droit', 'grand droit'], obliques: ['oblique', 'obliques'],
  flechisseurs_hanche: ['fléchisseurs de la hanche', 'fléchisseurs des hanches'], adducteurs: ['adducteurs', 'adducteurs'],
  quadriceps: ['quadriceps', 'quadriceps'], genou: ['', ''], jambier: ['jambier antérieur', 'jambiers antérieurs'],
  mollet: ['gastrocnémien et soléaire', 'gastrocnémiens et soléaires'], dessus_pied: ['', ''],
  achille: ["tendon d'Achille", "tendons d'Achille"], lombaires: ['lombaires', 'lombaires'],
  grand_fessier: ['grand fessier', 'grands fessiers'], moyen_fessier: ['moyen fessier', 'moyens fessiers'],
  ischio: ['ischio-jambiers', 'ischio-jambiers'] };
var MUSCLES_EN = {
  tete: ['', ''], machoire: ['masseter and temporalis', 'masseters and temporalis'], cou: ['SCM and scalenes', 'SCM and scalenes'],
  nuque: ['cervical muscles', 'cervical muscles'], trapeze_sup: ['upper trapezius', 'upper trapezius'],
  trapeze_moyen: ['middle trapezius', 'middle trapezius'], omoplate: ['infraspinatus and teres', 'infraspinatus and teres'],
  deltoide_avant: ['anterior deltoid', 'anterior deltoids'], deltoide_arriere: ['posterior deltoid', 'posterior deltoids'],
  pectoral: ['pectoralis major', 'pectoralis major'], grand_dorsal: ['latissimus dorsi', 'latissimus dorsi'],
  biceps: ['biceps', 'biceps'], triceps: ['triceps', 'triceps'], flechisseurs_ab: ['forearm flexors', 'forearm flexors'],
  extenseurs_ab: ['forearm extensors', 'forearm extensors'], paume: ['palm', 'palms'], dos_main: ['back of the hand', 'backs of the hands'],
  grand_droit: ['rectus abdominis', 'rectus abdominis'], obliques: ['oblique', 'obliques'],
  flechisseurs_hanche: ['hip flexors', 'hip flexors'], adducteurs: ['adductors', 'adductors'],
  quadriceps: ['quadriceps', 'quadriceps'], genou: ['', ''], jambier: ['tibialis anterior', 'tibialis anterior'],
  mollet: ['gastrocnemius and soleus', 'gastrocnemius and soleus'], dessus_pied: ['', ''],
  achille: ['Achilles tendon', 'Achilles tendons'], lombaires: ['lumbar muscles', 'lumbar muscles'],
  grand_fessier: ['gluteus maximus', 'gluteus maximus'], moyen_fessier: ['gluteus medius', 'gluteus medius'],
  ischio: ['hamstrings', 'hamstrings'] };
var ORDRE_MUSCLES = Object.keys(MUSCLES_FR);
var MASQUE_W = 768, MASQUE_H = 512, COUPE = 402;   // COUPE : la colonne vide entre la vue de face et la vue de dos
var masqueRegions = null, REG = null, GRP = null, PX_REG = null, TOT_VUE = [0, 0];
(function () {
  var im = new Image();
  im.onload = function () {
    try {
      var c = document.createElement('canvas'); c.width = MASQUE_W; c.height = MASQUE_H;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0, MASQUE_W, MASQUE_H);
      var d = x.getImageData(0, 0, MASQUE_W, MASQUE_H).data;
      REG = new Uint8Array(MASQUE_W * MASQUE_H); GRP = new Uint8Array(MASQUE_W * MASQUE_H);
      PX_REG = []; for (var k = 0; k <= REGIONS.length; k++) PX_REG.push([0, 0]);
      for (var i = 0; i < MASQUE_W * MASQUE_H; i++) {
        if (d[i * 4 + 3] < 128) continue;
        var r = Math.round(d[i * 4] / 8); if (!r) continue;
        var v = (i % MASQUE_W) < COUPE ? 0 : 1;
        REG[i] = r; GRP[i] = d[i * 4 + 1]; PX_REG[r][v]++; TOT_VUE[v]++;
      }
      masqueRegions = d;
    } catch (e) { console.warn('carte du corps :', e); }
  };
  im.src = 'images/corps-regions.png?v=20261126z';   // ⚠️ changer ce numéro si la carte change (cache)
})();
function regionAuPixel(x, y) {
  if (!REG || x < 0 || y < 0 || x >= MASQUE_W || y >= MASQUE_H) return 0;
  return REG[y * MASQUE_W + x];
}
/* La région sous un point (le collant ⊘) : celle du pixel, ou la plus proche si on a touché juste à côté du corps. */
function regionsSous(xPct, yPct, rayonPx, largeurPx) {
  if (!REG) return null;
  var cx = Math.round(xPct / 100 * MASQUE_W), cy = Math.round(yPct / 100 * MASQUE_H);
  var k = regionAuPixel(cx, cy); if (k) return [REGIONS[k - 1]];
  var lim = Math.max(6, rayonPx * MASQUE_W / largeurPx * 1.3), best = 0, bd = 1e9, d, x, y;
  for (y = Math.floor(cy - lim); y <= cy + lim; y++) for (x = Math.floor(cx - lim); x <= cx + lim; x++) {
    k = regionAuPixel(x, y); if (!k) continue;
    d = (x - cx) * (x - cx) + (y - cy) * (y - cy); if (d < bd && d <= lim * lim) { bd = d; best = k; }
  }
  return best ? [REGIONS[best - 1]] : [];
}
/* Ce que touchent des ronds (centre et rayon en pixels de la carte) : les régions, et dans chacune ses groupes.
   Une région compte si elle fait 12 % de ce qu'un rond couvre, ou si un rond en couvre 35 % ; un groupe compte
   s'il fait 15 % de ce que le rond couvre de sa région. 85 % d'une silhouette couverte = le corps entier. */
function analyserCorps(ronds) {
  var vu = new Uint8Array(MASQUE_W * MASQUE_H), couvert = [0, 0], garde = {}, grpParReg = {};
  ronds.forEach(function (rd) {
    var cR = {}, cG = {}, tot = 0, x, y;
    var x0 = Math.max(0, Math.floor(rd.x - rd.r)), x1 = Math.min(MASQUE_W - 1, Math.ceil(rd.x + rd.r));
    var y0 = Math.max(0, Math.floor(rd.y - rd.r)), y1 = Math.min(MASQUE_H - 1, Math.ceil(rd.y + rd.r));
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      if ((x - rd.x) * (x - rd.x) + (y - rd.y) * (y - rd.y) > rd.r * rd.r) continue;
      var i = y * MASQUE_W + x, k = REG[i]; if (!k) continue;
      var v = x < COUPE ? 0 : 1, cle = k + '|' + v, g = GRP[i];
      cR[cle] = (cR[cle] || 0) + 1; tot++;
      cG[k] = cG[k] || {}; cG[k][g] = (cG[k][g] || 0) + 1;
      if (!vu[i]) { vu[i] = 1; couvert[v]++; }
    }
    var une = false;
    Object.keys(cR).forEach(function (cle) {
      var p = cle.split('|'), k = +p[0], v = +p[1], n = cR[cle];
      if (n >= tot * 0.12 || n >= PX_REG[k][v] * 0.35) { garde[k] = 1; une = true; }
    });
    if (!une && tot) {   // un tout petit point : la région qui en a le plus
      var meilleure = Object.keys(cR).sort(function (a, b) { return cR[b] - cR[a]; })[0];
      garde[+meilleure.split('|')[0]] = 1;
    }
    Object.keys(cG).forEach(function (k) {
      var t = 0; Object.keys(cG[k]).forEach(function (g) { t += cG[k][g]; });
      Object.keys(cG[k]).forEach(function (g) {
        if (cG[k][g] >= t * 0.15) { grpParReg[k] = grpParReg[k] || {}; grpParReg[k][g] = 1; }
      });
    });
  });
  var entier = couvert[0] >= TOT_VUE[0] * 0.85 || couvert[1] >= TOT_VUE[1] * 0.85;
  return { regions: Object.keys(garde).map(function (k) { return REGIONS[k - 1]; }), grpParReg: grpParReg, entier: entier };
}
/* Les étiquettes unies : deux côtés → le pluriel ; haut + bas du dos → Dos ; bras + avant-bras → tout le bras ;
   cuisse + jambe → toute la jambe ; ce qui ne se touche pas reste séparé. Chaque étiquette garde ses régions. */
var PAIRES_UNIES = [["Tout le bras droit", "Tout le bras gauche", "Les deux bras au complet"],
  ["Toute la jambe droite", "Toute la jambe gauche", "Les deux jambes au complet"],
  ["Épaule droite", "Épaule gauche", "Épaules"], ["Bras droit", "Bras gauche", "Les deux bras"],
  ["Avant-bras droit", "Avant-bras gauche", "Les deux avant-bras"], ["Main droite", "Main gauche", "Mains"],
  ["Hanche droite", "Hanche gauche", "Hanches"], ["Fessier droit", "Fessier gauche", "Fessiers"],
  ["Cuisse droite", "Cuisse gauche", "Cuisses"], ["Genou droit", "Genou gauche", "Genoux"],
  ["Jambe droite", "Jambe gauche", "Jambes"], ["Pied droit", "Pied gauche", "Pieds"]];
var TOUTS_UNIS = [["Dos", ["Haut du dos", "Bas du dos"], []], ["Tout le cou", ["Cou", "Nuque"], []],
  ["Tout le bras droit", ["Bras droit", "Avant-bras droit"], ["Main droite"]],
  ["Tout le bras gauche", ["Bras gauche", "Avant-bras gauche"], ["Main gauche"]],
  ["Toute la jambe droite", ["Cuisse droite", "Jambe droite"], ["Genou droit", "Pied droit"]],
  ["Toute la jambe gauche", ["Cuisse gauche", "Jambe gauche"], ["Genou gauche", "Pied gauche"]]];
function unirZones(regions, entier) {
  if (entier || REGIONS.every(function (n) { return regions.indexOf(n) >= 0; }))
    return [{ nom: 'Corps entier', membres: REGIONS.slice(), deux: true }];
  var et = regions.map(function (n) { return { nom: n, membres: [n], deux: false }; });
  function trouve(n) { for (var i = 0; i < et.length; i++) if (et[i].nom === n) return et[i]; return null; }
  TOUTS_UNIS.forEach(function (t) {
    if (!t[1].every(trouve)) return;
    var membres = [];
    t[1].concat(t[2]).forEach(function (n) { var e = trouve(n); if (e) { membres = membres.concat(e.membres); et.splice(et.indexOf(e), 1); } });
    et.push({ nom: t[0], membres: membres, deux: false });
  });
  PAIRES_UNIES.forEach(function (p) {
    var a = trouve(p[0]), b = trouve(p[1]); if (!a || !b) return;
    et.splice(et.indexOf(a), 1); et.splice(et.indexOf(b), 1);
    et.push({ nom: p[2], membres: a.membres.concat(b.membres), deux: true });
  });
  function rang(e) {   // de la tête aux pieds ; l'avant-bras se range avec le bras
    return Math.min.apply(null, e.membres.map(function (m) { var i = REGIONS.indexOf(m); return i === 25 ? 5.5 : i === 26 ? 6.5 : i; }));
  }
  return et.sort(function (a, b) { return rang(a) - rang(b); });
}
/* Les muscles d'une étiquette (clés de MUSCLES_FR), de la tête aux pieds. Rien sous « Corps entier ». */
function musclesDe(e, grpParReg) {
  if (e.nom === 'Corps entier') return [];
  var cles = {};
  e.membres.forEach(function (m) {
    var k = REGIONS.indexOf(m) + 1, gs = grpParReg[k] || {};
    Object.keys(gs).forEach(function (g) { var x = GROUPES[g]; if (x && MUSCLES_FR[x[0]] && MUSCLES_FR[x[0]][0]) cles[x[0]] = 1; });
  });
  return Object.keys(cles).sort(function (a, b) { return ORDRE_MUSCLES.indexOf(a) - ORDRE_MUSCLES.indexOf(b); });
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
  return ZONE_INTERDITES_EN[nom] || REGIONS_EN[nom] || nom;
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

// Les collants de douleur : { el, x, y (en % de l'image), d (diamètre en fraction de sa largeur) }.
// Une touche pose un petit point (il nomme ce qui est sous le doigt) ; garder le doigt
// appuyé l'agrandit jusqu'au corps entier ; une touche dessus l'enlève (dans un cercle d'au moins 22 px :
// le doigt est plus gros que le point).
var COLLANT_POINT = 0.004, COLLANT_MAX = 0.8, APPUI_LONG_MS = 380, POUSSE_PAR_S = 0.22;
function largeurCorps() { var w = document.getElementById('corps-wrap'); return (w && w.getBoundingClientRect().width) || 1; }
function rayonCollantPx(c) { return Math.max(11, c.d * largeurCorps() / 2); }
function dessinerCollant(c) {
  var r = rayonCollantPx(c);
  c.el.style.left = c.x.toFixed(2) + '%'; c.el.style.top = c.y.toFixed(2) + '%';
  c.el.style.width = c.el.style.height = Math.round(r * 2) + 'px';
  if (c.el.classList) c.el.classList.toggle('point', r < 12);
}
function etiquettesDouleur() {
  if (!REG || !zonesDouleur.length) return [];
  var a = analyserCorps(zonesDouleur.map(function (c) {
    return { x: c.x / 100 * MASQUE_W, y: c.y / 100 * MASQUE_H, r: Math.max(1, c.d / 2 * MASQUE_W) };
  }));
  return unirZones(a.regions, a.entier).map(function (e) { return { nom: e.nom, deux: e.deux, muscles: musclesDe(e, a.grpParReg) }; });
}
function motsMuscles(e, lang) {
  var T = lang === 'en' ? MUSCLES_EN : MUSCLES_FR;
  return e.muscles.map(function (k) { return T[k][e.deux ? 1 : 0]; });
}
// Ancien nom gardé : applyLang() l'appelle.
function nomsDouleur() { return etiquettesDouleur().map(function (e) { return e.nom; }); }

function renderZoneTags() {
  var et = etiquettesDouleur();
  // Le texte envoyé est toujours en français,
  // « Dos (trapèze moyen · grand dorsal · lombaires), Épaules (deltoïdes postérieurs) ».
  document.getElementById('zones-input').value = et.map(function (e) {
    var m = motsMuscles(e, 'fr'); return e.nom + (m.length ? ' (' + m.join(' · ') + ')' : '');
  }).join(', ');
  var container = document.getElementById('zones-tags');
  if (!et.length) {
    container.innerHTML = '<em style="color:#c0b0a0;font-size:13px">' + (currentLang === 'en' ? 'No area selected' : 'Aucune zone sélectionnée') + '</em>';
    return;
  }
  // E1 : la partie du corps en or dans l'étiquette noire, ses muscles en petit dessous.
  container.innerHTML = et.map(function (e) {
    var m = motsMuscles(e, currentLang);
    return '<span class="zone-tag"><b>' + zoneLabel(e.nom) + '</b>' + (m.length ? '<small>' + m.join(' · ') + '</small>' : '') + '</span>';
  }).join('');
}

function poserCollant(xPct, yPct) {
  var wrap = document.getElementById('corps-wrap');
  var el = document.createElement('div');
  el.className = 'collant-douleur';
  var c = { el: el, x: xPct, y: yPct, d: COLLANT_POINT };
  wrap.appendChild(el); dessinerCollant(c);
  zonesDouleur.push(c); renderZoneTags();
  return c;
}
function enleverCollant(c) {
  if (c.el && c.el.parentNode) c.el.parentNode.removeChild(c.el);
  zonesDouleur = zonesDouleur.filter(function (x) { return x !== c; });
  renderZoneTags();
}
function collantSous(xPct, yPct) {
  var w = document.getElementById('corps-wrap').getBoundingClientRect(), best = null;
  zonesDouleur.forEach(function (c) {
    var dx = (xPct - c.x) / 100 * w.width, dy = (yPct - c.y) / 100 * w.height, r = Math.max(22, rayonCollantPx(c));
    if (dx * dx + dy * dy <= r * r && (!best || c.d < best.d)) best = c;   // le plus petit d'abord
  });
  return best;
}
// La zone génitale : on n'y pose rien. Le carré d'avant (x 21–33 %, y 44–49 %) couvrait les deux hanches.
function zoneGenitale(xPct, yPct) { return xPct >= 25 && xPct <= 29 && yPct >= 44 && yPct <= 49.5; }

// Le doigt sur le corps : touche courte = poser ou enlever ; appui long = le collant grandit tant qu'on tient.
var appuiCorps = null;
(function brancherCorps() {
  var wrap = document.getElementById('corps-wrap');
  if (!wrap || !window.PointerEvent) return;
  function pos(e) { var r = wrap.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; }
  wrap.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  wrap.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('.zone-interdit-sticker')) return;
    var p = pos(e), a = { p: p, sur: stickerMode ? null : collantSous(p.x, p.y), pousse: null, bouge: false };
    appuiCorps = a;
    if (stickerMode) return;
    a.minuterie = setTimeout(function () {
      if (appuiCorps !== a || a.bouge) return;
      var c = a.sur || ((zoneGenitale(p.x, p.y) || !REG) ? null : poserCollant(p.x, p.y));
      if (!c) return;
      a.pousse = c;
      var t0 = performance.now(), d0 = c.d;
      (function boucle(t) {
        if (appuiCorps !== a) return;
        c.d = Math.min(COLLANT_MAX, d0 + (t - t0) / 1000 * POUSSE_PAR_S);
        dessinerCollant(c); renderZoneTags();
        if (c.d < COLLANT_MAX) requestAnimationFrame(boucle);
      })(t0);
    }, APPUI_LONG_MS);
  });
  wrap.addEventListener('pointermove', function (e) {
    var a = appuiCorps; if (!a || a.pousse) return;
    var p = pos(e); if (Math.abs(p.x - a.p.x) + Math.abs(p.y - a.p.y) > 3) a.bouge = true;   // il fait défiler la page
  });
  // Pendant qu'il grandit, le doigt ne fait pas défiler la page.
  wrap.addEventListener('touchmove', function (e) { if (appuiCorps && appuiCorps.pousse) e.preventDefault(); }, { passive: false });
  function fin(e) {
    var a = appuiCorps; if (!a) return;
    clearTimeout(a.minuterie); appuiCorps = null;
    if (a.pousse || a.bouge || e.type === 'pointercancel') return;
    if (stickerMode) { placerSticker(e); return; }
    if (a.sur) { enleverCollant(a.sur); return; }
    if (!zoneGenitale(a.p.x, a.p.y) && REG) poserCollant(a.p.x, a.p.y);
  }
  wrap.addEventListener('pointerup', fin);
  wrap.addEventListener('pointercancel', fin);
  window.addEventListener('resize', function () { zonesDouleur.forEach(dessinerCollant); });
})();

// ─── MODE COLLANTS ⊘ ───────────────────────────────────────────
function toggleStickerMode() {
  stickerMode = !stickerMode;
  var btn = document.getElementById('btn-mode-interdit');
  btn.className = 'mode-corps-btn' + (stickerMode ? ' active-interdit' : '');
  document.getElementById('sticker-tools').style.display = stickerMode ? 'flex' : 'none';
  document.getElementById('corps-wrap').style.cursor = stickerMode ? 'crosshair' : '';
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
  if (e.target.closest && e.target.closest('.zone-interdit-sticker, .collant-douleur')) return;
  var wrap = document.getElementById('corps-wrap');
  var rect = wrap.getBoundingClientRect();
  var src = e.touches ? e.touches[0] : e;
  var xPct = (src.clientX - rect.left) / rect.width * 100;
  var yPct = (src.clientY - rect.top)  / rect.height * 100;
  if (zoneGenitale(xPct, yPct)) return;
  // Le nom du collant ⊘ : la région du corps sous le doigt.
  var trouve = regionsSous(xPct, yPct, 4, rect.width);
  if (!trouve || !trouve.length) return;
  var zoneName = trouve[0];
  var sticker = document.createElement('div');
  sticker.className = 'zone-interdit-sticker';
  sticker.style.left = xPct.toFixed(2) + '%';
  sticker.style.top  = yPct.toFixed(2) + '%';
  sticker.dataset.zone = zoneName;
  sticker.innerHTML = makeStickerSVG();
  sticker.title = (currentLang === 'en' ? translateZoneInterditEN(zoneName) + ' — click to remove' : zoneName + ' — cliquer pour retirer');
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

/**
 * Remet le corps a neuf : marques de douleur et collants ⊘ effaces.
 * ⚠️ form.reset() ne touche pas a ces deux-la — ce sont des elements du DOM, pas des
 * champs. Sans cet appel, une personne qui remplissait le questionnaire apres une autre
 * sur la meme tablette voyait les zones de la precedente, et les renvoyait a son nom.
 */
function reinitialiserCorps() {
  try {
    zonesDouleur.forEach(function(c) { if (c && c.el && c.el.parentNode) c.el.parentNode.removeChild(c.el); });
    zonesDouleur = [];
    renderZoneTags();
  } catch (e) { console.warn('zones de douleur :', e); }
  try { clearStickers(); } catch (e) { console.warn('collants :', e); }
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

  // Les noms s'unissent comme ceux de la douleur (deux côtés → pluriel, haut + bas du dos → Dos…).
  zones = unirZones(zones, false).map(function (e) { return e.nom; });
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
// on garde la signature legere : elle voyage avec le reste du questionnaire.
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

  // ─── Les deux dates doivent être de vraies dates ───────────────
  // ⚠️ Jusqu'au 2026-09-11, la validation regardait seulement si le champ était vide.
  // Un dossier est arrivé signé « 2209-00-02 » : le formatage force bien AAAA-MM-JJ,
  // mais rien ne vérifiait que les chiffres formaient une date qui existe. La date de
  // naissance est exigée nommément par l'article 9.1.1 du RMPQ : fausse, elle ne vaut rien.
  function dateReelle(txt) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((txt || '').trim());
    if (!m) return null;
    var a = +m[1], mo = +m[2], j = +m[3];
    if (mo < 1 || mo > 12 || j < 1 || j > 31) return null;
    var d = new Date(a, mo - 1, j);
    if (d.getFullYear() !== a || d.getMonth() !== mo - 1 || d.getDate() !== j) return null;
    return d;
  }
  var demain = new Date(); demain.setHours(0, 0, 0, 0); demain.setDate(demain.getDate() + 1);

  if (v('ddn')) {
    var dNaiss = dateReelle(v('ddn'));
    var ddnOk = !!dNaiss && dNaiss < demain && dNaiss.getFullYear() >= 1900;
    marqueFin('ddn', ddnOk);
    if (!ddnOk) erreurs.push(isEn
      ? 'Date of birth — enter a real date (YYYY-MM-DD)'
      : 'Date de naissance — indiquez une date réelle (AAAA-MM-JJ)');
  }
  if (v('date_signature')) {
    var dSig = dateReelle(v('date_signature'));
    var sigDateOk = !!dSig && dSig < demain;
    marqueFin('date_signature', sigDateOk);
    if (!sigDateOk) erreurs.push(isEn
      ? 'Signature date — enter a real date (YYYY-MM-DD), not in the future'
      : 'Date de signature — indiquez une date réelle (AAAA-MM-JJ), pas dans le futur');
  }

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
  if (!consentOk) erreurs.push(isEn ? 'Consent checkbox (mandatory)' : 'Case « J\'accepte » (obligatoire)');

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
    if (!pcOk) erreurs.push(isEn ? 'Parental consent (under 18)' : 'Consentement parental (moins de 18 ans)');
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
      + (isEn ? 'Please fill in the required fields:' : 'Veuillez remplir les champs obligatoires :')
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
    // ⚠️ Les `kw` servent à reconnaître les cases cochées : ne PAS y toucher, les deux
    // graphies (avec et sans accent) sont là exprès. Les `label`, eux, sont lus par Kevin
    // dans le courriel et par le client dans le PDF : ils s'écrivent en bon français.
    // Vérifié le 2026-09-11 sur un PDF réel : jsPDF rend é, è, à et — sans problème.
    { kw: ['Cancer'],               label: 'Cancer (actuel ou passé) — consulter le médecin traitant avant la séance; éviter les zones tumorales' },
    { kw: ['Problemes cardiaques', 'Problèmes cardiaques'], label: 'Problèmes cardiaques — pression légère uniquement; éviter le décubitus ventral prolongé' },
    { kw: ['Chirurgie recente', 'Chirurgie récente'], label: 'Chirurgie récente (moins de 2 ans) — éviter la zone opérée' },
    { kw: ['Osteoporose', 'Ostéoporose'], label: 'Ostéoporose — pressions très légères; pas de manœuvres articulaires forcées' },
    { kw: ['Grossesse'],            label: 'Grossesse — techniques adaptées requises; éviter certains points réflexes' },
    { kw: ['Hernie discale', 'sciatalgie'], label: 'Hernie discale / sciatalgie — éviter tractions et pressions directes sur la zone' },
    { kw: ['Hypertension'],         label: 'Hypertension / hypotension — surveiller le positionnement; éviter forte pression cervicale' },
    { kw: ['Diabete', 'Diabète'],   label: 'Diabète — surveiller la sensibilité des extrémités; éviter la chaleur intense' },
    { kw: ['Problemes neurologiques', 'Problèmes neurologiques'], label: 'Problèmes neurologiques — adapter la technique selon la condition spécifique' },
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
    // ⚠️ Les ingredients du gel vivent ICI, dans ce que KEVIN lit — jamais dans la question
    // posee au client. Kevin, 2026-09-10 : « ne mets pas la charge sur mes clients ».
    // C'est lui qui recoupe; le client dit seulement ce a quoi il reagit.
    //
    // ⭐ 2026-09-11, demande de Kevin : la liste des ingredients ne sort QUE si l'allergie
    // declaree peut les toucher. Une allergie a la penicilline n'a rien a voir avec le gel,
    // et la liste devenait du bruit qu'on finit par ne plus lire.
    // ⚠️ La liste ci-dessous est volontairement LARGE et joue la prudence : un mot de
    // famille (« noix », « fruits a coque », « huile », « alimentaire ») suffit a la faire
    // sortir, parce que le cout d'un affichage de trop est nul, et celui d'un oubli ne l'est
    // pas. Elle ne remplace pas le jugement : une formulation qu'elle ne connait pas passera
    // sans declencher le rappel, et c'est Kevin qui recoupe.
    var MOTS_GEL = [
      // les ingredients eux-memes
      'carthame', 'safflower', 'raisin', 'pepin', 'pépin', 'grape', 'tournesol', 'sunflower',
      'karite', 'karité', 'shea', 'mangue', 'mango', 'vitamine e', 'vitamin e', 'tocopherol',
      // les familles auxquelles ils appartiennent
      'noix', 'noisette', 'amande', 'almond', 'cajou', 'cashew', 'pistache', 'pistachio',
      'arachide', 'cacahu', 'peanut', 'coque', 'nut', 'anacard', 'sesame', 'sésame',
      // les formulations vagues, qui appellent justement une verification
      'huile', 'oil', 'creme', 'crème', 'cream', 'lotion', 'gel', 'graine', 'seed',
      'alimentaire', 'food', 'plusieurs', 'nombreuses', 'multiple', 'fruit'
    ];
    var a = allergiesTxt.toLowerCase();
    var toucheLeGel = MOTS_GEL.some(function(mot) { return a.indexOf(mot) >= 0; });
    CI.unshift('ALLERGIES DÉCLARÉES — ' + allergiesTxt
      + (toucheLeGel
        ? '\n    Gel Pur Spa : carthame, pépins de raisin, tournesol, beurre de karité,'
          + '\n    beurre de mangue, vitamine E. Le karité vient d\'une noix; la mangue est de'
          + '\n    la même famille que la noix de cajou et la pistache. À recouper avant la séance.'
        : ''));
  }
  var contre_indications_str = CI.length > 0
    ? CI.map(function(c) { return '* ' + c; }).join('\n')
    : (isEn ? 'None detected' : 'Aucune détectée');
  // ──────────────────────────────────────────────────────────────

  var T = isEn ? {
    title: 'Health Intake Form', sub: 'Vitalité Bohème - Massage Therapy',
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
    title: 'Questionnaire de santé', sub: 'Vitalité Bohème - Massothérapie',
    s1: 'Informations personnelles', s2: "Contact d'urgence", s3: 'Motif de consultation',
    s4: 'Douleurs et zones sensibles', s5: 'Historique de santé', s6: 'Médication et traitements',
    s7: 'Consentement et politiques', s8: 'Signature',
    nom: 'Nom :', prenom: 'Prénom :', ddn: 'Date de naissance :', tel: 'Téléphone :',
    email: 'Courriel :', sexe: 'Sexe :', adr: 'Adresse :', prof: 'Profession :', mineur: 'Moins de 18 ans :', parent: 'Parent/tuteur (reste dans la pièce) :', un: 'Nom :', ul: 'Lien :', ut: 'Téléphone :',
    motif: 'Motif :', motifd: 'Précisions :', zones: 'Zones :', none: 'Aucune',
    allerg: 'Allergies :', sante: 'Conditions :', santea: 'Autre :', santed: 'Précisions :',
    med: 'Médicaments :', medd: 'Lesquels :', autre: 'Autre traitement :',
    consok: 'Consentement :', yes: 'Oui', no: 'Non',
    date: 'Date :', sig: 'Signature :', gen: 'Généré le'
  };

  // PDF
  // ⚠️ jsPDF vient d'un CDN : s'il n'a pas chargé (réseau, bloqueur, panne du CDN),
  //    la ligne suivante levait une TypeError et le bouton ne faisait RIEN, sans un mot.
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert(isEn
      ? 'The form could not finish loading. Please refresh the page and try again.'
      : "Le formulaire n'a pas pu se préparer complètement. Recharge la page et réessaie.");
    return;
  }
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
  if (interdites) field(isEn ? 'Areas to avoid:' : 'Zones à éviter :', interdites);

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
  field(consentOk, isEn ? 'All conditions read, understood and accepted' : 'Toutes les conditions lues, comprises et acceptées');

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
  doc.text(T.gen + ' ' + now.toLocaleDateString(isEn ? 'en-CA' : 'fr-CA') + ' - KevinBibeau@vitaliteboheme.ca - 438-368-3282', M, pageH - 28);

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

  // ─── PDF : la copie du client ET la piece jointe du dossier ───────────────
  // Historique : jusqu'au 2026-09-10, le PDF ne partait JAMAIS. EmailJS refusait
  // toute requete au-dessus de 50 Ko (HTTP 413) et un questionnaire signe pese
  // ~430 Ko en base64 — le 28 juillet 2026, l'ajouter avait bloque 100 % des envois.
  // Depuis qu'on passe par le programme Google, ce plafond n'existe plus : le PDF
  // est joint au courriel de Kevin, et la personne garde sa copie par le bouton
  // de telechargement.
  //
  // Le telechargement vient APRES l'envoi, volontairement : dans les
  // navigateurs integres (Facebook, Messenger, Instagram), doc.save() peut
  // faire quitter la page vers une URL blob et le questionnaire serait perdu.
  window.__vbPdfDoc = doc;
  window.__vbPdfNom = nomFichier;

  // Envoi
  var btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.innerHTML = '<span>Envoi en cours…</span>';

  var templateParams = {
    client_nom:         v('prenom') + ' ' + v('nom') + (v('mineur') ? (isEn ? ' — UNDER 18' : ' — MOINS DE 18 ANS') : ''),
    name:               v('prenom') + ' ' + v('nom'),
    client_tel:         v('telephone') || '-',
    client_email:       v('email') || '-',
    email:              v('email') || '',
    // Le sexe, la date de naissance et l'adresse sont exiges nommement par l'article 9.1.1
    // du code de deontologie du RMPQ. Ils etaient dans le PDF — que le client garde — mais
    // pas dans ce que Kevin recoit. Son dossier etait donc incomplet. Corrige le 2026-09-10.
    client_sexe:        v('sexe') || '-',
    client_ddn:         v('ddn') || '-',
    client_adresse:     v('adresse') || '-',
    client_profession:  v('profession') || '-',
    // Les allergies remontent deja en tete des contre-indications, mais elles doivent
    // aussi figurer telles quelles au dossier.
    allergies:          v('allergies') || '-',
    urgence:            (v('urgence_nom') || '-') + (v('urgence_lien') ? ' (' + v('urgence_lien') + ')' : '') + (v('urgence_tel') ? ' · ' + v('urgence_tel') : ''),
    parent:             v('mineur') ? ((v('parent_nom') || '-') + (v('parent_lien') ? ' (' + v('parent_lien') + ')' : '') + (v('parent_tel') ? ' · ' + v('parent_tel') : '')) : '',
    motif:              all('motif').join(', ') || '-',
    // ⚠️ Les coordonnees du parent sont deja dans le champ `parent` ci-dessus. Ici on ne
    // garde que la mention, pas le detail : sinon nom, lien et telephone arrivaient deux
    // fois dans le meme courriel.
    motif_detail:       (v('mineur') ? (isEn ? '[UNDER 18 — parental consent signed, parent stays in the room] ' : '[MOINS DE 18 ANS — consentement parental signé, parent présent dans la pièce] ') : '') + (v('motif_detail') || '-'),
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

  // ─── Garde-fou : un champ libre demesure ne doit pas gonfler l'envoi ──────
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
        templateParams[k] = isEn ? '[Too long — ask the client]' : '[Trop long — à demander au client]';
      });
    }
    console.warn('Champ libre tronque : il depassait 2 000 caracteres.');
  })();

  // ─── Le PDF signe part avec le questionnaire ─────────────────────────────
  // C'est la piece du dossier au sens de l'article 9.1.1 du code de deontologie
  // du RMPQ. Avant le 2026-09-10 il restait chez le client : EmailJS refusait
  // tout envoi au-dessus de 50 Ko et le PDF en pese environ 430. Le programme
  // Google, lui, n'a pas ce plafond. La limite de 45 Ko ci-dessus s'applique aux
  // champs texte seulement — le PDF s'ajoute apres, exprès.
  try {
    if (window.__vbPdfDoc) {
      templateParams.pdf_base64 = window.__vbPdfDoc.output('datauristring');
      templateParams.pdf_nom = nomFichier;
    }
  } catch (ePdf) { console.warn('PDF non joint :', ePdf); }

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
            : "Le téléchargement n'est pas disponible dans ce navigateur. Votre questionnaire a bien été envoyé.");
        }
      }
    };
  }

  var LIBELLE_BOUTON = isEn
    ? '<span>Submit my intake form</span>'
    : '<span>Envoyer mon questionnaire</span>';

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
      : "<strong>Ton questionnaire n'a pas pu être envoyé.</strong><br>"
        + 'Télécharge ta copie PDF avec le bouton ci-dessous et fais-la-nous parvenir — '
        + 'ou appelle-nous simplement, on le remplira ensemble.<br>')
      + '<a href="mailto:KevinBibeau@vitaliteboheme.ca" style="color:#7b241c;font-weight:600;">KevinBibeau@vitaliteboheme.ca</a>'
      + ' &nbsp;·&nbsp; '
      + '<a href="tel:+14383683282" style="color:#7b241c;font-weight:600;">438-368-3282</a>'
      + '<br><span style="font-size:12px;opacity:.75;">Code technique : ' + (statut || '?') + ' ' + (detail || '') + '</span>';
    boite.style.display = 'block';
    boite.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function onSuccess() {
    // ⛔ Plus d'appel a signalerBanque ici. Le programme inscrit lui-meme le client
    // dans la banque quand il recoit le questionnaire (questionnaireRecu -> ficheRecue).
    // Le faire des deux cotes creait deux entrees pour la meme personne.
    var echec = document.getElementById('echec-msg');
    if (echec) echec.style.display = 'none';
    document.getElementById('succes-msg').style.display = 'block';
    form.reset();
    // form.reset() vide la date de signature et laisse le trace de signature
    // dessine a l'ecran : on remet la page dans un etat coherent pour un
    // eventuel 2e questionnaire.
    try { effacerSignature(); } catch (eSig) {}
    try { setDateAujourdhui(); } catch (eDate) {}
    // Les marques sur le corps ne sont pas des champs : form.reset() les laisse en place.
    try { reinitialiserCorps(); } catch (eCorps) {}
    // Le PDF de la personne precedente ne doit pas rester disponible au telechargement
    // pour la suivante. On le laisse le temps que le bouton serve, puis il part.
    setTimeout(function() { try { delete window.__vbPdfDoc; } catch (e) { window.__vbPdfDoc = null; } }, 300000);
    btn.disabled = false;
    btn.innerHTML = LIBELLE_BOUTON;
    preparerTelechargement();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onError(err) {
    var statut = (err && err.status) || 0;
    var detail = (err && (err.text || err.message)) || '';
    console.error('Envoi du questionnaire — echec :', statut, detail, err);
    btn.disabled = false;
    btn.innerHTML = LIBELLE_BOUTON;
    preparerTelechargement();
    afficherEchec(statut, detail);
  }

  // ⭐ Depuis le 2026-09-10 (22 h 45), le questionnaire ne passe PLUS par EmailJS.
  // Il part directement au programme de reservation, dans le compte Google de Kevin.
  // Pourquoi : EmailJS est un tiers americain sans entente ecrite, et il transportait
  // tout le contenu de sante — conditions, medicaments, allergies, signature. Un
  // fournisseur de moins qui touche a ces donnees, et plus de plafond a 50 Ko qui
  // faisait echouer un envoi sans prevenir personne.
  // Une seule nouvelle tentative, et seulement si le reseau a coupe : un refus du
  // programme echouerait exactement pareil au deuxieme essai.
  function envoyer(essai) {
    var paquet = {};
    for (var k in templateParams) if (Object.prototype.hasOwnProperty.call(templateParams, k)) paquet[k] = templateParams[k];
    paquet.action = 'questionnaire';
    paquet.site_web = '';   // case piege : vide chez un vrai client

    fetch(BANQUE_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(paquet)
    })
      .then(function(r) { return r.json().catch(function() { return { ok: false, erreur: 'reponse_illisible', status: r.status }; }); })
      .then(function(rep) {
        if (rep && rep.ok) { onSuccess(); return; }
        // Le programme a repondu, mais il a refuse. Rejouer ne changerait rien.
        onError({ status: (rep && rep.status) || 200, text: (rep && rep.erreur) || 'refus' });
      })
      .catch(function(err) {
        // Coupure reseau ou serveur indisponible : une seule nouvelle tentative.
        if (essai < 2) { setTimeout(function() { envoyer(essai + 1); }, 1500); return; }
        onError({ status: 0, text: (err && err.message) || 'reseau' });
      });
  }

  // ⛔ Plus de faux succes. Avant le 2026-09-10, si la librairie d'envoi ne se
  // chargeait pas, la page affichait « envoye » sans que rien ne parte — le client
  // repartait tranquille et Kevin ne recevait jamais son questionnaire.
  // Maintenant il n'y a qu'un seul chemin, et il dit la verite.
  if (window.fetch && BANQUE_URL) {
    envoyer(1);
  } else {
    onError({ status: 0, text: 'navigateur trop ancien' });
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
