/* ==========================================================================
   MARTARTA — Factura simplificada (todo local, sin servidor)
   --------------------------------------------------------------------------
   * Los datos del negocio están en un solo sitio (MARTARTA): cámbialos aquí.
   * El número de factura sale de una serie por año y se guarda en el navegador
     (localStorage). En una facturación real, la numeración debe ser continua
     y coincidir con los ingresos declarados: esta plantilla emite facturas de
     libro, no sirve para ocultar ventas.
   * La factura lee el carrito guardado por carrito.js (clave 'martarta-factura').
   ========================================================================== */

const MARTARTA = {
    nombre: 'Martarta · La Temporal',
    lema: 'Tartas NO, Martartas!',
    actividad: 'Pastelería artesanal · tartas, galletas, pasteles y antojos',
    direccion: 'Blanes (Girona) · 17300 · Solo online, recogida en Blanes',
    nif: '', // ← NIF de la titular. Obligatorio en una factura real.
    telefono: '34614896462',
    telefonoBonito: '614 896 462',
    email: 'latemporalblanes@gmail.com',
    instagram: 'https://www.instagram.com/martartalatemporal',
    iva: 0.21,          // tipo de IVA aplicado a los productos
    serie: 'MT',        // prefijo del número de factura
    logo: 'img/logo-martarta.png', // logo con la tarta (si no existe, se usa el icono de la cesta)
};

const CLAVE_CARRITO = 'martarta-factura';
const CLAVE_NUMERACION = 'martarta-factura-num';
const eu = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const fechaLarga = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ---------- Número de factura: serie-año-secuencial, continuo por año ---------- */
function siguienteNumeroFactura(anno) {
    let numeracion = {};
    try { numeracion = JSON.parse(localStorage.getItem(CLAVE_NUMERACION) || '{}'); } catch (e) { numeracion = {}; }
    numeracion[anno] = (numeracion[anno] || 0) + 1;
    localStorage.setItem(CLAVE_NUMERACION, JSON.stringify(numeracion));
    return `${MARTARTA.serie}-${anno}-${String(numeracion[anno]).padStart(4, '0')}`;
}

/* ---------- Cálculos ---------- */
function calcularLineas(items) {
    return items.map((it) => ({ ...it, subtotal: it.precio * it.cantidad }));
}
function calcularTotales(lineas, tipoIva) {
    const base = lineas.reduce((s, l) => s + l.subtotal, 0);
    const iva = base * tipoIva;
    return { base, iva, total: base + iva };
}

/* ---------- Pintado ---------- */
function pintarLogo() {
    const img = document.getElementById('factura-logo');
    img.src = MARTARTA.logo;
    img.onerror = () => { img.src = 'img/icono-cesta.svg'; };
}

function pintarNegocio() {
    document.getElementById('negocio-nombre').textContent = MARTARTA.nombre;
    document.getElementById('negocio-lema').textContent = MARTARTA.lema;
    document.getElementById('negocio-actividad').textContent = MARTARTA.actividad;
    document.getElementById('negocio-direccion').textContent = MARTARTA.direccion;
    const nif = document.getElementById('negocio-nif');
    nif.textContent = MARTARTA.nif ? `NIF ${MARTARTA.nif}` : '';
    document.getElementById('negocio-contacto').textContent =
        `${MARTARTA.telefonoBonito} · ${MARTARTA.email}`;
    const insta = document.getElementById('negocio-instagram');
    insta.href = MARTARTA.instagram;
    insta.textContent = '@martartalatemporal';
}

function pintarCabecera(numero, fecha) {
    document.getElementById('factura-numero').textContent = numero;
    document.getElementById('factura-fecha').textContent = fechaLarga(fecha);
}

function pintarLineas(lineas, totales) {
    const cuerpo = document.getElementById('factura-lineas');
    cuerpo.innerHTML = '';
    lineas.forEach((l, i) => {
        const tr = document.createElement('tr');
        const td = (texto, clase) => {
            const c = document.createElement('td');
            c.textContent = texto;
            if (clase) c.className = clase;
            return c;
        };
        tr.append(
            td(i + 1),
            td(l.nombre),
            td(l.cantidad, 'c'),
            td(eu.format(l.precio), 'd'),
            td(eu.format(l.subtotal), 'd')
        );
        cuerpo.appendChild(tr);
    });
    document.getElementById('total-base').textContent = eu.format(totales.base);
    document.getElementById('total-iva').textContent =
        `${eu.format(totales.iva)} (${Math.round(MARTARTA.iva * 100)} %)`;
    document.getElementById('total-final').textContent = eu.format(totales.total);
}

function pintarFormaPago(metodo) {
    const textos = {
        bizum: 'Bizum al confirmar el pedido (Marta pasa el número por WhatsApp).',
        efectivo: 'En efectivo al recoger el pedido en Blanes.',
    };
    document.getElementById('factura-pago').textContent = textos[metodo] || textos.efectivo;
}

/* ---------- Arranque ---------- */
(function arranque() {
    let items = [];
    // Modo demo: factura.html?demo=1 muestra la plantilla con un pedido de ejemplo.
    if (new URLSearchParams(location.search).has('demo')) {
        items = [
            { id: 'tarta-queso', nombre: 'Tarta de queso clásica', precio: 22, cantidad: 1 },
            { id: 'cookies-pack', nombre: 'Pack de cookies surtidas', precio: 12, cantidad: 2 },
            { id: 'tarta-choco', nombre: 'Tarta de chocolate y avellana', precio: 26, cantidad: 1 },
        ];
    } else {
        try { items = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]'); } catch (e) { items = []; }
    }

    pintarLogo();
    pintarNegocio();

    if (items.length === 0) {
        document.getElementById('factura-vacia').hidden = false;
        document.getElementById('factura-documento').hidden = true;
        document.querySelectorAll('.factura-acciones').forEach((el) => { el.hidden = true; });
        return;
    }

    const fecha = new Date();
    const numero = siguienteNumeroFactura(fecha.getFullYear());
    const lineas = calcularLineas(items);
    const totales = calcularTotales(lineas, MARTARTA.iva);
    pintarCabecera(numero, fecha);
    pintarLineas(lineas, totales);
    pintarFormaPago(document.getElementById('forma-pago').value);

    document.getElementById('forma-pago').addEventListener('change', (e) => pintarFormaPago(e.target.value));
    document.getElementById('cliente-nombre').addEventListener('input', (e) => {
        document.getElementById('factura-cliente').textContent = e.target.value.trim() || 'Cliente';
    });
    document.getElementById('imprimir').addEventListener('click', () => window.print());
    document.getElementById('volver').addEventListener('click', () => { window.location.href = 'tartas.html'; });
})();
