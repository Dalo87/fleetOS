# FleetOS — Guía de despliegue

## Paso 1: Crear las tablas en Supabase

1. Ve a [supabase.com](https://supabase.com) → tu proyecto
2. Panel izquierdo → **SQL Editor** → **New query**
3. Copia y pega el contenido de `supabase_schema.sql`
4. Haz clic en **Run** (botón verde)

Verás las tablas creadas en **Table Editor**.

---

## Paso 2: Subir el código a GitHub

```bash
# En tu ordenador, instala las dependencias primero:
npm install

# Comprueba que funciona en local:
npm run dev
# Abre http://localhost:5173

# Luego sube a GitHub:
git init
git add .
git commit -m "FleetOS - primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/fleetOS.git
git push -u origin main
```

---

## Paso 3: Desplegar en Netlify

1. Ve a [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Selecciona tu repositorio `fleetOS`
3. Configuración de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Ve a **Site settings → Environment variables** y añade:
   ```
   VITE_SUPABASE_URL = https://qzjuznynohtfmqksmutm.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Haz clic en **Deploy site**

En 2-3 minutos tendrás la URL de tu app (algo como `fleetOS.netlify.app`).

---

## Estructura del proyecto

```
fleetOS/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx    — Resumen y alertas
│   │   ├── Flota.jsx        — Gestión de vehículos
│   │   ├── Alertas.jsx      — Seguros e ITV
│   │   ├── Incidencias.jsx  — Golpes y averías
│   │   ├── Talleres.jsx     — Directorio de talleres
│   │   └── Gastos.jsx       — Historial de gastos
│   ├── lib/
│   │   └── supabase.js      — Conexión a Supabase
│   ├── App.jsx              — Navegación y layout
│   ├── main.jsx             — Entrada
│   └── index.css            — Estilos globales
├── supabase_schema.sql      — Script SQL para crear tablas
├── netlify.toml             — Configuración Netlify
├── vite.config.js
└── package.json
```

---

## Funcionalidades incluidas

- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de flota (añadir, editar, eliminar)
- ✅ Seguros: registro y alertas de vencimiento
- ✅ ITV: registro y alertas con días restantes
- ✅ Incidencias: golpes, averías, revisiones con taller asignado
- ✅ Directorio de talleres con teléfono y valoración
- ✅ Historial de gastos con totales por vehículo y categoría
- ✅ Responsive: funciona en PC, tablet y móvil
- ✅ Base de datos en tiempo real (Supabase)
