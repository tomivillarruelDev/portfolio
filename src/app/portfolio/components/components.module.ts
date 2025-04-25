import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ProjectsModule } from './projects/projects.module';

import { ContactComponent } from './contact/contact.component';
import { EducationComponent } from './education/education.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { ExperienceComponent } from './experience/experience.component';

@NgModule({
  declarations: [
    ContactComponent,
    EducationComponent,
    IntroductionComponent,
    ExperienceComponent,
  ],
  exports: [
    ContactComponent,
    EducationComponent,
    IntroductionComponent,
    ProjectsModule,
    ExperienceComponent,
  ],
  imports: [CommonModule, ProjectsModule, NgxSkeletonLoaderModule],
})
export class ComponentsModule {}
