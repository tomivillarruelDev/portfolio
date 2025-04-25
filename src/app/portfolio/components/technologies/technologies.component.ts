import {
  Component,
  Input,
  AfterViewInit,
  AfterViewChecked,
  OnInit,
} from '@angular/core';

import Iconify from '@iconify/iconify';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { TechnologyService } from 'src/app/admin/services/technology.service';

import tippy from 'tippy.js';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-technologies',
  templateUrl: './technologies.component.html',
  styleUrls: ['./technologies.component.css'],
})
export class TechnologiesComponent implements OnInit, AfterViewChecked {
  @Input() technologies: string[] = [];
  @Input() size: string = 'size-4';

  public technologyObjects: Technology[] = [];
  private tippyInitialized = false;

  constructor(
    private technologyService: TechnologyService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!Array.isArray(this.technologies) || this.technologies.length === 0) {
      this.technologyObjects = [];
      return;
    }
    const allTechnologies = await this.technologyService.getTechnologies();
    this.technologyObjects = this.technologies
      .map((id) => allTechnologies.find((tech) => tech.id === id))
      .filter((tech): tech is Technology => !!tech);
  }

  ngAfterViewChecked(): void {
    if (!this.tippyInitialized && this.technologyObjects.length > 0) {
      const elements = document.querySelectorAll('.tippy-tech');
      if (elements.length > 0) {
        tippy('.tippy-tech', {
          animation: 'shift-away-extreme',
          theme: 'light-border',
        });
        this.tippyInitialized = true;
      }
    }
  }
}
