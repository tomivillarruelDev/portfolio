import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // El guard se encargará de verificar la autenticación
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Logout exitoso');
      // La redirección ya se maneja en el servicio
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }


}
