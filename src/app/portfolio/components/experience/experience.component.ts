import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceInterface } from 'src/app/shared/interfaces/experience.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';

const FALLBACK: ExperienceInterface[] = [
  {
    name: 'Desarrollador Frontend',
    company: 'Grupo EON',
    date: 'Feb 2024 — Actualidad',
    address: 'Córdoba, Argentina (Remoto)',
    description: 'Lideré la migración de Angular 12 a Angular 19, reduciendo el bundle un 60% e implementando lazy loading en toda la plataforma. Rediseñé el dashboard principal con GSAP y mejores prácticas de UX, y construí un sistema de componentes reutilizables adoptado por todo el equipo.',
    tasks: [
      'Migré la plataforma de Angular 12 a Angular 19, adoptando standalone components y la nueva API de señales reactivas.',
      'Implementé lazy loading y optimicé el bundle size, logrando una reducción del 60% en el tiempo de carga inicial.',
      'Integré Firebase Realtime Database y Authentication para reemplazar la API REST anterior.',
      'Desarrollé un sistema de reportes con exportación a PDF y Excel consumiendo datos en tiempo real.',
      'Establecí una guía de estilos y convenciones de código que redujo el tiempo de onboarding de nuevos developers.',
    ],
  },
  {
    name: 'Desarrollador Web Freelance',
    company: 'Clientes independientes',
    date: '2022 — 2024',
    address: 'Córdoba, Argentina',
    description: 'Diseñé y desarrollé sitios web y aplicaciones a medida para clientes locales, desde landing pages hasta e-commerce completos con panel de administración.',
    tasks: [
      'Desarrollé Óptica San Nicolás: e-commerce completo con Angular, Node.js y MongoDB.',
      'Construí SpotiApp, plataforma de música que consume la API de Spotify con búsqueda en tiempo real.',
      'Entregué proyectos de principio a fin, incluyendo diseño UI, desarrollo y deployment.',
    ],
  },
];

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ExperienceComponent implements OnInit {
  experiences: ExperienceInterface[] = FALLBACK;

  private readonly firebaseService = inject(FirebaseService);

  async ngOnInit() {
    const remote = await this.firebaseService.getList<ExperienceInterface>('experience');
    if (remote.length > 0) {
      this.experiences = remote;
    }
    // else: keeps FALLBACK
  }
}
