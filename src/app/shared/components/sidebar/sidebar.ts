import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() menuItems: MenuItem[] = [];
  @Input() brandText: string = 'Colegio San Lorenzo';
  @Input() basePath: string = '';

  // Controla si el menú está abierto (móvil)
  isOpen: boolean = false;

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenuOnMobile(): void {
    this.isOpen = false;
  }
}