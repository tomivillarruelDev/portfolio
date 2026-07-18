import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Reference } from '../../portfolio/interfaces/reference.interface';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private readonly node = 'references';

  constructor(private db: AngularFireDatabase) {}

  async getAll(): Promise<Reference[]> {
    const snap = await this.db.database.ref(this.node).once('value');
    const val = snap.val();
    if (!val) return [];
    return Object.entries(val)
      .map(([id, v]) => ({ ...(v as object), id } as Reference))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  async create(data: Omit<Reference, 'id'>): Promise<Reference> {
    const all = await this.getAll();
    const maxOrder = all.reduce((m, e) => Math.max(m, e.order ?? 0), -1);
    const ref = this.db.database.ref(this.node).push();
    const entry: Omit<Reference, 'id'> = { ...data, order: maxOrder + 1 };
    await ref.set(entry);
    return { ...entry, id: ref.key! };
  }

  async update(entry: Reference): Promise<void> {
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
