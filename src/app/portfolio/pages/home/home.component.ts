import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { SeoService } from '../../../shared/services/seo.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { IntroductionComponent } from '../../components/introduction/introduction.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { AboutComponent } from '../../components/about/about.component';
import { ProjectsComponent } from '../../components/projects/projects.component';
import { SkillsComponent } from '../../components/skills/skills.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
import { ProcessComponent } from '../../components/process/process.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { WhatsappButtonComponent } from '../../components/whatsapp-button/whatsapp-button.component';
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
    ProcessComponent,
    ContactComponent,
    FooterComponent,
    WhatsappButtonComponent,
  ],
})
export class HomeComponent implements OnInit, AfterViewInit {
  showCtaBanner = false;

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

  constructor(private ngZone: NgZone, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setHomePage();
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.ngZone.runOutsideAngular(() => {
          this.initAllAnimations();
          [400, 800, 1400, 2000, 3000, 4500].forEach(ms =>
            setTimeout(() => ScrollTrigger.refresh(), ms)
          );
        });
      });
    });
  }

  private initAllAnimations(): void {
    this.initRevealObserver();  // handles .reveal, .reveal-left, .reveal-right via IntersectionObserver
    this.initNavShrink();       // navbar shrink on scroll
    this.initStatCounters();    // number counters
    this.initCtaBanner();       // floating banner

    if (window.innerWidth >= 900) {
      this.initHeroExit();
    }

    this.initStatCols();
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

  private getST(el: Element, start = 'top 88%', end = 'top 48%', scrubVal = 0.6) {
    return window.innerWidth < 900
      ? { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      : { trigger: el, scrub: scrubVal, start, end };
  }

  private initRevealObserver(): void {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
        else e.target.classList.remove('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 100px 0px' });
    document.querySelectorAll('.reveal, .stagger, .reveal-left, .reveal-right').forEach(el => io.observe(el));
  }

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

  private initStatCols(): void {
    document.querySelectorAll<HTMLElement>('.stat-col').forEach(el => {
      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(el, 'top 86%', 'top 40%', 0.7) }
      );
    });
  }

  private initStatCounters(): void {
    document.querySelectorAll<HTMLElement>('.count').forEach(el => {
      const target = +(el.dataset['target'] ?? 0);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
        scrollTrigger: this.getST(el, 'top 82%', 'top 30%', 1.2),
      });
    });
  }

  private initSectionLabels(): void {
    document.querySelectorAll<HTMLElement>('.section-label').forEach(el => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1,
          scrollTrigger: this.getST(el, 'top 92%', 'top 62%', 0.5) }
      );
    });
  }

  private initSectionTitles(): void {
    document.querySelectorAll<HTMLElement>('.section-title').forEach(el => {
      gsap.fromTo(el,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(el, 'top 88%', 'top 48%', 0.6) }
      );
    });
  }

  private initSectionDescs(): void {
    document.querySelectorAll<HTMLElement>('.section-desc').forEach(el => {
      gsap.fromTo(el,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(el, 'top 90%', 'top 55%', 0.5) }
      );
    });
  }

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
        ...this.getST(entry, 'top 88%', 'top 28%', 0.9),
        animation: tl,
      });
    });
  }

  private initSkillPills(): void {
    document.querySelectorAll<HTMLElement>('.about-value, .skill-pill').forEach(el => {
      el.style.transition = 'border-color 0.3s, box-shadow 0.3s, background 0.3s, color 0.3s';
    });
    document.querySelectorAll('.skills-list').forEach(group => {
      const pills = gsap.utils.toArray<HTMLElement>(group.querySelectorAll('.skill-pill'));
      gsap.fromTo(pills,
        { scale: 0.82, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: this.getST(group as Element, 'top 82%', 'top 18%', 0.9) }
      );
    });
  }

  private initAboutValues(): void {
    document.querySelectorAll<HTMLElement>('.about-value').forEach(el => {
      gsap.fromTo(el,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'power2.out',
          scrollTrigger: this.getST(el, 'top 88%', 'top 48%', 0.7) }
      );
    });
  }

  private initSmallCards(): void {
    const applyAnim = (el: HTMLElement, i: number) => {
      el.style.transition = 'border-color 0.3s, box-shadow 0.3s, background 0.3s';
      gsap.fromTo(el,
        { scale: 0.90, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'power2.out',
          scrollTrigger: this.getST(el, 'top 90%', 'top 50%', 0.7) }
      );
    };

    const existing = document.querySelectorAll<HTMLElement>('.small-card');
    if (existing.length > 0) {
      existing.forEach((el, i) => applyAnim(el, i));
      return;
    }

    const container = document.querySelector('.small-projects, portfolio-card-projects');
    if (!container) return;
    let done = false;
    const mo = new MutationObserver(() => {
      if (done) return;
      const cards = document.querySelectorAll<HTMLElement>('.small-card');
      if (cards.length > 0) {
        done = true;
        mo.disconnect();
        cards.forEach((el, i) => applyAnim(el, i));
        setTimeout(() => ScrollTrigger.refresh(), 80);
      }
    });
    mo.observe(container, { childList: true, subtree: true });
  }

  private initEduCards(): void {
    document.querySelectorAll<HTMLElement>('.edu-row, .edu-card').forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(el, 'top 88%', 'top 45%', 0.6) }
      );
    });
  }

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

  private initCtaBanner(): void {
    const ids = ['skills', 'projects'];
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const visible = new Set<Element>();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      this.ngZone.run(() => { this.showCtaBanner = visible.size > 0; });
    }, { threshold: 0.01 });

    sections.forEach(s => io.observe(s));
  }

  private initTestimonials(): void {
    document.querySelectorAll<HTMLElement>('.testi-card').forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(el, 'top 88%', 'top 45%', 0.6) }
      );
    });
  }

  private initContactCard(): void {
    const inner = document.querySelector<HTMLElement>('.contact-inner');
    if (inner) {
      inner.style.transition = 'none';
      inner.style.opacity = '1';
      inner.style.transform = 'none';
      const label    = inner.querySelector<HTMLElement>('.section-label');
      const headline = inner.querySelector<HTMLElement>('.contact-headline');
      const loss     = inner.querySelector<HTMLElement>('.contact-loss');
      if (label) gsap.fromTo(label,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1,
          scrollTrigger: this.getST(label, 'top 92%', 'top 62%', 0.5) }
      );
      if (headline) gsap.fromTo(headline,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(headline, 'top 88%', 'top 48%', 0.6) }
      );
      if (loss) gsap.fromTo(loss,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: this.getST(loss, 'top 90%', 'top 55%', 0.5) }
      );
    }

    const box = document.querySelector<HTMLElement>('.contact-box, .contact-card');
    if (box) {
      box.style.transition = 'none';
      box.style.opacity = '1';
      box.style.transform = 'none';
      gsap.fromTo(box,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1,
          scrollTrigger: this.getST(box, 'top 85%', 'top 40%', 0.7) }
      );
    }
  }
}
