import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { MenuItem } from '../../../shared/models/menu-item.model';

@Component({
  selector: 'app-docente-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './docente-layout.html',
  styleUrl: './docente-layout.scss',
})
export class DocenteLayout {
  readonly menu: MenuItem[] = [
    { label: 'Inicio',         icon: 'bi-house-door',     route: 'inicio' },
    { label: 'Mis Cursos',     icon: 'bi-journal-text',   route: 'cursos' },
    { label: 'Notas',          icon: 'bi-pencil-square',  route: 'notas' },
    { label: 'Asistencia',     icon: 'bi-check2-all',     route: 'asistencia' },
    { label: 'Horarios',       icon: 'bi-calendar-event', route: 'horarios' },
    { label: 'Comunicaciones', icon: 'bi-chat-dots',      route: 'comunicaciones' },
    { label: 'Perfil',         icon: 'bi-person',         route: 'perfil' },
  ];
}
