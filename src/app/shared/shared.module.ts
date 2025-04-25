import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { firebaseConfig } from '../firebase.config';

import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CvService } from './services/cv.service';

@NgModule({
  declarations: [FooterComponent, NavbarComponent],
  imports: [
    CommonModule,
    // Configuración de Firebase para el almacenamiento
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage()),
  ],
  exports: [FooterComponent, NavbarComponent],
  providers: [CvService],
})
export class SharedModule {}
