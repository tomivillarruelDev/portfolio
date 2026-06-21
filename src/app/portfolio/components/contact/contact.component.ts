import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const EMAILJS_SERVICE_ID  = 'service_c81p2ym';
const EMAILJS_TEMPLATE_ID = 'template_432a6es';
const EMAILJS_PUBLIC_KEY  = 'AWPiMrrzABPkCdBaa';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ContactComponent {
  sent    = false;
  sending = false;
  error   = '';
  copyLabel = 'Copiar';

  form = {
    nombre:  '',
    email:   '',
    tipo:    '',
    mensaje: '',
  };

  constructor(private http: HttpClient) {}

  async onSubmit(): Promise<void> {
    if (this.sending) return;
    this.sending = true;
    this.error   = '';

    const payload = {
      service_id:  EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id:     EMAILJS_PUBLIC_KEY,
      template_params: {
        name:         this.form.nombre,
        email:        this.form.email,
        from_name:    this.form.nombre,
        from_email:   this.form.email,
        project_type: this.form.tipo,
        message:      this.form.mensaje,
      },
    };

    try {
      await this.http.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        payload,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' as const }
      ).toPromise();
      this.sent = true;
    } catch (err: any) {
      console.error('EmailJS error:', err);
      this.error = 'Hubo un error al enviar. Escribime directamente a tomasvillarruel18@gmail.com';
    } finally {
      this.sending = false;
    }
  }

  copyEmail(): void {
    navigator.clipboard.writeText('tomasvillarruel18@gmail.com').then(() => {
      this.copyLabel = 'Copiado';
      setTimeout(() => (this.copyLabel = 'Copiar'), 2000);
    });
  }
}
