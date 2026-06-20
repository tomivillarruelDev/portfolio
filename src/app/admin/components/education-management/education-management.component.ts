import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationService, EducationEntry, EDUCATION_CATEGORIES } from '../../services/education.service';

@Component({
  selector: 'app-education-management',
  templateUrl: './education-management.component.html',
  styleUrls: ['./education-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class EducationManagementComponent implements OnInit {
  entries: EducationEntry[] = [];
  categories = EDUCATION_CATEGORIES;
  loading = true;
  saving = false;
  error: string | null = null;
  successMsg: string | null = null;

  showForm = false;
  editingId: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: EducationService,
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.entries = await this.svc.getAll();
    } catch {
      this.error = 'Error al cargar educación.';
    } finally {
      this.loading = false;
    }
  }

  buildForm(entry?: EducationEntry) {
    this.form = this.fb.group({
      year:     [entry?.year     ?? '', Validators.required],
      title:    [entry?.title    ?? '', Validators.required],
      platform: [entry?.platform ?? '', Validators.required],
      category: [entry?.category ?? 'Frontend', Validators.required],
    });
  }

  openCreate() {
    this.editingId = null;
    this.buildForm();
    this.showForm = true;
    this.error = null;
    this.successMsg = null;
  }

  openEdit(entry: EducationEntry) {
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
      const val = this.form.value as Omit<EducationEntry, 'id'>;
      if (this.editingId) {
        await this.svc.update({ ...val, id: this.editingId });
        this.successMsg = 'Educación actualizada.';
      } else {
        await this.svc.create(val);
        this.successMsg = 'Educación creada.';
      }
      this.showForm = false;
      await this.load();
    } catch {
      this.error = 'Error al guardar. Intentá de nuevo.';
    } finally {
      this.saving = false;
    }
  }

  async delete(entry: EducationEntry) {
    if (!confirm(`¿Eliminar "${entry.title}"?`)) return;
    try {
      await this.svc.remove(entry.id!);
      this.successMsg = 'Entrada eliminada.';
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

  getCatColor(cat: string): string {
    const map: Record<string, string> = {
      Frontend: '#7c3aed', Backend: '#2563eb', Data: '#d97706',
      Formal: '#059669', DevOps: '#dc2626', Otro: '#6b7280',
    };
    return map[cat] ?? '#6b7280';
  }

  trackById(_: number, e: EducationEntry) { return e.id; }
}
