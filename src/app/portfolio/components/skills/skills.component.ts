import { Component, OnInit, signal, inject, computed, ElementRef, viewChildren, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { TechnologyService } from 'src/app/admin/services/technology.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';

interface CertEntry {
  id?: string;
  title: string;
  platform: string;
  year?: string;
  url?: string;
  downloadUrl?: string;
  order?: number;
}

const CERT_FALLBACK: CertEntry[] = [
  { title: 'Angular: De cero a experto',              platform: 'Udemy · Fernando Herrera',          year: 'Dic 2023' },
  { title: 'Diplomatura — Programador Web Full Stack', platform: 'Universidad Provincial de Córdoba', year: '2022'     },
  { title: 'Análisis de datos con Python',             platform: 'Platzi',                            year: '2023'     },
];

@Component({
  selector: 'portfolio-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule],
})
export class SkillsComponent implements OnInit {
  readonly technologies = signal<Technology[]>([]);
  readonly imagesLoaded = signal<Record<string, boolean>>({});
  readonly certsOpen = signal(false);
  readonly certs = signal<CertEntry[]>(CERT_FALLBACK);

  /** Stack agrupado por área (reemplaza la terminal decorativa). El orden de cada
   *  grupo respeta el orden que viene del admin. */
  readonly techGroups = computed(() => {
    const areas: { name: string; re: RegExp }[] = [
      { name: 'Frontend', re: /^(javascript|typescript|angular|react|vue|html|css|sass|tailwind|bootstrap|expo|ionic)/i },
      { name: 'Backend',  re: /^(node|nest|express|python|django|flask|php|symfony|laravel|java|spring|c#|\.net|go)/i },
      { name: 'Datos',    re: /^(mysql|postgre|mongo|sql|firebase|redis|supabase|sqlite)/i },
      { name: 'Infra y herramientas', re: /./ },
    ];
    const groups = areas.map(a => ({ name: a.name, items: [] as Technology[] }));
    for (const t of this.technologies()) {
      const i = areas.findIndex(a => a.re.test((t.name || '').trim()));
      groups[i].items.push(t);
    }
    return groups.filter(g => g.items.length);
  });

  readonly orbitInner = computed(() => this.technologies().slice(0, 4));
  readonly orbitOuter = computed(() => this.technologies().slice(4, 8));

  readonly skillImages = viewChildren<ElementRef<HTMLImageElement>>('skillImg');

  private readonly technologyService = inject(TechnologyService);
  private readonly firebaseService   = inject(FirebaseService);

  constructor() {
    effect(() => {
      const techs = this.technologies();
      if (techs.length > 0) {
        setTimeout(() => this.checkCompletedImages(), 300);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const [techs, remoteCerts] = await Promise.all([
      this.technologyService.getTechnologies(),
      this.firebaseService.getList<CertEntry>('education'),
    ]);
    this.technologies.set(techs);
    if (remoteCerts.length > 0) {
      this.certs.set(remoteCerts.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)));
    }
  }

  toggleCerts(): void {
    this.certsOpen.update(v => !v);
  }

  private checkCompletedImages(): void {
    this.skillImages().forEach(ref => {
      const img = ref.nativeElement;
      if (img.complete) {
        const key = img.getAttribute('data-img-key');
        if (key) this.onImageLoad(key);
      }
    });
  }

  abbrev(name: string): string {
    const words = name.trim().split(/[\s.\-_]+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  onImageLoad(techId: string): void {
    this.imagesLoaded.update(state => ({ ...state, [techId]: true }));
  }
}
