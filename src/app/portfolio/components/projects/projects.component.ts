import { Component, signal, inject, effect, NgZone, OnDestroy, untracked, ElementRef, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { ProjectCardComponent } from './project-card/project-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ImageViewerService } from 'src/app/shared/services/image-viewer.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { TECH_MAP, getTechClass, getTechAbbr } from 'src/app/portfolio/constants/tech-map.constant';

gsap.registerPlugin(ScrollTrigger);

const STATIC_FALLBACK: {
  nameHtml: string;
  tagline:  string;
  metrics:  { val: string; lab: string }[];
  chipVals: [string, string, string, string];
}[] = [
  {
    nameHtml: 'Óptica<br>San Nicolás',
    tagline: 'Un comercio local,<br><em>convertido en e-commerce.</em>',
    metrics: [
      { val: '+180%', lab: 'Tráfico orgánico' },
      { val: '3 meses', lab: 'Time to market' },
      { val: '3.1s', lab: 'First paint' },
    ],
    chipVals: ['+180%', 'Tráfico org.', '3.1s', 'FCP'],
  },
  {
    nameHtml: 'Spoti<br>App',
    tagline: 'Buscá artistas, descubrí tendencias.<br><em>Música sin límites.</em>',
    metrics: [
      { val: '1M+', lab: 'Canciones via API' },
      { val: '<1.4s', lab: 'Tiempo de carga' },
      { val: '100%', lab: 'Responsive' },
    ],
    chipVals: ['1M+', 'Canciones', '<1.4s', 'Carga'],
  },
];

@Component({
  selector: 'portfolio-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  standalone: true,
  imports: [CommonModule, ProjectCardComponent, NgxSkeletonLoaderModule],
})
export class ProjectsComponent implements OnDestroy {
  readonly featuredProjects = signal<Project[]>([]);
  readonly imagesLoaded = signal<Record<string, boolean>>({});
  readonly imageAspectRatios = signal<Record<string, number>>({});
  readonly currentImageIndex = signal<Record<string, number>>({});
  // Stable per-project flag set once when image _0 loads. Never changes during
  // carousel autoplay, so the phone/browser @if branch never toggles mid-session
  // (which would reset CSS animations on orbit/badge siblings).
  readonly projectIsMobile = signal<Record<string, boolean>>({});

  isCurrentImageMobile(project: Project): boolean {
    const idx = this.currentImageIndex()[project.id] || 0;
    // photoTypes covers photoURLs[] (secondary images).
    // The carousel is built as [photoURL, ...photoURLs], so:
    //   carousel idx 0  → photoURL (no photoTypes entry → fallback)
    //   carousel idx 1  → photoURLs[0] → photoTypes[0]
    //   carousel idx N  → photoURLs[N-1] → photoTypes[N-1]
    const types = project.photoTypes;
    if (idx > 0 && types && types[idx - 1] !== undefined) {
      return types[idx - 1] === 'mobile';
    }
    // idx === 0 (photoURL) or no explicit type: use stable fallback.
    const cached = this.projectIsMobile()[project.id];
    if (cached !== undefined) return cached;
    return !!project.isMobileView;
  }
  
  /** Tipo de mockup ('phone' | 'browser') de cada foto del carrusel, en orden. */
  private getMockupTypes(project: Project): ('phone' | 'browser')[] {
    const count = this.getProjectImages(project).length || 1;
    const types = project.photoTypes;
    const cached = this.projectIsMobile()[project.id];
    const first = cached !== undefined ? cached : !!project.isMobileView;
    return Array.from({ length: count }, (_, idx) => {
      if (idx > 0 && types && types[idx - 1] !== undefined) {
        return types[idx - 1] === 'mobile' ? 'phone' : 'browser';
      }
      return first ? 'phone' : 'browser';
    });
  }

  // En mobile el frame oculto reserva espacio (para que no salte el layout);
  // solo tiene sentido si el proyecto realmente usa ese tipo de mockup.
  projectHasPhone(project: Project): boolean {
    return this.getMockupTypes(project).includes('phone');
  }
  projectHasBrowser(project: Project): boolean {
    return this.getMockupTypes(project).includes('browser');
  }

  private autoplayIntervals: Record<string, any> = {};
  private gsapInited = false;

  readonly projectImages = viewChildren<ElementRef<HTMLImageElement>>('projImg');

  private readonly firebaseService = inject(FirebaseService);
  private readonly ngZone = inject(NgZone);
  private readonly imageViewerService = inject(ImageViewerService);

  constructor() {
    effect(() => {
      const projects = this.featuredProjects();
      if (projects.length > 0 && !this.gsapInited) {
        this.gsapInited = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.ngZone.runOutsideAngular(() => this.initGsap());
          });
        });
      }
    });

    effect(() => {
      const images = this.projectImages();
      if (images.length > 0) {
        this.checkCompletedImages();
        setTimeout(() => this.checkCompletedImages(), 100);
        setTimeout(() => this.checkCompletedImages(), 400);
      }
    });

    effect(() => {
      const isOpen = this.imageViewerService.state().isOpen;
      untracked(() => {
        if (isOpen) {
          Object.keys(this.autoplayIntervals).forEach(key => {
            clearInterval(this.autoplayIntervals[key]);
          });
          this.autoplayIntervals = {};
        } else {
          const projects = this.featuredProjects();
          projects.forEach(p => this.startAutoplay(p));
        }
      });
    });

    this.loadProjects();
  }

  private checkCompletedImages(): void {
    this.projectImages().forEach(ref => {
      const img = ref.nativeElement;
      if (img.complete) {
        const key = img.getAttribute('data-img-key');
        if (key) {
          this.imagesLoaded.update(state => ({ ...state, [key]: true }));
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            const ratio = img.naturalWidth / img.naturalHeight;
            this.imageAspectRatios.update(state => ({ ...state, [key]: ratio }));
          }
        }
      }
    });
    this.scheduleScrollTriggerRefresh();
  }

  // Las imágenes (Firebase, red real) pueden tardar más que los refresh()
  // fijos de initGsap y cambian el aspect-ratio/alto de .browser-screen al
  // cargar. Si eso pasa después del último refresh(), el ScrollTrigger queda
  // con el "start" del pin desactualizado y reaparece un hueco antes del
  // primer proyecto. Recalculamos cada vez que termina de cargar una imagen.
  private refreshDebounce: any;
  private scheduleScrollTriggerRefresh(): void {
    if (!this.gsapInited) return;
    clearTimeout(this.refreshDebounce);
    this.refreshDebounce = setTimeout(() => ScrollTrigger.refresh(), 60);
  }

  ngOnDestroy(): void {
    Object.keys(this.autoplayIntervals).forEach(key => {
      clearInterval(this.autoplayIntervals[key]);
    });
    this.autoplayIntervals = {};
  }

  private async loadProjects() {
    const all = await this.firebaseService.getProjects('projects-image');
    this.featuredProjects.set(all);
    all.forEach(p => this.startAutoplay(p));
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

  onImageLoad(key: string, event?: Event): void {
    this.imagesLoaded.update(state => ({ ...state, [key]: true }));
    if (event) {
      const img = event.target as HTMLImageElement;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const ratio = img.naturalWidth / img.naturalHeight;
        this.imageAspectRatios.update(state => ({ ...state, [key]: ratio }));
        // Set the stable phone/browser flag when image 0 loads.
        // Keyed by projectId (everything before the last '_0').
        if (key.endsWith('_0')) {
          const projectId = key.slice(0, -2);
          if (this.projectIsMobile()[projectId] === undefined) {
            this.projectIsMobile.update(state => ({ ...state, [projectId]: ratio < 1.0 }));
          }
        }
      }
    }
    // Only refresh ScrollTrigger for layout-affecting images (not carousel slides).
    if (key.endsWith('_0') || key.endsWith('_logo') || key.endsWith('_icon')) {
      this.scheduleScrollTriggerRefresh();
    }
  }

  getBrowserAspectRatio(project: Project): string {
    const key = project.id + '_0';
    const ratio = this.imageAspectRatios()[key];
    return ratio ? `${ratio}` : '1.6';
  }

  getBrowserMaxWidth(project: Project): number {
    const key = project.id + '_0';
    const ratio = this.imageAspectRatios()[key];
    if (!ratio) return 600;
    if (ratio >= 1.2) return 600;
    return Math.max(220, Math.round(450 * ratio));
  }

  getProjectImages(project: Project): string[] {
    const images: string[] = [];
    if (project.photoURL) images.push(project.photoURL);
    if (Array.isArray(project.photoURLs)) {
      project.photoURLs.forEach(url => {
        if (url && !images.includes(url)) {
          images.push(url);
        }
      });
    }
    return images;
  }

  startAutoplay(project: Project): void {
    const images = this.getProjectImages(project);
    if (images.length <= 1) return;
    this.stopAutoplay(project);
    this.ngZone.runOutsideAngular(() => {
      this.autoplayIntervals[project.id] = setInterval(() => {
        this.ngZone.run(() => {
          this.nextImage(project);
        });
      }, 5000);
    });
  }

  stopAutoplay(project: Project): void {
    if (this.autoplayIntervals[project.id]) {
      clearInterval(this.autoplayIntervals[project.id]);
      delete this.autoplayIntervals[project.id];
    }
  }

  private touchStartX = 0;
  private touchStartY = 0;

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onTouchEnd(project: Project, event: TouchEvent): void {
    if (event.changedTouches.length === 1) {
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      const diffX = this.touchStartX - touchEndX;
      const diffY = this.touchStartY - touchEndY;

      // Ensure horizontal swipe is dominant and exceeds threshold (35px)
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          this.nextImage(project, event);
        } else {
          this.prevImage(project, event);
        }
      }
    }
  }

  resetAutoplay(project: Project): void {
    this.stopAutoplay(project);
    this.startAutoplay(project);
  }

  prevImage(project: Project, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      this.resetAutoplay(project);
    }
    const images = this.getProjectImages(project);
    if (images.length <= 1) return;
    const current = this.currentImageIndex()[project.id] || 0;
    this.currentImageIndex.update(s => ({ ...s, [project.id]: current === 0 ? images.length - 1 : current - 1 }));
  }

  nextImage(project: Project, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      this.resetAutoplay(project);
    }
    const images = this.getProjectImages(project);
    if (images.length <= 1) return;
    const current = this.currentImageIndex()[project.id] || 0;
    this.currentImageIndex.update(s => ({ ...s, [project.id]: current === images.length - 1 ? 0 : current + 1 }));
  }

  goToImage(project: Project, index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      this.resetAutoplay(project);
    }
    this.currentImageIndex.update(s => ({ ...s, [project.id]: index }));
  }

  getTechIcon(techName: string): string | null {
    if (!techName) return null;
    return this.firebaseService.techIconCache()[techName.trim().toLowerCase()] || null;
  }

  openViewer(event: MouseEvent, project: Project, imgIndex: number): void {
    event.stopPropagation();
    const img = event.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const images = this.getProjectImages(project);
    this.imageViewerService.open(images, imgIndex, rect);
  }

  getTechClass(tech: string): string { return TECH_MAP[tech]?.[0] ?? 'ic-ng'; }
  getTechAbbr(tech: string):  string { return TECH_MAP[tech]?.[1] ?? tech.slice(0, 2).toUpperCase(); }

  getNameHtml(i: number, project: Project): string {
    return project.nameHtml || STATIC_FALLBACK[i]?.nameHtml || project.name;
  }

  /** Nombre sin HTML para el <h3> oculto, los alt y la URL de respaldo
   *  (en la base algunos nombres traen <br>, p. ej. "Reel<br>VERSE"). */
  plainName(project: { name?: string }): string {
    return (project.name ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  getTagline(i: number, project: Project): string {
    return project.tagline || STATIC_FALLBACK[i]?.tagline || '';
  }

  // Métricas de relleno ("100%", "Top", "1 Click") restan credibilidad a las
  // reales (<1.2s, 200K+, #1). Se filtran acá; en el admin se pueden seguir cargando.
  private static readonly FILLER_METRIC = /^(100\s?%|top|1\s?click)$/i;

  getMetrics(i: number, project: Project): { val: string; lab: string }[] {
    const list = project.metrics?.length ? project.metrics : (STATIC_FALLBACK[i]?.metrics ?? []);
    return list.filter(m => m?.val?.trim() && !ProjectsComponent.FILLER_METRIC.test(m.val.trim()));
  }

  private initGsap(): void {
    if (window.innerWidth < 900) {
      const section = document.querySelector<HTMLElement>('#projects');
      if (!section) return;
      const scenes = Array.from(section.querySelectorAll<HTMLElement>('.proj-scene'));
      scenes.forEach(sc => {
        // Animamos el wrapper (contiene phone + browser superpuestos), no el
        // primer .proj-frame: si no, el browser nunca recibía la animación.
        const frame = sc.querySelector<HTMLElement>('.mockups-wrapper');
        const narr  = sc.querySelector<HTMLElement>('.proj-narrative');
        const tags  = Array.from(sc.querySelectorAll<HTMLElement>('.stack-tag'));
        const links = Array.from(sc.querySelectorAll<HTMLElement>('.proj-link'));

        // Cada elemento se dispara cuando él mismo asoma (95%), no cuando la escena
        // entera llega al 75-85%: así no queda pantalla negra antes de cada proyecto.
        if (frame) {
          gsap.fromTo(frame,
            { opacity: 0, y: 36, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out',
              scrollTrigger: { trigger: frame, start: 'top 95%', toggleActions: 'play none none reverse' }
            }
          );
        }
        if (narr) {
          gsap.fromTo(narr,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1,
              scrollTrigger: { trigger: narr, start: 'top 95%', toggleActions: 'play none none reverse' }
            }
          );
        }
        if (tags.length) {
          gsap.fromTo(tags,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, stagger: 0.05, duration: 0.45, ease: 'back.out(1.6)',
              scrollTrigger: { trigger: tags[0], start: 'top 95%', toggleActions: 'play none none reverse' }
            }
          );
        }
        if (links.length) {
          gsap.fromTo(links,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out',
              scrollTrigger: { trigger: links[0], start: 'top 95%', toggleActions: 'play none none reverse' }
            }
          );
        }
      });
      return;
    }

    const section = document.querySelector<HTMLElement>('#projects');
    if (!section) return;
    const scenes = Array.from(section.querySelectorAll<HTMLElement>('.proj-scene'));
    if (scenes.length < 2) return;

    const stage = document.createElement('div');
    stage.className = 'proj-pin-stage';
    scenes[0].parentNode!.insertBefore(stage, scenes[0]);
    scenes.forEach(sc => stage.appendChild(sc));

    scenes.forEach((sc, i) => {
      sc.style.position = 'absolute';
      sc.style.top = '0';
      sc.style.left = '50%';
      sc.style.transform = '';
      sc.style.width = '100%';
      sc.style.maxWidth = '1400px';
      sc.style.height = '100%';
      sc.style.margin = '0';
      sc.style.minHeight = 'unset';
      sc.style.zIndex = String(i + 1);
    });

    // GSAP owns xPercent so it never collides with its own transform writes
    // (autoAlpha, frame scale/y, narr x, etc.). Must run before any other
    // gsap.set() call on these elements so the centering is in GSAP's cache.
    gsap.set(scenes, { xPercent: -50 });

    const els = scenes.map(sc => ({
      sc,
      frame:  sc.querySelector<HTMLElement>('.proj-frame'),
      narr:   sc.querySelector<HTMLElement>('.proj-narrative'),
      badges: Array.from(sc.querySelectorAll<HTMLElement>('.proj-badge')),
      chips:  Array.from(sc.querySelectorAll<HTMLElement>('.proj-chip')),
      orbits: Array.from(sc.querySelectorAll<HTMLElement>('.proj-orbit,.proj-orbit-2')),
      isRev:  sc.classList.contains('reverse'),
    }));

    gsap.set(scenes[0], { autoAlpha: 1 });
    scenes.slice(1).forEach(sc => gsap.set(sc, { autoAlpha: 0 }));

    els.forEach(({ frame, narr, badges, chips, orbits, isRev }) => {
      if (frame)         gsap.set(frame,  { scale: 1.06, y: 28, opacity: 0 });
      if (narr)          gsap.set(narr,   { x: isRev ? -60 : 60, opacity: 0 });
      if (badges.length) gsap.set(badges, { opacity: 0 });
      if (chips.length)  gsap.set(chips,  { y: -50, opacity: 0 });
      if (orbits.length) gsap.set(orbits, { opacity: 0 });
    });

    const e1 = els[0];

    // El reveal del proyecto 1 vive en su PROPIO ScrollTrigger (no en el
    // pineado) y NO usa scrub: dispara la animación completa "de golpe" (como
    // siempre) apenas el stage entra en pantalla, en vez de recién cuando
    // engancha el pin ('top top') 100vh más tarde, que era el hueco vacío real.
    // Con scrub quedaba atado 1:1 al scroll y se sentía gradual/parallax en
    // vez del pop de siempre.
    const header    = e1.sc.querySelector<HTMLElement>('.proj-logo, .proj-eyebrow');
    const name      = e1.sc.querySelector<HTMLElement>('.proj-name:not(.sr-only)');
    const tagline   = e1.sc.querySelector<HTMLElement>('.proj-tagline');
    const body      = e1.sc.querySelector<HTMLElement>('.proj-body');
    const metrics   = Array.from(e1.sc.querySelectorAll<HTMLElement>('.proj-metric'));
    const stackTags = Array.from(e1.sc.querySelectorAll<HTMLElement>('.stack-tag'));
    const links     = Array.from(e1.sc.querySelectorAll<HTMLElement>('.proj-link'));
    const textLines = [header, name, tagline, body].filter((el): el is HTMLElement => !!el);

    // Estado inicial extra SOLO para la entrada del proyecto 1: el resto de
    // props (scale/y/opacity de frame, narr, chips, badges, orbits) ya las
    // deja listas el forEach de arriba, igual que en la escena 2.
    // Amplitudes grandes y timeline estirado (~2.4s) a propósito: tiene que
    // notarse a simple vista, no ser un detalle sutil de medio segundo.
    gsap.set(e1.frame!, { rotationY: -50, rotationX: 8, scale: 1.35, filter: 'blur(22px)', transformPerspective: 1200 });
    gsap.set(e1.badges, { scale: 0.3, rotation: -12 });
    gsap.set(e1.chips,  { scale: 0.4, y: -70 });
    gsap.set(textLines, { opacity: 0, y: 40 });
    gsap.set(metrics,   { opacity: 0, y: 45, scale: 0.6 });
    gsap.set(stackTags, { opacity: 0, y: 24, scale: 0.4, rotation: -8 });
    gsap.set(links,     { opacity: 0, y: 36, scale: 0.6 });

    const introTl = gsap.timeline({ paused: true });
    introTl
      .to(e1.frame!, { scale: 1, y: 0, rotationY: 0, rotationX: 0, filter: 'blur(0px)', opacity: 1, duration: 0.9, ease: 'elastic.out(1, 0.6)' }, 0)
      .to(e1.orbits, { opacity: 0.5, duration: 0.7, ease: 'power2.out' }, 0.15)
      .to(e1.narr!,  { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
      .to(header ? [header] : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.45)
      .to(name   ? [name]   : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.58)
      .to(tagline ? [tagline] : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.71)
      .to(body   ? [body]   : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.84)
      .to(e1.chips,  { y: 0, scale: 1, opacity: 1, rotation: 0, stagger: 0.12, duration: 0.55, ease: 'elastic.out(1, 0.55)' }, 1.0)
      .to(e1.badges, { scale: 1, opacity: 1, rotation: 0, stagger: 0.1, duration: 0.55, ease: 'elastic.out(1, 0.55)' }, 1.15)
      .to(metrics,   { opacity: 1, y: 0, scale: 1, stagger: 0.14, duration: 0.6, ease: 'elastic.out(1, 0.6)' }, 1.35)
      .to(stackTags, { opacity: 1, y: 0, scale: 1, rotation: 0, stagger: 0.07, duration: 0.5, ease: 'back.out(2.2)' }, 1.65)
      .to(links,     { opacity: 1, y: 0, scale: 1, stagger: 0.18, duration: 0.55, ease: 'back.out(2)' }, 1.9)
      .call(() => {
        // Clear GSAP's inline transform on badges/chips so CSS pb-float animation
        // takes full control without GSAP's scale/rotation blocking it.
        if (e1.badges.length) gsap.set(e1.badges, { clearProps: 'transform' });
        if (e1.chips.length)  gsap.set(e1.chips,  { clearProps: 'transform' });
      });

    ScrollTrigger.create({
      trigger: stage, start: 'top 20%',
      onEnter: () => introTl.play(),
      onLeaveBack: () => introTl.reverse(),
    });

    const tl = gsap.timeline();
    // El pin arranca con el proyecto 1 ya revelado (por el ScrollTrigger de
    // arriba); esta pausa reemplaza esa fase para que el crossfade hacia el
    // proyecto 2 (y los siguientes) siga cayendo en el mismo punto de scroll que antes.
    for (let i = 1; i < els.length; i++) {
      const currentScene = scenes[i - 1];
      const nextScene = scenes[i];
      const nextEl = els[i];

      tl.to({}, { duration: 0.55 })
        .to(currentScene, { autoAlpha: 0, duration: 0.20 })
        .to(nextScene,    { autoAlpha: 1, duration: 0.18 }, '<0.08')
        .to(nextEl.frame!,  { scale: 1, y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' }, '<0.06')
        .to(nextEl.orbits, { opacity: 0.5, duration: 0.22 }, '<0.06')
        .to(nextEl.narr!,   { x: 0, opacity: 1, duration: 0.26, ease: 'power2.out' }, '<0.14')
        .to(nextEl.chips,  { y: 0, opacity: 1, stagger: 0.05, duration: 0.20 }, '<0.18')
        .to(nextEl.badges, { opacity: 1, stagger: 0.06, duration: 0.20 }, '<0.20');
    }
    tl.to({}, { duration: 0.10 });

    const totalScrollPercent = (scenes.length - 1) * 130;
    ScrollTrigger.create({
      trigger: stage, pin: true, pinSpacing: true, scrub: 1.4,
      start: 'top top', end: `+=${totalScrollPercent}%`, animation: tl,
    });

    setTimeout(() => ScrollTrigger.refresh(), 100);
    setTimeout(() => ScrollTrigger.refresh(), 600);

    scenes.forEach(scene => {
      // With [hidden], both phone-frame and browser-frame are always in the DOM.
      // Apply tilt to the wrapper div (parentElement of .proj-frame) instead of
      // the frame itself — that way overflow:hidden + border-radius on the frame
      // never clips the rotated content (the clip box follows the untransformed frame).
      const frames = Array.from(scene.querySelectorAll<HTMLElement>('.proj-frame'));
      frames.forEach(frame => {
        const tiltTarget = (frame.parentElement ?? frame) as HTMLElement;
        let on = false;
        tiltTarget.addEventListener('mouseenter', () => { on = true; });
        tiltTarget.addEventListener('mousemove', (e: MouseEvent) => {
          if (!on) return;
          const r = frame.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
          const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
          gsap.to(tiltTarget, { rotationX: -dy * 5, rotationY: dx * 8, scale: 1.03, transformPerspective: 1100, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        });
        tiltTarget.addEventListener('mouseleave', () => {
          on = false;
          gsap.to(tiltTarget, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
        });
      });
    });
  }
}
