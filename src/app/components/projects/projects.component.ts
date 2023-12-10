import { Component } from '@angular/core';
import { Project } from 'src/app/interfaces/project.interface';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {

  
  projects: Project[] = [
    {
      title: 'MXK RESTAURANTE BAR',
      description: 'MXK Mexiko-Restaurante Bar, fue mi primera Web para el curso de "Programador Web Inicial" parte de la Diplomatura que realice de "Programador Web Full Stack.',
      technologies: ['HTML', 'CSS', 'Javascript', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/MXK',
      link: 'https://tomivillarrueldev.github.io/MXK/'
    },
    {
      title: 'La Comisión 5',
      description: 'El Proyecto de la Web "La Comisión 5" fue el trabajo final del curso "Introducción al Desarrollo Web" que realice en la Escuela de Oficios. Fue un proyecto que realizamos diariamente de manera grupal.',
      technologies: ['HTML', 'CSS', 'Javascript', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/COMISION5',
      link: 'https://tomivillarrueldev.github.io/COMISION5/'
    },
    {
      title: 'Óptica San Nicolás',
      description: 'Óptica San Nicolás es un proyecto que desarrollé utilizando Django como estudiante autodidacta, demostrando mi dedicación y la mejora constante.',
      technologies: ['Python', 'Django', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/optica-san-nicolas',
      link:''
    },
    {
      title: 'SpotiApp',
      description: 'SpotiApp es una aplicación que desarrollé utilizando Angular y la API de Spotify. Esta aplicación permite buscar artistas y canciones. También permite reproducir un preview de alguna canción.',
      technologies: ['Angular', 'Typescript', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/SpotiApp',
      link:'https://spotiapp-tomas.web.app/#/home'
    },
    {
      title: 'Django Crud',
      description: 'Django App Crud Desarrollada utilizando Django. Esta aplicación permite loguearse, para crear, editar, eliminar y listar tareas.',
      technologies: ['Django', 'Python', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/SpotiApp',
      link:'https://django-auth-crud-3xs5.onrender.com/'
    },
    {
      title: 'Comic App',
      description: 'Comic App fue mi primer proyecto utilizando Angular.',
      technologies: ['Angular', 'Typescript', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/Comic-app',
      link:'https://comic-app-d84e9.web.app/heroes',
    },
    {
      title: 'Colored Rain API REST',
      description: 'API REST desarrollada con Django Rest Framework para un la organización de negocios, simplificando la gestión de datos y mejorando la eficiencia.',
      technologies: ['Django Rest Framework', 'Python'],
      github: 'https://github.com/tomivillarruelDev/COLOREDRAIN-API-REST',
      link:'',
    },
    {
      title: 'Django Portfolio',
      description: 'Portfolio desarrollado con Django.',
      technologies: ['Django', 'Python', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/DJANGO-PORTFOLIO',
      link:'',
    }
  ];

  show_all_projects: boolean = false;
  
  six_projects = this.projects.slice(0, 6);

  projects_ = this.projects.slice(6);

  buttonText = 'See more';

  constructor() { }

  showProjects(){
    this.show_all_projects = !this.show_all_projects;
    this.buttonText = this.show_all_projects ? 'See less' : 'See more';
  }
}
