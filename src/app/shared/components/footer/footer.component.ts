import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappService } from '../../services/whatsapp.service';

@Component({
  selector: 'shared-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  readonly year = new Date().getFullYear();
  readonly inView = signal(false);
  readonly whatsappHref = signal('https://wa.me/543512524229');

  private readonly footerEl = viewChild<ElementRef<HTMLElement>>('footerEl');
  private readonly ngZone = inject(NgZone);
  private io?: IntersectionObserver;

  constructor(private whatsappService: WhatsappService) {
    // Mismo número y mensaje que el botón flotante (configurables desde el admin)
    this.whatsappService.getConfig().then(cfg => {
      this.whatsappHref.set(`https://wa.me/${cfg.phone}?text=${encodeURIComponent(cfg.message)}`);
    });
  }

  ngAfterViewInit(): void {
    const el = this.footerEl()?.nativeElement;
    if (!el) return;
    // Dispara el revelado (y el pintado del nombre) una sola vez, al entrar en pantalla
    this.ngZone.runOutsideAngular(() => {
      this.io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this.ngZone.run(() => this.inView.set(true));
          this.io?.disconnect();
        }
      }, { threshold: 0.2 });
      this.io.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
