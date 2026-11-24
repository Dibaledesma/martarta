/* ==================================================================
   MARTARTA — Panel interno · lógica
   Pedidos y contabilidad sobre Supabase (login + base de datos).
================================================================== */
'use strict';

/* ---------- Utilidades ---------- */
const $ = id => document.getElementById(id);
const euros = n => (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const fechaBonita = iso => { if (!iso) return '—'; const [a, m, d] = iso.slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const hoyISO = () => new Date().toISOString().slice(0, 10);
const mesActual = () => new Date().toISOString().slice(0, 7);

let toastTimer = null;
function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.remove('oculto');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('oculto'), 2600);
}

/* ---------- Conexión con Supabase ---------- */
let sb = null;

function configurado() {
    return typeof SUPABASE_URL === 'string'
        && SUPABASE_URL.startsWith('https://')
        && typeof SUPABASE_ANON_KEY === 'string'
        && SUPABASE_ANON_KEY.length > 30;
}

function iniciarSupabase() {
    if (!configurado()) {
        $('aviso-config').classList.remove('oculto');
        return;
    }
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    sb.auth.onAuthStateChange((_evento, sesion) => {
        if (sesion) mostrarApp();
        else mostrarLogin();
    });
}

/* ---------- Login / sesión ---------- */
function mostrarLogin() {
    $('app').classList.add('oculto');
    $('pantalla-login').classList.remove('oculto');
}
function mostrarApp() {
    $('pantalla-login').classList.add('oculto');
    $('app').classList.remove('oculto');
    cargarTodo();
}

$('form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const error = $('login-error');
    error.classList.add('oculto');
    const { error: err } = await sb.auth.signInWithPassword({
        email: $('login-email').value.trim(),
        password: $('login-pass').value
    });
    if (err) {
        error.textContent = err.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos.'
            : err.message;
        error.classList.remove('oculto');
    }
});

$('btn-salir').addEventListener('click', () => sb.auth.signOut());

/* ---------- Pestañas ---------- */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => activarTab(btn.dataset.tab));
});
function activarTab(nombre) {
    document.querySelectorAll('.tab').forEach(s => s.classList.add('oculto'));
    $(`tab-${nombre}`).classList.remove('oculto');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('activo', b.dataset.tab === nombre));
    if (nombre === 'cuentas') pintarCuentas();
    window.scrollTo({ top: 0 });
}

/* ---------- Datos ---------- */
let pedidos = [];
let costes = [];

async function cargarTodo() {
    await Promise.all([cargarPedidos(), cargarCostes()]);
    pintarPedidos();
    pintarCostes();
    pintarCuentas();
}

async function cargarPedidos() {
    const { data, error } = await sb.from('pedidos').select('*').order('id', { ascending: false });
    if (error) { toast('Error al cargar pedidos: ' + error.message); return; }
    pedidos = data;
}

async function cargarCostes() {
    const { data, error } = await sb.from('costes').select('*').order('fecha', { ascending: false }).order('id', { ascending: false });
    if (error) { toast('Error al cargar costes: ' + error.message); return; }
    costes = data;
}

