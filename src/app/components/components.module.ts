import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutMeComponent } from './about-me/about-me.component';
import { ContactComponent } from './contact/contact.component';
import { EducationComponent } from './education/education.component';
import { FooterComponent } from './footer/footer.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProjectsComponent } from './projects/projects.component';




@NgModule({
  declarations: [
    AboutMeComponent,
    ContactComponent,
    EducationComponent,
    FooterComponent,
    IntroductionComponent,
    NavbarComponent,
    ProjectsComponent
  ],
  exports: [
    AboutMeComponent,
    ContactComponent,
    EducationComponent,
    FooterComponent,
    IntroductionComponent,
    NavbarComponent,
    ProjectsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ComponentsModule { }
