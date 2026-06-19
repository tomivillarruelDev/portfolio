import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ContactComponent {
  sent = false;
  copyLabel = 'Copiar';

  form = {
    nombre: '',
    email: '',
    tipo: '',
    mensaje: '',
  };

  onSubmit(): void {
    // In a real app, send to Firebase / EmailJS / etc.
    this.sent = true;
  }

  copyEmail(): void {
    navigator.clipboard.writeText('tomasvillarruel18@gmail.com').then(() => {
      this.copyLabel = 'Copiado';
      setTimeout(() => (this.copyLabel = 'Copiar'), 2000);
    });
  }
}
