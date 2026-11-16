/* Original animal buddies, drawn as smooth SVG with a bold sticker-style outline.
   Everyone shares one face style so the set feels like a family.
   characterSVG(id, mood) returns an <svg> string. mood: 'happy' (default), 'yay' or 'oh'. */
const CHARACTERS = [
  { id: 'penguin', name: 'Penguin', color: '#5b6fa8' },
  { id: 'cat', name: 'Cat', color: '#8e9bb8' },
  { id: 'dog', name: 'Dog', color: '#c98a52' },
  { id: 'owl', name: 'Owl', color: '#9a7350' },
  { id: 'lion', name: 'Lion', color: '#e59a2f' },
  { id: 'tiger', name: 'Tiger', color: '#f08a2c' },
  { id: 'horse', name: 'Horse', color: '#b97c4f' },
  { id: 'bunny', name: 'Bunny', color: '#c9a4d8' },
  { id: 'fox', name: 'Fox', color: '#f2793a' }
];

function characterSVG(id, mood = 'happy') {
  const ink = '#2d2b3f';
  const eye = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}"/><circle cx="${x + r * .35}" cy="${y - r * .38}" r="${r * .38}" fill="#fff"/><circle cx="${x - r * .3}" cy="${y + r * .35}" r="${r * .17}" fill="#fff"/>`;
  const eyes = (y = 98, dx = 20, r = 11) => (mood === 'yay'
    ? `<path d="M${100 - dx - 9},${y + 2} q9,-11 18,0 M${100 + dx - 9},${y + 2} q9,-11 18,0" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
    : eye(100 - dx, y, r) + eye(100 + dx, y, r));
  const blush = (y = 116, dx = 36) => `<ellipse cx="${100 - dx}" cy="${y}" rx="9" ry="6" fill="#ff7f98" opacity=".5"/><ellipse cx="${100 + dx}" cy="${y}" rx="9" ry="6" fill="#ff7f98" opacity=".5"/>`;
  const mouth = (y = 124) => mood === 'yay'
    ? `<path d="M89,${y - 2} q11,16 22,0z" fill="${ink}"/><path d="M94,${y + 5} q6,5 12,0 q-6,-4 -12,0z" fill="#ff7f98"/>`
    : mood === 'oh' ? `<ellipse cx="100" cy="${y + 2}" rx="5" ry="6.5" fill="${ink}"/>`
    : `<path d="M92,${y} q8,8 16,0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const body = (c, belly, feet) => `<ellipse cx="78" cy="196" rx="15" ry="9" fill="${feet}"/><ellipse cx="122" cy="196" rx="15" ry="9" fill="${feet}"/><ellipse cx="100" cy="166" rx="45" ry="34" fill="${c}"/><ellipse cx="100" cy="174" rx="27" ry="21" fill="${belly}"/>`;
  const mirror = s => s + `<g transform="translate(200,0) scale(-1,1)">${s}</g>`;
  let art = '', top = ''; // top: thin details drawn above the outline

  if (id === 'penguin') {
    const c = '#33406a';
    art = mirror(`<ellipse cx="54" cy="160" rx="11" ry="25" transform="rotate(20 54 160)" fill="${c}"/>`) + body(c, '#fff', '#ffa53d')
      + `<circle cx="100" cy="92" r="56" fill="${c}"/><circle cx="80" cy="100" r="28" fill="#fff"/><circle cx="120" cy="100" r="28" fill="#fff"/><ellipse cx="100" cy="120" rx="38" ry="24" fill="#fff"/>`
      + eyes(98) + blush(118, 34)
      + (mood === 'yay' ? `<path d="M90,112 L110,112 L100,120z" fill="#ffa53d"/><path d="M92,121 L108,121 L100,129z" fill="#f08a1d"/>` : mood === 'oh' ? `<path d="M90,112 L110,112 L100,118z" fill="#ffa53d"/><path d="M93,121 L107,121 L100,127z" fill="#f08a1d"/>` : `<path d="M90,113 L110,113 L100,124z" fill="#ffa53d"/>`);
  }
  if (id === 'cat') {
    const c = '#a7b2c9';
    art = `<path d="M140,186 q46,4 42,-40 q-2,-10 -12,-8 q4,32 -30,34z" fill="${c}"/>` + body(c, '#eef1f7', '#8a96b0')
      + mirror(`<path d="M48,74 L54,24 L96,46z" fill="${c}"/><path d="M57,62 L61,36 L84,50z" fill="#ffb3c8"/>`)
      + `<circle cx="100" cy="94" r="56" fill="${c}"/><ellipse cx="100" cy="122" rx="22" ry="15" fill="#eef1f7"/>`
      + eyes(96) + blush(114, 38) + `<path d="M95,113 L105,113 L100,119z" fill="#ff8fab"/>`
      + (mood === 'happy' ? `<path d="M90,122 q5,5 10,0 q5,5 10,0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` : mouth(124))
    top = mirror(`<path d="M58,116 l-24,-5 M58,124 l-24,4" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>`);
  }
  if (id === 'dog') {
    const c = '#d89c62';
    art = `<path d="M142,170 q34,-10 32,-36" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>` + body(c, '#fbe9d6', '#8f5b34')
      + `<circle cx="100" cy="94" r="56" fill="${c}"/><circle cx="122" cy="92" r="19" fill="#b97440"/>`
      + `<ellipse cx="100" cy="122" rx="28" ry="20" fill="#fbe9d6"/>`
      + eyes(96) + blush(116, 40) + `<ellipse cx="100" cy="112" rx="10" ry="7" fill="${ink}"/><circle cx="97" cy="110" r="2.5" fill="#fff"/>`
      + (mood === 'happy' ? `<path d="M88,124 q6,6 12,0 q6,6 12,0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M96,127 q4,12 8,0z" fill="#ff7f98"/>` : mouth(126))
      + mirror(`<ellipse cx="48" cy="96" rx="16" ry="34" transform="rotate(18 48 96)" fill="#8f5b34"/>`);
  }
  if (id === 'owl') {
    const c = '#a47b55';
    art = mirror(`<ellipse cx="56" cy="162" rx="13" ry="28" transform="rotate(14 56 162)" fill="#7e5a3a"/>`) + body(c, '#f3dfc0', '#ffa53d')
      + `<path d="M88,166 l6,6 l6,-6 M100,166 l6,6 l6,-6 M94,178 l6,6 l6,-6" stroke="#d6b88f" stroke-width="3" fill="none" stroke-linecap="round"/>`
      + mirror(`<path d="M50,58 L46,26 L80,44z" fill="${c}"/>`)
      + `<circle cx="100" cy="94" r="56" fill="${c}"/><circle cx="78" cy="98" r="25" fill="#f3dfc0"/><circle cx="122" cy="98" r="25" fill="#f3dfc0"/>`
      + (mood === 'yay' ? eyes(100, 22) : `<circle cx="78" cy="98" r="16" fill="#ffd34d"/><circle cx="122" cy="98" r="16" fill="#ffd34d"/>` + eyes(98, 22, 11))
      + blush(124, 40) + (mood === 'oh' ? `<path d="M93,116 L107,116 L100,128z" fill="#ffa53d"/>` : `<path d="M93,114 L107,114 L100,126z" fill="#ffa53d"/>`);
  }
  if (id === 'lion') {
    const c = '#f4bb4f';
    let mane = '';
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mane += `<circle cx="${(100 + Math.cos(a) * 60).toFixed(1)}" cy="${(94 + Math.sin(a) * 60).toFixed(1)}" r="20" fill="#d9772b"/>`; }
    art = `<path d="M140,180 q38,0 36,-34" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="176" cy="142" r="10" fill="#d9772b"/>` + body(c, '#fde7b8', '#c98a2d')
      + `<circle cx="100" cy="94" r="62" fill="#d9772b"/>` + mane
      + mirror(`<circle cx="62" cy="54" r="14" fill="${c}"/><circle cx="62" cy="54" r="7" fill="#f6a19a"/>`)
      + `<circle cx="100" cy="96" r="50" fill="${c}"/><ellipse cx="100" cy="122" rx="25" ry="17" fill="#fde7b8"/>`
      + eyes(94) + blush(114, 34) + `<path d="M92,111 L108,111 L100,119z" fill="#7a4a2a"/>` + mouth(125);
  }
  if (id === 'tiger') {
    const c = '#ff9a3c', s = '#3b2a2a';
    art = `<path d="M140,180 q38,0 36,-34" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M170,158 l10,-4 M174,146 l10,-2" stroke="${s}" stroke-width="4" stroke-linecap="round"/>` + body(c, '#fff4e6', '#d66e1c')
      + `<path d="M68,150 l12,6 M132,150 l-12,6 M66,166 l12,4 M134,166 l-12,4" stroke="${s}" stroke-width="4" stroke-linecap="round"/>`
      + mirror(`<circle cx="56" cy="50" r="17" fill="${c}"/><circle cx="56" cy="50" r="9" fill="#fff4e6"/>`)
      + `<circle cx="100" cy="94" r="56" fill="${c}"/><ellipse cx="78" cy="122" rx="24" ry="17" fill="#fff4e6"/><ellipse cx="122" cy="122" rx="24" ry="17" fill="#fff4e6"/>`
      + `<path d="M100,40 v14 M88,43 l3,11 M112,43 l-3,11" stroke="${s}" stroke-width="5" stroke-linecap="round"/>`
      + mirror(`<path d="M46,90 l14,4 M46,104 l12,1" stroke="${s}" stroke-width="5" stroke-linecap="round"/>`)
      + eyes(94) + blush(114, 40) + `<path d="M92,111 L108,111 L100,119z" fill="#ff7f98"/>` + mouth(125);
  }
  if (id === 'horse') {
    const c = '#c48a5c';
    art = body(c, '#ecc9a6', '#6b4529')
      + mirror(`<path d="M62,56 L58,18 L86,44z" fill="${c}"/><path d="M66,48 L64,28 L80,44z" fill="#f2b8a6"/>`)
      + `<ellipse cx="100" cy="92" rx="52" ry="54" fill="${c}"/><path d="M84,40 q16,-26 36,-6 q-6,16 -20,16 q-10,0 -16,-10z" fill="#5b3a24"/>`
      + `<path d="M100,52 q-6,22 0,44 q6,-22 0,-44z" fill="#fff" opacity=".85"/>`
      + `<ellipse cx="100" cy="128" rx="34" ry="24" fill="#ecc9a6"/><ellipse cx="88" cy="124" rx="4" ry="5" fill="#8a5a3a"/><ellipse cx="112" cy="124" rx="4" ry="5" fill="#8a5a3a"/>`
      + eyes(88, 24) + blush(108, 42) + mouth(136);
  }
  if (id === 'bunny') {
    const c = '#f3eef9';
    art = body(c, '#fff', '#d9cbe8')
      + mirror(`<ellipse cx="78" cy="26" rx="15" ry="40" transform="rotate(-8 78 26)" fill="${c}"/><ellipse cx="78" cy="28" rx="7" ry="28" transform="rotate(-8 78 28)" fill="#ffc2d4"/>`)
      + `<circle cx="100" cy="96" r="56" fill="${c}"/>`
      + eyes(96) + blush(116, 38) + `<ellipse cx="100" cy="114" rx="7" ry="5" fill="#ff8fab"/>`
      + (mood === 'happy' ? `<path d="M92,121 q4,5 8,0 q4,5 8,0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/><rect x="95" y="124" width="10" height="9" rx="2" fill="#fff" stroke="${ink}" stroke-width="2"/>` : mouth(124));
  }
  if (id === 'fox') {
    const c = '#ff8a3d';
    art = `<path d="M142,186 q52,-6 44,-62 q-8,34 -44,40z" fill="${c}"/><path d="M186,124 q4,12 -2,24 q-4,-10 -12,-14 q10,-2 14,-10z" fill="#fff4e6"/>` + body(c, '#fff4e6', '#5b3a2a')
      + mirror(`<path d="M46,66 L52,22 L92,48z" fill="${c}"/><path d="M55,56 L59,34 L80,48z" fill="#ffd2b0"/>`)
      + `<circle cx="100" cy="94" r="56" fill="${c}"/><path d="M46,108 q54,-10 108,0 q-12,40 -54,40 q-42,0 -54,-40z" fill="#fff4e6"/>`
      + eyes(94) + blush(116, 38) + `<ellipse cx="100" cy="116" rx="8" ry="6" fill="${ink}"/>` + mouth(127);
  }
  // A bold dark outline around the whole buddy, like a sticker.
  const outline = `<filter id="vq-line" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="${ink}"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return `<svg class="buddy" viewBox="-10 -26 220 244" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${outline}</defs><g filter="url(#vq-line)">${art}</g>${top}</svg>`;
}

if (typeof module !== 'undefined') module.exports = { CHARACTERS, characterSVG };
