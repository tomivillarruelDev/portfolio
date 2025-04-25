import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectImageCardComponent } from './project-image-card/project-image-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectsComponent } from './projects.component';
import { TechnologiesComponent } from '../technologies/technologies.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'; // Importar el módulo de skeleton loader

@NgModule({
  declarations: [
    ProjectImageCardComponent,
    ProjectCardComponent,
    ProjectsComponent,
    TechnologiesComponent,
  ],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule, // Añadir el módulo a los imports
  ],
  exports: [ProjectImageCardComponent, ProjectCardComponent, ProjectsComponent],
})
export class ProjectsModule {}
