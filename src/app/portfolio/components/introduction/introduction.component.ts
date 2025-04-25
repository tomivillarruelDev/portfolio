import { AfterViewInit, Component, effect, signal } from '@angular/core';
import { CvService } from '../../../shared/services/cv.service';
import { ProfileImageService } from '../../../shared/services/profile-image.service';
import tippy from 'tippy.js';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
  standalone: true,
  imports: [NgxSkeletonLoaderModule],
})
export class IntroductionComponent implements AfterViewInit {
  cvUrl = signal('');
  profileImageUrl = signal('');
  imageLoaded = signal(false);

  constructor(
    private cvService: CvService,
    private profileImageService: ProfileImageService
  ) {
    // Efecto reactivo para la URL del CV
    effect(() => {
      this.cvService.cvUrl$.subscribe((url) => {
        if (url) this.cvUrl.set(url);
      });
      this.cvService.loadCvUrl().subscribe();
    });

    // Efecto reactivo para la imagen de perfil
    effect(() => {
      this.profileImageService.imageUrl$.subscribe((url) => {
        if (url) {
          this.profileImageUrl.set(url);
          this.imageLoaded.set(false);
        }
      });
      this.profileImageService.loadImageUrl().subscribe();
    });
  }

  ngAfterViewInit(): void {
    tippy('.tippy-work', {
      content: 'Disponible para trabajar',
      animation: 'shift-away-extreme',
      theme: 'light-border',
    });
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}
