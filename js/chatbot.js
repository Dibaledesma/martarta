/* ==================================================================
   TARTABOT 🧁 — Chatbot local de Martarta (sin APIs, sin coste)
   ------------------------------------------------------------
   * Un chat flotante que responde dudas sobre la web:
     horario, tartas, precios, cómo pedir, pago, quién es Marta...
   * 100% JavaScript local: no llama a ningún servicio externo.
   * Para actualizar precios/tartas: busca PRODUCTOS más abajo
     (es la única lista que hay que tocar).
================================================================== */

/* ---------- 📋 DATOS DE LA WEB (actualizar aquí si cambian) ---------- */
const TARTABOT_DATOS = {
    nombre: 'Tartabot',
    telefono: '34614896462',                                   // WhatsApp de Marta
    telefonoBonito: '614 89 64 62',
    correo: 'latemporalblanes@gmail.com',
    instagram: 'https://www.instagram.com/martartalatemporal',
    horario: 'miércoles a domingo, de 9:00 a 17:00',
};

/* ⚠️ PRODUCTOS: actualizar cuando Marta pase los reales.
   (Ahora son los de ejemplo que hay en la web.) */
const PRODUCTOS = [
    { nombre: 'Tarta de queso clásica', precio: 22, resumen: 'la de toda la vida, cremosa y al horno' },
    { nombre: 'Tarta de chocolate y avellana', precio: 26, resumen: 'ganache y avellana crujiente' },
    { nombre: 'Pack de cookies surtidas', precio: 12, resumen: 'seis unidades recién horneadas' },
    { nombre: 'Tarta de queso sin lactosa', precio: 24, resumen: 'apta para intolerantes 🥛' },
    { nombre: 'Bizcocho sin gluten', precio: 20, resumen: 'esponjoso, apto para celíacos 🌾' },
    { nombre: 'Tarta de zanahoria', precio: 23, resumen: 'nueces, canela y crema de queso 🥕' },
    { nombre: 'Tarta de limón', precio: 21, resumen: 'merengue tostado y sin lactosa 🍋' },
    { nombre: 'Red Velvet', precio: 28, resumen: 'terciopelo rojo con crema de queso ❤️' },
    { nombre: 'Tarta de manzana', precio: 19, resumen: 'hojaldre y canela, sin lactosa 🍎' },
    { nombre: 'Postres en vasito (x4)', precio: 14, resumen: 'pack de cuatro, sin gluten 🍮' },
];

function listaProductos() {
    return PRODUCTOS.map(p => `🧁 <strong>${p.nombre}</strong> — ${p.precio} € <em>(${p.resumen})</em>`).join('<br>');
}

/* ---------- 🧠 CEREBRO: intenciones y respuestas ----------
   El bot mira cuántas palabras clave encajan en el mensaje
   y responde con la intención ganadora (peso 2 = más específica). */
