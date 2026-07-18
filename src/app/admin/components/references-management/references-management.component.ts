import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReferenceService } from '../../services/reference.service';
import { Reference } from '../../../portfolio/interfaces/reference.interface';

const DEFAULT_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

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

  selectedAvatarType = 'custom';

  defaultAvatars: { [key: string]: string } = {
    user: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    code: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    business: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    globe: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    star: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  };

  private sanitizer = inject(DomSanitizer);

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

  sanitizeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content || '');
  }

  normalizeSvg(svgStr: string): string {
    return (svgStr || '').replace(/\s+/g, '').replace(/['"]/g, '"').toLowerCase();
  }

  onSelectDefaultAvatar(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.selectedAvatarType = value;
    if (value && value !== 'custom') {
      const svg = this.defaultAvatars[value];
      if (svg) {
        this.form.get('avatar')?.setValue(svg);
      }
    } else if (value === 'custom') {
      this.form.get('avatar')?.setValue('');
    }
  }

  buildForm(entry?: Reference) {
    const avatarVal = entry?.avatar ?? DEFAULT_SVG;

    this.selectedAvatarType = 'custom';
    const normalizedAvatar = this.normalizeSvg(avatarVal);
    for (const [key, svg] of Object.entries(this.defaultAvatars)) {
      if (normalizedAvatar === this.normalizeSvg(svg)) {
        this.selectedAvatarType = key;
        break;
      }
    }

    this.form = this.fb.group({
      text:   [entry?.text   ?? '', Validators.required],
      name:   [entry?.name   ?? '', Validators.required],
      role:   [entry?.role   ?? '', Validators.required],
      stars:  [entry?.stars  ?? 5, [Validators.required, Validators.min(1), Validators.max(5)]],
      avatar: [avatarVal, Validators.required],
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
