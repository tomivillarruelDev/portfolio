import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { IconInterface } from 'src/app/shared/interfaces/icons.interface';
import { IconsService } from 'src/app/shared/services/icons.service';

import tippy from 'tippy.js';



@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    standalone: false
})
export class ContactComponent implements OnInit, AfterViewInit {

  isHovering = false;

  public socials: IconInterface = {};

  private tippyText = 'Copiar email';

  private tippyInstance: any;

  constructor( private iconsService: IconsService, private ngZone: NgZone) { }

  ngOnInit(): void {
    this.socials = this.iconsService.socials;
  }

  ngAfterViewInit() {
    this.tippyInstance = tippy('.tippy-send-email', {
      content: this.tippyText,
      animation: 'shift-away-extreme',
      theme: 'light-border',
      hideOnClick: false,

    });

    tippy('.tippy-email', {
      content: 'Envíame un correo',
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });
  }

  get socialValues() {
    return Object.entries(this.socials);
  }

  copyToClipboard(){
    const text =  'tomasadrianvillarruel@gmail.com'
    navigator.clipboard.writeText(text).then(() => {
      this.ngZone.run(() => {
        this.tippyInstance[0].setContent('Copiado');
        this.tippyInstance[0].show();
      });
    });
  }





}
