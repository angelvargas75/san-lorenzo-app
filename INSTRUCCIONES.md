# 📘 Instrucciones para el Equipo — San Lorenzo App

Sistema de gestión académica del Colegio San Lorenzo (Angular).
Este documento explica cómo configurar el proyecto y qué le toca a cada integrante.

---

## 🚀 PASO 1 — Configuración inicial (TODOS los devs)

Sigan estos pasos **una sola vez** para preparar su entorno.

\`\`\`bash
# 1. Clonar el repositorio
git clone https://github.com/angelvargas75/san-lorenzo-app.git

# 2. Entrar a la carpeta del proyecto
cd san-lorenzo-app

# 3. Instalar TODAS las dependencias del proyecto
npm install
\`\`\`

### ⚠️ Importante sobre el Paso 3 (npm install)

El comando \`npm install\` (sin nombres) lee el archivo \`package.json\` y descarga
automáticamente **todo** lo que el proyecto necesita: Angular, **Bootstrap,
Bootstrap Icons y Popper ya vienen incluidos**.

- **NO ejecuten** \`npm install bootstrap\` ni instalen nada por separado. Ya está
  registrado en el proyecto.
- Esto crea la carpeta \`node_modules/\` en su máquina. Esa carpeta NO está en
  GitHub (pesa mucho), por eso cada uno debe generarla con \`npm install\`.

**Verificar que Bootstrap quedó instalado:**

\`\`\`bash
npm list bootstrap
\`\`\`
Debe mostrar \`bootstrap@5.x.x\`. Si aparece, todo está listo.

---

## 🌿 PASO 2 — Cambiar a SU rama

Cada dev trabaja en su propia rama. **Usen solo la que les corresponde:**

| Dev | Comando |
|-----|---------|
| Dev 2 (Alumno) | \`git checkout feature/alumno\` |
| Dev 3 (Docente) | \`git checkout feature/docente\` |
| Dev 4 (Coordinador 1) | \`git checkout feature/coordinador-1\` |
| Dev 5 (Coordinador 2) | \`git checkout feature/coordinador-2\` |

Verificar que están en su rama:

\`\`\`bash
git branch
\`\`\`
La rama con \`*\` es la activa. Debe ser la suya.

Probar que el proyecto corre:

\`\`\`bash
ng serve -o
\`\`\`
Abre \`localhost:4200\`. Login de prueba: usuario \`alumno\`, contraseña \`1234\`.

---

## 🧩 RECURSOS YA CREADOS (úsenlos, no los hagan de nuevo)

El senior ya dejó listos estos componentes compartidos. **Reutilícenlos:**

### Sidebar — ya funciona, no lo toquen
Cada layout ya tiene su sidebar configurado con su menú.

### PageTitle — título de sección
\`\`\`html
<app-page-title titulo="Mis Calificaciones"></app-page-title>
\`\`\`
Importar en su componente:
\`\`\`typescript
import { PageTitle } from '../../../shared/components/page-title/page-title';
// ...
imports: [PageTitle],
\`\`\`

### StatCard — tarjeta de estadística
\`\`\`html
<app-stat-card label="Promedio" value="16.5" trend="+0.8"></app-stat-card>
<app-stat-card label="Faltas" value="2" trend="-1" [trendUp]="false"></app-stat-card>
\`\`\`
Importar:
\`\`\`typescript
import { StatCard } from '../../../shared/components/stat-card/stat-card';
// ...
imports: [StatCard],
\`\`\`

---

## 🔨 PASO 3 — Cómo trabajar en sus componentes

### A. Generar un componente hijo
\`\`\`bash
ng g c features/alumno/calificaciones --skip-tests
\`\`\`

### B. Registrar la ruta hija
Abrir \`src/app/app.routes.ts\` y agregar su componente dentro del array
\`children\` de SU rol. Ejemplo para alumno:

\`\`\`typescript
{
  path: 'alumno',
  component: AlumnoLayout,
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: Inicio },
    { path: 'calificaciones', component: Calificaciones },  // <-- agregar
  ]
},
\`\`\`
(No olviden el \`import\` del componente arriba del archivo.)

### C. Maquetar el HTML/SCSS
Copien el diseño desde el HTML original de su rol y adáptenlo. Usen Bootstrap y
las variables de color globales: \`var(--primary-green)\`.

---

## ✅ PASO 4 — Subir su trabajo (Pull Request)

\`\`\`bash
git add .
git commit -m "feat: implementa seccion de calificaciones del alumno"
git push origin feature/alumno
\`\`\`

Luego en GitHub:
1. Repo → **Pull requests** → **New pull request**
2. Base: \`main\` ← Compare: \`feature/su-rama\`
3. Crear el PR
4. **El senior (Angel) revisa y aprueba** el merge

> ⚠️ NADIE hace merge directo a \`main\`. Todo pasa por Pull Request.

---

## 📋 ASIGNACIÓN DE TAREAS POR DEV

### Dev 2 — Módulo Alumno (\`feature/alumno\`)
La de \`inicio\` ya existe de ejemplo. Generar y maquetar:
- [ ] calificaciones
- [ ] tareas
- [ ] horarios
- [ ] asistencia
- [ ] perfil

### Dev 3 — Módulo Docente (\`feature/docente\`)
Primero configurar el menú en \`docente-layout\` (copiar patrón del alumno). Luego:
- [ ] inicio
- [ ] cursos
- [ ] notas
- [ ] asistencia
- [ ] horarios
- [ ] comunicaciones
- [ ] perfil

### Dev 4 — Coordinador parte 1 (\`feature/coordinador-1\`)
Primero configurar el menú en \`coordinador-layout\`. Luego:
- [ ] inicio (dashboard con StatCards)
- [ ] usuarios
- [ ] academica
- [ ] horarios

### Dev 5 — Coordinador parte 2 (\`feature/coordinador-2\`)
Coordinar con Dev 4 (mismo módulo). Maquetar:
- [ ] reportes
- [ ] comunicados
- [ ] configuracion
- [ ] perfil

---

## 🆘 Reglas de oro

1. Trabajen SOLO en su rama. No toquen \`main\` ni la rama de otro dev.
2. Reutilicen Sidebar, PageTitle y StatCard. No los rehagan.
3. Commits pequeños y descriptivos (prefijo \`feat:\`).
4. Ante cualquier duda o bloqueo, avisen al senior (Angel).
5. Si un dev no puede completar su parte, el senior la asume.

---

_Colegio San Lorenzo © 2025 — Proyecto académico Angular_