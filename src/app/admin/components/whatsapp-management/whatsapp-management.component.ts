import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsappService } from '../../../shared/services/whatsapp.service';
import { WhatsappConfig } from '../../../shared/interfaces/whatsapp.interface';

@Component({
  selector: 'app-whatsapp-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-management.component.html',
  styleUrls: ['./whatsapp-management.component.css'],
})
export class WhatsappManagementComponent implements OnInit {
  config: WhatsappConfig = { enabled: true, phone: '', message: '' };
  loading = true;
  saving  = false;
  saved   = false;
  error   = '';

  constructor(private whatsappService: WhatsappService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.config = await this.whatsappService.getConfig();
    } catch {
      this.error = 'Error al cargar la configuración.';
    } finally {
      this.loading = false;
    }
  }

  get previewUrl(): string {
    const text = encodeURIComponent(this.config.message);
    return `https://wa.me/${this.config.phone}?text=${text}`;
  }

  async save(): Promise<void> {
    try {
      this.saving = true;
      this.error  = '';
      this.saved  = false;
      await this.whatsappService.saveConfig(this.config);
      this.saved = true;
      setTimeout(() => { this.saved = false; }, 3000);
    } catch {
      this.error = 'Error al guardar. Intentá de nuevo.';
    } finally {
      this.saving = false;
    }
  }
}
