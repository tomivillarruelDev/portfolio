// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './portfolio/pages/home/home.component';
import { LoginComponent } from './admin/components/login/login.component';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { ProjectListComponent } from './admin/components/project-list/project-list.component';
import { ProjectFormComponent } from './admin/components/project-form/project-form.component';
import { TechnologyManagementComponent } from './admin/components/technology-management/technology-management.component';
import { CvUploadComponent } from './admin/components/cv-upload/cv-upload.component';
import { ProfileImageUploadComponent } from './admin/components/profile-image-upload/profile-image-upload.component';
import { AuthGuard } from './admin/services/auth.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'admin',
    children: [
      { path: 'login', component: LoginComponent },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'projects',
        component: ProjectListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'projects/create',
        component: ProjectFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'projects/edit/:id',
        component: ProjectFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'technologies',
        component: TechnologyManagementComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'upload-cv',
        component: CvUploadComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'upload-profile-image',
        component: ProfileImageUploadComponent,
        canActivate: [AuthGuard],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