/* ---------- Pedidos: pintar ---------- */
function pintarPedidos() {
    const lista = $('lista-pedidos');
    lista.innerHTML = '';

    /* Solicitudes de la web (aún sin aceptar) arriba del todo */
    const solicitudes = pedidos.filter(p => p.estado === 'solicitud');
    const normales = pedidos.filter(p => p.estado !== 'solicitud');

    $('pedidos-vacio').classList.toggle('oculto', normales.length > 0 || solicitudes.length > 0);

    const pendienteTotal = normales.filter(p => !p.pagado).reduce((s, p) => s + p.cantidad * p.precio_unitario, 0);
    $('rap-pendiente').textContent = euros(pendienteTotal);
    $('rap-num').textContent = normales.length;

    for (const p of solicitudes) {
        const li = document.createElement('li');
        li.className = 'pedido-card solicitud';
        li.innerHTML = `
            <div class="pedido-cab">
                <span class="pedido-num">✉️ solicitud</span>
                <span class="pedido-cliente">${sinHTML(p.cliente)}</span>
            </div>
            <div class="pedido-detalle">${sinHTML(p.detalle)}</div>
            <div class="pedido-datos">
                <span class="pedido-total">${euros(p.cantidad * p.precio_unitario)}</span>
                ${p.forma_pago ? `<span class="badge-pago">${sinHTML(p.forma_pago)}</span>` : ''}
                ${p.contacto ? `<span>📞 ${sinHTML(p.contacto)}</span>` : ''}
                ${p.correo ? `<span>📧 ${sinHTML(p.correo)}</span>` : ''}
            </div>
            ${p.notas ? `<div class="pedido-detalle">📝 ${sinHTML(p.notas)}</div>` : ''}`;

        const acciones = document.createElement('div');
        acciones.className = 'acciones';

        const btnAceptar = document.createElement('button');
        btnAceptar.className = 'btn btn-aceptar';
        btnAceptar.textContent = '✓ Aceptar pedido';
        btnAceptar.addEventListener('click', () => aceptarSolicitud(p));

        const btnDesistir = document.createElement('button');
        btnDesistir.className = 'btn-desistir';
        btnDesistir.textContent = '✗ Desistir';
        btnDesistir.addEventListener('click', () => desistirSolicitud(p));

        acciones.append(btnAceptar, btnDesistir);
        li.append(acciones);
        lista.append(li);
    }

    for (const p of normales) {
        const li = document.createElement('li');
        li.className = 'pedido-card' + (p.pagado ? ' pagado' : '');

        const total = p.cantidad * p.precio_unitario;

        const btnPago = document.createElement('button');
        btnPago.className = 'btn btn-pago ' + (p.pagado ? 'pag' : 'sin');
        btnPago.textContent = p.pagado ? '✓ Pagado — desmarcar' : '✗ Sin pagar — marcar pagado';
        btnPago.addEventListener('click', () => alternarPagado(p));

        const btnBorrar = document.createElement('button');
        btnBorrar.className = 'btn-borrar';
        btnBorrar.title = 'Borrar pedido';
        btnBorrar.textContent = '🗑';
        btnBorrar.addEventListener('click', () => borrarPedido(p));

        li.innerHTML = `
            <div class="pedido-cab">
                <span class="pedido-num">#${p.id}</span>
                <span class="pedido-cliente">${sinHTML(p.cliente)}</span>
            </div>
            <div class="pedido-detalle">${sinHTML(p.detalle)}</div>
            <div class="pedido-datos">
                <span>${p.cantidad} × ${euros(p.precio_unitario)}</span>
                <span class="pedido-total">${euros(total)}</span>
                ${p.fecha_entrega ? `<span>entrega ${fechaBonita(p.fecha_entrega)}</span>` : ''}
                ${p.contacto ? `<span>${sinHTML(p.contacto)}</span>` : ''}
            </div>
            ${p.notas ? `<div class="pedido-detalle">📝 ${sinHTML(p.notas)}</div>` : ''}
            ${p.pagado && p.pagado_en ? `<span class="tarjeta-pagada">cobrado el ${fechaBonita(p.pagado_en)}</span>` : ''}`;

        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        acciones.append(btnPago, btnBorrar);
        li.append(acciones);
        lista.append(li);
    }
}

function sinHTML(t) { return String(t ?? '').replace(/</g, '&lt;'); }

/* ---------- Solicitudes de la web: aceptar / desistir ---------- */
async function aceptarSolicitud(p) {
    const { error } = await sb.from('pedidos').update({ estado: 'aceptado' }).eq('id', p.id);
    if (error) { toast('No se pudo aceptar: ' + error.message); return; }
    p.estado = 'aceptado';
    pintarPedidos();
    pintarCuentas();
    toast(`✓ Solicitud de ${p.cliente} aceptada — en marcha`);
}

