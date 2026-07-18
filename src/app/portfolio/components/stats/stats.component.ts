import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, Stat } from '../../../shared/services/stats.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'portfolio-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class StatsComponent implements OnInit {
  stats: Stat[] = [];
  visibleStats: Stat[] = [];
  loaded = false;

  constructor(
    private statsService: StatsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  async ngOnInit(): Promise<void> {
    this.stats = await this.statsService.getStats();
    this.visibleStats = this.stats.filter(s => s.visible);
    this.loaded = true;
    this.cdr.detectChanges();
    // Run counters after Angular renders the new DOM
    setTimeout(() => this.ngZone.runOutsideAngular(() => this.initCounters()), 80);
  }

  get featuredStats()   { return this.visibleStats.slice(0, 2); }
  get secondaryStats()  { return this.visibleStats.slice(2); }

  private initCounters(): void {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll<HTMLElement>('.count').forEach(el => {
      const target = +(el.dataset['target'] ?? 0);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
        scrollTrigger: {
          trigger: el, scrub: 1.2,
          start: 'top 82%', end: 'top 30%',
        },
      });
    });
  }
}
