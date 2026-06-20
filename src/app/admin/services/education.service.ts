import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

export interface EducationEntry {
  id?: string;
  year: string;
  title: string;
  platform: string;
  category: string;
  order?: number;
}

export const EDUCATION_CATEGORIES = ['Frontend', 'Backend', 'Data', 'Formal', 'DevOps', 'Otro'];

@Injectable({ providedIn: 'root' })
export class EducationService {
  private readonly node = 'education';

  constructor(private db: AngularFireDatabase) {}

  async getAll(): Promise<EducationEntry[]> {
    const snap = await this.db.database.ref(this.node).once('value');
    const val = snap.val();
    if (!val) return [];
    return Object.entries(val)
      .map(([id, v]) => ({ ...(v as object), id } as EducationEntry))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  async create(data: Omit<EducationEntry, 'id'>): Promise<EducationEntry> {
    const all = await this.getAll();
    const maxOrder = all.reduce((m, e) => Math.max(m, e.order ?? 0), -1);
    const ref = this.db.database.ref(this.node).push();
    const entry: Omit<EducationEntry, 'id'> = { ...data, order: maxOrder + 1 };
    await ref.set(entry);
    return { ...entry, id: ref.key! };
  }

  async update(entry: EducationEntry): Promise<void> {
    const { id, ...data } = entry;
    await this.db.database.ref(`${this.node}/${id}`).update(data);
  }

  async remove(id: string): Promise<void> {
    await this.db.database.ref(`${this.node}/${id}`).remove();
  }

  async reorder(ids: string[]): Promise<void> {
    const batch: Record<string, number> = {};
    ids.forEach((id, i) => { batch[`/${this.node}/${id}/order`] = i; });
    await this.db.database.ref().update(batch);
  }
}
