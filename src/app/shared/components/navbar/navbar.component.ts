import {
  Component,
  effect,
  signal,
  inject,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { CvService } from '../../services/cv.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'shared-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly menuActive = signal(false);
  readonly cvUrl = signal('');

  private readonly cvService = inject(CvService);
  private readonly renderer = inject(Renderer2);

  constructor() {
    // Efecto reactivo para actualizar la URL del CV
    effect(() => {
      this.cvService.cvUrl$.subscribe((url) => {
        if (url) {
          this.cvUrl.set(url);
        }
      });
    });

    // Cargar la URL inicial
    this.cvService.loadCvUrl().subscribe();
  }

  ngOnInit(): void {
    // Agregar listener para cerrar el menú si la ventana se redimensiona
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy(): void {
    // Eliminar listener al destruir el componente
    window.removeEventListener('resize', this.handleResize.bind(this));

    // Asegurarse de que el body pueda desplazarse al salir
    this.enableBodyScroll();
  }

  /**
   * Alterna el estado del menú
   */
  toggleMenu(): void {
    this.menuActive.update((active) => {
      const newState = !active;

      if (newState) {
        this.disableBodyScroll();
      } else {
        this.enableBodyScroll();
      }

      return newState;
    });
  }

  /**
   * Cierra el menú
   */
  closeMenu(): void {
    if (this.menuActive()) {
      this.menuActive.set(false);
      this.enableBodyScroll();
    }
  }

  /**
   * Deshabilita el scroll del body
   */
  private disableBodyScroll(): void {
    // Guardar la posición actual del scroll
    const scrollY = window.scrollY;

    // Aplicar estilos para fijar el body
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'top', `-${scrollY}px`);
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow-y', 'hidden');

    // Almacenar la posición del scroll para restaurarla después
    document.body.setAttribute('data-scroll-position', scrollY.toString());
  }

  /**
   * Habilita el scroll del body
   */
  private enableBodyScroll(): void {
    // Restaurar el scroll solo si estaba deshabilitado previamente
    if (document.body.style.position === 'fixed') {
      // Obtener la posición guardada del scroll
      const scrollY = parseInt(
        document.body.getAttribute('data-scroll-position') || '0',
        10
      );

      // Restaurar estilos
      this.renderer.removeStyle(document.body, 'position');
      this.renderer.removeStyle(document.body, 'top');
      this.renderer.removeStyle(document.body, 'width');
      this.renderer.removeStyle(document.body, 'overflow-y');

      // Restaurar la posición del scroll
      window.scrollTo(0, scrollY);
    }
  }

  /**
   * Maneja el cambio de tamaño de la ventana
   */
  private handleResize(): void {
    // Si estamos en desktop (> 1024px) y el menú está activo, cerrarlo
    if (window.innerWidth > 1024 && this.menuActive()) {
      this.menuActive.set(false);
      this.enableBodyScroll();
    }
  }
}
