/* =====================================================================
   ARRANQUE: carga los datos, arma el marco, muestra la página de la
   dirección (#/…), pantalla de carga con el logo y entrada animada.
   ===================================================================== */
async function iniciar(){
  document.documentElement.lang = IDIOMA === 'pt' ? 'pt-BR' : 'es-UY';
  Datos.cargar();
  if (window.gsap && !QUIETO) document.documentElement.classList.add('anim');
  iniciarScrollSuave();
  dibujarMarco();
  mostrarRuta();
  $('link[rel=icon]').href = faviconDP(64);
  navAlBajar();
  await pantallaDeCarga();
  entradaPagina();
  if (/[?&]admin\b/.test(location.search)) abrirAdmin();
  window.addEventListener('resize', () => { clearTimeout(window._rsz); window._rsz = setTimeout(() => { if (_rutaActual) marcarMenu(_rutaActual.seccion); window.ScrollTrigger && ScrollTrigger.refresh(); }, 250); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
