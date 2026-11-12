/* =====================================================================
   DRON QUE ACOMPAÑA AL BAJAR + CAMPO QUE SE FUMIGA (versión 2, 12/11/2026)
   - En el inicio, un T100 visto desde arriba (con su sombra) va cruzando
     la página de un lado al otro mientras bajás, inclinándose en las curvas.
   - En la sección «Así trabaja un Agras» la pantalla queda fija y el dron
     recorre el campo dibujado pasada por pasada: lo que ya fumigó se pone
     verde y abajo se cuentan las hectáreas y los litros (ejemplo a 10 L/ha).
   Sin movimiento reducido (prefers-reduced-motion) no se muestra el dron
   que acompaña y el campo aparece ya fumigado.
   ===================================================================== */
const CAMPO = { filas: 6, x0: 40, x1: 560, y0: 70, paso: 54, ha: 12, lha: 10 };

function campoHTML(){
  const pt = IDIOMA === 'pt', C = CAMPO;
  const filas = Array.from({ length: C.filas }, (_, i) => {
    const y = C.y0 + i * C.paso;
    return `<g class="cf-fila"><rect class="cf-seco" x="${C.x0}" y="${y - 20}" width="${C.x1 - C.x0}" height="40" rx="6"/>
      <rect class="cf-verde" id="cf-v${i}" x="${C.x0}" y="${y - 20}" width="0" height="40" rx="6"/>
      ${Array.from({ length: 26 }, (_, k) => `<line class="cf-surco" x1="${C.x0 + 10 + k * 20}" y1="${y - 14}" x2="${C.x0 + 10 + k * 20}" y2="${y + 14}"/>`).join('')}</g>`;
  }).join('');
  const ruta = Array.from({ length: C.filas }, (_, i) => { const y = C.y0 + i * C.paso, a = i % 2 ? C.x1 : C.x0, b = i % 2 ? C.x0 : C.x1; return `${i ? 'L' : 'M'}${a} ${y} L${b} ${y}`; }).join(' ');
  return `<section class="campo-sec" id="campo-sec">
    <div class="campo-pegado"><div class="contenedor campo-in">
      <div class="campo-txt">
        <span class="etiqueta"><i></i>${pt ? 'Assim trabalha um Agras' : 'Así trabaja un Agras'}</span>
        <h2 class="titulo chico">${pt ? 'Passada a passada, <b>sem pisar a lavoura</b>' : 'Pasada a pasada, <b>sin pisar el cultivo</b>'}</h2>
        <p class="sub">${pt ? 'Você marca o lote no controle e o drone faz a rota sozinho: altura certa, gota uniforme e nenhum pedaço repetido ou esquecido.' : 'Marcás el lote en el control y el dron hace la ruta solo: altura justa, gota pareja y ningún pedazo repetido ni olvidado.'}</p>
        <div class="campo-datos">
          <div><b id="cf-ha">0,0</b><small>${pt ? 'hectares' : 'hectáreas'}</small></div>
          <div><b id="cf-l">0</b><small>${pt ? 'litros aplicados' : 'litros aplicados'}</small></div>
          <div><b id="cf-p">0 %</b><small>${pt ? 'do lote' : 'del lote'}</small></div>
        </div>
        <p class="campo-nota">${pt ? 'Exemplo ilustrativo: lote de 12 ha a 10 L/ha.' : 'Ejemplo ilustrativo: lote de 12 ha a 10 L/ha.'} <span class="campo-bajar">${icono('abajo')} ${pt ? 'Role para ver' : 'Bajá para verlo'}</span></p>
      </div>
      <div class="campo-mapa">
        <svg viewBox="0 0 600 420" aria-hidden="true">
          <defs><pattern id="cf-pasto" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#5e8a3a"/><circle cx="2" cy="2" r="1" fill="#6f9c45"/></pattern></defs>
          <rect x="0" y="0" width="600" height="420" rx="26" fill="url(#cf-pasto)"/>
          <rect x="18" y="26" width="564" height="${C.filas * C.paso + 16}" rx="14" fill="#8a6b3c" opacity=".35"/>
          ${filas}
          <path class="cf-ruta" d="${ruta}"/>
          <g class="cf-poste"><line x1="575" y1="20" x2="575" y2="8"/><circle cx="575" cy="8" r="4"/></g>
        </svg>
        <div class="cf-dron" id="cf-dron"><span class="cf-rocio"></span><span class="cf-sombra"></span><img src="media/drones/t100-arriba.png" alt=""></div>
      </div>
    </div></div>
  </section>`;
}

