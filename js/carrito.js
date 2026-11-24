/* ==================================================================
   MARTARTA — Carrito de compra (todo local, sin servidor)
   ------------------------------------------------------------
   * Los productos se añaden desde las tarjetas de la web.
   * El carrito se guarda en el navegador (localStorage),
     así no se pierde al recargar la página.
   * Al confirmar, se abre WhatsApp o tu app de correo
     con el pedido ya escrito.
================================================================== */

/* ⚙️ CONFIGURACIÓN: cambia aquí el número de WhatsApp (una sola vez).
   Formato España: 34 + número, ejemplo: '34612345678'. */
const TELEFONO_WHATSAPP = '34614896462';

/* ⚙️ CONFIGURACIÓN DEL CORREO: escribe aquí el correo de Marta.
   Se usa para: 1) el botón «Confirmar por correo» del carrito
                2) el formulario de novedades de la sección Contacto
   En el formulario, el PRIMER envío llegará a este correo pidiendo
   confirmar la activación (servicio gratuito FormSubmit): se pulsa
   una sola vez y queda funcionando para siempre. */
const CORREO_PEDIDOS = 'latemporalblanes@gmail.com';

/* 💳 PAGOS ONLINE (opción B): botones de pago con enlaces de Stripe.
   CÓMO ACTIVARLO (3 pasos):
   1. Crea una cuenta gratis en https://stripe.com (necesitas ser la titular)
   2. En Stripe: Productos → Nuevo → crea cada tarta → «Enlace de pago»
      y copia la URL que empieza por https://buy.stripe.com/...
   3. Pega cada URL aquí abajo y cambia ACTIVAR_PAGOS_ONLINE a true */
const ACTIVAR_PAGOS_ONLINE = false;
const ENLACES_PAGO = {
    //'tarta-queso': 'https://buy.stripe.com/TU_ENLACE',
    //'tarta-choco': 'https://buy.stripe.com/TU_ENLACE',
    //'cookies-pack': 'https://buy.stripe.com/TU_ENLACE',
};

/* La web rellena automáticamente todos los botones de WhatsApp
   con el número de arriba. No hace falta tocar el HTML. */
document.querySelectorAll('a[href*="wa.me"]').forEach(enlace => {
    enlace.href = `https://wa.me/${TELEFONO_WHATSAPP}`;
});

/* Igual con el correo: los enlaces mailto: usan CORREO_PEDIDOS. */
document.querySelectorAll('a[href^="mailto:"]').forEach(enlace => {
    enlace.href = `mailto:${CORREO_PEDIDOS}`;
});

/* Formulario de novedades → FormSubmit en modo AJAX (no sale de la web
   y funciona tanto abriendo el index.html con doble clic como publicada).
   ⚠️ IMPORTANTE: la PRIMERA vez, FormSubmit manda a CORREO_PEDIDOS un email
   de activación → hay que pulsar «Activate Form» UNA sola vez (revisar spam).
   Hasta entonces, los envíos no llegan al correo. */
const formEmail = document.querySelector('form.form-email');
if (formEmail) {
    formEmail.addEventListener('submit', async (e) => {
        e.preventDefault();
        const boton = formEmail.querySelector('button[type="submit"]');
        const textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.textContent = 'Enviando…';

        try {
            const respuesta = await fetch(
                `https://formsubmit.co/ajax/${CORREO_PEDIDOS}`,
                { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(formEmail) }
            );
            const datos = await respuesta.json();

            if (respuesta.ok && String(datos.success) === 'true') {
                formEmail.innerHTML = '<p class="form-ok">💌 ¡Apuntada! Te avisaré de novedades y tartas de temporada.</p>';
            } else {
                throw new Error(datos.message || 'Envío rechazado');
            }
        } catch (error) {
            boton.disabled = false;
            boton.textContent = textoOriginal;
            alert('No se ha podido enviar 😅\n\n' +
                  '¿Has abierto la web con DOBLE CLIC? El servicio de correo no acepta\n' +
                  'envíos desde archivos sueltos: cierra el navegador y abre la web con\n' +
                  'ABRIR-WEB.bat (doble clic en él). Con eso funciona seguro.\n\n' +
                  'O escríbeme por WhatsApp: 614 89 64 62');
        }
    });
}

