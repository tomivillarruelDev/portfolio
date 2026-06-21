import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { TechnologyService } from 'src/app/admin/services/technology.service';

@Component({
  selector: 'portfolio-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SkillsComponent implements OnInit {
  readonly technologies = signal<Technology[]>([]);

  readonly orbitInner = computed(() => this.technologies().slice(0, 4));
  readonly orbitOuter = computed(() => this.technologies().slice(4, 8));

  private readonly technologyService = inject(TechnologyService);

  async ngOnInit(): Promise<void> {
    const techs = await this.technologyService.getTechnologies();
    this.technologies.set(techs);
  }

  abbrev(name: string): string {
    const words = name.trim().split(/[\s.\-_]+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
}
