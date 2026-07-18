import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class WhatsappButtonComponent implements OnInit, OnDestroy {
  config: WhatsappConfig | null = null;
  visible    = false;
  nudgeOpen  = false;

  private nudgeTimer: ReturnType<typeof setTimeout> | null = null;
  private nudgeInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private whatsappService: WhatsappService) {}

  async ngOnInit(): Promise<void> {
    const cfg = await this.whatsappService.getConfig();
    if (!cfg.enabled) return;

    this.config = cfg;
    setTimeout(() => {
      this.visible = true;
      this.scheduleNudge();
    }, 800);
  }

  ngOnDestroy(): void {
    if (this.nudgeTimer)    clearTimeout(this.nudgeTimer);
    if (this.nudgeInterval) clearInterval(this.nudgeInterval);
  }

  private scheduleNudge(): void {
    // First nudge after 4s, then every 9s
    this.nudgeTimer = setTimeout(() => {
      this.showNudge();
      this.nudgeInterval = setInterval(() => this.showNudge(), 9000);
    }, 4000);
  }

  private showNudge(): void {
    this.nudgeOpen = true;
    setTimeout(() => { this.nudgeOpen = false; }, 2500);
  }

  get href(): string {
    if (!this.config) return '#';
    return `https://wa.me/${this.config.phone}?text=${encodeURIComponent(this.config.message)}`;
  }
}
