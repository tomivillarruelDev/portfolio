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

  constructor() {
    effect(() => {
      this.cvService.cvUrl$.subscribe((url) => {
        if (url) this.cvUrl.set(url);
      });
    });
    this.cvService.loadCvUrl().subscribe();
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.handleResize.bind(this));

    // Nav shrink on scroll
    const nav = document.getElementById('nav');
    this.scrollListener = () => {
      if (!nav) return;
      if (window.scrollY > 60) {
        nav.style.padding = '12px 60px';
        nav.style.borderBottomColor = 'rgba(124,58,237,0.18)';
      } else {
        nav.style.padding = '18px 60px';
        nav.style.borderBottomColor = 'rgba(124,58,237,0.08)';
      }
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('scroll', this.scrollListener);
    this.enableBodyScroll();
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      window.scrollTo(0, scrollY);
    }
  }

  private handleResize(): void {
    if (window.innerWidth > 768 && this.menuActive()) {
      this.menuActive.set(false);
      this.enableBodyScroll();
    }
  }
}
