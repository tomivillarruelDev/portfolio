import { AfterViewInit, Component } from '@angular/core';

import tippy from 'tippy.js';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent implements AfterViewInit {
  ngAfterViewInit(): void {
  
      tippy('.tippy-work', {
        content: 'Disponible para trabajar',
        animation: 'shift-away-extreme',
        theme: 'light-border',
      });
  }
  

}
