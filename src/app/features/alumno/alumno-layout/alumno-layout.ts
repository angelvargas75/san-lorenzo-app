import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { MenuItem } from '../../../shared/models/menu-item.model';

@Component({
  selector: 'app-alumno-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './alumno-layout.html',
  styleUrl: './alumno-layout.scss',
})
export class AlumnoLayout {
  // Menú específico del alumno (se lo pasa al Sidebar)
  menuAlumno: MenuItem[] = [
    { label: 'Inicio',             icon: 'bi-house-door',     route: 'inicio' },
    { label: 'Mis Calificaciones', icon: 'bi-journal-check',  route: 'calificaciones' },
    { label: 'Tareas y Exámenes',  icon: 'bi-backpack',       route: 'tareas' },
    { label: 'Horarios',           icon: 'bi-calendar-event', route: 'horarios' },
    { label: 'Asistencia',         icon: 'bi-check2-all',     route: 'asistencia' },
    { label: 'Perfil',             icon: 'bi-person',         route: 'perfil' },
  ];
}