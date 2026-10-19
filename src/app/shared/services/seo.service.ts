import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

interface SeoPage {
  title: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly BASE_URL = 'https://tomas-villarruel-portfolio.web.app';
  private readonly DEFAULT_IMAGE = `${this.BASE_URL}/assets/og-image-v2.png`;

  constructor(
    private titleSvc: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  setPage(page: SeoPage): void {
    const image = page.image ?? this.DEFAULT_IMAGE;

    this.titleSvc.setTitle(page.title);

    this.meta.updateTag({ name: 'description',        content: page.description });
    if (page.keywords) {
      this.meta.updateTag({ name: 'keywords',         content: page.keywords });
    }

    this.meta.updateTag({ property: 'og:title',       content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url',         content: page.url });
    this.meta.updateTag({ property: 'og:image',       content: image });

    this.meta.updateTag({ name: 'twitter:title',       content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image',       content: image });

    this.setCanonicalUrl(page.url);
  }

  setHomePage(): void {
    this.setPage({
      title: 'Tomás Villarruel | Desarrollador Full Stack en Córdoba (Angular, NestJS)',
      description: 'Desarrollador Full Stack en Córdoba, Argentina. Sitios, e-commerce y sistemas a medida con Angular, NestJS y PostgreSQL. Proyectos publicados y contacto directo.',
      url: `${this.BASE_URL}/`,
      keywords: 'Tomás Villarruel, Desarrollador Full Stack, Angular, TypeScript, Node.js, NestJS, Firebase, Symfony, PostgreSQL, RxJS, Desarrollador Web, Argentina, Córdoba'
    });
  }

  private setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.doc.head.appendChild(link);
    }
  }
}
