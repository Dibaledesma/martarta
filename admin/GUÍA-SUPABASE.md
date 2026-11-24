# Guía: poner en marcha el panel interno (Supabase)

Objetivo: que Marta registre pedidos (los que llegan por WhatsApp) desde el
móvil, con botón **rojo = sin pagar → verde = pagado**, y llevar las cuentas.

Solo hay que hacer estos pasos **UNA vez**. Después, todo funciona solo.

## 1 · Crear la cuenta y el proyecto (gratis)

1. Entra en **https://supabase.com** → *Start your project* → regístrate con
   Google o GitHub.
2. *New project*:
   - **Name**: `martarta`
   - **Database Password**: inventa una y guárdala (casi no se usa, pero la pide).
   - **Region**: *Central EU (Frankfurt)* (la más cercana).
3. Pulsa *Create new project* y espera 1–2 minutos.

## 2 · Crear las tablas

1. En el menú lateral: **SQL Editor** → *New query*.
2. Abre el archivo `supabase-esquema.sql` (en esta misma carpeta), copia **todo**
   su contenido, pégalo en el editor y pulsa **Run**.
3. Tiene que responder **Success**. Con eso ya existen las tablas `pedidos`
   y `costes`.

## 3 · Crear el usuario para entrar al panel

1. Menú lateral: **Authentication** → *Users* → **Add user** → *Create new user*.
2. Elige un correo y una contraseña **fácil de recordar** para Marta
   (por ejemplo `martarta.tartas@gmail.com` y una contraseña tipo `Tartas2026!`).
   No hace falta que el correo exista de verdad; es solo la llave de entrada.
3. Importante: en **Authentication → Sign In / Providers** deja **desactivado**
   *Allow new users to sign up*. Así nadie más puede crearse cuenta.

## 4 · Conectar la app con la base de datos

1. Menú lateral: **Project Settings** (⚙) → **API**.
2. Copia estos dos valores:
   - **Project URL** (empieza por `https://`)
   - **anon public** (una clave larga)
3. Abre `config.js` (en esta misma carpeta) y pégalos donde dice
   `PEGA_AQUI_...`. Guarda.

## 5 · Probar

Doble clic en **ABRIR-PANEL.bat** (o abre `panel-online/index.html` en el
navegador):

1. Entra con el usuario del paso 3.
2. Pestaña **➕ Nuevo** → registra un pedido de prueba (p. ej. "Tarta de queso,
   22 €").
3. En **📋 Pedidos** verás el botón **rojo**; púlsalo y se pone **verde**
   (pagado).
4. En **💰 Cuentas** mira que salgan las cifras.
5. Borra el pedido de prueba (🗑) cuando termines.

## 6 · Publicarlo para el móvil

1. Ejecuta **PUBLICAR-WEB.bat** (el de la raíz del proyecto).
2. El panel quedará en: **https://dibaledesma.github.io/martarta/admin/**
3. En el móvil de Marta: abre ese enlace → menú del navegador →
   *"Añadir a pantalla de inicio"*. Le quedará como una app con su icono.

> La página se puede abrir desde cualquier móvil, pero los datos solo los ve
> quien tenga el usuario y la contraseña. Sin sesión, Supabase no entrega nada.

## Copia de seguridad

Los datos viven en Supabase. Si algún día se quieren exportar:
**Table Editor** → tabla `pedidos` o `costes` → *Download CSV*.
