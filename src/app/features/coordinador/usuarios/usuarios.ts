import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinadorApi, UserListItem } from '../coordinador-api';

interface UsuarioVista {
  id: number;
  nombre: string;
  rol: string;
  activo: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {
  private readonly api = inject(CoordinadorApi);
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  readonly usuarios = signal<UsuarioVista[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly busqueda = signal('');

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  onBuscar(termino: string): void {
    this.busqueda.set(termino);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.cargarUsuarios(), 400);
  }

  private cargarUsuarios(): void {
    this.loading.set(true);
    this.error.set(false);

    this.api.getUsuarios(this.busqueda() || undefined).subscribe({
      next: (data: UserListItem[]) => {
        this.usuarios.set(data.map(u => ({
          id: u.id,
          nombre: u.fullName,
          rol: this.traducirRol(u.role),
          activo: u.isActive,
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private traducirRol(rol: string): string {
    switch (rol) {
      case 'Teacher': return 'Profesor';
      case 'Student': return 'Estudiante';
      case 'Coordinator': return 'Administrativo';
      default: return rol;
    }
  }

  nuevoUsuario(): void {
    // Pendiente: abrir formulario/modal de creación (siguiente paso)
    console.log('Nuevo Usuario — pendiente de implementar');
  }

  editarUsuario(id: number): void {
    // Pendiente: abrir formulario/modal de edición (siguiente paso)
    console.log('Editar usuario', id, '— pendiente de implementar');
  }
}