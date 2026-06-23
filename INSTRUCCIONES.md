# 📘 Instrucciones para el Equipo — San Lorenzo App

Sistema de gestión académica del Colegio San Lorenzo (Angular).
Este documento explica cómo configurar el proyecto y qué le toca a cada integrante.

> 💡 **Cómo leer este documento:** todo lo que aparece dentro de un recuadro gris
> es un **comando que deben escribir en la terminal** (uno por línea). Cópienlo
> tal cual, sin agregar nada.

---

## 👥 EQUIPO Y ASIGNACIÓN

| Rol | Nombre | Usuario GitHub | Rama asignada | Módulo |
|-----|--------|----------------|---------------|--------|
| Senior + QA | Angel Vargas | `angelvargas75` | `main` | Base, Shared, Auth + revisar PRs |
| Dev 2 | bvargasg24-spec | `bvargasg24-spec` | `feature/alumno` | Módulo Alumno |
| Dev 3 | Sebastian Vasquez | `soySebasVR` | `feature/docente` | Módulo Docente |
| Dev 4 | Victor | `v7237` | `feature/coordinador-1` | Coordinador (parte 1) |
| Dev 5 | (por confirmar) | (pendiente) | `feature/coordinador-2` | Coordinador (parte 2) |

> **Nota:** Si el integrante de Dev 5 no participa, el senior (Angel) asume la
> rama `feature/coordinador-2` y completa esas secciones.

---

## 🚀 PASO 1 — Configuración inicial (TODOS los devs)

Sigan estos pasos **una sola vez** para preparar su entorno.

Clonar el repositorio:

```
git clone https://github.com/angelvargas75/san-lorenzo-app.git
```

Entrar a la carpeta del proyecto:

```
cd san-lorenzo-app
```

Instalar TODAS las dependencias del proyecto:

```
npm install
```

### ⚠️ Importante sobre `npm install`

El comando `npm install` lee el archivo `package.json` y descarga automáticamente
**todo** lo que el proyecto necesita: Angular, **Bootstrap, Bootstrap Icons y
Popper ya vienen incluidos**.

- **NO escriban** `npm install bootstrap` ni instalen nada por separado. Ya está
  registrado en el proyecto.
- Esto crea la carpeta `node_modules/` en su máquina. Esa carpeta NO está en
  GitHub (pesa mucho), por eso cada uno debe generarla con `npm install`.

Para verificar que Bootstrap quedó instalado, escriban:

```
npm list bootstrap
```

Debe mostrar `bootstrap@5.x.x`. Si aparece, todo está listo.

---

## 🌿 PASO 2 — Cambiar a SU rama

Cada dev trabaja en su propia rama. **Usen solo la línea que les corresponde.**

Dev 2 (Alumno):

```
git checkout feature/alumno
```

Dev 3 (Docente):

```
git checkout feature/docente
```

Dev 4 (Coordinador 1):

```
git checkout feature/coordinador-1
```

Dev 5 (Coordinador 2):

```
git checkout feature/coordinador-2
```

Para verificar en qué rama están, escriban:

```
git branch
```

La rama con `*` es la activa. Debe ser la suya.

Para probar que el proyecto corre, escriban:

```
ng serve -o
```

Se abrirá `localhost:4200`. Login de prueba: usuario `alumno`, contraseña `1234`.

---

## 🧩 RECURSOS YA CREADOS (úsenlos, no los hagan de nuevo)

El senior ya dejó listos estos componentes compartidos. **Reutilícenlos:**

### Sidebar — ya funciona, no lo toquen
Cada layout ya tiene su sidebar configurado con su menú.

### PageTitle — título de sección
En el HTML de su componente, escriban:

```
<app-page-title titulo="Mis Calificaciones"></app-page-title>
```

Y en el archivo `.ts` de su componente, agreguen el import:

```
import { PageTitle } from '../../../shared/components/page-title/page-title';
```

Y añadan `PageTitle` dentro de `imports: []`.

