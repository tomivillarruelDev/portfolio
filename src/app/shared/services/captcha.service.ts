import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CaptchaConfig } from '../interfaces/captcha.interface';

const DEFAULT_CONFIG: CaptchaConfig = {
  enabled: false,
  siteKey: '',
  secretKey: '',
};

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private url = 'https://tomas-villarruel-portfolio-default-rtdb.firebaseio.com/captcha';

  constructor(private http: HttpClient) {}

  async getConfig(): Promise<CaptchaConfig> {
    try {
      const raw = await firstValueFrom(
        this.http.get<CaptchaConfig | null>(`${this.url}.json`)
      );
      return raw ?? DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  async saveConfig(config: CaptchaConfig): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.url}.json`, config)
    );
  }
}
