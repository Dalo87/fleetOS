-- FleetOS - Schema para Supabase
-- Ejecuta en: Supabase > SQL Editor > New query > Run

-- VEHICULOS
create table if not exists vehiculos (
  id uuid primary key default gen_random_uuid(),
  matricula text not null unique,
  marca text not null,
  modelo text not null,
  anio integer,
  color text,
  conductor text,
  telefono_conductor text,
  notas text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TALLERES (antes que incidencias para la FK)
create table if not exists talleres (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad text,
  telefono text,
  direccion text,
  ciudad text,
  valoracion integer check (valoracion between 1 and 5),
  asociado boolean default false,
  urgencias boolean default false,
  notas text,
  created_at timestamptz default now()
);

-- SEGUROS
create table if not exists seguros (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid references vehiculos(id) on delete cascade,
  compania text not null,
  numero_poliza text,
  fecha_inicio date,
  fecha_vencimiento date not null,
  tipo text default 'terceros',
  coste numeric(10,2),
  notas text,
  created_at timestamptz default now()
);

-- ITV
create table if not exists itv (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid references vehiculos(id) on delete cascade,
  fecha_realizacion date,
  fecha_vencimiento date not null,
  resultado text default 'favorable',
  estacion text,
  coste numeric(10,2),
  notas text,
  created_at timestamptz default now()
);

-- INCIDENCIAS
create table if not exists incidencias (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid references vehiculos(id) on delete cascade,
  tipo text not null,
  descripcion text not null,
  fecha date not null default current_date,
  estado text default 'abierta',
  taller_id uuid references talleres(id) on delete set null,
  coste_estimado numeric(10,2),
  coste_final numeric(10,2),
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GASTOS
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid references vehiculos(id) on delete cascade,
  incidencia_id uuid references incidencias(id) on delete set null,
  concepto text not null,
  categoria text not null,
  importe numeric(10,2) not null,
  fecha date not null default current_date,
  proveedor text,
  notas text,
  created_at timestamptz default now()
);

-- USUARIOS
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique,
  telefono text,
  rol text default 'operario',
  activo boolean default true,
  created_at timestamptz default now()
);

-- Desactivar RLS para empezar (activar más adelante si se añade autenticación)
alter table vehiculos disable row level security;
alter table talleres disable row level security;
alter table seguros disable row level security;
alter table itv disable row level security;
alter table incidencias disable row level security;
alter table gastos disable row level security;
alter table usuarios disable row level security;

-- DATOS DE EJEMPLO (puedes borrar estos bloques después)
insert into vehiculos (matricula, marca, modelo, anio, conductor) values
  ('1234 ABC', 'Seat', 'Ibiza', 2021, 'Carlos Martínez'),
  ('5678 DEF', 'Ford', 'Transit', 2020, null),
  ('9012 GHI', 'Renault', 'Kangoo', 2019, 'Ana Pérez'),
  ('3456 JKL', 'Mercedes', 'Sprinter', 2022, 'Luis Rodríguez')
on conflict (matricula) do nothing;

insert into talleres (nombre, especialidad, telefono, ciudad, valoracion, asociado, urgencias) values
  ('Talleres Hermanos García', 'Mecánica general · Chapa y pintura', '+34 956 12 34 56', 'San Fernando', 5, true, true),
  ('Autoservicio Málaga Centro', 'Electricidad · Diagnóstico OBD', '+34 952 98 76 54', 'Málaga', 4, false, false),
  ('Grúas Andalucía', 'Asistencia en carretera · Grúa 24h', '+34 900 111 222', 'Cádiz', 4, true, true);
