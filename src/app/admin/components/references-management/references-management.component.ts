import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReferenceService } from '../../services/reference.service';
import { Reference } from '../../../portfolio/interfaces/reference.interface';

@Component({
  selector: 'app-references-management',
  templateUrl: './references-management.component.html',
  styleUrls: ['./references-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ReferencesManagementComponent implements OnInit {
  entries: Reference[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  successMsg: string | null = null;

  showForm = false;
  editingId: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: ReferenceService,
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.entries = await this.svc.getAll();
    } catch {
      this.error = 'Error al cargar referencias.';
    } finally {
      this.loading = false;
    }
  }

  buildForm(entry?: Reference) {
    this.form = this.fb.group({
      text:   [entry?.text   ?? '', Validators.required],
      name:   [entry?.name   ?? '', Validators.required],
      role:   [entry?.role   ?? '', Validators.required],
      stars:  [entry?.stars  ?? 5, [Validators.required, Validators.min(1), Validators.max(5)]],
      avatar: [entry?.avatar ?? '👨‍💼', Validators.required],
    });
  }

  openCreate() {
    this.editingId = null;
    this.buildForm();
    this.showForm = true;
    this.error = null;
    this.successMsg = null;
  }

  openEdit(entry: Reference) {
    this.editingId = entry.id!;
    this.buildForm(entry);
    this.showForm = true;
    this.error = null;
    this.successMsg = null;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error = null;
    try {
      const val = this.form.value as Omit<Reference, 'id'>;
      if (this.editingId) {
        await this.svc.update({ ...val, id: this.editingId });
        this.successMsg = 'Referencia actualizada.';
      } else {
        await this.svc.create(val);
        this.successMsg = 'Referencia creada.';
      }
      this.showForm = false;
      await this.load();
    } catch {
      this.error = 'Error al guardar. Intentá de nuevo.';
    } finally {
      this.saving = false;
    }
  }

  async delete(entry: Reference) {
    if (!confirm(`¿Eliminar la referencia de "${entry.name}"?`)) return;
    try {
      await this.svc.remove(entry.id!);
      this.successMsg = 'Referencia eliminada.';
      await this.load();
    } catch {
      this.error = 'Error al eliminar.';
    }
  }

  async moveUp(i: number) {
    if (i === 0) return;
    [this.entries[i - 1], this.entries[i]] = [this.entries[i], this.entries[i - 1]];
    await this.svc.reorder(this.entries.map(e => e.id!));
  }

  async moveDown(i: number) {
    if (i >= this.entries.length - 1) return;
    [this.entries[i], this.entries[i + 1]] = [this.entries[i + 1], this.entries[i]];
    await this.svc.reorder(this.entries.map(e => e.id!));
  }

  getStarsArray(stars: number): string[] {
    return Array(stars).fill('★');
  }

  trackById(_: number, e: Reference) { return e.id; }
}
