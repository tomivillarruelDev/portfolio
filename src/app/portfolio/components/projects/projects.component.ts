import { Component, signal, inject, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { ProjectCardComponent } from './project-card/project-card.component';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TECH_MAP: Record<string, [string, string]> = {
  'Angular':    ['ic-ng',  'A'],
  'TypeScript': ['ic-ts',  'T'],
  'Firebase':   ['ic-fb',  'F'],
  'Node.js':    ['ic-no',  'N'],
  'MongoDB':    ['ic-mo',  'M'],
  'Docker':     ['ic-dk',  'D'],
  'PostgreSQL': ['ic-pg',  'Pg'],
  'Git':        ['ic-git', 'G'],
  'AWS':        ['ic-aws', 'A'],
  'RxJS':       ['ic-ng',  'R'],
};

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
        // Two rAFs: first lets Angular render, second lets the browser paint
        requestAnimationFrame(() => requestAnimationFrame(() => {
          this.ngZone.runOutsideAngular(() => this.initGsap());
        }));
      }
    });
    this.loadProjects();
  }

  private async loadProjects() {
    const resp = await this.firebaseService.getProjects('featuredProjects');
    this.featuredProjects.set(resp);
  }

  getTechClass(tech: string): string { return TECH_MAP[tech]?.[0] ?? 'ic-ng'; }
  getTechAbbr(tech: string):  string { return TECH_MAP[tech]?.[1] ?? tech.slice(0,2); }

  // ── Ported 1:1 from the HTML final script ───────────────────────────────
  private initGsap(): void {
    const section = document.querySelector<HTMLElement>('#projects');
    if (!section) return;

    const scenes = Array.from(section.querySelectorAll<HTMLElement>('.proj-scene'));
    if (scenes.length < 2) return;

    // ── Create stage container wrapping both scenes ──
    const stage = document.createElement('div');
    stage.className = 'proj-pin-stage';
    stage.style.cssText = 'position:relative;width:100%;height:100vh;overflow:hidden;';
    scenes[0].parentNode!.insertBefore(stage, scenes[0]);
    scenes.forEach(sc => stage.appendChild(sc));

    // ── Stack scenes absolutely ──
    scenes.forEach((sc, i) => {
      sc.style.cssText += [
        ';position:absolute',
        'top:0', 'left:50%', 'transform:translateX(-50%)',
        'width:100%', 'max-width:1400px', 'height:100%',
        'margin:0', 'min-height:unset',
        'z-index:' + (i + 1),
      ].join(';');
    });

    // ── Helpers ──
    const els = scenes.map(sc => ({
      sc,
      frame:  sc.querySelector<HTMLElement>('.proj-frame'),
      narr:   sc.querySelector<HTMLElement>('.proj-narrative'),
      badges: Array.from(sc.querySelectorAll<HTMLElement>('.proj-badge')),
      chips:  Array.from(sc.querySelectorAll<HTMLElement>('.proj-chip')),
      orbits: Array.from(sc.querySelectorAll<HTMLElement>('.proj-orbit,.proj-orbit-2')),
      isRev:  sc.classList.contains('reverse'),
    }));

    // ── Initial states ──
    gsap.set(scenes[0], { opacity: 1 });
    gsap.set(scenes[1], { opacity: 0 });

    els.forEach(({ frame, narr, badges, chips, orbits, isRev }) => {
      if (frame)         gsap.set(frame,  { scale: 1.20, y: 90, opacity: 0 });
      if (narr)          gsap.set(narr,   { x: isRev ? -110 : 110, opacity: 0 });
      if (badges.length) gsap.set(badges, { opacity: 0 });
      if (chips.length)  gsap.set(chips,  { y: -50, opacity: 0 });
      if (orbits.length) gsap.set(orbits, { opacity: 0 });
    });

    // ── Master timeline — scene 1, pause, crossfade, scene 2 ──
    const tl = gsap.timeline();
    const e1 = els[0], e2 = els[1];

    tl.to(e1.frame,  { scale: 1, y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, 0)
      .to(e1.orbits, { opacity: 0.95, duration: 0.14 }, 0.04)
      .to(e1.narr,   { x: 0, opacity: 1, duration: 0.18, ease: 'power2.out' }, 0.12)
      .to(e1.chips,  { y: 0, opacity: 1, stagger: 0.04, duration: 0.14 }, 0.16)
      .to(e1.badges, { opacity: 1, stagger: 0.05, duration: 0.14 }, 0.20)
      .to({}, { duration: 0.14 })
      .to(scenes[0], { opacity: 0, duration: 0.12 })
      .to(scenes[1], { opacity: 1, duration: 0.10 }, '<0.04')
      .to(e2.frame,  { scale: 1, y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, '<0.04')
      .to(e2.orbits, { opacity: 0.95, duration: 0.14 }, '<0.04')
      .to(e2.narr,   { x: 0, opacity: 1, duration: 0.18, ease: 'power2.out' }, '<0.10')
      .to(e2.chips,  { y: 0, opacity: 1, stagger: 0.04, duration: 0.14 }, '<0.14')
      .to(e2.badges, { opacity: 1, stagger: 0.05, duration: 0.14 }, '<0.17')
      .to({}, { duration: 0.10 });

    // ── Single pin — scroll drives the whole timeline ──
    ScrollTrigger.create({
      trigger: stage,
      pin: true,
      pinSpacing: true,
      scrub: 1.4,
      start: 'top top',
      end: '+=130%',
      animation: tl,
    });

    // ── 3-D tilt on hover ──
    scenes.forEach(scene => {
      const frame = scene.querySelector<HTMLElement>('.proj-frame');
      if (!frame) return;
      let _on = false;
      frame.addEventListener('mouseenter', () => { _on = true; });
      frame.addEventListener('mousemove', (e: MouseEvent) => {
        if (!_on) return;
        const r  = frame.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        gsap.to(frame, {
          rotationX: -dy * 6, rotationY: dx * 8,
          scale: 1.03, transformPerspective: 1100,
          duration: 0.3, ease: 'power2.out', overwrite: 'auto',
        });
      });
      frame.addEventListener('mouseleave', () => {
        _on = false;
        gsap.to(frame, {
          rotationX: 0, rotationY: 0, scale: 1,
          duration: 0.55, ease: 'power3.out', overwrite: 'auto',
        });
      });
    });
  }
}