/* ---------- Estado del carrito ---------- */

const CLAVE_GUARDADO = 'martarta-carrito';
let carrito = cargarCarrito();

function cargarCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_GUARDADO)) || [];
    } catch {
        return [];
    }
}

function guardarCarrito() {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(carrito));
}

/* ---------- Operaciones ---------- */

function añadirAlCarrito(id, nombre, precio) {
    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    guardarCarrito();
    pintarCarrito();
    abrirCarrito();           // se abre para que se vea el resultado
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    }
    guardarCarrito();
    pintarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    pintarCarrito();
}

/* ---------- Dibujar el panel ---------- */

const listaEl = document.getElementById('carrito-lista');
const totalEl = document.getElementById('carrito-total');
const contadorEl = document.getElementById('contador-carrito');

function pintarCarrito() {
    // Contador de la cabecera
    const unidades = carrito.reduce((suma, i) => suma + i.cantidad, 0);
    contadorEl.textContent = unidades;

    // Lista
    if (carrito.length === 0) {
        listaEl.innerHTML = '<li class="carrito-vacio">Aún no hay tartas por aquí 🥺</li>';
        totalEl.textContent = '0 €';
        return;
    }

    let total = 0;
    listaEl.innerHTML = '';
    carrito.forEach(item => {
        total += item.precio * item.cantidad;

        const li = document.createElement('li');

        const info = document.createElement('div');
        info.className = 'item-info';
        info.innerHTML = `
            <div class="item-nombre">${item.nombre}</div>
            <div>${item.precio} €/ud</div>`;

        const controles = document.createElement('div');
        controles.className = 'item-controles';

        const btnMenos = document.createElement('button');
        btnMenos.textContent = '−';
        btnMenos.onclick = () => cambiarCantidad(item.id, -1);

        const cantidad = document.createElement('span');
        cantidad.textContent = item.cantidad;

        const btnMas = document.createElement('button');
        btnMas.textContent = '+';
        btnMas.onclick = () => cambiarCantidad(item.id, +1);

        controles.append(btnMenos, cantidad, btnMas);
        li.append(info, controles);
        listaEl.appendChild(li);
    });

    totalEl.textContent = `${total} €`;
}

/* ---------- Abrir y cerrar el panel ---------- */

const fondoEl = document.getElementById('carrito-fondo');
const panelEl = document.getElementById('carrito-panel');

function abrirCarrito() {
    fondoEl.hidden = false;
    panelEl.classList.add('abierto');
}

function cerrarCarrito() {
    fondoEl.hidden = true;
    panelEl.classList.remove('abierto');
}

document.getElementById('abrir-carrito').addEventListener('click', abrirCarrito);
document.getElementById('cerrar-carrito').addEventListener('click', cerrarCarrito);
fondoEl.addEventListener('click', cerrarCarrito);

/* CSS necesario para el panel (se inyecta una sola vez):
   sin esto el panel estaría siempre visible en su posición abierta. */
const estiloPanel = document.createElement('style');
estiloPanel.textContent = `
    .carrito-panel { transform: translateX(100%); transition: transform .25s ease; }
    .carrito-panel.abierto { transform: translateX(0); }
`;
document.head.appendChild(estiloPanel);

/* ---------- Botones "Añadir" de las tarjetas ---------- */