function iniciarCampo(v){
  const sec = $('#campo-sec', v); if (!sec) return;
  const C = CAMPO, dron = $('#cf-dron', sec), svg = $('.campo-mapa svg', sec), verdes = $$('.cf-verde', sec);
  const ha = $('#cf-ha', sec), lt = $('#cf-l', sec), pc = $('#cf-p', sec);
  let xPrev = null;
  const dibujar = p => {
    p = Math.max(0, Math.min(1, p));
    const seg = p * C.filas, i = Math.min(C.filas - 1, Math.floor(seg)), t = Math.min(1, seg - i);
    const giro = .12, enFila = Math.min(1, t / (1 - giro)), der = i % 2 === 0;
    let x = der ? C.x0 + (C.x1 - C.x0) * enFila : C.x1 - (C.x1 - C.x0) * enFila, y = C.y0 + i * C.paso;
    if (t > 1 - giro && i < C.filas - 1) y += C.paso * ((t - (1 - giro)) / giro);
    verdes.forEach((r, j) => {
      if (j < i || (j === i && p >= 1)) { r.setAttribute('x', C.x0); r.setAttribute('width', C.x1 - C.x0); }
      else if (j > i) r.setAttribute('width', 0);
      else { const w = (C.x1 - C.x0) * enFila; r.setAttribute('x', der ? C.x0 : C.x1 - w); r.setAttribute('width', w); }
    });
    // del dibujo (600 × 420) a la pantalla
    const caja = svg.getBoundingClientRect(), mapa = dron.parentElement.getBoundingClientRect(), k = caja.width / 600;
    dron.style.transform = `translate(${caja.left - mapa.left + x * k}px, ${caja.top - mapa.top + y * k}px) translate(-50%,-50%) rotate(${xPrev === null ? 0 : Math.max(-25, Math.min(25, (x - xPrev) * 1.4))}deg)`;
    dron.classList.toggle('fumiga', t < 1 - giro && p > 0 && p < 1);
    xPrev = x;
    const hecho = Math.min(1, p) * C.ha;
    ha.textContent = hecho.toLocaleString('es-UY', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    lt.textContent = Math.round(hecho * C.lha).toLocaleString('es-UY'); pc.textContent = Math.round(p * 100) + ' %';
  };
  const medir = () => { if (!sec.isConnected) return quitar(); const r = sec.getBoundingClientRect(), largo = r.height - innerHeight; dibujar(QUIETO ? 1 : largo > 0 ? -r.top / largo : 1); };
  let pedido = false; const alBajar = () => { if (pedido) return; pedido = true; requestAnimationFrame(() => { pedido = false; medir(); }); };
  const quitar = () => { window.removeEventListener('scroll', alBajar); window.removeEventListener('resize', alBajar); };
  window.addEventListener('scroll', alBajar, { passive: true }); window.addEventListener('resize', alBajar); medir();
}

/* --- El dron que acompaña por toda la página de inicio --- */
function iniciarDronGuia(v){
  const viejo = $('#dron-guia'); if (viejo) viejo.remove();
  if (QUIETO || !$('.pagina-inicio', v)) return;
  const g = document.createElement('div'); g.id = 'dron-guia'; g.className = 'dron-guia'; g.setAttribute('aria-hidden', 'true');
  g.innerHTML = '<span class="dg-sombra"></span><img src="media/drones/t100-arriba.png" alt="">'; document.body.appendChild(g);
  const hero = $('.hero', v), tapan = [$('#campo-sec', v), ...$$('.explorar', v)].filter(Boolean), pie = $('.pie', v);
  let x = innerWidth / 2, vx = 0, pedido = false;
  const mover = () => {
    pedido = false; if (!g.isConnected) return;
    if (!hero.isConnected) { g.remove(); return quitar(); }
    const y = scrollY, alto = document.documentElement.scrollHeight - innerHeight, p = alto > 0 ? y / alto : 0;
    // se esconde donde hay otro dron (el campo y «Conocelo por dentro») y en el pie
    const enCampo = tapan.some(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * .85 && r.bottom > innerHeight * .15; });
    const enPie = pie && pie.getBoundingClientRect().top < innerHeight * .8;
    const ver = y > hero.offsetHeight * .55 && !enCampo && !enPie;
    g.classList.toggle('ver', ver);
    const ancho = innerWidth, margen = Math.min(140, ancho * .12);
    const objetivo = margen + (ancho - 2 * margen) * (.5 + .5 * Math.sin(p * Math.PI * 7));
    vx = objetivo - x; x += vx * .18;
    g.style.transform = `translate(${x}px, ${innerHeight * .58}px) translate(-50%,-50%) rotate(${Math.max(-28, Math.min(28, vx * .35))}deg)`;
    if (Math.abs(vx) > .5) pedir();
  };
  const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(mover); } };
  const quitar = () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); };
  window.addEventListener('scroll', pedir, { passive: true }); window.addEventListener('resize', pedir); mover();
}
// Al salir del inicio, el dron se va
window.addEventListener('hashchange', () => { const g = $('#dron-guia'); if (g && leerRuta().seccion !== 'inicio') g.remove(); });
