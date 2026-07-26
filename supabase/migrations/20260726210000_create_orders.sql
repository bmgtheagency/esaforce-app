create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table private.app_config enable row level security;
revoke all on table private.app_config from public, anon, authenticated;

insert into private.app_config (key, value)
values
  ('backend_secret_sha256', '4d6666a061abd338ed3a24d26fc18a97faadd6b75a390e01057f5d4c3982bbef'),
  ('admin_pin_sha256', 'f3332b291d4e301ee79ac989c52c62aa9fc129c51bc6075643545451f9fff7a2')
on conflict (key) do update
set value = excluded.value, updated_at = now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique check (order_code ~ '^ESA-[A-Z0-9]{6}$'),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (
    char_length(phone) between 8 and 24
    and phone ~ '^[+0-9 ().-]+$'
    and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 8
  ),
  fulfillment text not null check (fulfillment in ('pickup', 'eat-in')),
  pickup_time text not null check (
    pickup_time in (
      'As soon as possible',
      'In 30 minutes',
      'In 1 hour',
      'Schedule at counter'
    )
  ),
  notes text check (notes is null or char_length(notes) <= 500),
  language text not null default 'en' check (language in ('en', 'fr', 'ar')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'received'
    check (status in ('received', 'preparing', 'ready', 'collected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null check (char_length(product_id) between 1 and 100),
  name text not null check (char_length(name) between 1 and 120),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 20),
  nutrition jsonb not null default '{}'::jsonb
    check (jsonb_typeof(nutrition) = 'object'),
  selections jsonb not null default '{}'::jsonb
    check (jsonb_typeof(selections) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders from public, anon, authenticated;
revoke all on table public.order_items from public, anon, authenticated;

comment on table public.orders is
  'ESAFORCE customer orders. Access is restricted to authenticated backend RPC calls.';
comment on table public.order_items is
  'Line items belonging to ESAFORCE orders. Access is server-only.';

create or replace function public.submit_order(
  p_backend_secret text,
  p_order_code text,
  p_customer_name text,
  p_phone text,
  p_fulfillment text,
  p_pickup_time text,
  p_notes text,
  p_language text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_created_at timestamptz;
  v_item jsonb;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_subtotal numeric(10,2) := 0;
begin
  if p_backend_secret is null or not exists (
    select 1
    from private.app_config
    where key = 'backend_secret_sha256'
      and value = pg_catalog.encode(
        extensions.digest(pg_catalog.convert_to(p_backend_secret, 'UTF8'), 'sha256'),
        'hex'
      )
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_order_code !~ '^ESA-[A-Z0-9]{6}$' then
    raise exception 'Invalid order code' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) < 1
    or jsonb_array_length(p_items) > 30 then
    raise exception 'Invalid order items' using errcode = '22023';
  end if;

  insert into public.orders (
    order_code,
    customer_name,
    phone,
    fulfillment,
    pickup_time,
    notes,
    language,
    subtotal,
    total,
    status
  )
  values (
    p_order_code,
    p_customer_name,
    p_phone,
    p_fulfillment,
    p_pickup_time,
    nullif(p_notes, ''),
    p_language,
    0,
    0,
    'received'
  )
  returning id, created_at into v_order_id, v_created_at;

  for v_item in
    select value from pg_catalog.jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Invalid order item' using errcode = '22023';
    end if;

    v_quantity := (v_item ->> 'quantity')::integer;
    v_unit_price := (v_item ->> 'unit_price')::numeric(10,2);

    if v_quantity < 1 or v_quantity > 20
      or v_unit_price < 0 or v_unit_price > 2000
      or jsonb_typeof(v_item -> 'nutrition') <> 'object'
      or jsonb_typeof(coalesce(v_item -> 'selections', '{}'::jsonb)) <> 'object' then
      raise exception 'Invalid order item values' using errcode = '22023';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      name,
      unit_price,
      quantity,
      nutrition,
      selections
    )
    values (
      v_order_id,
      v_item ->> 'product_id',
      v_item ->> 'name',
      v_unit_price,
      v_quantity,
      v_item -> 'nutrition',
      coalesce(v_item -> 'selections', '{}'::jsonb)
    );

    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  end loop;

  update public.orders
  set subtotal = v_subtotal, total = v_subtotal
  where id = v_order_id;

  return jsonb_build_object(
    'order_code', p_order_code,
    'status', 'received',
    'created_at', v_created_at,
    'total', v_subtotal
  );
end;
$$;

create or replace function public.track_order(
  p_backend_secret text,
  p_order_code text
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_backend_secret is null or not exists (
    select 1
    from private.app_config
    where key = 'backend_secret_sha256'
      and value = pg_catalog.encode(
        extensions.digest(pg_catalog.convert_to(p_backend_secret, 'UTF8'), 'sha256'),
        'hex'
      )
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'order_code', order_code,
    'status', status,
    'fulfillment', fulfillment,
    'pickup_time', pickup_time,
    'total', total,
    'created_at', created_at,
    'updated_at', updated_at
  )
  into v_result
  from public.orders
  where order_code = upper(p_order_code);

  return v_result;
end;
$$;

create or replace function public.admin_list_orders(
  p_backend_secret text,
  p_admin_pin text
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_backend_secret is null or not exists (
    select 1
    from private.app_config
    where key = 'backend_secret_sha256'
      and value = pg_catalog.encode(
        extensions.digest(pg_catalog.convert_to(p_backend_secret, 'UTF8'), 'sha256'),
        'hex'
      )
  ) or p_admin_pin is null or not exists (
    select 1
    from private.app_config
    where key = 'admin_pin_sha256'
      and value = pg_catalog.encode(
        extensions.digest(pg_catalog.convert_to(p_admin_pin, 'UTF8'), 'sha256'),
        'hex'
      )
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', orders.id,
        'order_code', orders.order_code,
        'customer_name', orders.customer_name,
        'phone', orders.phone,
        'fulfillment', orders.fulfillment,
        'pickup_time', orders.pickup_time,
        'notes', orders.notes,
        'total', orders.total,
        'status', orders.status,
        'created_at', orders.created_at,
        'order_items', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', order_items.id,
                'name', order_items.name,
                'quantity', order_items.quantity,
                'unit_price', order_items.unit_price,
                'selections', order_items.selections
              )
              order by order_items.created_at
            )
            from public.order_items
            where order_items.order_id = orders.id
          ),
          '[]'::jsonb
        )
      )
      order by orders.created_at desc
    ),
    '[]'::jsonb
  )
  into v_result
  from (
    select *
    from public.orders
    order by created_at desc
    limit 100
  ) as orders;

  return v_result;
