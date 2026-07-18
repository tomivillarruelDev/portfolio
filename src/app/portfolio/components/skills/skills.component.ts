import { Component, OnInit, signal, inject, computed, ElementRef, viewChildren, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { TechnologyService } from 'src/app/admin/services/technology.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

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

  readonly orbitInner = computed(() => this.technologies().slice(0, 4));
  readonly orbitOuter = computed(() => this.technologies().slice(4, 8));

  readonly skillImages = viewChildren<ElementRef<HTMLImageElement>>('skillImg');

  private readonly technologyService = inject(TechnologyService);

  constructor() {
    // Al cargarse las tecnologías asíncronamente de la base de datos, 
    // se insertan en el DOM. En ese momento exacto disparamos el chequeo
    // de imágenes de caché con un leve retraso para dar tiempo al renderizado.
    effect(() => {
      const techs = this.technologies();
      if (techs.length > 0) {
        setTimeout(() => {
          this.checkCompletedImages();
        }, 100);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const techs = await this.technologyService.getTechnologies();
    this.technologies.set(techs);
  }

  private checkCompletedImages(): void {
    this.skillImages().forEach(ref => {
      const img = ref.nativeElement;
      if (img.complete) {
        const key = img.getAttribute('data-img-key');
        if (key) {
          this.onImageLoad(key);
        }
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
