import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CaptchaService } from '../../../shared/services/captcha.service';
import { CaptchaConfig } from '../../../shared/interfaces/captcha.interface';

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
export class ContactComponent implements OnInit {
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

  captchaConfig: CaptchaConfig = { enabled: false, siteKey: '', secretKey: '' };
  userCaptchaAnswer = '';
  honeypot = '';

  constructor(
    private http: HttpClient,
    private captchaService: CaptchaService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.captchaConfig = await this.captchaService.getConfig();
      if (this.captchaConfig.enabled && this.captchaConfig.siteKey) {
        this.loadRecaptchaScript();
        this.renderCaptcha();
      }
    } catch (err) {
      console.error('Error al cargar la configuración del captcha:', err);
    }
  }

  private loadRecaptchaScript(): void {
    if (document.getElementById('recaptcha-script')) return;
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  private renderCaptcha(): void {
    const checkInterval = setInterval(() => {
      if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
        clearInterval(checkInterval);
        try {
          const container = document.getElementById('recaptcha-container');
          if (container) {
            (window as any).grecaptcha.render('recaptcha-container', {
              sitekey: this.captchaConfig.siteKey,
              size: 'invisible',
              badge: 'bottomright',
              callback: (token: string) => {
                this.userCaptchaAnswer = token;
                this.sendEmail(token);
              },
              'expired-callback': () => {
                this.userCaptchaAnswer = '';
                this.sending = false;
              },
              'error-callback': () => {
                this.userCaptchaAnswer = '';
                this.sending = false;
                this.error = 'Error de validación con reCAPTCHA.';
              }
            });
          }
        } catch (e) {
          console.error('Error al renderizar reCAPTCHA:', e);
        }
      }
    }, 100);
  }

  async onSubmit(contactForm: NgForm): Promise<void> {
    if (this.sending) return;

    // 1. Honeypot check (anti-bot silencioso)
    if (this.honeypot) {
      console.warn('Bot detectado mediante Honeypot.');
      this.sent = true;
      return;
    }

    // 2. Validar formulario nativo de Angular
    if (contactForm.invalid) {
      contactForm.control.markAllAsTouched();
      this.error = 'Por favor, completá todos los campos requeridos correctamente.';
      return;
    }

    this.sending = true;
    this.error   = '';

    // 3. Ejecutar reCAPTCHA invisible si está habilitado
    if (this.captchaConfig.enabled) {
      if (!this.captchaConfig.siteKey) {
        this.error = 'Error de configuración de seguridad (falta Site Key). Por favor, escribime directamente a tomasvillarruel18@gmail.com';
        this.sending = false;
        return;
      }

      try {
        if ((window as any).grecaptcha && (window as any).grecaptcha.execute) {
          (window as any).grecaptcha.reset();
          (window as any).grecaptcha.execute();
        } else {
          throw new Error('Google reCAPTCHA no está inicializado.');
        }
      } catch (err) {
        console.error('Error al ejecutar reCAPTCHA:', err);
        this.error = 'No se pudo validar el captcha de seguridad. Por favor, reintentá o escribime directamente por email.';
        this.sending = false;
      }
    } else {
      await this.sendEmail();
    }
  }

  async sendEmail(token?: string): Promise<void> {
    const payload: any = {
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

    if (token) {
      payload['g-recaptcha-response'] = token;
    }

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

