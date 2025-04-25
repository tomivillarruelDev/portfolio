import { Component, OnInit, signal, inject, input } from '@angular/core';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { TechnologyService } from 'src/app/admin/services/technology.service';
import { CommonModule } from '@angular/common';
import tippy from 'tippy.js';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-technologies',
  templateUrl: './technologies.component.html',
  styleUrl: './technologies.component.css',
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule],
})
export class TechnologiesComponent implements OnInit {
  technologies = input<string[]>([]);
  size = input<string>('size-4');

  readonly technologyObjects = signal<Technology[]>([]);

  private readonly technologyService = inject(TechnologyService);

  private tippyInstance: any;

  imagesLoaded: Record<string, boolean> = {};

  constructor() {}

  async ngOnInit(): Promise<void> {
    if (!Array.isArray(this.technologies()) || this.technologies().length === 0) {
      this.technologyObjects.set([]);
      return;
    }
    const allTechnologies = await this.technologyService.getTechnologies();
    const filtered = this.technologies()
      .map((id) => allTechnologies.find((tech) => tech.id === id))
      .filter((tech): tech is Technology => !!tech);

    filtered.forEach(tech => {
      if (tech.id) {
        this.imagesLoaded[tech.id] = false;
      }
    });

    this.technologyObjects.set(filtered);
  }

  private initTippy() {
    if (this.tippyInstance) {
      this.tippyInstance.forEach((t: any) => t.destroy());
    }
    const elements = document.querySelectorAll('.tippy-tech');
    if (elements.length > 0) {
      this.tippyInstance = tippy('.tippy-tech', {
        animation: 'shift-away-extreme',
        theme: 'light-border',
      });
    }
  }

  onImageLoad(id: string) {
    this.imagesLoaded[id] = true;
    this.initTippy();
  }
}
