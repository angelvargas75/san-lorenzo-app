import { Component } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-tareas',
  imports: [PageTitle],
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
})
export class Tareas {
  // Controla qué tab está activo
  tabActivo: string = 'tareas';

  // Controla el filtro seleccionado
  filtro: string = 'todas';
}