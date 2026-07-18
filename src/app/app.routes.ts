import { Routes } from '@angular/router';
import { HomeComponent } from './portfolio/pages/home/home.component';
import { LoginComponent } from './admin/components/login/login.component';
import { AdminLayoutComponent } from './admin/components/admin-layout/admin-layout.component';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { ProjectListComponent } from './admin/components/project-list/project-list.component';
import { ProjectFormComponent } from './admin/components/project-form/project-form.component';
import { TechnologyManagementComponent } from './admin/components/technology-management/technology-management.component';
import { CvUploadComponent } from './admin/components/cv-upload/cv-upload.component';
import { ProfileImageUploadComponent } from './admin/components/profile-image-upload/profile-image-upload.component';
import { ExperienceManagementComponent } from './admin/components/experience-management/experience-management.component';
import { EducationManagementComponent } from './admin/components/education-management/education-management.component';
import { StatsManagementComponent } from './admin/components/stats-management/stats-management.component';
import { WhatsappManagementComponent } from './admin/components/whatsapp-management/whatsapp-management.component';
import { CaptchaManagementComponent } from './admin/components/captcha-management/captcha-management.component';
import { AuthGuard } from './admin/services/auth.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'admin',
    children: [
      { path: 'login', component: LoginComponent },
      {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'dashboard',            component: DashboardComponent },
          { path: 'projects',             component: ProjectListComponent },
          { path: 'projects/create',      component: ProjectFormComponent },
          { path: 'projects/edit/:id',    component: ProjectFormComponent },
          { path: 'technologies',         component: TechnologyManagementComponent },
          { path: 'upload-cv',            component: CvUploadComponent },
          { path: 'upload-profile-image', component: ProfileImageUploadComponent },
          { path: 'experience',           component: ExperienceManagementComponent },
          { path: 'education',            component: EducationManagementComponent },
          { path: 'stats',                component: StatsManagementComponent },
          { path: 'whatsapp',             component: WhatsappManagementComponent },
          { path: 'captcha',              component: CaptchaManagementComponent },
          { path: '',                     redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

