/* =====================================================================
   DATOS: guarda todo lo editable en el navegador (demo, sin Firebase).
   En la versión real esto mismo se guarda en la nube y lo ve todo el mundo.
   - Datos.get()            → el contenido actual
   - Datos.guardar()        → guarda los cambios
   - Datos.exportar()       → descarga un archivo con todo (respaldo)
   - Datos.importar(texto)  → vuelve a cargar un respaldo
   - Datos.restaurar()      → vuelve al contenido de ejemplo
   ===================================================================== */
const VERSION_CONTENIDO = 4;   // 3: fotos nuevas de Claudio · 4: textos del equipo y «El equipo» (12/11/2026)
const CLAVE_DATOS = 'dronesdelpampa_web_v2';   // versión 2: su propia memoria, para no mezclarse con la base si se publican las dos

const Datos = (() => {
  let d = null;
  const copia = o => JSON.parse(JSON.stringify(o));

  function cargar(){
    try {
      const txt = localStorage.getItem(CLAVE_DATOS);
      if (txt) {
        const g = JSON.parse(txt);
        if (g && g._v === VERSION_CONTENIDO && Array.isArray(g.drones)) { d = completar(g); return d; }
      }
    } catch (e) { /* datos ilegibles: se vuelven a sembrar */ }
    d = copia(CONTENIDO_INICIAL); d._v = VERSION_CONTENIDO;
    guardar();
    return d;
  }

  // Si falta alguna parte (por ejemplo, un texto nuevo), se completa con el ejemplo
  function completar(g){
    const base = copia(CONTENIDO_INICIAL);
    for (const k of Object.keys(base)) if (g[k] === undefined) g[k] = base[k];
    for (const k of Object.keys(base.textos)) if (!g.textos[k]) g.textos[k] = base.textos[k];
    for (const k of Object.keys(base.config)) if (g.config[k] === undefined) g.config[k] = base.config[k];
    return g;
  }

  function guardar(){
    try { localStorage.setItem(CLAVE_DATOS, JSON.stringify(d)); return true; }
    catch (e) {
      if (typeof aviso === 'function') aviso('No hay más lugar en este navegador para fotos. Usá fotos más chicas o borrá alguna.', 'error');
      return false;
    }
  }

  function exportar(){
    const blob = new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    const hoy = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(blob); a.download = 'drones-del-pampa-pagina-' + hoy + '.json';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function importar(texto){
    const g = JSON.parse(texto);
    if (!g || !Array.isArray(g.drones) || !g.textos) throw new Error('El archivo no es un respaldo de la página.');
    g._v = VERSION_CONTENIDO; d = completar(g); guardar();
  }

  function restaurar(){ d = copia(CONTENIDO_INICIAL); d._v = VERSION_CONTENIDO; guardar(); }

  const nuevoId = (pre) => (pre || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  return { cargar, get: () => d, guardar, exportar, importar, restaurar, nuevoId };
})();
