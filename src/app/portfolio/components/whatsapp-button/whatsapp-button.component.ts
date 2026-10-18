import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappService } from '../../../shared/services/whatsapp.service';
import { WhatsappConfig } from '../../../shared/interfaces/whatsapp.interface';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.component.html',
  styleUrls: ['./whatsapp-button.component.css'],
})
export class WhatsappButtonComponent implements OnInit {
  config: WhatsappConfig | null = null;
  visible = false;

  constructor(private whatsappService: WhatsappService) {}

  async ngOnInit(): Promise<void> {
    const cfg = await this.whatsappService.getConfig();
    if (!cfg.enabled) return;

    this.config = cfg;
    // El globo "Hablemos" ya no aparece solo: se muestra únicamente en hover (CSS).
    setTimeout(() => { this.visible = true; }, 800);
  }

  get href(): string {
    if (!this.config) return '#';
    return `https://wa.me/${this.config.phone}?text=${encodeURIComponent(this.config.message)}`;
  }
}
