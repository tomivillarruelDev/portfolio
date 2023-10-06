import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent {

  menu_active: boolean = false;

  toggleMenu() {
    
    this.menu_active = !this.menu_active;
    console.log(this.menu_active);
  }
}
