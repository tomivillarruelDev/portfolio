import { Component, OnInit } from '@angular/core';
import { CvService } from '../../services/cv.service';

@Component({
  selector: 'shared-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  menu_active: boolean = false;
  cvUrl: string = '/assets/tomasvillarruelCV.pdf'; // URL por defecto

  constructor(private cvService: CvService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de la URL del CV
    this.cvService.cvUrl$.subscribe((url) => {
      if (url) {
        this.cvUrl = url;
      }
    });

    // Cargar la URL inicial
    this.cvService.loadCvUrl().subscribe();
  }

  toggleMenu() {
    this.menu_active = !this.menu_active;
    console.log(this.menu_active);
  }
}
