import { AfterViewInit, Component, effect, NgZone, signal } from '@angular/core';
import { CvService } from '../../../shared/services/cv.service';
import { ProfileImageService } from '../../../shared/services/profile-image.service';
import tippy from 'tippy.js';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

const HERO_WORDS = ['convierte.', 'impacta.', 'escala.', 'diferencia.'];

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
  standalone: true,
  imports: [NgxSkeletonLoaderModule],
})
export class IntroductionComponent implements AfterViewInit {
  cvUrl           = signal('');
  profileImageUrl = signal('');
  imageLoaded     = signal(false);

  constructor(
    private cvService: CvService,
    private profileImageService: ProfileImageService,
    private ngZone: NgZone,
  ) {
    effect(() => {
      this.cvService.cvUrl$.subscribe(url => { if (url) this.cvUrl.set(url); });
      this.cvService.loadCvUrl().subscribe();
    });
    effect(() => {
      this.profileImageService.imageUrl$.subscribe(url => {
        if (url) { this.profileImageUrl.set(url); this.imageLoaded.set(false); }
      });
      this.profileImageService.loadImageUrl().subscribe();
    });
  }

  ngAfterViewInit(): void {
    tippy('.tippy-work', {
      content: 'Disponible para trabajar',
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });
    this.ngZone.runOutsideAngular(() => {
      this.initCursorGlow();
      this.initHeroTextCycle();
    });
  }

  onImageLoad(): void { this.imageLoaded.set(true); }

  scrollToProjects(event: Event): void {
    event.preventDefault();
    const el = document.getElementById('projects');
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

  scrollToContact(event: Event): void {
    event.preventDefault();
    const el = document.getElementById('contact');
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

  // ── cursor glow ──────────────────────────────────────────────────────────
  private initCursorGlow(): void {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    let mx = -500, my = -500;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const tick = () => {
      glow.style.transform = `translate(${mx - 140}px, ${my - 140}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ── hero text cycling (CSS transitions, same as HTML) ────────────────────
  private initHeroTextCycle(): void {
    const el = document.getElementById('heroGradient');
    if (!el) return;
    let wi = 0;
    setInterval(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => {
        wi = (wi + 1) % HERO_WORDS.length;
        el.textContent = HERO_WORDS[wi];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 320);
    }, 2500);
  }
}