const INTENCIONES = [
    {
        id: 'saludo', peso: 1,
        claves: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'hey', 'que tal', 'holaa'],
        resp: () => '¡Hola! 👋 ¿En qué te ayudo? Pregúntame por <strong>horario</strong>, <strong>tartas</strong>, <strong>precios</strong>, <strong>cómo pedir</strong> o <strong>pago</strong>.'
    },
    {
        id: 'horario', peso: 1,
        claves: ['horario', 'hora', 'horas', 'abierto', 'abris', 'abren', 'cuando', 'cuanto antes', 'atencion'],
        resp: () => `⏰ Soy una web <strong>solo online</strong> (no hay tienda física).<br>La <strong>recogida de pedidos en Blanes</strong> es de <strong>${TARTABOT_DATOS.horario}</strong>.`
    },
    {
        id: 'donde', peso: 1,
        claves: ['donde', 'direccion', 'ubicacion', 'ubicas', 'blanes', 'tienda', 'obrador', 'local', 'os encontrais'],
        resp: () => '📍 Estamos en <strong>Blanes</strong>. Solo online: los pedidos se hacen aquí en la web y se recogen en Blanes 🏠'
    },
    {
        id: 'precios', peso: 1,
        claves: ['precio', 'precios', 'cuanto cuesta', 'cuanto vale', 'cuanto es', 'cuesta', 'vale', 'tarifa', 'tarifas', 'caro', 'barato'],
        resp: () => `Estos son los precios de ahora:<br><br>${listaProductos()}<br><br>¿Y las tartas <strong>personalizadas</strong>? Me cuentas tu idea a Marta por WhatsApp y te dice precio 💬`
    },
    {
        id: 'queso', peso: 2,
        claves: ['queso', 'cheesecake', 'san marc'],
        resp: () => `🧀 Nuestra <strong>Tarta de queso clásica</strong> está a <strong>22 €</strong>: la de toda la vida, con base de galleta casera. ¡La más pedida!`
    },
    {
        id: 'chocolate', peso: 2,
        claves: ['chocolate', 'choco', 'avellana', 'brownie'],
        resp: () => `🍫 La de <strong>chocolate y avellana</strong> está a <strong>26 €</strong>: para paladares exigentes 😋`
    },
    {
        id: 'cookies', peso: 2,
        claves: ['cookie', 'cookies', 'galleta', 'galletas'],
        resp: () => `🍪 El <strong>pack de cookies surtidas</strong> (6 unidades) está a <strong>12 €</strong>, recién horneadas.`
    },
    {
        id: 'productos', peso: 1,
        claves: ['tarta', 'tartas', 'que hay', 'menu', 'carta', 'variedad', 'catalogo', 'dulces', 'personalizada', 'personalizadas', 'bizcocho', 'cumpleanos'],
        resp: () => `Esto es lo que hay ahora mismo:<br><br>${listaProductos()}<br><br>✨ ¿Quieres algo <strong>personalizado</strong>? Se puede: cuéntale la idea a Marta por WhatsApp.`
    },
    {
        id: 'pedir', peso: 1,
        claves: ['pedir', 'pedido', 'encargar', 'comprar', 'carrito', 'reservar', 'como pido', 'como compro', 'quiero una tarta', 'quiero tarta'],
        resp: () => `🧺 Muy fácil, dos formas:<br><br>1️⃣ <strong>Desde la web</strong>: pulsa «Añadir 🧺» en las tartas y confirma el pedido (te lleva a WhatsApp o al correo ya escrito).<br>2️⃣ <strong>Directo por WhatsApp</strong>: <a href="https://wa.me/${TARTABOT_DATOS.telefono}" target="_blank">escríbele a Marta</a> al ${TARTABOT_DATOS.telefonoBonito} 💬`
    },
    {
        id: 'whatsapp', peso: 1,
        claves: ['whatsapp', 'telefono', 'movil', 'numero', 'llamar', 'llamo'],
        resp: () => `📱 El WhatsApp de Martarta es <strong>${TARTABOT_DATOS.telefonoBonito}</strong>.<br><a href="https://wa.me/${TARTABOT_DATOS.telefono}" target="_blank">Pulsa aquí para abrir el chat</a> 💬`
    },
    {
        id: 'humano', peso: 2,
        claves: ['humano', 'persona', 'real', 'hablar con marta', 'con marta', 'atencion al cliente', 'operador'],
        resp: () => `Claro, mejor con la jefa 😄<br><a href="https://wa.me/${TARTABOT_DATOS.telefono}" target="_blank">Escríbele a Marta por WhatsApp</a> al ${TARTABOT_DATOS.telefonoBonito} y te atiende al momento.`
    },
    {
        id: 'correo', peso: 1,
        claves: ['correo', 'email', 'mail', 'escribirte un correo'],
        resp: () => `📧 Puedes escribir a <strong>${TARTABOT_DATOS.correo}</strong> (también los pedidos del carrito se pueden confirmar por correo).`
    },
    {
        id: 'pago', peso: 1,
        claves: ['pagar', 'pago', 'bizum', 'efectivo', 'tarjeta', 'transferencia', 'metodo de pago'],
        resp: () => `💳 Dos formas:<br><br>• <strong>Bizum</strong> — el número te lo pasa Marta por WhatsApp al confirmar.<br>• <strong>Efectivo</strong> — al recoger tu pedido en Blanes.`
    },
    {
        id: 'entrega', peso: 1,
        claves: ['envio', 'envios', 'entrega', 'entregar', 'recoger', 'recogida', 'llevar', 'a domicilio', 'domicilio'],
        resp: () => `🏠 La <strong>recogida</strong> es en Blanes, de <strong>${TARTABOT_DATOS.horario}</strong>.<br>¿Necesitas envío a domicilio? Consúltalo con Marta por WhatsApp y os lo miráis 💬`
    },
    {
        id: 'marta', peso: 2,
        claves: ['quien eres', 'quien es marta', 'marta', 'sobre mi', 'sobre ti', 'sobre marta', 'historia', 'pastelera', 'quien hace'],
        resp: () => `Soy <strong>Tartabot</strong> 🧁, la ayudante virtual.<br><br>Marta es la pastelera: lleva <strong>17 años</strong> en esto (empezó a los 16), tiene titulación y varios premios. Su filosofía: <em>«Yo no hago tartas. Hago Martartas»</em> ✨`
    },
    {
        id: 'instagram', peso: 1,
        claves: ['instagram', 'redes', 'perfil', 'tiktok', 'instagram de'],
        resp: () => `📸 Síguenos en Instagram: <a href="${TARTABOT_DATOS.instagram}" target="_blank">@martartalatemporal</a> — tartas nuevas y detrás de las cámaras.`
    },
    {
        id: 'novedades', peso: 1,
        claves: ['novedades', 'suscribir', 'suscribirme', 'newsletter', 'aviso', 'avisadme', 'enterarme'],
        resp: () => `💌 En la sección <strong>Contacto → Novedades</strong> (abajo en la web) dejas tu email y Marta te avisa de tartas de temporada. ¡Sin spam!`
    },
    {
        id: 'gracias', peso: 1,
        claves: ['gracias', 'genial', 'perfecto', 'guay', 'dale', 'vale perfecto'],
        resp: () => '¡Un placer! 🧁 Si se te ocurre otra duda, aquí estoy. Y si no… ¡que aproveche! 😋'
    },
    {
        id: 'adios', peso: 1,
        claves: ['adios', 'hasta luego', 'chao', 'nos vemos', 'hasta pronto'],
        resp: () => '¡Hasta pronto! 👋 Que tu día sea dulce 🍰'
    },
];

