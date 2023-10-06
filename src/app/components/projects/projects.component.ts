import { Component } from '@angular/core';

// Import the interface
import { Project } from '../../interfaces/project.interface';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      title: 'MXK RESTAURANTE BAR',
      description: 'MXK Mexiko-Restaurante Bar, fue mi primera Web para el curso de "Programador Web Inicial" parte de la Diplomatura que realice de "Programador Web Full Stack',
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
      link:''
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
      description: 'Comic App fue mi primer proyecto utilizando Angular',
      technologies: ['Angular', 'Typescript', 'Bootstrap'],
      github: 'https://github.com/tomivillarruelDev/Comic-app',
      link:'',
    }
  ];
}
