import { Component } from '@angular/core';
import { Education } from '../../interfaces/education.interface';
// import { Education } from 'src/app/interfaces/education.interface';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {

  courses: Education[] = [
    {
      name: 'Angular: De cero a experto',
      company: 'Udemy',
      date: 'Diciembre - 2023',
      teacher: 'Fernando Herrera',
      description: 'TypeScript, RXJS, SPA, Signals, componentes, directivas, servicios, mapas, JWT, autenticación, despliegues, mongo, Git, GitHub y mucho más'
    },
    {
      name: 'Análisis de datos con Python',
      company: 'Union Informática',
      date: 'Agosto - 2023',
      teacher: 'Federico Fortado',
      description: 'Python, Pandas, Numpy, Matplotlib, Seaborn, Scipy, Scikit-learn'
    },
    {
      name: 'Testing ágil',
      company: 'Universidad Tecnológica Nacional Facultad Regional Córdoba',
      date: 'Junio - 2023',
      teacher: 'Ing. Fanny Montoya',
      description: 'Unit Testing, Integration Testing, Metodologías ágiles, Scrum'
    },
    {
      name: 'Programación web con JavaScript',
      company: 'Universidad Tecnológica Nacional Facultad Regional Resistencia',
      date: 'Junio - 2023',
      teacher: 'Lorena Paula Bernis',
      description: 'Fundamentos de JavaScript, DOM, JSON, etc.'


    },
    {
      name: 'Diplomatura de Programador Web Full Stack',
      company: 'Universidad Tecnológica Nacional Facultad Regional Resistencia',
      date: 'Enero- 2023',
      teacher: 'Lorena Paula Bernis',
      description: 'Consto de tres cursos: Programación Web Inicial, Programación Web Nivel Medio con PHP y MySQL, Programación Web Avanzada con PHP y MySQL. Me proporcionó conocimientos en HTML, CSS, Bootstrap, JavaScript, PHP, POO, SQL, MySQL, etc.'
    },
    {
      name: 'Introducción a la Programación Web',
      company: 'Escuela de Oficios de la Universidad Nacional de Córdoba',
      date: 'Noviembre - 2022',
      teacher: 'Ing. Malena Luján',
      description: 'Me permitió establecer una base sólida para el desarrollo web con HTML, CSS y JavaScript'
    },
  ]

  course: Education = {
    name: '',
    company: '',
    date: '',
    description: ''
  }
  selected_idx: number = 0

  seeInfo( idx: number ) {
    let course = this.courses[idx]
    this.selected_idx = idx
    this.course = course
  }

  constructor() { }

  ngOnInit(){
    this.course = this.courses[0]
  }

}
