import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectImageCardComponent } from './project-image-card/project-image-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectsComponent } from './projects.component';
import { TechnologiesComponent } from '../technologies/technologies.component';


@NgModule({
  declarations: [
    ProjectImageCardComponent,
    ProjectCardComponent,
    ProjectsComponent,
    TechnologiesComponent
  ],
  imports: [
    CommonModule,

  ],
  exports: [
    ProjectImageCardComponent,
    ProjectCardComponent,
    ProjectsComponent,
    ]
})
export class ProjectsModule { }