/* ---------- Respuestas que no encajan ---------- */
const RESP_FALLBACK = 'Uy, eso todavía no me lo han enseñado 😅<br>Prueba con: <strong>horario</strong>, <strong>tartas</strong>, <strong>precios</strong>, <strong>cómo pedir</strong>, <strong>pago</strong>…<br>¿O prefieres hablar con Marta directamente? <a href="https://wa.me/' + TARTABOT_DATOS.telefono + '" target="_blank">WhatsApp 💬</a>';

/* ---------- Estilos (se inyectan una sola vez) ---------- */
const estilo = document.createElement('style');
estilo.textContent = `
.chatbot-btn{position:fixed;bottom:1.2rem;right:1.2rem;width:58px;height:58px;
  border-radius:50%;background:var(--rojo);color:#fff;font-size:1.7rem;border:3px solid #fff;
  cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);z-index:60;transition:transform .15s ease}
.chatbot-btn:hover{transform:scale(1.1)}
.chatbot-btn .chatbot-punto{position:absolute;top:-2px;right:-2px;width:14px;height:14px;
  border-radius:50%;background:#ffd54f;border:2px solid #fff}
.chatbot-avatar{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
.chatbot-panel{position:fixed;bottom:calc(1.2rem + 70px);right:1.2rem;width:min(340px,calc(100vw - 2rem));
  max-height:min(520px,calc(100vh - 10rem));background:#fff;border-radius:16px;overflow:hidden;
  display:none;flex-direction:column;box-shadow:0 10px 40px rgba(63,29,29,.35);z-index:60;
  border:3px solid var(--rojo-suave)}
.chatbot-panel.abierto{display:flex;animation:chatbot-subir .2s ease}
@keyframes chatbot-subir{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.chatbot-cabecera{background:linear-gradient(160deg,var(--rojo),var(--rojo-oscuro));color:#fff;
  padding:.7rem 1rem;display:flex;justify-content:space-between;align-items:center}
.chatbot-cabecera h3{margin:0;font-family:'Caveat',cursive;font-size:1.4rem}
.chatbot-cabecera small{color:#ffe4de;display:block;font-family:'Nunito',sans-serif;font-size:.72rem}
.chatbot-cerrar{background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;opacity:.8}
.chatbot-cuerpo{flex:1;overflow-y:auto;padding:.8rem;display:flex;flex-direction:column;gap:.5rem;
  background:var(--rojo-suave);min-height:220px}
.chatbot-msg{max-width:85%;padding:.55rem .8rem;border-radius:14px;font-size:.92rem;line-height:1.45}
.chatbot-msg a{color:var(--rojo);font-weight:700}
.chatbot-bot{background:#fff;align-self:flex-start;border:2px solid var(--rojo-suave);
  border-bottom-left-radius:4px}
.chatbot-usuario{background:var(--rojo);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.chatbot-chips{display:flex;gap:.4rem;flex-wrap:wrap;padding:.5rem .8rem;background:#fff;
  border-top:1px solid var(--rojo-suave)}
.chatbot-chip{background:var(--rojo-suave);color:var(--rojo);border:none;border-radius:999px;
  padding:.3rem .7rem;font-size:.8rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif}
.chatbot-chip:hover{background:var(--rojo);color:#fff}
.chatbot-entrada{display:flex;gap:.5rem;padding:.6rem .8rem;background:#fff}
.chatbot-entrada input{flex:1;border:2px solid var(--rojo-suave);border-radius:10px;
  padding:.5rem .7rem;font-family:'Nunito',sans-serif;font-size:.95rem}
.chatbot-entrada input:focus{outline:none;border-color:var(--rojo)}
.chatbot-entrada button{background:var(--rojo);color:#fff;border:none;border-radius:10px;
  padding:0 .9rem;font-size:1.2rem;cursor:pointer}
`;
document.head.appendChild(estilo);

