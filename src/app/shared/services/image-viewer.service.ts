import { Injectable, signal } from '@angular/core';

export interface ViewerState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  originRect: DOMRect | null;
}

@Injectable({ providedIn: 'root' })
export class ImageViewerService {
  readonly state = signal<ViewerState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    originRect: null,
  });

  open(images: string[], index: number, originRect: DOMRect): void {
    this.state.set({ isOpen: true, images, currentIndex: index, originRect });
  }

  close(): void {
    this.state.update(s => ({ ...s, isOpen: false }));
  }

  goTo(index: number): void {
    this.state.update(s => ({ ...s, currentIndex: index }));
  }
}
