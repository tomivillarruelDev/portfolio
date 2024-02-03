import { Component, Input, AfterViewInit, OnInit } from '@angular/core';

import Iconify from '@iconify/iconify';

import tippy from 'tippy.js';

@Component({
  selector: 'app-technologies',
  templateUrl: './technologies.component.html',
  styleUrls: ['./technologies.component.css']
})
export class TechnologiesComponent implements OnInit, AfterViewInit {

  @Input() technologies: string[] = [];

  @Input() size: string = '';


  ngOnInit(): void {
    if (!this.technologies) return;

    this.technologies = this.technologies.map((tech) => tech ? tech.toLowerCase() : tech);
    this.technologies = this.technologies.filter((tech) => tech && tech !== '');

  }

  getPathIcon(technology: string): string {
    return `./assets/icons/svgs/${ technology }.svg`;
  }

  ngAfterViewInit() {

    tippy('.tippy-tech', {
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });
  }
}

