import { AfterViewInit, Component, NgZone } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { IntroductionComponent } from '../../components/introduction/introduction.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { AboutComponent } from '../../components/about/about.component';
import { ProjectsComponent } from '../../components/projects/projects.component';
import { SkillsComponent } from '../../components/skills/skills.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
import { EducationComponent } from '../../components/education/education.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    NavbarComponent,
    IntroductionComponent,
    StatsComponent,
    AboutComponent,
    ProjectsComponent,
    SkillsComponent,
    ExperienceComponent,
    EducationComponent,
    ContactComponent,
    FooterComponent,
  ],
})
export class HomeComponent implements AfterViewInit {
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.ngZone.runOutsideAngular(() => {
          this.initAllAnimations();
          // Refresh after Firebase async data loads (projects/skills from Realtime DB)
          setTimeout(() => ScrollTrigger.refresh(), 1200);
          setTimeout(() => ScrollTrigger.refresh(), 2500);
        });
      });
    });
  }

  private initAllAnimations(): void {
    this.initRevealObserver();
    this.initNavShrink();
    this.initHeroExit();
    this.initStatCols();
    this.initStatCounters();
    this.initSectionLabels();
    this.initSectionTitles();
    this.initSectionDescs();
    this.initExperienceEntries();
    this.initSkillPills();
    this.initAboutValues();
    this.initSmallCards();
    this.initEduCards();
    this.initOrbParallax();
    this.initContactCard();
  }

  // ── IO reveal: .reveal / .reveal-left / .reveal-right ──────────────────
  private initRevealObserver(): void {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.stagger')
      .forEach(el => io.observe(el));
  }

  // ── Nav shrink ──────────────────────────────────────────────────────────
  private initNavShrink(): void {
    const nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.padding = '12px 60px';
        nav.style.borderBottomColor = 'rgba(124,58,237,0.18)';
      } else {
        nav.style.padding = '18px 60px';
        nav.style.borderBottomColor = 'rgba(124,58,237,0.08)';
      }
    }, { passive: true });
  }

  // ── Hero cinematic exit (scrub) ─────────────────────────────────────────
  private initHeroExit(): void {
    const tl = gsap.timeline();
    tl.to('.hero-content',     { y: -70, opacity: 0, ease: 'none', duration: 0.6 })
      .to('.hero-avatar-wrap', { scale: 0.82, opacity: 0, ease: 'none', duration: 0.6 }, 0);
    ScrollTrigger.create({
      trigger: '#hero', scrub: 1,
      start: 'top top', end: 'bottom 10%',
      animation: tl,
    });
  }

  // ── Stat columns — scrub entrance ──────────────────────────────────────
  private initStatCols(): void {
    document.querySelectorAll<HTMLElement>('.stat-col').forEach(el => {
      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: { trigger: el, scrub: 0.7, start: 'top 86%', end: 'top 40%' } }
      );
    });
  }

  // ── Stat count-up (scrub) ───────────────────────────────────────────────
  private initStatCounters(): void {
    document.querySelectorAll<HTMLElement>('.count').forEach(el => {
      const target = +(el.dataset['target'] ?? 0);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
        scrollTrigger: { trigger: el, scrub: 1.2, start: 'top 82%', end: 'top 30%' },
      });
    });
  }

  // ── Section labels — horizontal clip reveal (scrub) ─────────────────────
  private initSectionLabels(): void {
    document.querySelectorAll<HTMLElement>('.section-label').forEach(el => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1,
          scrollTrigger: { trigger: el, scrub: 0.5, start: 'top 92%', end: 'top 62%' } }
      );
    });
  }

  // ── Section titles — rise + fade (scrub) ────────────────────────────────
  private initSectionTitles(): void {
    document.querySelectorAll<HTMLElement>('.section-title').forEach(el => {
      gsap.fromTo(el,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: { trigger: el, scrub: 0.6, start: 'top 88%', end: 'top 48%' } }
      );
    });
  }

  // ── Section descriptions (scrub) ────────────────────────────────────────
  private initSectionDescs(): void {
    document.querySelectorAll<HTMLElement>('.section-desc').forEach(el => {
      gsap.fromTo(el,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: { trigger: el, scrub: 0.5, start: 'top 90%', end: 'top 55%' } }
      );
    });
  }

  // ── Experience entries (scrub) ───────────────────────────────────────────
  private initExperienceEntries(): void {
    document.querySelectorAll('.exp-entry').forEach(entry => {
      const headline = entry.querySelector('.exp-headline');
      const byline   = entry.querySelector('.exp-byline');
      const content  = entry.querySelector('.exp-content');
      if (!headline) return;

      gsap.set(headline, { y: 56, opacity: 0 });
      gsap.set(byline,   { opacity: 0 });
      gsap.set(content,  { y: 28, opacity: 0 });

      const tl = gsap.timeline();
      tl.to(headline, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' })
        .to(byline,   { opacity: 1, duration: 0.25, ease: 'none' }, 0.18)
        .to(content,  { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.22);

      ScrollTrigger.create({
        trigger: entry, scrub: 0.9,
        start: 'top 88%', end: 'top 28%',
        animation: tl,
      });
    });
  }

  // ── Skill pills — scale + cascade (scrub) ─────────────────────────────
  private initSkillPills(): void {
    document.querySelectorAll<HTMLElement>('.about-value, .skill-pill').forEach(el => {
      el.style.transition = 'border-color 0.3s, box-shadow 0.3s, background 0.3s, color 0.3s';
    });
    document.querySelectorAll('.skills-list').forEach(group => {
      const pills = gsap.utils.toArray<HTMLElement>(group.querySelectorAll('.skill-pill'));
      gsap.fromTo(pills,
        { scale: 0.82, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: group as Element, scrub: 0.9, start: 'top 82%', end: 'top 18%' } }
      );
    });
  }

  // ── About value cards — scale + fade (scrub) ───────────────────────────
  private initAboutValues(): void {
    document.querySelectorAll<HTMLElement>('.about-value').forEach(el => {
      gsap.fromTo(el,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'power2.out',
          scrollTrigger: { trigger: el, scrub: 0.7, start: 'top 88%', end: 'top 48%' } }
      );
    });
  }

  // ── Small cards — scale + fade, staggered (scrub) ──────────────────────
  private initSmallCards(): void {
    document.querySelectorAll<HTMLElement>('.small-card').forEach(el => {
      el.style.transition = 'border-color 0.3s, box-shadow 0.3s, background 0.3s';
    });
    document.querySelectorAll<HTMLElement>('.small-card').forEach((el, i) => {
      gsap.fromTo(el,
        { scale: 0.90, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'power2.out',
          scrollTrigger: { trigger: el, scrub: 0.7,
            start: `top ${92 - i * 4}%`, end: `top ${52 - i * 4}%` } }
      );
    });
  }

  // ── Edu rows/cards — rise + fade (scrub) ───────────────────────────────
  private initEduCards(): void {
    const rows = document.querySelectorAll<HTMLElement>('.edu-row, .edu-card');
    rows.forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: { trigger: el, scrub: 0.6, start: 'top 88%', end: 'top 45%' } }
      );
    });
  }

  // ── Orbs — slow parallax ────────────────────────────────────────────────
  private initOrbParallax(): void {
    document.querySelectorAll('.orb').forEach((orb, i) => {
      gsap.to(orb, {
        y: i % 2 === 0 ? -100 : 110, ease: 'none',
        scrollTrigger: {
          trigger: (orb.closest('section') ?? orb.parentElement) as Element,
          scrub: 2.5, start: 'top bottom', end: 'bottom top',
        },
      });
    });
  }

  // ── Contact card — scale in (scrub) ────────────────────────────────────
  private initContactCard(): void {
    // contact-inner: headline + label (replace reveal/IO with GSAP scrub)
    const inner = document.querySelector<HTMLElement>('.contact-inner');
    if (inner) {
      // Force visibility — remove opacity:0 set by .reveal CSS
      inner.style.opacity = '1';
      inner.style.transform = 'none';
      const label = inner.querySelector<HTMLElement>('.section-label');
      const headline = inner.querySelector<HTMLElement>('.contact-headline');
      const loss = inner.querySelector<HTMLElement>('.contact-loss');
      if (label) gsap.fromTo(label,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1,
          scrollTrigger: { trigger: label, scrub: 0.5, start: 'top 92%', end: 'top 62%' } }
      );
      if (headline) gsap.fromTo(headline,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: { trigger: headline, scrub: 0.6, start: 'top 88%', end: 'top 48%' } }
      );
      if (loss) gsap.fromTo(loss,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: { trigger: loss, scrub: 0.5, start: 'top 90%', end: 'top 55%' } }
      );
    }

    // contact-box: scale in
    const box = document.querySelector<HTMLElement>('.contact-box, .contact-card');
    if (box) {
      box.style.opacity = '1';
      box.style.transform = 'none';
      gsap.fromTo(box,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1,
          scrollTrigger: { trigger: box, scrub: 0.7, start: 'top 85%', end: 'top 40%' } }
      );
    }
  }
}
