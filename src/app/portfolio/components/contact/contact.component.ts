import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  effect,
  signal,
  inject,
  NgZone,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { IconInterface } from 'src/app/shared/interfaces/icons.interface';
import { IconsService } from 'src/app/shared/services/icons.service';
import tippy from 'tippy.js';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  // Señales reactivas
  readonly socials = signal<IconInterface>({});
  readonly tippyText = signal('Copiar email');
  readonly isHovering = signal(false);

  private tippyInstance: any;
  private timeoutId: any;

  // Inyección de dependencias usando inject
  private readonly iconsService = inject(IconsService);
  private readonly ngZone = inject(NgZone);
  private readonly environmentInjector = inject(EnvironmentInjector);

  constructor() {
    this.socials.set(this.iconsService.socials);
  }

  ngAfterViewInit() {
    this.tippyInstance = tippy('.tippy-send-email', {
      content: this.tippyText(),
      animation: 'shift-away-extreme',
      theme: 'light-border',
      hideOnClick: false,
    });

    tippy('.tippy-email', {
      content: 'Envíame un correo',
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });

    // Efecto reactivo para actualizar el contenido del tooltip en contexto de inyección
    runInInjectionContext(this.environmentInjector, () => {
      effect(() => {
        if (this.tippyInstance && this.tippyInstance[0]) {
          this.tippyInstance[0].setContent(this.tippyText());
        }
      });
    });
  }

  get socialValues() {
    return Object.entries(this.socials());
  }

  copyToClipboard() {
    const text = 'tomasadrianvillarruel@gmail.com';
    navigator.clipboard.writeText(text).then(() => {
      this.ngZone.run(() => {
        this.tippyText.set('Copiado');
        if (this.tippyInstance && this.tippyInstance[0]) {
          this.tippyInstance[0].setContent('Copiado');
          this.tippyInstance[0].show();
        }
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          this.tippyText.set('Copiar email');
          if (this.tippyInstance && this.tippyInstance[0]) {
            this.tippyInstance[0].setContent('Copiar email');
            this.tippyInstance[0].hide();
          }
        }, 1500);
      });
    });
  }

  setHovering(state: boolean) {
    this.isHovering.set(state);
  }

  ngOnDestroy(): void {
    if (this.tippyInstance && this.tippyInstance[0]) {
      this.tippyInstance[0].destroy();
    }
    clearTimeout(this.timeoutId);
  }
}