/* ---------- Construir la interfaz ---------- */
const btn = document.createElement('button');
btn.className = 'chatbot-btn';
btn.setAttribute('aria-label', 'Abrir chat de Tartabot');
btn.innerHTML = '<img class="chatbot-avatar" src="img/hero-temporal.jpg" alt="Tartabot"><span class="chatbot-punto"></span>';
const panel = document.createElement('div');
panel.className = 'chatbot-panel';
panel.setAttribute('role', 'dialog');
panel.setAttribute('aria-label', 'Chat con Tartabot');
panel.innerHTML = `
    <header class="chatbot-cabecera">
        <div class="chatbot-cabecera-izq"><img class="chatbot-avatar-cabecera" src="img/hero-temporal.jpg" alt="Tartabot"><div><h3>Tartabot</h3><small>La ayudante de Martarta — responde al instante</small></div></div>
        <button class="chatbot-cerrar" aria-label="Cerrar chat">✕</button>
    </header>
    <div class="chatbot-cuerpo" id="chatbot-cuerpo"></div>
    <div class="chatbot-chips" id="chatbot-chips"></div>
    <div class="chatbot-entrada">
        <input type="text" id="chatbot-texto" placeholder="Escribe tu duda…" aria-label="Mensaje">
        <button id="chatbot-enviar" aria-label="Enviar">➤</button>
    </div>
`;
document.body.append(btn, panel);

const cuerpo = panel.querySelector('#chatbot-cuerpo');
const chipsEl = panel.querySelector('#chatbot-chips');
const input = panel.querySelector('#chatbot-texto');

/* ---------- Lógica del chat ---------- */
function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function responder(mensaje) {
    const texto = normalizar(mensaje);
    let mejor = null, mejorPuntuacion = 0;

    for (const intencion of INTENCIONES) {
        let puntos = 0;
        for (const clave of intencion.claves) {
            if (texto.includes(clave)) puntos += intencion.peso;
        }
        if (puntos > mejorPuntuacion) {          // empate gana la primera de la lista
            mejorPuntuacion = puntos;
            mejor = intencion;
        }
    }
    return mejor ? mejor.resp() : RESP_FALLBACK;
}

function burbuja(html, quien) {
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-' + quien;
    div.innerHTML = html;
    cuerpo.append(div);
    cuerpo.scrollTop = cuerpo.scrollHeight;      // bajar al último mensaje
}

function diceElBot(mensaje) {
    const pensando = document.createElement('div');
    pensando.className = 'chatbot-msg chatbot-bot';
    pensando.textContent = '…';
    cuerpo.append(pensando);
    cuerpo.scrollTop = cuerpo.scrollHeight;

    setTimeout(() => {
        pensando.remove();
        burbuja(responder(mensaje), 'bot');
    }, 450);                                     // pequeña pausa: parece que "piensa"
}

function enviar() {
    const texto = input.value.trim();
    if (!texto) return;
    burbuja(texto.replace(/</g, '&lt;'), 'usuario');  // sin HTML del usuario
    input.value = '';
    diceElBot(texto);
}

/* Preguntas rápidas (chips) */
const CHIPS = ['🕒 Horario', '🍰 Tartas', '💰 Precios', '🧺 Cómo pedir', '💳 Pago', '👋 Quién es Marta'];
CHIPS.forEach(chip => {
    const b = document.createElement('button');
    b.className = 'chatbot-chip';
    b.textContent = chip;
    b.onclick = () => { burbuja(chip, 'usuario'); diceElBot(chip); };
    chipsEl.append(b);
});

/* Abrir / cerrar */
let saludoInicial = false;
btn.addEventListener('click', () => {
    const abierto = panel.classList.toggle('abierto');
    btn.innerHTML = abierto ? '✕' : '<img class="chatbot-avatar" src="img/hero-temporal.jpg" alt="Tartabot"><span class="chatbot-punto"></span>';
    if (abierto && !saludoInicial) {
        saludoInicial = true;
        setTimeout(() => burbuja(
            `¡Hola! 👋 Soy <strong>Tartabot</strong> 🧁, la ayudante de <strong>Martarta</strong>.<br>Pregúntame lo que quieras: <strong>horario</strong>, <strong>tartas</strong>, <strong>precios</strong>, <strong>cómo pedir</strong>… o toca una de las preguntas de abajo 😊`,
            'bot'), 250);
    }
    if (abierto) input.focus();
});
panel.querySelector('.chatbot-cerrar').addEventListener('click', () => {
    panel.classList.remove('abierto');
    btn.innerHTML = '<img class="chatbot-avatar" src="img/hero-temporal.jpg" alt="Tartabot"><span class="chatbot-punto"></span>';
});

panel.querySelector('#chatbot-enviar').addEventListener('click', enviar);
input.addEventListener('keydown', e => { if (e.key === 'Enter') enviar(); });
