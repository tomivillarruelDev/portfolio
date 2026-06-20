import { Component, signal, inject, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { ProjectCardComponent } from './project-card/project-card.component';
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

const STATIC: {
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
  imports: [CommonModule, ProjectCardComponent],
})
export class ProjectsComponent {
  readonly featuredProjects = signal<Project[]>([]);
  private gsapInited = false;

  private readonly firebaseService = inject(FirebaseService);
  private readonly ngZone = inject(NgZone);

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
    this.loadProjects();
  }

  private async loadProjects() {
    const all = await this.firebaseService.getProjects('projects');
    this.featuredProjects.set(all.slice(0, 2));
  }

  getTechClass(tech: string): string { return TECH_MAP[tech]?.[0] ?? 'ic-ng'; }
  getTechAbbr(tech: string):  string { return TECH_MAP[tech]?.[1] ?? tech.slice(0, 2).toUpperCase(); }
  getNameHtml(i: number): string     { return STATIC[i]?.nameHtml ?? ''; }
  getTagline(i: number): string      { return STATIC[i]?.tagline ?? ''; }
  getMetrics(i: number)              { return STATIC[i]?.metrics ?? []; }
  getChip(i: number, slot: 0|1|2|3): string { return STATIC[i]?.chipVals[slot] ?? ''; }

  private initGsap(): void {
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

    gsap.set(scenes[0], { opacity: 1 });
    gsap.set(scenes[1], { opacity: 0 });

    els.forEach(({ frame, narr, badges, chips, orbits, isRev }) => {
      if (frame)         gsap.set(frame,  { scale: 1.20, y: 90, opacity: 0 });
      if (narr)          gsap.set(narr,   { x: isRev ? -110 : 110, opacity: 0 });
      if (badges.length) gsap.set(badges, { opacity: 0 });
      if (chips.length)  gsap.set(chips,  { y: -50, opacity: 0 });
      if (orbits.length) gsap.set(orbits, { opacity: 0 });
    });

    const tl = gsap.timeline();
    const [e1, e2] = els;
    tl.to(e1.frame!,  { scale: 1, y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, 0)
      .to(e1.orbits, { opacity: 0.95, duration: 0.14 }, 0.04)
      .to(e1.narr!,   { x: 0, opacity: 1, duration: 0.18, ease: 'power2.out' }, 0.12)
      .to(e1.chips,  { y: 0, opacity: 1, stagger: 0.04, duration: 0.14 }, 0.16)
      .to(e1.badges, { opacity: 1, stagger: 0.05, duration: 0.14 }, 0.20)
      .to({}, { duration: 0.14 })
      .to(scenes[0], { opacity: 0, duration: 0.12 })
      .to(scenes[1], { opacity: 1, duration: 0.10 }, '<0.04')
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

    // Refresh so pin position is correct after Firebase load
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
        gsap.to(frame, {
          rotationX: -dy * 6, rotationY: dx * 8, scale: 1.03,
          transformPerspective: 1100, duration: 0.3,
          ease: 'power2.out', overwrite: 'auto',
        });
      });
      frame.addEventListener('mouseleave', () => {
        on = false;
        gsap.to(frame, {
          rotationX: 0, rotationY: 0, scale: 1,
          duration: 0.55, ease: 'power3.out', overwrite: 'auto',
        });
      });
    });
  }
}
