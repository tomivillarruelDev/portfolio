import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaptchaService } from '../../../shared/services/captcha.service';
import { CaptchaConfig } from '../../../shared/interfaces/captcha.interface';

@Component({
  selector: 'app-captcha-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './captcha-management.component.html',
  styleUrls: ['./captcha-management.component.css'],
})
export class CaptchaManagementComponent implements OnInit {
  config: CaptchaConfig = { enabled: false, siteKey: '', secretKey: '' };
  loading = true;
  saving  = false;
  saved   = false;
  error   = '';

  constructor(private captchaService: CaptchaService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.config = await this.captchaService.getConfig();
    } catch {
      this.error = 'Error al cargar la configuración del captcha.';
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    if (this.config.enabled) {
      if (!this.config.siteKey.trim() || !this.config.secretKey.trim()) {
        this.error = 'Si Google reCAPTCHA está activo, tanto la Clave del Sitio (Pública) como la Clave Secreta (Privada) son obligatorias.';
        return;
      }
    }

    try {
      this.saving = true;
      this.error  = '';
      this.saved  = false;
      await this.captchaService.saveConfig(this.config);
      this.saved = true;
      setTimeout(() => { this.saved = false; }, 3000);
    } catch {
      this.error = 'Error al guardar. Intentá de nuevo.';
    } finally {
      this.saving = false;
    }
  }
}
