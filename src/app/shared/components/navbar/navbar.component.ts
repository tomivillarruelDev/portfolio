import { Component, effect, signal, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
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
  private scrollListener!: () => void;

  // "Hide on scroll": se oculta al bajar y aparece al subir
  private lastScrollY = 0;
  private ticking = false;
  private static readonly SHOW_NEAR_TOP = 120; // px: cerca del inicio, siempre visible
  private static readonly MIN_DELTA = 8;       // px: ignora micro-scrolls (trackpad)

  constructor() {
    this.cvService.cvUrl$.subscribe((url) => {
      if (url) this.cvUrl.set(url);
    });
    this.cvService.loadCvUrl().subscribe();
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.handleResize.bind(this));

    // Nav shrink on scroll
    const nav = document.getElementById('nav');
    this.lastScrollY = window.scrollY;
    this.scrollListener = () => {
      if (!nav) return;
      this.scheduleVisibilityUpdate(nav);
      if (window.innerWidth <= 768) {
        nav.style.padding = '';
        return;
      }
      if (window.scrollY > 60) {
        nav.style.padding = '12px 60px';
      } else {
        nav.style.padding = '18px 60px';
      }
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  /** Un solo cálculo por frame, aunque el scroll dispare muchos eventos. */
  private scheduleVisibilityUpdate(nav: HTMLElement): void {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      const y = window.scrollY;

      // Menú mobile abierto (body congelado) o cerca del inicio: siempre visible
      if (this.menuActive() || y < NavbarComponent.SHOW_NEAR_TOP) {
        nav.classList.remove('nav-hidden');
        this.lastScrollY = y;
        return;
      }

      const delta = y - this.lastScrollY;
      if (Math.abs(delta) < NavbarComponent.MIN_DELTA) return;

      nav.classList.toggle('nav-hidden', delta > 0);
      this.lastScrollY = y;
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('scroll', this.scrollListener);
    this.enableBodyScroll();
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Links del menú mobile: primero cierra el menú (descongela el body y lo
   * devuelve a su posición) y recién después calcula el destino y scrollea.
   * Antes era al revés: el destino se calculaba con el body congelado
   * (scrollY = 0) y el cierre pisaba el scroll volviendo a la posición vieja.
   */
  navigateFromMenu(event: Event, id: string): void {
    event.preventDefault();
    this.closeMenu();
    requestAnimationFrame(() => this.scrollTo(event, id));
  }

  toggleMenu(): void {
    this.menuActive.update((active) => {
      const newState = !active;
      if (newState) this.disableBodyScroll();
      else this.enableBodyScroll();
      return newState;
    });
  }

  closeMenu(): void {
    if (this.menuActive()) {
      this.menuActive.set(false);
      this.enableBodyScroll();
    }
  }

  private disableBodyScroll(): void {
    const scrollY = window.scrollY;
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'top', `-${scrollY}px`);
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow-y', 'hidden');
    document.body.setAttribute('data-scroll-position', scrollY.toString());
  }

  private enableBodyScroll(): void {
    if (document.body.style.position === 'fixed') {
      const scrollY = parseInt(document.body.getAttribute('data-scroll-position') || '0', 10);
      this.renderer.removeStyle(document.body, 'position');
      this.renderer.removeStyle(document.body, 'top');
      this.renderer.removeStyle(document.body, 'width');
      this.renderer.removeStyle(document.body, 'overflow-y');
      // 'instant': html tiene scroll-behavior:smooth y, si no, la página "viaja" al cerrar el menú
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
      // Que la restauración de posición no cuente como "scroll hacia abajo"
      this.lastScrollY = scrollY;
    }
  }

  private handleResize(): void {
    if (window.innerWidth > 768 && this.menuActive()) {
      this.menuActive.set(false);
      this.enableBodyScroll();
    }
  }
}
