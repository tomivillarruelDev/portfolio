import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsModule } from './projects/projects.module';

import { AboutMeComponent } from './about-me/about-me.component';
import { ContactComponent } from './contact/contact.component';
import { EducationComponent } from './education/education.component';
import { IntroductionComponent } from './introduction/introduction.component';



@NgModule({
  declarations: [
    AboutMeComponent,
    ContactComponent,
    EducationComponent,
    IntroductionComponent,

  ],
  exports: [
    AboutMeComponent,
    ContactComponent,
    EducationComponent,
    IntroductionComponent,
    ProjectsModule,

  ],
  imports: [
    CommonModule,
    ProjectsModule,
  ]
})
export class ComponentsModule { }
