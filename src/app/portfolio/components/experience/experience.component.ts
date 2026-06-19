import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceInterface } from 'src/app/shared/interfaces/experience.interface';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ExperienceComponent {
  experiences: ExperienceInterface[] = [
    {
      name: 'Desarrollador Frontend',
      company: 'Grupo EON',
      date: 'Feb 2024 — Actualidad',
      address: 'Córdoba, Argentina (Remoto)',
      description: 'Lideré el rediseño completo de la plataforma web interna de gestión, migrando desde una arquitectura legacy a Angular 17+ con standalone components, señales reactivas y Firebase como backend.',
      tasks: [
        'Migré la plataforma de Angular 12 a Angular 19, adoptando standalone components y la nueva API de señales reactivas.',
        'Implementé lazy loading y optimicé el bundle size, logrando una reducción del 60% en el tiempo de carga inicial.',
        'Integré Firebase Realtime Database y Authentication para reemplazar la API REST anterior.',
        'Desarrollé un sistema de reportes con exportación a PDF y Excel consumiendo datos en tiempo real.',
        'Establecí una guía de estilos y convenciones de código que redujo el tiempo de onboarding de nuevos developers.',
      ],
    },
  ];
}
