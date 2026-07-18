import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WhatsappConfig } from '../interfaces/whatsapp.interface';

const DEFAULT_CONFIG: WhatsappConfig = {
  enabled: true,
  phone: '543512524229',
  message: 'Hola Tomas, vi tu portfolio y me interesa hablar sobre un proyecto.',
};

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private url = 'https://tomas-villarruel-portfolio-default-rtdb.firebaseio.com/whatsapp';

  constructor(private http: HttpClient) {}

  async getConfig(): Promise<WhatsappConfig> {
    try {
      const raw = await firstValueFrom(
        this.http.get<WhatsappConfig | null>(`${this.url}.json`)
      );
      return raw ?? DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  async saveConfig(config: WhatsappConfig): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.url}.json`, config)
    );
  }
}
