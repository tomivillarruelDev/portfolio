import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExperienceService, ExperienceEntry } from '../../services/experience.service';

@Component({
  selector: 'app-experience-management',
  templateUrl: './experience-management.component.html',
  styleUrls: ['./experience-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ExperienceManagementComponent implements OnInit {
  entries: ExperienceEntry[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  successMsg: string | null = null;

  // Form state
  showForm = false;
  editingId: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: ExperienceService,
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.entries = await this.svc.getAll();
    } catch {
      this.error = 'Error al cargar experiencias.';
    } finally {
      this.loading = false;
    }
  }

  buildForm(entry?: ExperienceEntry) {
    this.form = this.fb.group({
      name:        [entry?.name        ?? '', Validators.required],
      company:     [entry?.company     ?? '', Validators.required],
      date:        [entry?.date        ?? '', Validators.required],
      address:     [entry?.address     ?? '', Validators.required],
      description: [entry?.description ?? '', Validators.required],
      tasks:       this.fb.array(
        (entry?.tasks ?? ['']).map(t => this.fb.control(t, Validators.required))
      ),
    });
  }

  get tasksArray(): FormArray {
    return this.form.get('tasks') as FormArray;
  }

  addTask() {
    this.tasksArray.push(this.fb.control('', Validators.required));
  }

  removeTask(i: number) {
    if (this.tasksArray.length > 1) this.tasksArray.removeAt(i);
  }

  openCreate() {
    this.editingId = null;
    this.buildForm();
    this.showForm = true;
    this.error = null;
    this.successMsg = null;
  }

  openEdit(entry: ExperienceEntry) {
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
      const val = this.form.value as Omit<ExperienceEntry, 'id'>;
      if (this.editingId) {
        await this.svc.update({ ...val, id: this.editingId });
        this.successMsg = 'Experiencia actualizada.';
      } else {
        await this.svc.create(val);
        this.successMsg = 'Experiencia creada.';
      }
      this.showForm = false;
      await this.load();
    } catch {
      this.error = 'Error al guardar. Intentá de nuevo.';
    } finally {
      this.saving = false;
    }
  }

  async delete(entry: ExperienceEntry) {
    if (!confirm(`¿Eliminar "${entry.name} en ${entry.company}"?`)) return;
    try {
      await this.svc.remove(entry.id!);
      this.successMsg = 'Experiencia eliminada.';
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

  trackById(_: number, e: ExperienceEntry) { return e.id; }
}
