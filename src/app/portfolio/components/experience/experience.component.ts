import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceInterface } from 'src/app/shared/interfaces/experience.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';

const FALLBACK: ExperienceInterface[] = [
  {
    name: 'Frontend Developer',
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
    stack: 'Angular · TypeScript · RxJS · Firebase · GSAP',
    metric: '−60%',
    metricLabel: 'tamaño del bundle',
  },
  {
    name: 'Full Stack Developer',
    company: 'Freelance / Clientes',
    date: '2022 — 2024',
    address: 'Córdoba, Argentina',
    description: 'Construí e-commerces y dashboards para clientes de distintas industrias. Stack completo de punta a punta: base de datos, backend, frontend y despliegue. Doce proyectos entregados, cero excusas.',
    tasks: [
      'Desarrollé Óptica San Nicolás: e-commerce completo con Angular, Node.js y MongoDB.',
      'Construí SpotiApp, plataforma de música que consume la API de Spotify con búsqueda en tiempo real.',
      'Entregué proyectos de principio a fin, incluyendo diseño UI, desarrollo y deployment.',
    ],
    stack: 'Node.js · MongoDB · Angular · Firebase · PostgreSQL',
    metric: '12+',
    metricLabel: 'proyectos entregados',
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
  }

  padIndex(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
