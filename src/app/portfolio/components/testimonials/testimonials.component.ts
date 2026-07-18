import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { Reference } from '../../interfaces/reference.interface';

const FALLBACK: Reference[] = [
  {
    avatar: '👨‍💼',
    name: 'Carlos M.',
    role: 'Dueño · Óptica San Nicolás',
    stars: 5,
    text: 'Tomás entregó el proyecto en tiempo y con una calidad que <strong>superó lo que esperábamos</strong>. No solo cumplió los requisitos técnicos — propuso mejoras que no habíamos pensado.'
  },
  {
    avatar: '👩‍💻',
    name: 'Ana R.',
    role: 'Product Manager · Startup Tech',
    stars: 5,
    text: 'Lo que más valoro es su <strong>comunicación clara y su proactividad</strong>. Siempre supo lo que estaba haciendo y por qué. Volvería a trabajar con él sin dudarlo.'
  },
  {
    avatar: '🧑‍🔬',
    name: 'Martín L.',
    role: 'CTO · Empresa de Datos',
    stars: 5,
    text: 'Necesitábamos un dashboard complejo en poco tiempo. <strong>Tomás lo entregó limpio, documentado y funcionando perfectamente</strong>. Fue el mejor dev con el que trabajamos.'
  }
];

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class TestimonialsComponent implements OnInit {
  testimonials: Reference[] = FALLBACK;

  private readonly firebaseService = inject(FirebaseService);

  async ngOnInit() {
    const remote = await this.firebaseService.getList<Reference>('references');
    if (remote.length > 0) {
      // Ordenar por el campo 'order' si existe
      this.testimonials = remote.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
  }

  getStarsArray(stars: number): string[] {
    return Array(stars || 5).fill('★');
  }
}