document.querySelectorAll('.tarjeta-producto').forEach(tarjeta => {
    const { id, nombre, precio } = tarjeta.dataset;
    const boton = tarjeta.querySelector('.boton-comprar');
    if (!boton) return;   // tarjetas sin carrito (ej. «precio a consultar»)
    boton.addEventListener('click', () => {
        añadirAlCarrito(id, nombre, Number(precio));
    });

    /* 💳 Si hay enlace de pago para este producto, mostramos el botón directo */
    const enlace = ENLACES_PAGO[id];
    const botonPago = tarjeta.querySelector('.boton-pago');
    if (ACTIVAR_PAGOS_ONLINE && enlace && botonPago) {
        botonPago.hidden = false;
        botonPago.addEventListener('click', () => window.open(enlace, '_blank'));
    }
});

/* ---------- Confirmar pedido (WhatsApp o correo) ---------- */

function redactarMensajePedido() {
    let total = 0;
    const lineas = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        return `• ${item.cantidad} × ${item.nombre} — ${subtotal} €`;
    });

    return `¡Hola Martarta! 🎂 Quiero hacer este pedido:\n\n` +
        lineas.join('\n') +
        `\n\nTotal: ${total} €\n\n¿Me confirmáis disponibilidad y forma de entrega? ¡Gracias!`;
}

function avisarCarritoVacio() {
    alert('Tu carrito está vacío. ¡Añade alguna tarta primero! 🧺');
}

/* ---------- Registro automático en el panel de Marta (base de datos) ----------
   Además de abrir WhatsApp/correo, el pedido queda apuntado SOLO en el panel.
   Los visitantes solo tienen permiso de ENVIAR (insert), nunca leer ni borrar. */
const SUPABASE_URL      = 'https://qjxwaqqvmjjzxrsvlgms.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9BE5Iuqg3R1ebbkzEaJqwQ_wQOdnICc';

function registrarPedidoEnPanel() {
    if (carrito.length === 0) return;

    let total = 0;
    const detalle = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        return `${item.cantidad} × ${item.nombre} (${subtotal} €)`;
    }).join(' · ');

    fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            cliente: 'Pedido web',
            contacto: '',
            detalle: detalle,
            cantidad: 1,
            precio_unitario: total,
            notas: 'Enviado desde la web por el cliente'
        })
    }).catch(() => {}); // si fallara, el pedido igualmente llega por WhatsApp/correo
}

/* Opción 1: WhatsApp */
document.getElementById('confirmar-pedido').addEventListener('click', () => {
    if (carrito.length === 0) { avisarCarritoVacio(); return; }
    registrarPedidoEnPanel();

    // encodeURIComponent convierte el texto a formato URL seguro
    window.open(
        `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(redactarMensajePedido())}`,
        '_blank'
    );
});

/* Opción 2: abre la app de correo con el pedido ya escrito.
   Funciona sin cuentas ni servicios: se abre el correo del cliente
   (Gmail, Outlook, la que tenga) con destino a CORREO_PEDIDOS. */
document.getElementById('confirmar-email').addEventListener('click', () => {
    if (carrito.length === 0) { avisarCarritoVacio(); return; }
    registrarPedidoEnPanel();

    const cuerpo = redactarMensajePedido().replace(/\n/g, '\r\n');
    const asunto = 'Pedido desde la web 🎂';
    window.location.href =
        `mailto:${CORREO_PEDIDOS}` +
        `?subject=${encodeURIComponent(asunto)}` +
        `&body=${encodeURIComponent(cuerpo)}`;
});

/* Opción 3: genera una factura simplificada del pedido (factura.html). */
document.getElementById('generar-factura').addEventListener('click', () => {
    if (carrito.length === 0) { avisarCarritoVacio(); return; }
    localStorage.setItem('martarta-factura', JSON.stringify(carrito));
    window.location.href = 'factura.html';
});

/* ---------- Arranque ---------- */
pintarCarrito();
// Enlace directo al carrito: tartas.html?carrito lo abre al cargar (lo usa la simulación de compra).
if (new URLSearchParams(location.search).has('carrito')) abrirCarrito();
