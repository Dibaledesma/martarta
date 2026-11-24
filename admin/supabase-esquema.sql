-- ==================================================================
--  MARTARTA — Panel interno: pedidos y contabilidad (Supabase)
--  ------------------------------------------------------------------
--  DÓNDE EJECUTARLO:
--    1. Entra en https://supabase.com/dashboard
--    2. Abre tu proyecto → "SQL Editor" → "New query"
--    3. Pega TODO este archivo y pulsa "Run"
--  Solo hace falta ejecutarlo UNA vez.
-- ==================================================================

-- ---------- Pedidos ----------
create table if not exists public.pedidos (
  id              bigint generated always as identity primary key,  -- nº de registro (1, 2, 3…)
  cliente         text not null,
  contacto        text default '',          -- WhatsApp, teléfono…
  detalle         text not null,            -- qué tarta / producto
  cantidad        int  not null default 1,
  precio_unitario numeric(10,2) not null default 0,
  fecha_entrega   date,                     -- cuándo hay que entregarla
  notas           text default '',
  pagado          boolean not null default false,
  pagado_en       timestamptz,              -- cuándo se marcó como pagado
  creado_en       timestamptz not null default now()
);

-- ---------- Costes ----------
create table if not exists public.costes (
  id        bigint generated always as identity primary key,
  fecha     date not null default current_date,
  concepto  text not null,
  categoria text not null default 'Otros',  -- Ingredientes, Material, Transporte, Otros
  importe   numeric(10,2) not null default 0,
  creado_en timestamptz not null default now()
);

-- ---------- Seguridad: solo usuarios con login ----------
alter table public.pedidos enable row level security;
alter table public.costes enable row level security;

create policy "pedidos_uso_interno" on public.pedidos
  for all to authenticated using (true) with check (true);

create policy "costes_uso_interno" on public.costes
  for all to authenticated using (true) with check (true);
