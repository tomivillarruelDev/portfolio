import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService, Stat } from '../../../shared/services/stats.service';

@Component({
  selector: 'app-stats-management',
  standalone: true,
  templateUrl: './stats-management.component.html',
  styleUrls: ['./stats-management.component.css'],
  imports: [CommonModule, FormsModule],
})
export class StatsManagementComponent implements OnInit {
  stats: Stat[] = [];
  loading  = true;
  saving   = false;
  saved    = false;
  error    = '';

  readonly sizes = ['hero', 'major', 'normal'] as const;

  constructor(private statsService: StatsService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.stats = await this.statsService.getStats();
    } catch {
      this.error = 'Error al cargar las métricas.';
    } finally {
      this.loading = false;
    }
  }

  trackByIndex(i: number): number { return i; }

  async save(): Promise<void> {
    try {
      this.saving = true;
      this.error  = '';
      this.saved  = false;
      await this.statsService.saveStats(this.stats);
      this.saved = true;
      setTimeout(() => { this.saved = false; }, 3000);
    } catch {
      this.error = 'Error al guardar. Intentá de nuevo.';
    } finally {
      this.saving = false;
    }
  }

  addStat(): void {
    this.stats.push({
      number: 0, suffix: '+', label: '', labelAccent: '',
      sublabel: '', visible: true, flex: 1, size: 'normal',
    });
  }

  removeStat(i: number): void {
    this.stats.splice(i, 1);
  }
}
