import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';

interface EducationEntry {
  id?: string;
  year: string;
  title: string;
  platform: string;
  category?: string;
  url?: string;
  downloadUrl?: string;
  order?: number;
}

const FALLBACK: EducationEntry[] = [
  { year: 'Dic 2023', title: 'Angular: De cero a experto',              platform: 'Udemy · Fernando Herrera',          category: 'Frontend' },
  { year: '2023',     title: 'Análisis de datos con Python',             platform: 'Platzi',                            category: 'Data'     },
  { year: '2023',     title: 'Testing ágil',                             platform: 'Udemy',                             category: 'Backend'  },
  { year: '2022',     title: 'Diplomatura — Programador Web Full Stack', platform: 'Universidad Provincial de Córdoba', category: 'Formal'   },
  { year: '2022',     title: 'Programación web con JavaScript',          platform: 'Platzi',                            category: 'Frontend' },
  { year: '2021',     title: 'CSS avanzado y diseño responsive',         platform: 'Udemy',                             category: 'Frontend' },
];

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class EducationComponent implements OnInit {
  educations: EducationEntry[] = FALLBACK;

  private readonly firebaseService = inject(FirebaseService);

  async ngOnInit() {
    const remote = await this.firebaseService.getList<EducationEntry>('education');
    if (remote.length > 0) {
      this.educations = remote.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
  }
}
