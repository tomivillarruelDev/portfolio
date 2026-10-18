import { Component } from '@angular/core';

/**
 * La entrada escalonada de las capacidades (.cap-row) la maneja el CSS
 * (.cap-dash.visible), disparada por el IntersectionObserver de home.
 * Antes también se animaba con GSAP y las dos animaciones peleaban por la
 * opacidad: las filas quedaban trabadas a medio aparecer.
 */
@Component({
  selector: 'portfolio-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
})
export class AboutComponent {}
