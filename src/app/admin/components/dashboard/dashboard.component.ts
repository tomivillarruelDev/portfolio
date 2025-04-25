import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
}

interface DashboardCard {
  title: string;
  description: string;
  route: string;
  buttonText: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class DashboardComponent {
  // Inyección moderna
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para datos reactivos
  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Proyectos', route: '/admin/projects' },
    { label: 'Tecnologías', route: '/admin/technologies' },
    { label: 'Curriculum Vitae', route: '/admin/upload-cv' },
    { label: 'Imagen de Perfil', route: '/admin/upload-profile-image' },
  ]);

  readonly dashboardCards = signal<DashboardCard[]>([
    {
      title: 'Proyectos',
      description: 'Administra tus proyectos',
      route: '/admin/projects',
      buttonText: 'Ir a Proyectos',
    },
    {
      title: 'Tecnologías',
      description: 'Gestiona las tecnologías disponibles',
      route: '/admin/technologies',
      buttonText: 'Ir a Tecnologías',
    },
    {
      title: 'Curriculum Vitae',
      description: 'Sube o actualiza tu CV',
      route: '/admin/upload-cv',
      buttonText: 'Gestionar CV',
    },
    {
      title: 'Imagen de Perfil',
      description: 'Actualiza tu foto de perfil',
      route: '/admin/upload-profile-image',
      buttonText: 'Gestionar Imagen',
    },
  ]);

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Logout exitoso');
      // La redirección ya se maneja en el servicio
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
