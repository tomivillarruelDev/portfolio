import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EducationEntry {
  year: string;
  title: string;
  platform: string;
}

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class EducationComponent {
  educations: EducationEntry[] = [
    { year: 'Dic 2023', title: 'Angular: De cero a experto', platform: 'Udemy · Fernando Herrera' },
    { year: '2023', title: 'Análisis de datos con Python', platform: 'Platzi' },
    { year: '2023', title: 'Testing ágil', platform: 'Udemy' },
    { year: '2022', title: 'Diplomatura — Programador Web Full Stack', platform: 'Universidad Provincial de Córdoba' },
    { year: '2022', title: 'Programación web con JavaScript', platform: 'Platzi' },
    { year: '2021', title: 'CSS avanzado y diseño responsive', platform: 'Udemy' },
  ];

  private catClasses = ['c-fe', 'c-dat', 'c-be', 'c-edu', 'c-fe', 'c-fe'];
  private catLabels  = ['Frontend', 'Data', 'Backend', 'Formal', 'Frontend', 'Frontend'];

  getCatClass(i: number): string { return this.catClasses[i] ?? 'c-fe'; }
  getCatLabel(i: number): string { return this.catLabels[i]  ?? 'Frontend'; }
}
