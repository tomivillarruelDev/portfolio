import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { TechnologyManagementComponent } from './components/technology-management/technology-management.component';
import { CvUploadComponent } from './components/cv-upload/cv-upload.component';
import { ProfileImageUploadComponent } from './components/profile-image-upload/profile-image-upload.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
