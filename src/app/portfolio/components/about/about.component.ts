import { AfterViewInit, Component, NgZone } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'portfolio-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
})
export class AboutComponent implements AfterViewInit {
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initAnimations());
  }

  private initAnimations(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;

    const rows = document.querySelectorAll<HTMLElement>('.cap-row');
    if (rows.length) {
      gsap.set(rows, { x: 14, opacity: 0 });
      ScrollTrigger.create({
        trigger: '.cap-list',
        start: 'top 65%',
        once: true,
        onEnter: () => gsap.to(rows, {
          x: 0, opacity: 1,
          duration: 0.48, ease: 'power2.out',
          stagger: 0.065,
        }),
      });
    }
  }
}
