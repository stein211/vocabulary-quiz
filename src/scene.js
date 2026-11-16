/* Original story illustrations, drawn in code: no image downloads or asset licenses.
   Each chapter has its own time of day, from Friday afternoon to the day after. */
function drawWorld(chapter, solved = false, canvas = document.getElementById('world')) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d'), W = 640, H = 280;
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = ctx.lineJoin = 'round';

  // --- drawing helpers ---
  const rr = (x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.fill(); };
  const circ = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const poly = (pts, c) => { ctx.fillStyle = c; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.fill(); };
  const line = (pts, c, w = 2) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const sky = (...stops) => { const g = ctx.createLinearGradient(0, 0, 0, H); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const cloud = (x, y, s, c = '#fff') => { circ(x, y, 14 * s, c); circ(x + 16 * s, y - 8 * s, 17 * s, c); circ(x + 36 * s, y, 15 * s, c); rr(x - 6 * s, y, 50 * s, 14 * s, 7 * s, c); };
  const hills = (base, amp, c, phase = 0) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, base - Math.sin(x * .012 + phase) * amp - Math.sin(x * .031 + phase) * amp * .3); ctx.lineTo(W, H); ctx.fill(); };
  const tree = (x, y, s, leaf, leaf2, trunk = '#7a5236') => { rr(x - 5 * s, y - 50 * s, 10 * s, 50 * s, 3 * s, trunk); circ(x, y - 72 * s, 30 * s, leaf); circ(x - 22 * s, y - 55 * s, 20 * s, leaf); circ(x + 22 * s, y - 56 * s, 21 * s, leaf); circ(x + 8 * s, y - 80 * s, 14 * s, leaf2); circ(x - 12 * s, y - 62 * s, 9 * s, leaf2); };
  const star = (x, y, r, c) => poly([[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]], c);
  const windowPane = (x, y, w, h, c, frame) => { rr(x - 2, y - 2, w + 4, h + 4, 3, frame); rr(x, y, w, h, 2, c); line([[x + w / 2, y], [x + w / 2, y + h]], frame, 1.5); line([[x, y + h / 2], [x + w, y + h / 2]], frame, 1.5); };

  // A simple character: x is the centre, y is where the feet stand.
  const person = (x, y, o) => {
    const skin = o.skin || '#f3c9a5', dark = '#27264a';
    ctx.save(); ctx.translate(x, y); ctx.scale((o.s || 1) * (o.flip ? -1 : 1), o.s || 1);
    if (o.sit) { rr(-9, -34, 26, 9, 4, o.legs); rr(9, -34, 8, 30, 4, o.legs); rr(8, -6, 13, 6, 3, dark); }
    else { rr(-9, -32, 8, 30, 3, o.legs); rr(1, -32, 8, 30, 3, o.legs); rr(-11, -5, 11, 6, 3, dark); rr(1, -5, 11, 6, 3, dark); }
    if (o.long) rr(-14, -92, 28, 40, 12, o.hair);
    rr(-12, -66, 24, 38, 9, o.top);
    if (o.wave) { ctx.save(); ctx.translate(12, -60); ctx.rotate(-2.3); rr(-3, 0, 7, 26, 3.5, o.top); circ(.5, 28, 4, skin); ctx.restore(); }
    else { rr(10, -63, 7, 27, 3.5, o.top); circ(13.5, -35, 4, skin); }
    rr(-17, -63, 7, 27, 3.5, o.top); circ(-13.5, -35, 4, skin);
    rr(-3, -70, 6, 7, 2, skin);
    circ(0, -80, 12, skin);
    ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(0, -82, 12.6, Math.PI, 0); ctx.lineTo(12.6, -78); ctx.quadraticCurveTo(2, -88, -12.6, -78); ctx.fill();
    if (o.bun) circ(0, -96, 6, o.hair);
    circ(-4.5, -79, 1.5, dark); circ(4.5, -79, 1.5, dark);
    if (o.mood === 'o') circ(0, -73.5, 2.4, dark);
    else if (o.mood === 'sad') { ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -70.5, 3.5, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
    else { ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -76.5, 4, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
    ctx.restore();
  };
  const emma = { hair: '#b5532a', top: '#f6c343', legs: '#3d5a9e', long: true };
  const lucy = { hair: '#2b2333', top: '#e2475b', legs: '#2f3e5c', bun: true, skin: '#d9a17a' };
  const ben = { hair: '#5a3b22', top: '#3f9b8c', legs: '#4a4f66' };
  const laptop = (x, y, s, broken) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (broken) ctx.rotate(-.18);
    rr(-22, -30, 44, 30, 3, '#3a3f55'); rr(-19, -27, 38, 24, 2, broken ? '#1d2030' : '#9fd8ff');
    if (broken) { line([[-12, -27], [-4, -17], [-9, -10], [2, -3]], '#e9ecf5', 1.4); line([[-4, -17], [8, -22], [14, -12]], '#e9ecf5', 1.2); line([[8, -22], [12, -27]], '#e9ecf5', 1.2); }
    rr(-26, 0, 52, 6, 2, '#565c78');
    ctx.restore();
  };

  if (chapter === 0) {
    // Friday afternoon outside school.
    sky('#8fd0ee', '#d8f0f6'); circ(86, 58, 26, '#fff3b0'); circ(86, 58, 19, '#ffe066');
    cloud(190, 52, 1); cloud(470, 38, .8); cloud(560, 86, .6);
    hills(190, 18, '#a8d99b'); hills(206, 10, '#86c57f', 2);
    rr(0, 214, W, 66, 0, '#d9d2c3'); rr(0, 214, W, 5, 0, '#bdb5a4');
    for (let x = 20; x < W; x += 70) line([[x, 240], [x + 34, 240]], '#c7bfae', 2);
    // School building
    rr(330, 92, 250, 124, 4, '#d9694a'); rr(322, 84, 266, 14, 4, '#8a3b2c');
    poly([[420, 84], [455, 48], [490, 84]], '#8a3b2c'); circ(455, 72, 8, '#fff7e0'); line([[455, 72], [455, 67]], '#27264a', 1.5); line([[455, 72], [459, 73]], '#27264a', 1.5);
    for (let i = 0; i < 4; i++) windowPane(348 + i * 60 + (i > 1 ? 14 : 0), 112, 30, 34, '#cfeaf7', '#fff7e0');
    windowPane(348, 166, 30, 34, '#cfeaf7', '#fff7e0'); windowPane(542, 166, 30, 34, '#cfeaf7', '#fff7e0');
    rr(432, 160, 46, 56, 4, '#fff7e0'); rr(436, 164, 17, 52, 2, '#2f6f8f'); rr(457, 164, 17, 52, 2, '#2f6f8f');
    rr(420, 216, 70, 6, 2, '#bdb5a4');
    line([[606, 216], [606, 120]], '#8a8fa3', 3); poly([[606, 122], [634, 130], [606, 140]], '#e2475b');
    tree(280, 218, 1, '#4fa866', '#6fc27f'); tree(40, 220, .8, '#4fa866', '#6fc27f');
    person(150, 250, { ...lucy, s: 1.05, wave: true });
    person(200, 252, { ...emma, s: 1.05 });
    person(288, 250, { ...ben, s: 1.05, flip: true, wave: true });
  }

  if (chapter === 1) {
    // Friday evening: the house with the secret party.
    sky('#2c2a6e', '#8b4a8f', '#f08a6b', '#f9c783');
    circ(540, 54, 20, '#fff4d6'); circ(548, 48, 18, '#3a3077');
    [[60, 40], [130, 70], [220, 30], [300, 62], [420, 28], [600, 100], [470, 80]].forEach(([x, y], i) => star(x, y, 3 + i % 2, '#fff4d6'));
    hills(206, 12, '#3a2a63'); rr(0, 222, W, 58, 0, '#2a2150');
    poly([[250, 280], [330, 222], [390, 222], [430, 280]], '#4a3b78');
    // House
    rr(270, 104, 190, 120, 4, '#3b2f6b'); poly([[254, 108], [365, 44], [476, 108]], '#241b4a'); rr(410, 56, 18, 36, 2, '#241b4a');
    windowPane(290, 124, 36, 36, '#ffd866', '#241b4a'); windowPane(404, 124, 36, 36, '#ff8fb3', '#241b4a'); windowPane(290, 178, 36, 32, '#7fe0d0', '#241b4a'); windowPane(404, 178, 36, 32, '#ffd866', '#241b4a');
    rr(346, 160, 38, 64, 4, '#ffe9a8'); poly([[346, 224], [384, 224], [420, 262], [318, 262]], '#ffe9a833');
    circ(305, 142, 6, '#241b4a'); rr(299, 148, 12, 12, 3, '#241b4a'); circ(425, 144, 6, '#241b4a'); rr(419, 150, 12, 10, 3, '#241b4a');
    // String lights and balloons
    ctx.strokeStyle = '#1a1438'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(96, 96); ctx.quadraticCurveTo(190, 140, 270, 106); ctx.moveTo(460, 106); ctx.quadraticCurveTo(540, 140, 632, 92); ctx.stroke();
    ['#ffd866', '#ff8fb3', '#7fe0d0', '#ffd866', '#ff8fb3'].forEach((c, i) => { const t = (i + 1) / 6, y = 96 + 2 * t * (1 - t) * 44 + t * 10 - 4; circ(96 + t * 174, y + 8, 4.5, c); circ(460 + t * 172, 106 + 2 * t * (1 - t) * 34 - t * 14 + 6, 4.5, c); });
    rr(92, 96, 6, 130, 3, '#1a1438');
    line([[482, 150], [476, 200]], '#1a1438', 1); circ(484, 138, 13, '#e2475b'); line([[500, 160], [480, 200]], '#1a1438', 1); circ(504, 148, 13, '#f6c343');
    tree(578, 226, .9, '#2b3f6e', '#3a548a', '#1a1438');
    person(170, 256, { ...emma, s: 1.05, mood: 'o' });
    person(222, 254, { ...lucy, s: 1.05, wave: true });
  }

  if (chapter === 2) {
    // Later that night: the crash.
    sky('#33215f', '#4a2f80'); rr(0, 206, W, 74, 0, '#6b4a3a'); rr(0, 206, W, 6, 0, '#4f3528');
    for (let x = -20; x < W; x += 64) line([[x, 280], [x + 40, 212]], '#5c3e30', 2);
    [['#ff8fb355', 110], ['#7fe0d044', 330], ['#ffd86644', 540]].forEach(([c, x]) => poly([[x - 6, 0], [x + 6, 0], [x + 90, 206], [x - 90, 206]], c));
    line([[320, 0], [320, 26]], '#1a1438', 2); circ(320, 44, 18, '#d9dcf0'); for (let i = 0; i < 5; i++) { circ(308 + i * 6, 38 + (i % 2) * 8, 2.2, '#8f94c9'); circ(311 + i * 5, 52 - (i % 2) * 4, 2, '#fff'); }
    ['#ffd866', '#ff8fb3', '#7fe0d0', '#ffd866', '#ff8fb3', '#7fe0d0', '#ffd866'].forEach((c, i) => poly([[30 + i * 90, 14], [60 + i * 90, 14], [45 + i * 90, 44]], c)); line([[0, 14], [W, 14]], '#1a1438', 2);
    // Table, and the laptop on the floor
    rr(400, 150, 190, 12, 4, '#c98b4f'); rr(416, 162, 10, 76, 3, '#9b6535'); rr(566, 162, 10, 76, 3, '#9b6535');
    rr(520, 128, 14, 22, 3, '#ff8fb3'); rr(544, 132, 14, 18, 3, '#7fe0d0'); rr(452, 140, 44, 10, 5, '#f6c343');
    poly([[352, 262], [330, 236], [348, 240], [340, 210], [360, 228], [372, 196], [384, 228], [406, 208], [398, 240], [420, 236], [396, 262]], '#ffe24d');
    laptop(374, 252, 1.25, true);
    rr(338, 262, 8, 5, 1, '#565c78'); rr(410, 258, 6, 6, 1, '#3a3f55'); rr(326, 250, 5, 4, 1, '#9aa0ba');
    person(90, 258, { ...lucy, s: 1.1, mood: 'o' });
    person(160, 262, { ...emma, s: 1.1, mood: 'o' });
    person(262, 258, { ...ben, s: 1.1, mood: 'o', wave: true });
    person(500, 240, { hair: '#e8c56a', top: '#8f6bd6', legs: '#2f3e5c', s: .95, mood: 'o', flip: true });
  }

  if (chapter === 3) {
    // The video on the phone shows what really happened.
    sky('#101b47', '#263b82');
    [[40, 36], [110, 80], [180, 26], [250, 58], [600, 40], [560, 110], [620, 170]].forEach(([x, y], i) => star(x, y, 3 + i % 2, '#dfe7ff'));
    hills(220, 10, '#0c1436'); rr(0, 236, W, 44, 0, '#0c1436');
    circ(410, 140, 150, '#5b7fe01f'); circ(410, 140, 110, '#8fb0ff1f');
    // Phone
    ctx.save(); ctx.translate(410, 140); ctx.rotate(-.07);
    rr(-150, -96, 300, 192, 20, '#0a0e22'); rr(-138, -86, 276, 172, 10, '#4a2f80');
    rr(-138, 34, 276, 52, 0, '#6b4a3a'); rr(-70, -4, 150, 9, 3, '#c98b4f'); rr(-58, 5, 8, 50, 2, '#9b6535'); rr(60, 5, 8, 50, 2, '#9b6535');
    // the laptop at the edge of the table, and the arm that pushes it
    ctx.save(); ctx.translate(-56, -6); ctx.rotate(-.35); rr(-18, -24, 36, 24, 3, '#3a3f55'); rr(-15, -21, 30, 18, 2, '#9fd8ff'); rr(-22, 0, 44, 5, 2, '#565c78'); ctx.restore();
    rr(-14, -22, 96, 14, 7, '#8f6bd6'); circ(-18, -15, 8, '#f3c9a5');
    circ(92, -34, 15, '#f3c9a5'); ctx.fillStyle = '#e8c56a'; ctx.beginPath(); ctx.arc(92, -36, 15.6, Math.PI, 0); ctx.fill(); rr(74, -18, 36, 52, 10, '#8f6bd6');
    line([[-96, -30], [-108, -40]], '#ffe24d', 3); line([[-100, -14], [-116, -14]], '#ffe24d', 3); line([[-94, 2], [-106, 12]], '#ffe24d', 3);
    // player controls
    rr(-138, 62, 276, 24, 0, '#0a0e2299'); rr(-96, 72, 216, 4, 2, '#ffffff55'); rr(-96, 72, 120, 4, 2, '#e2475b'); circ(24, 74, 6, '#e2475b'); poly([[-124, 66], [-124, 82], [-110, 74]], '#fff');
    circ(-120, -68, 5, '#e2475b'); rr(-110, -72, 26, 8, 3, '#ffffff66');
    ctx.restore();
    person(130, 262, { ...emma, s: 1.35, mood: 'o', wave: true });
  }

  if (chapter >= 4) {
    // The next day in the park.
    sky('#9bdcf2', '#e6f7ee'); circ(540, 60, 28, '#fff3b0'); circ(540, 60, 20, '#ffd84d');
    cloud(120, 54, 1); cloud(330, 36, .7); cloud(430, 84, .55);
    hills(176, 22, '#b6e3a1'); hills(198, 14, '#8fd08a', 1.4); hills(224, 8, '#6fbf73', 3);
    ctx.fillStyle = '#f0e2bd'; ctx.beginPath(); ctx.moveTo(0, 280); ctx.quadraticCurveTo(200, 236, 420, 250); ctx.quadraticCurveTo(560, 258, 640, 236); ctx.lineTo(640, 280); ctx.fill();
    tree(96, 232, 1.25, '#3f9d5c', '#62bb74'); tree(590, 226, .9, '#3f9d5c', '#62bb74');
    line([[250, 60], [258, 54], [266, 60]], '#3a4a6b', 2); line([[280, 76], [287, 71], [294, 76]], '#3a4a6b', 2);
    [[190, 250, '#e2475b'], [214, 258, '#f6c343'], [470, 246, '#fff'], [498, 254, '#e2475b'], [44, 262, '#fff'], [530, 262, '#f6c343']].forEach(([x, y, c]) => { line([[x, y], [x, y + 8]], '#3f9d5c', 2); circ(x, y, 4, c); circ(x, y, 1.6, '#ffd84d'); });
    // Bench with the two friends
    rr(262, 168, 150, 8, 3, '#a8703f'); rr(262, 182, 150, 8, 3, '#a8703f'); rr(270, 166, 7, 70, 2, '#7a4f2a'); rr(397, 166, 7, 70, 2, '#7a4f2a');
    person(312, 240, { ...emma, s: 1.1, sit: true });
    person(360, 240, { ...lucy, s: 1.1, sit: true, wave: true });
    rr(256, 204, 162, 9, 3, '#c98b4f'); rr(268, 213, 7, 26, 2, '#7a4f2a'); rr(399, 213, 7, 26, 2, '#7a4f2a');
  }

  if (solved) {
    // A little celebration for every correct answer.
    const colours = ['#ffe24d', '#ffffff', '#ff8fb3', '#7fe0d0'];
    for (let i = 0; i < 14; i++) star(30 + (i * 137) % 580, 22 + (i * 53) % 92, 4 + i % 3 * 2, colours[i % 4]);
  }
  canvas.setAttribute('aria-label', ['Emma and Lucy meet a new boy outside school', 'Emma and Lucy arrive at a house party in the evening', 'A broken laptop on the floor at the party', 'A phone video shows a boy pushing the laptop off the table', 'Emma and Lucy sit together on a park bench'][Math.min(chapter, 4)]);
}
