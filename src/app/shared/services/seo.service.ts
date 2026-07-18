import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoPage {
  title: string;
  description: string;
  url: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly BASE_URL = 'https://tomas-villarruel-portfolio.web.app';
  private readonly DEFAULT_IMAGE = `${this.BASE_URL}/assets/og-image.png`;

  constructor(private titleSvc: Title, private meta: Meta) {}

  setPage(page: SeoPage): void {
    const image = page.image ?? this.DEFAULT_IMAGE;

    this.titleSvc.setTitle(page.title);

    this.meta.updateTag({ name: 'description',      content: page.description });
    this.meta.updateTag({ property: 'og:title',     content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url',        content: page.url });
    this.meta.updateTag({ property: 'og:image',      content: image });
    this.meta.updateTag({ name: 'twitter:title',     content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image',     content: image });
  }

  setHomePage(): void {
    this.setPage({
      title: 'Tomás Villarruel — Desarrollador Full Stack',
      description: 'Portfolio de Tomás Villarruel, Desarrollador Full Stack especializado en Angular, TypeScript y Firebase. Desarrollo web moderno, aplicaciones escalables y arquitectura limpia.',
      url: `${this.BASE_URL}/`,
    });
  }
}
