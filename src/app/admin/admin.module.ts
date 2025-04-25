import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Imports de Firebase para el almacenamiento
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { firebaseConfig } from '../firebase.config';

import { AdminRoutingModule } from './admin-routing.module';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { UploadComponent } from './components/upload/upload.component';
import { TechnologyManagementComponent } from './components/technology-management/technology-management.component';
import { CvUploadComponent } from './components/cv-upload/cv-upload.component';
import { ProfileImageUploadComponent } from './components/profile-image-upload/profile-image-upload.component';

@NgModule({
  declarations: [
    LoginComponent,
    DashboardComponent,
    ProjectListComponent,
    ProjectFormComponent,
    UploadComponent,
    TechnologyManagementComponent,
    CvUploadComponent,
    ProfileImageUploadComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSkeletonLoaderModule,
    // Configuración de Firebase para el almacenamiento
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage()),
  ],
})
export class AdminModule {}
