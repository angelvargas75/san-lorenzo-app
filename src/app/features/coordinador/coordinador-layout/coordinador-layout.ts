import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { MenuItem } from '../../../shared/models/menu-item.model';

@Component({
  selector: 'app-coordinador-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './coordinador-layout.html',
  styleUrl: './coordinador-layout.scss',
})
export class CoordinadorLayout {
  menuCoordinador: MenuItem[] = [
    { label: 'Inicio',        icon: 'bi-house-door',     route: 'inicio' },
    { label: 'Usuarios',      icon: 'bi-people',         route: 'usuarios' },
    { label: 'Academica',     icon: 'bi-mortarboard',    route: 'academica' },
    { label: 'Horarios',      icon: 'bi-calendar-event', route: 'horarios' },
    { label: 'Reportes',      icon: 'bi-bar-chart',      route: 'reportes' },
    { label: 'Comunicados',   icon: 'bi-megaphone',      route: 'comunicados' },
    { label: 'Configuracion', icon: 'bi-gear',           route: 'configuracion' },
    { label: 'Perfil',        icon: 'bi-person',         route: 'perfil' },
  ];
}