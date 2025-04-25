import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CvService } from '../../../shared/services/cv.service';
import { ProfileImageService } from '../../../shared/services/profile-image.service';

import tippy from 'tippy.js';

@Component({
    selector: 'app-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.css'],
    standalone: false
})
export class IntroductionComponent implements AfterViewInit, OnInit {
  cvUrl: string = ''; // URL por defecto
  profileImageUrl: string = ''; // URL por defecto
  imageLoaded: boolean = false;

  constructor(
    private cvService: CvService,
    private profileImageService: ProfileImageService
  ) {}

  ngOnInit(): void {
    // Establecer inicialmente que la imagen no está cargada
    this.imageLoaded = false;

    // Suscribirse a los cambios de la URL del CV
    this.cvService.cvUrl$.subscribe((url) => {
      if (url) {
        this.cvUrl = url;
      }
    });

    // Cargar la URL inicial del CV
    this.cvService.loadCvUrl().subscribe();

    // Suscribirse a los cambios de la URL de la imagen de perfil
    this.profileImageService.imageUrl$.subscribe((url) => {
      if (url) {
        this.profileImageUrl = url;
        // Resetear el estado de carga cuando cambia la URL
        this.imageLoaded = false;
      }
    });

    // Cargar la URL inicial de la imagen de perfil
    this.profileImageService.loadImageUrl().subscribe();
  }

  onImageLoad(): void {
    // Marcar la imagen como cargada
    this.imageLoaded = true;
  }

  ngAfterViewInit(): void {
    tippy('.tippy-work', {
      content: 'Disponible para trabajar',
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });
  }
}
