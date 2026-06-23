import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  @Input() label: string = '';      // "Total Alumnos Matriculados"
  @Input() value: string = '';      // "520"
  @Input() trend: string = '';      // "+10" (opcional)
  @Input() trendUp: boolean = true; // true = verde (↑), false = rojo (↓)
}