async function desistirSolicitud(p) {
    if (!confirm(`¿Desistir de la solicitud de ${p.cliente}?\nSe borrará de la lista.`)) return;
    const { error } = await sb.from('pedidos').delete().eq('id', p.id);
    if (error) { toast('No se pudo borrar: ' + error.message); return; }
    pedidos = pedidos.filter(x => x.id !== p.id);
    pintarPedidos();
    pintarCuentas();
    toast('Solicitud desistida y borrada');
}

/* ---------- Pedidos: acciones ---------- */
async function alternarPagado(p) {
    const { error } = await sb.from('pedidos')
        .update({ pagado: !p.pagado, pagado_en: !p.pagado ? new Date().toISOString() : null })
        .eq('id', p.id);
    if (error) { toast('No se pudo actualizar: ' + error.message); return; }
    p.pagado = !p.pagado;
    p.pagado_en = p.pagado ? new Date().toISOString() : null;
    pintarPedidos();
    pintarCuentas();
    toast(p.pagado ? `✓ Pedido #${p.id} marcado como PAGADO` : `Pedido #${p.id} vuelta a sin pagar`);
}

async function borrarPedido(p) {
    if (!confirm(`¿Borrar el pedido #${p.id} de ${p.cliente}?`)) return;
    const { error } = await sb.from('pedidos').delete().eq('id', p.id);
    if (error) { toast('No se pudo borrar: ' + error.message); return; }
    pedidos = pedidos.filter(x => x.id !== p.id);
    pintarPedidos();
    pintarCuentas();
    toast('Pedido borrado');
}

/* ---------- Formulario nuevo pedido ---------- */
function recalcularTotal() {
    const total = (Number($('ped-cantidad').value) || 0) * (Number($('ped-precio').value) || 0);
    $('ped-total-vista').textContent = euros(total);
}
$('ped-cantidad').addEventListener('input', recalcularTotal);
$('ped-precio').addEventListener('input', recalcularTotal);

$('form-pedido').addEventListener('submit', async e => {
    e.preventDefault();
    const nuevo = {
        cliente: $('ped-cliente').value.trim(),
        contacto: $('ped-contacto').value.trim(),
        detalle: $('ped-detalle').value.trim(),
        cantidad: Number($('ped-cantidad').value) || 1,
        precio_unitario: Number($('ped-precio').value) || 0,
        fecha_entrega: $('ped-entrega').value || null,
        notas: $('ped-notas').value.trim(),
        estado: 'aceptado'
    };
    const { data, error } = await sb.from('pedidos').insert(nuevo).select().single();
    if (error) { toast('No se pudo registrar: ' + error.message); return; }
    pedidos.unshift(data);
    pintarPedidos();
    pintarCuentas();
    e.target.reset();
    $('ped-cantidad').value = 1;
    recalcularTotal();
    activarTab('pedidos');
    toast(`✓ Pedido #${data.id} de ${data.cliente} registrado`);
});

/* ---------- Costes ---------- */
$('cos-fecha').value = hoyISO();

$('form-coste').addEventListener('submit', async e => {
    e.preventDefault();
    const nuevo = {
        fecha: $('cos-fecha').value || hoyISO(),
        concepto: $('cos-concepto').value.trim(),
        categoria: $('cos-categoria').value,
        importe: Number($('cos-importe').value) || 0
    };
    const { data, error } = await sb.from('costes').insert(nuevo).select().single();
    if (error) { toast('No se pudo apuntar: ' + error.message); return; }
    costes.unshift(data);
    pintarCostes();
    pintarCuentas();
    e.target.reset();
    $('cos-fecha').value = hoyISO();
    toast('✓ Coste apuntado');
});