end;
$$;

create or replace function public.admin_update_order(
  p_backend_secret text,
  p_admin_pin text,
  p_order_code text,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_backend_secret is null or not exists (
    select 1
    from private.app_config
    where key = 'backend_secret_sha256'
      and value = pg_catalog.encode(
        extensions.digest(pg_catalog.convert_to(p_backend_secret, 'UTF8'), 'sha256'),
        'hex'
      )
  ) or p_admin_pin is null or not exists (
    select 1
    from private.app_config
    where key = 'admin_pin_sha256'
      and value = pg_catalog.encode(
        extensions.digest(pg_catalog.convert_to(p_admin_pin, 'UTF8'), 'sha256'),
        'hex'
      )
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_status not in ('received', 'preparing', 'ready', 'collected', 'cancelled') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;

  update public.orders
  set status = p_status, updated_at = now()
  where order_code = upper(p_order_code)
  returning jsonb_build_object(
    'order_code', order_code,
    'status', status,
    'updated_at', updated_at
  )
  into v_result;

  if v_result is null then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

revoke all on function public.submit_order(
  text, text, text, text, text, text, text, text, jsonb
) from public, anon, authenticated;
revoke all on function public.track_order(text, text)
  from public, anon, authenticated;
revoke all on function public.admin_list_orders(text, text)
  from public, anon, authenticated;
revoke all on function public.admin_update_order(text, text, text, text)
  from public, anon, authenticated;

grant execute on function public.submit_order(
  text, text, text, text, text, text, text, text, jsonb
) to anon;
grant execute on function public.track_order(text, text) to anon;
grant execute on function public.admin_list_orders(text, text) to anon;
grant execute on function public.admin_update_order(text, text, text, text) to anon;
