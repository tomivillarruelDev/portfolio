import { Component } from '@angular/core';
import { Education } from 'src/app/interfaces/education.interface';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {

  courses: Education[] = [
    {
      name: 'Angular',
      company: 'udemy',
      date: 'Actualidad',
      description: 'en proceso de aprendizaje de Angular para el desarrollo web, enfocado en la construcción de aplicaciones modernas y dinámicas.'
    },
    {
      name: 'Python',
      company: 'Union Informática',
      date: '2023',
      description: 'Curso exitoso de Python, enfocado en programación y resolución de problemas. Adquirí habilidades sólidas en Python, con experiencia en proyectos prácticos y la capacidad de trabajar en equipo.'
    },
    {
      name: 'Agile testing',
      company: 'Universidad Tecnológica Nacional Facultad Regional Córdoba',
      date: '2023',
      description: 'Curso en proceso de Agile Testing, enfocado en pruebas en entornos ágiles.'
    },
    {
      name: 'Javascript',
      company: 'Universidad Tecnológica Nacional Facultad Regional Chaco',
      date: '2023',
      description: 'Curso de JavaScript completado, desarrollando habilidades en programación web y creación de aplicaciones interactivas.'
    },
    {
      name: 'Diplomatura de Programador Web Full Stack',
      company: 'Universidad Tecnológica Nacional Facultad Regional Chaco',
      date: '2022',
      description: 'Consistió de tres cursos clave para mi desarrollo profesional: Programador Web Inicial, Programación Web Nivel Medio con PHP y MySQL, Programación Web Avanzada con PHP y MySQL. Estos cursos me proporcionaron una base sólida en desarrollo web, permitiéndome abordar proyectos web con confianza y eficiencia.'
    },
    {
      name: 'Introducción a la Programación Web',
      company: 'Escuela de Oficios de la Universidad Nacional de Córdoba',
      date: '2022',
      description: 'En este curso donde adquirí conocimientos básicos en HTML, CSS y JavaScript, estableciendo una base sólida para el desarrollo web.'
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
