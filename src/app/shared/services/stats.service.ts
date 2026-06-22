import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Stat {
  number:      number;
  suffix:      string;
  label:       string;
  labelAccent: string;
  sublabel:    string;
  visible:     boolean;
  flex:        number;
  size:        'hero' | 'major' | 'normal';
}

const DEFAULT_STATS: Stat[] = [
  { number: 15, suffix: '+', label: 'proyectos',   labelAccent: 'entregados', sublabel: 'en tiempo y en presupuesto',  visible: true, flex: 1.45, size: 'hero'   },
  { number: 8,  suffix: '+', label: 'clientes',    labelAccent: 'renovaron',  sublabel: 'o refirieron el trabajo',      visible: true, flex: 1.25, size: 'major'  },
  { number: 3,  suffix: '',  label: 'años',        labelAccent: '',           sublabel: 'en producción real',           visible: true, flex: 0.85, size: 'normal' },
  { number: 11, suffix: '+', label: 'tecnologías', labelAccent: '',           sublabel: 'en producción',               visible: true, flex: 0.85, size: 'normal' },
];

@Injectable({ providedIn: 'root' })
export class StatsService {
  private url = 'https://tomas-villarruel-portfolio-default-rtdb.firebaseio.com/stats';

  constructor(private http: HttpClient) {}

  async getStats(): Promise<Stat[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<Record<string, Stat> | null>(`${this.url}.json`)
      );
      if (!raw) return DEFAULT_STATS;
      const stats = Object.values(raw);
      return stats.length ? stats : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  }

  async saveStats(stats: Stat[]): Promise<void> {
    const payload: Record<string, Stat> = {};
    stats.forEach((s, i) => { payload[i] = s; });
    await firstValueFrom(
      this.http.put(`${this.url}.json`, payload)
    );
  }

  async initDefaults(): Promise<void> {
    const existing = await this.getStats();
    const isEmpty = existing === DEFAULT_STATS;
    if (isEmpty) await this.saveStats(DEFAULT_STATS);
  }
}
