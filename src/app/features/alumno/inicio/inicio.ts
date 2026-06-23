import { Component } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-inicio',
  imports: [PageTitle, StatCard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {}
