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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Proyectos', route: '/admin/projects' },
    { label: 'Tecnologias', route: '/admin/technologies' },
    { label: 'Experiencia', route: '/admin/experience' },
    { label: 'Educacion', route: '/admin/education' },
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
      title: 'Tecnologias',
      description: 'Gestiona las tecnologias disponibles',
      route: '/admin/technologies',
      buttonText: 'Ir a Tecnologias',
    },
    {
      title: 'Experiencia',
      description: 'Carga y edita tu experiencia laboral',
      route: '/admin/experience',
      buttonText: 'Gestionar Experiencia',
    },
    {
      title: 'Educacion',
      description: 'Carga y edita tus cursos y certificados',
      route: '/admin/education',
      buttonText: 'Gestionar Educacion',
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
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
    }
  }
}
