import { AfterViewInit, Component, effect, NgZone, signal } from '@angular/core';
import { CvService } from '../../../shared/services/cv.service';
import { ProfileImageService } from '../../../shared/services/profile-image.service';
import tippy from 'tippy.js';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

const HERO_WORDS = ['convierten.', 'posicionan.', 'escalan.', 'performan.'];

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
  isLoading       = signal(true);

  constructor(
    private cvService: CvService,
    private profileImageService: ProfileImageService,
    private ngZone: NgZone,
  ) {
    this.cvService.cvUrl$.subscribe(url => { 
      if (url) this.cvUrl.set(url); 
    });
    this.cvService.loadCvUrl().subscribe();

    this.profileImageService.imageUrl$.subscribe(url => {
      if (url) { 
        this.profileImageUrl.set(url); 
        this.isLoading.set(false); 
      }
    });
    this.profileImageService.loadImageUrl().subscribe();
  }

  ngAfterViewInit(): void {
    tippy('.tippy-work', {
      content: 'Disponible para trabajar',
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });
    this.ngZone.runOutsideAngular(() => {
      this.initHeroTextCycle();
    });
  }

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

  // ── hero text cycling (CSS transitions, same as HTML) ────────────────────
  private initHeroTextCycle(): void {
    const el = document.getElementById('heroGradient');
    if (!el) return;
    let wi = 0;
    setInterval(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      el.style.filter = 'blur(6px)';
      setTimeout(() => {
        wi = (wi + 1) % HERO_WORDS.length;
        el.textContent = HERO_WORDS[wi];
        // Entra desde abajo y sale hacia arriba: se lee como una palabra que reemplaza a la otra
        el.style.transition = 'none';
        el.style.transform = 'translateY(10px)';
        void el.offsetWidth;
        el.style.transition = '';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.filter = 'blur(0px)';
      }, 320);
    }, 2500);
  }
}