### StatCard — tarjeta de estadística
En el HTML:

```
<app-stat-card label="Promedio" value="16.5" trend="+0.8"></app-stat-card>
```

Para mostrar la tendencia en rojo (números negativos):

```
<app-stat-card label="Faltas" value="2" trend="-1" [trendUp]="false"></app-stat-card>
```

Y en el `.ts`, el import:

```
import { StatCard } from '../../../shared/components/stat-card/stat-card';
```

Y añadan `StatCard` dentro de `imports: []`.

---

## 🔨 PASO 3 — Cómo trabajar en sus componentes

### A. Generar un componente hijo
Ejemplo (ajusten el rol y el nombre de la sección):

```
ng g c features/alumno/calificaciones --skip-tests
```

### B. Registrar la ruta hija
Abran `src/app/app.routes.ts` y agreguen su componente dentro del array
`children` de SU rol. Ejemplo para alumno (la línea nueva es la de calificaciones):

```
{
  path: 'alumno',
  component: AlumnoLayout,
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: Inicio },
    { path: 'calificaciones', component: Calificaciones },
  ]
},
```

No olviden agregar el `import` del componente al inicio del archivo.

### C. Maquetar el HTML/SCSS
Copien el diseño desde el HTML original de su rol y adáptenlo. Usen las clases de
Bootstrap y las variables de color globales, por ejemplo `var(--primary-green)`.

---

## ✅ PASO 4 — Subir su trabajo (Pull Request)

Cuando terminen una sección, escriban estos comandos uno por uno.

Agregar sus cambios:

```
git add .
```

Crear el commit (cambien el texto según lo que hicieron):

```
git commit -m "feat: implementa seccion de calificaciones del alumno"
```

Subir a SU rama (cambien el nombre por su rama):

```
git push origin feature/alumno
```

Luego, en la página de GitHub:
1. Entren al repo → pestaña **Pull requests** → **New pull request**
2. Base: `main` ← Compare: `feature/su-rama`
3. Describan qué hicieron y creen el PR
4. **El senior (Angel) revisa y aprueba** el merge a `main`

> ⚠️ NADIE hace merge directo a `main`. Todo pasa por un Pull Request que revisa
> el senior.

---

## 📋 TAREAS DETALLADAS POR DEV

### Dev 2 — Módulo Alumno (rama `feature/alumno`)
La sección `inicio` ya existe como ejemplo. Generar y maquetar:
- [ ] calificaciones
- [ ] tareas
- [ ] horarios
- [ ] asistencia
- [ ] perfil

### Dev 3 — Módulo Docente (rama `feature/docente`)
Primero configurar el menú del docente en `docente-layout` (copiar el patrón del
`alumno-layout`). Luego generar y maquetar:
- [ ] inicio
- [ ] cursos
- [ ] notas
- [ ] asistencia
- [ ] horarios
- [ ] comunicaciones
- [ ] perfil

### Dev 4 — Coordinador parte 1 (rama `feature/coordinador-1`)
Primero configurar el menú del coordinador en `coordinador-layout`. Luego:
- [ ] inicio (dashboard con StatCards)
- [ ] usuarios
- [ ] academica
- [ ] horarios

### Dev 5 — Coordinador parte 2 (rama `feature/coordinador-2`)
Coordinar con Dev 4 (mismo módulo). Maquetar:
- [ ] reportes
- [ ] comunicados
- [ ] configuracion
- [ ] perfil

---

## 🆘 Reglas de oro

1. Trabajen SOLO en su rama. No toquen `main` ni la rama de otro dev.
2. Reutilicen Sidebar, PageTitle y StatCard. No los rehagan.
3. Hagan commits pequeños y descriptivos (con prefijo `feat:`).
4. Ante cualquier duda o bloqueo, avisen al senior (Angel).
5. Si un dev no puede completar su parte, el senior la asume.

---

_Colegio San Lorenzo © 2025 — Proyecto académico Angular_