import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Usar isAuthenticated$ (observable) en lugar de isAuthenticated() (método)
    return this.authService.isAuthenticated$.pipe(
      take(1), // Tomar solo el primer valor emitido para evitar múltiples suscripciones
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirigir a la página de login si no está autenticado
          return this.router.createUrlTree(['/admin/login']);
        }
      })
    );
  }
}