function pintarCostes() {
    const lista = $('lista-costes');
    lista.innerHTML = '';
    $('costes-vacio').classList.toggle('oculto', costes.length > 0);
    for (const c of costes.slice(0, 30)) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${sinHTML(c.concepto)}
                <span class="fecha-categoria">${fechaBonita(c.fecha)} · ${sinHTML(c.categoria)}</span>
            </span>
            <span class="importe">${euros(c.importe)}</span>`;
        const btn = document.createElement('button');
        btn.className = 'btn-mini';
        btn.title = 'Borrar coste';
        btn.textContent = '🗑';
        btn.addEventListener('click', async () => {
            if (!confirm(`¿Borrar el coste «${c.concepto}»?`)) return;
            const { error } = await sb.from('costes').delete().eq('id', c.id);
            if (error) { toast('No se pudo borrar: ' + error.message); return; }
            costes = costes.filter(x => x.id !== c.id);
            pintarCostes();
            pintarCuentas();
        });
        li.append(btn);
        lista.append(li);
    }
}

/* ---------- Cuentas (contabilidad por mes / trimestre / año) ---------- */
$('cuentas-mes').value = mesActual();
$('cuentas-mes').addEventListener('change', pintarCuentas);

let vistaCuentas = 'mes';   // 'mes' | 'T1'..'T4' | 'anual'
document.querySelectorAll('.chip-vista').forEach(b => {
    b.addEventListener('click', () => {
        vistaCuentas = b.dataset.v;
        document.querySelectorAll('.chip-vista').forEach(x => x.classList.toggle('activo', x === b));
        pintarCuentas();
    });
});

function rangoCuentas() {
    const ref = $('cuentas-mes').value || mesActual();   // 'YYYY-MM'
    const y = Number(ref.slice(0, 4));
    if (vistaCuentas === 'mes')    return [`${ref}-01`, `${ref}-31`, 'Costes del mes'];
    if (vistaCuentas === 'anual') return [`${y}-01-01`, `${y}-12-31`, `Costes del año ${y}`];
    const t = Number(vistaCuentas.slice(1));              // 1..4
    const desde = String((t - 1) * 3 + 1).padStart(2, '0');
    const hasta = String(t * 3).padStart(2, '0');
    return [`${y}-${desde}-01`, `${y}-${hasta}-31`, `Costes del T${t} ${y}`];
}

function pintarCuentas() {
    const [desde, hasta, etiquetaCostes] = rangoCuentas();
    const enRango = fecha => { const f = (fecha || '').slice(0, 10); return f >= desde && f <= hasta; };

    const delMes = pedidos.filter(p => p.estado !== 'solicitud' && enRango(p.creado_en));
    const costesMes = costes.filter(c => enRango(c.fecha));

    const vendido  = delMes.reduce((s, p) => s + p.cantidad * p.precio_unitario, 0);
    const cobrado  = delMes.filter(p => p.pagado).reduce((s, p) => s + p.cantidad * p.precio_unitario, 0);
    const totalCostes = costesMes.reduce((s, c) => s + c.importe, 0);

    $('cu-vendido').textContent   = euros(vendido);
    $('cu-cobrado').textContent   = euros(cobrado);
    $('cu-pendiente').textContent = euros(vendido - cobrado);
    $('cu-costes').textContent    = euros(totalCostes);
    $('cu-beneficio').textContent = euros(cobrado - totalCostes);

    const listaMes = $('lista-costes-mes');
    listaMes.innerHTML = '';
    $('titulo-costes-vista').textContent = etiquetaCostes;
    $('costes-mes-vacio').classList.toggle('oculto', costesMes.length > 0);
    for (const c of costesMes) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${sinHTML(c.concepto)}
                <span class="fecha-categoria">${fechaBonita(c.fecha)} · ${sinHTML(c.categoria)}</span>
            </span>
            <span class="importe">${euros(c.importe)}</span>`;
        listaMes.append(li);
    }
}

/* ---------- Arranque ---------- */
iniciarSupabase();
