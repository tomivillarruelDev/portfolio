import { Component } from '@angular/core';
import { ProjectImageCardComponent } from './project-image-card/project-image-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'portfolio-projects',
  templateUrl: './projects.component.html',
  styles: [],
  standalone: true,
  imports: [
    ProjectImageCardComponent,
    ProjectCardComponent,
    NgxSkeletonLoaderModule,
  ],
})
export class ProjectsComponent {}
