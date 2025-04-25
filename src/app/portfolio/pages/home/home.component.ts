import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { EducationComponent } from '../../components/education/education.component';
import { IntroductionComponent } from '../../components/introduction/introduction.component';
import { ProjectsComponent } from '../../components/projects/projects.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [],
  standalone: true,
  imports: [
    NavbarComponent,
    IntroductionComponent,
    ProjectsComponent,
    EducationComponent,
    ContactComponent,
  ],
})
export class HomeComponent {}
