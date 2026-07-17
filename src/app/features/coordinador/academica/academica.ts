import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CoordinadorApi,
  AdminCourse,
  TeacherOption,
  GradeSection,
  SaveCourseRequest,
} from '../coordinador-api';

interface CursoVista {
  id: number;
  nombre: string;
  docente: string;
  grado: string;
  seccion: string;
  color: string;
}

@Component({
  selector: 'app-academica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academica.html',
  styleUrl: './academica.scss',
})
export class Academica implements OnInit {
  private readonly api = inject(CoordinadorApi);

  // Cursos
  readonly cursos = signal<CursoVista[]>([]);
  readonly loadingCursos = signal(true);
  readonly errorCursos = signal(false);

  // Docentes para el selector del formulario
  readonly docentes = signal<TeacherOption[]>([]);

  // Grados y Secciones (solo lectura)
  readonly gradosSecciones = signal<GradeSection[]>([]);
  readonly loadingGrados = signal(true);
  readonly errorGrados = signal(false);

  // Formulario de curso (crear/editar)
  readonly mostrarFormCurso = signal(false);
  readonly editandoCursoId = signal<number | null>(null);
  formCurso: SaveCourseRequest = { name: '', gradeLevel: '', section: '', teacherId: 0, color: '#3E5C4E' };

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarGradosSecciones();
    this.api.getDocentesOptions().subscribe({
      next: (data) => this.docentes.set(data),
      error: () => this.docentes.set([]),
    });
  }

  private cargarCursos(): void {
    this.loadingCursos.set(true);
    this.errorCursos.set(false);
    this.api.getCursos().subscribe({
      next: (data: AdminCourse[]) => {
        this.cursos.set(data.map(c => ({
          id: c.id,
          nombre: c.name,
          docente: c.teacherName,
          grado: c.gradeLevel,
          seccion: c.section,
          color: c.color,
        })));
        this.loadingCursos.set(false);
      },
      error: () => {
        this.errorCursos.set(true);
        this.loadingCursos.set(false);
      },
    });
  }

  private cargarGradosSecciones(): void {
    this.loadingGrados.set(true);
    this.errorGrados.set(false);
    this.api.getGradosSecciones().subscribe({
      next: (data) => {
        this.gradosSecciones.set(data);
        this.loadingGrados.set(false);
      },
      error: () => {
        this.errorGrados.set(true);
        this.loadingGrados.set(false);
      },
    });
  }

  abrirFormNuevoCurso(): void {
    this.editandoCursoId.set(null);
    this.formCurso = { name: '', gradeLevel: '', section: '', teacherId: 0, color: '#3E5C4E' };
    this.mostrarFormCurso.set(true);
  }

  abrirFormEditarCurso(curso: CursoVista): void {
    this.editandoCursoId.set(curso.id);
    const docenteMatch = this.docentes().find(d => d.fullName === curso.docente);
    this.formCurso = {
      name: curso.nombre,
      gradeLevel: curso.grado,
      section: curso.seccion,
      teacherId: docenteMatch?.id ?? 0,
      color: curso.color,
    };
    this.mostrarFormCurso.set(true);
  }

  cancelarFormCurso(): void {
    this.mostrarFormCurso.set(false);
    this.editandoCursoId.set(null);
  }

  guardarCurso(): void {
    const id = this.editandoCursoId();
    const peticion = id
      ? this.api.actualizarCurso(id, this.formCurso)
      : this.api.crearCurso(this.formCurso);

    peticion.subscribe({
      next: () => {
        this.mostrarFormCurso.set(false);
        this.editandoCursoId.set(null);
        this.cargarCursos();
      },
      error: () => alert('No se pudo guardar el curso. Verifica los datos.'),
    });
  }

  eliminarCurso(id: number): void {
    if (!confirm('¿Eliminar este curso?')) return;
    this.api.eliminarCurso(id).subscribe({
      next: () => this.cargarCursos(),
      error: () => alert('No se pudo eliminar el curso.'),
    });
  }
}