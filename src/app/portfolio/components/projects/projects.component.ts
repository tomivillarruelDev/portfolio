import { Component, signal, inject, effect, NgZone, OnDestroy, untracked, ElementRef, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { ProjectCardComponent } from './project-card/project-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ImageViewerService } from 'src/app/shared/services/image-viewer.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TECH_MAP: Record<string, [string, string]> = {
  'Angular':    ['ic-ng',  'Ng'], 'angular':    ['ic-ng',  'Ng'],
  'TypeScript': ['ic-ts',  'TS'], 'typescript': ['ic-ts',  'TS'],
  'JavaScript': ['ic-js',  'JS'], 'javascript': ['ic-js',  'JS'],
  'Firebase':   ['ic-fb',  'FB'], 'firebase':   ['ic-fb',  'FB'],
  'Node.js':    ['ic-no',  'No'], 'nodejs':     ['ic-no',  'No'],
  'MongoDB':    ['ic-mo',  'Mo'], 'mongodb':    ['ic-mo',  'Mo'],
  'Docker':     ['ic-dk',  'Do'], 'docker':     ['ic-dk',  'Do'],
  'PostgreSQL': ['ic-pg',  'PG'], 'postgresql': ['ic-pg',  'PG'],
  'Git':        ['ic-git', 'Gi'], 'git':        ['ic-git', 'Gi'],
  'AWS':        ['ic-aws', 'AW'], 'aws':        ['ic-aws', 'AW'],
  'RxJS':       ['ic-ng',  'Rx'], 'Python':     ['ic-ng',  'Py'],
  'python':     ['ic-ng',  'Py'], 'React':      ['ic-ng',  'Re'],
  'HTML':       ['ic-ng',  'HT'], 'html':       ['ic-ng',  'HT'],
  'CSS':        ['ic-ng',  'CS'], 'css':        ['ic-ng',  'CS'],
  'Bootstrap':  ['ic-ng',  'Bs'], 'bootstrap':  ['ic-ng',  'Bs'],
  'Django':     ['ic-ng',  'Dj'], 'django':     ['ic-ng',  'Dj'],
};

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
  currentImageIndex: Record<string, number> = {};
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
      const projects = this.featuredProjects();
      if (projects.length > 0) {
        setTimeout(() => {
          this.checkCompletedImages();
        }, 100);
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
    const featured = all.slice(0, 2);
    this.featuredProjects.set(featured);
    featured.forEach(p => this.startAutoplay(p));
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
      }
    }
    this.scheduleScrollTriggerRefresh();
  }

  getBrowserAspectRatio(project: Project): string {
    const idx = this.currentImageIndex[project.id] || 0;
    const key = project.id + '_' + idx;
    const ratio = this.imageAspectRatios()[key];
    return ratio ? `${ratio}` : '1.6'; // Fallback 16/10
  }

  getBrowserMaxWidth(project: Project): number {
    const idx = this.currentImageIndex[project.id] || 0;
    const key = project.id + '_' + idx;
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
    const current = this.currentImageIndex[project.id] || 0;
    this.currentImageIndex[project.id] = current === 0 ? images.length - 1 : current - 1;
  }

  nextImage(project: Project, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      this.resetAutoplay(project);
    }
    const images = this.getProjectImages(project);
    if (images.length <= 1) return;
    const current = this.currentImageIndex[project.id] || 0;
    this.currentImageIndex[project.id] = current === images.length - 1 ? 0 : current + 1;
  }

  goToImage(project: Project, index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      this.resetAutoplay(project);
    }
    this.currentImageIndex[project.id] = index;
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

  getTagline(i: number, project: Project): string {
    return project.tagline || STATIC_FALLBACK[i]?.tagline || '';
  }

  getMetrics(i: number, project: Project): { val: string; lab: string }[] {
    if (project.metrics?.length) return project.metrics;
    return STATIC_FALLBACK[i]?.metrics ?? [];
  }

  private initGsap(): void {
    if (window.innerWidth < 900) return;

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
      sc.style.transform = 'translateX(-50%)';
      sc.style.width = '100%';
      sc.style.maxWidth = '1400px';
      sc.style.height = '100%';
      sc.style.margin = '0';
      sc.style.minHeight = 'unset';
      sc.style.zIndex = String(i + 1);
    });

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
    gsap.set(scenes[1], { autoAlpha: 0 });

    els.forEach(({ frame, narr, badges, chips, orbits, isRev }) => {
      if (frame)         gsap.set(frame,  { scale: 1.20, y: 90, opacity: 0 });
      if (narr)          gsap.set(narr,   { x: isRev ? -110 : 110, opacity: 0 });
      if (badges.length) gsap.set(badges, { opacity: 0 });
      if (chips.length)  gsap.set(chips,  { y: -50, opacity: 0 });
      if (orbits.length) gsap.set(orbits, { opacity: 0 });
    });

    const [e1, e2] = els;

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
      .to(e1.orbits, { opacity: 0.95, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0.15)
      .to(e1.narr!,  { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
      .to(header ? [header] : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.45)
      .to(name   ? [name]   : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.58)
      .to(tagline ? [tagline] : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.71)
      .to(body   ? [body]   : [], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.84)
      .to(e1.chips,  { y: 0, scale: 1, opacity: 1, rotation: 0, stagger: 0.12, duration: 0.55, ease: 'elastic.out(1, 0.55)' }, 1.0)
      .to(e1.badges, { scale: 1, opacity: 1, rotation: 0, stagger: 0.1, duration: 0.55, ease: 'elastic.out(1, 0.55)' }, 1.15)
      .to(metrics,   { opacity: 1, y: 0, scale: 1, stagger: 0.14, duration: 0.6, ease: 'elastic.out(1, 0.6)' }, 1.35)
      .to(stackTags, { opacity: 1, y: 0, scale: 1, rotation: 0, stagger: 0.07, duration: 0.5, ease: 'back.out(2.2)' }, 1.65)
      .to(links,     { opacity: 1, y: 0, scale: 1, stagger: 0.18, duration: 0.55, ease: 'back.out(2)' }, 1.9);

    ScrollTrigger.create({
      trigger: stage, start: 'top 20%',
      onEnter: () => introTl.play(),
      onLeaveBack: () => introTl.reverse(),
    });

    const tl = gsap.timeline();
    // El pin arranca con el proyecto 1 ya revelado (por el ScrollTrigger de
    // arriba); esta pausa reemplaza esa fase para que el crossfade hacia el
    // proyecto 2 siga cayendo en el mismo punto de scroll que antes.
    tl.to({}, { duration: 0.63 })
      .to(scenes[0], { autoAlpha: 0, duration: 0.12 })
      .to(scenes[1], { autoAlpha: 1, duration: 0.10 }, '<0.04')
      .to(e2.frame!,  { scale: 1, y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, '<0.04')
      .to(e2.orbits, { opacity: 0.95, duration: 0.14 }, '<0.04')
      .to(e2.narr!,   { x: 0, opacity: 1, duration: 0.18, ease: 'power2.out' }, '<0.10')
      .to(e2.chips,  { y: 0, opacity: 1, stagger: 0.04, duration: 0.14 }, '<0.14')
      .to(e2.badges, { opacity: 1, stagger: 0.05, duration: 0.14 }, '<0.17')
      .to({}, { duration: 0.10 });

    ScrollTrigger.create({
      trigger: stage, pin: true, pinSpacing: true, scrub: 1.4,
      start: 'top top', end: '+=130%', animation: tl,
    });

    setTimeout(() => ScrollTrigger.refresh(), 100);
    setTimeout(() => ScrollTrigger.refresh(), 600);

    scenes.forEach(scene => {
      const frame = scene.querySelector<HTMLElement>('.proj-frame');
      if (!frame) return;
      let on = false;
      frame.addEventListener('mouseenter', () => { on = true; });
      frame.addEventListener('mousemove', (e: MouseEvent) => {
        if (!on) return;
        const r = frame.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        gsap.to(frame, { rotationX: -dy * 6, rotationY: dx * 8, scale: 1.03, transformPerspective: 1100, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      frame.addEventListener('mouseleave', () => {
        on = false;
        gsap.to(frame, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }
}
