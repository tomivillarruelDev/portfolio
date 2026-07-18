import {
  Component, signal, effect, inject, ElementRef,
  OnDestroy, NgZone, ChangeDetectorRef, untracked,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageViewerService } from '../../services/image-viewer.service';
import gsap from 'gsap';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ImageViewerComponent implements OnDestroy {
  readonly overlayRef     = viewChild<ElementRef<HTMLDivElement>>('overlay');
  readonly stageRef       = viewChild<ElementRef<HTMLDivElement>>('stage');
  readonly imgARef        = viewChild<ElementRef<HTMLImageElement>>('imgA');
  readonly imgBRef        = viewChild<ElementRef<HTMLImageElement>>('imgB');
  readonly counterRef     = viewChild<ElementRef<HTMLDivElement>>('counter');
  readonly counterTextRef = viewChild<ElementRef<HTMLSpanElement>>('counterText');
  readonly closeBtnRef    = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  readonly prevBtnRef     = viewChild<ElementRef<HTMLButtonElement>>('prevBtn');
  readonly nextBtnRef     = viewChild<ElementRef<HTMLButtonElement>>('nextBtn');

  private readonly svc  = inject(ImageViewerService);
  private readonly zone = inject(NgZone);
  private readonly cdr  = inject(ChangeDetectorRef);

  readonly isVisible   = signal(false);
  readonly currentIndex = signal(0);
  readonly totalImages  = signal(0);
  readonly imgASrc      = signal('');
  readonly imgBSrc      = signal('');

  private activeSlot: 'a' | 'b' = 'a';
  private isSliding = false;
  private openingIndex = 0;
  private originRect: DOMRect | null = null;
  private prevIsOpen = false;
  private readonly flipDone = signal(false);

  private keyHandler?:        (e: KeyboardEvent) => void;
  private mmHandler?:         (e: MouseEvent) => void;
  private tsHandler?:         (e: TouchEvent) => void;
  private tmHandler?:         (e: TouchEvent) => void;
  private teHandler?:         (e: TouchEvent) => void;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private swipingDown = false;

  private idleTimer?: ReturnType<typeof setTimeout>;
  private controlsShown = true;

  constructor() {
    // 1. Sincronizar el estado de visibilidad y fuentes con el servicio
    effect(() => {
      const state = this.svc.state();
      const isOpen = state.isOpen;

      untracked(() => {
        if (isOpen && !this.prevIsOpen) {
          this.prevIsOpen = true;
          this.openingIndex = state.currentIndex;
          this.originRect = state.originRect;
          this.activeSlot = 'a';
          this.flipDone.set(false);
          this.isSliding = false;
          this.controlsShown = true;

          this.currentIndex.set(state.currentIndex);
          this.totalImages.set(state.images.length);
          this.imgASrc.set(state.images[state.currentIndex]);
          this.imgBSrc.set(state.images.length > 1 ? state.images[(state.currentIndex + 1) % state.images.length] : '');
          this.isVisible.set(true);
        } else if (!isOpen && this.prevIsOpen) {
          this.prevIsOpen = false;
          this.runCloseAnimation();
        }
      });
    });

    // 2. Ejecutar la animación de apertura cuando el DOM esté listo
    effect(() => {
      const isOpen = this.svc.state().isOpen;
      const overlay = this.overlayRef();
      const imgA = this.imgARef();
      const done = this.flipDone();

      if (isOpen && overlay && imgA && !done) {
        this.zone.runOutsideAngular(() => {
          this.runOpenAnimation(overlay.nativeElement, imgA.nativeElement);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.detachListeners();
    clearTimeout(this.idleTimer);
  }

  // ── Public template helpers ────────────────────────────────────────────────

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  onOverlayClick(event: MouseEvent): void {
    const t = event.target as HTMLElement;
    if (t === this.overlayRef()?.nativeElement || t === this.stageRef()?.nativeElement) {
      this.close();
    }
  }

  close(): void { this.svc.close(); }

  prev(): void {
    if (this.isSliding || this.totalImages() <= 1) return;
    const idx = (this.currentIndex() - 1 + this.totalImages()) % this.totalImages();
    this.slideTo(idx, 'left');
  }

  next(): void {
    if (this.isSliding || this.totalImages() <= 1) return;
    const idx = (this.currentIndex() + 1) % this.totalImages();
    this.slideTo(idx, 'right');
  }

  // ── Open sequence ──────────────────────────────────────────────────────────

  private runOpenAnimation(overlay: HTMLDivElement, imgA: HTMLImageElement): void {
    const imgB = this.imgBRef()?.nativeElement;
    this.flipDone.set(true);

    document.body.style.overflow = 'hidden';

    // Init transforms — GSAP owns them from here on
    gsap.set(imgA, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, opacity: 0, rotationX: 0, rotationY: 0 });
    if (imgB) gsap.set(imgB, { xPercent: -50, yPercent: -50, x: window.innerWidth, y: 0, scale: 1, opacity: 1, rotationX: 0, rotationY: 0 });

    // Overlay: fade in
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.42, ease: 'power2.out' });

    // Controls entrance
    this.animateControlsIn();

    // Image FLIP
    if (imgA.complete && imgA.naturalWidth > 0) {
      this.runFlip(imgA);
    } else {
      const onLoad = () => {
        imgA.removeEventListener('load', onLoad);
        if (this.isVisible()) this.runFlip(imgA);
      };
      imgA.addEventListener('load', onLoad);
      // Fallback if image takes too long
      setTimeout(() => {
        if (!this.isVisible()) return;
        imgA.removeEventListener('load', onLoad);
        gsap.to(imgA, { opacity: 1, scale: 1, duration: 0.42, ease: 'power3.out' });
      }, 900);
    }

    this.attachListeners();
    this.resetIdleTimer();
  }

  private runFlip(imgEl: HTMLImageElement): void {
    const finalRect = imgEl.getBoundingClientRect();

    if (!finalRect.width || !finalRect.height) {
      // Not rendered yet — simple fade in
      gsap.to(imgEl, { opacity: 1, duration: 0.4, ease: 'power3.out' });
      return;
    }

    if (!this.originRect) {
      // No origin — scale + fade in from center
      gsap.fromTo(imgEl,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.44, ease: 'power4.out' },
      );
      return;
    }

    const origin = this.originRect;
    const oCX = origin.left + origin.width  / 2;
    const oCY = origin.top  + origin.height / 2;
    const fCX = finalRect.left + finalRect.width  / 2;
    const fCY = finalRect.top  + finalRect.height / 2;

    const dx    = oCX - fCX;
    const dy    = oCY - fCY;
    const scale = Math.max(0.04, origin.width / finalRect.width);

    gsap.fromTo(imgEl,
      { x: dx, y: dy, scale, opacity: 1 },
      {
        x: 0, y: 0, scale: 1, opacity: 1,
        duration: 0.44,
        ease: 'power4.out',
        onComplete: () => {
          // Subtle settling pulse: 1.00 → 1.02 → 1.00
          gsap.to(imgEl, {
            scale: 1.02,
            duration: 0.18,
            ease: 'power1.out',
            onComplete: () => gsap.to(imgEl, { scale: 1, duration: 0.26, ease: 'power2.inOut' }),
          });
        },
      },
    );
  }

  // ── Close sequence ─────────────────────────────────────────────────────────

  private runCloseAnimation(): void {
    const overlay   = this.overlayRef()?.nativeElement;
    const activeImg = this.getActiveImg();

    this.detachListeners();
    clearTimeout(this.idleTimer);

    const finish = () => this.zone.run(() => {
      this.isVisible.set(false);
      this.imgASrc.set('');
      this.imgBSrc.set('');
      document.body.style.overflow = '';
    });

    if (!overlay) { finish(); return; }

    // Hide the inactive slot so no ghost image appears during close
    const inactiveImg = this.activeSlot === 'a' ? this.imgBRef()?.nativeElement : this.imgARef()?.nativeElement;
    if (inactiveImg) gsap.set(inactiveImg, { opacity: 0 });

    // Fade out overlay
    gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: finish });

    if (!activeImg) return;

    const canReverseFlip = this.currentIndex() === this.openingIndex && this.originRect;

    if (canReverseFlip) {
      const imgRect = activeImg.getBoundingClientRect();
      const origin  = this.originRect!;
      const oCX = origin.left + origin.width  / 2;
      const oCY = origin.top  + origin.height / 2;
      const iCX = imgRect.left + imgRect.width  / 2;
      const iCY = imgRect.top  + imgRect.height / 2;

      gsap.to(activeImg, {
        x: oCX - iCX,
        y: oCY - iCY,
        scale: Math.max(0.04, origin.width / Math.max(1, imgRect.width)),
        duration: 0.34,
        ease: 'power4.in',
      });
    } else {
      gsap.to(activeImg, { scale: 0.86, opacity: 0, y: 18, duration: 0.28, ease: 'power3.in' });
    }
  }

  // ── Slide (navigation) ─────────────────────────────────────────────────────

  private slideTo(newIndex: number, direction: 'left' | 'right'): void {
    this.isSliding = true;
    this.resetIdleTimer();

    const curSlot  = this.activeSlot;
    const nextSlot: 'a' | 'b' = curSlot === 'a' ? 'b' : 'a';
    const curImg   = this.getSlotImg(curSlot);
    const nxtImg   = this.getSlotImg(nextSlot);
    if (!curImg || !nxtImg) { this.isSliding = false; return; }

    // Load new image into inactive slot
    const images = this.svc.state().images;
    if (nextSlot === 'a') this.imgASrc.set(images[newIndex]);
    else                  this.imgBSrc.set(images[newIndex]);
    this.cdr.detectChanges();

    const dir = direction === 'right' ? 1 : -1;
    const vw  = window.innerWidth;

    // Reset tilt on current, init position for next
    gsap.set(curImg, { rotationX: 0, rotationY: 0 });
    gsap.set(nxtImg, { xPercent: -50, yPercent: -50, x: dir * vw, y: 0, scale: 1, opacity: 1, rotationX: 0, rotationY: 0 });

    // Animate counter before slide
    this.currentIndex.set(newIndex);
    this.animateCounter();

    gsap.timeline({
      onComplete: () => this.zone.run(() => this.onSlideComplete(newIndex, curImg, nextSlot, images)),
    })
      .to(curImg, { x: -dir * vw * 1.15, opacity: 0, duration: 0.38, ease: 'power3.inOut' }, 0)
      .to(nxtImg, { x: 0,                            duration: 0.38, ease: 'power3.inOut' }, 0);
  }

  private onSlideComplete(
    newIndex: number,
    oldImg: HTMLImageElement,
    newSlot: 'a' | 'b',
    images: string[],
  ): void {
    this.isSliding  = false;
    this.activeSlot = newSlot;

    // Ensure old image is invisible while parked as inactive slot
    gsap.set(oldImg, { opacity: 0 });

    this.svc.goTo(newIndex);

    // Preload adjacent image into now-inactive slot
    const preloadIdx = (newIndex + 1) % images.length;
    const inactiveSlot: 'a' | 'b' = newSlot === 'a' ? 'b' : 'a';
    const preloadSrc = images[preloadIdx];
    if (inactiveSlot === 'a') this.imgASrc.set(preloadSrc);
    else                      this.imgBSrc.set(preloadSrc);
  }

  // ── Mouse parallax tilt ────────────────────────────────────────────────────

  private onMouseMove(e: MouseEvent): void {
    this.resetIdleTimer();

    if (this.isSliding) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const activeImg = this.getActiveImg();
    if (!activeImg) return;

    const nx =  (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny =  (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(activeImg, {
      rotationY:            nx * 1.8,
      rotationX:           -ny * 1.8,
      transformPerspective: 1400,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  // ── Touch handling ─────────────────────────────────────────────────────────

  private onTouchStart(e: TouchEvent): void {
    this.touchStartX    = e.touches[0].clientX;
    this.touchStartY    = e.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.swipingDown    = false;
  }

  private onTouchMove(e: TouchEvent): void {
    const dx    = e.touches[0].clientX - this.touchStartX;
    const dy    = e.touches[0].clientY - this.touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const activeImg = this.getActiveImg();
    if (!activeImg) return;

    if (absDy > absDx && dy > 12) {
      this.swipingDown = true;
      if (e.cancelable) e.preventDefault();
      const p = Math.min(dy / 260, 1);
      gsap.set(activeImg, { y: dy, scale: 1 - p * 0.13, opacity: 1 - p * 0.45 });
    } else if (!this.swipingDown && absDx > 12) {
      if (e.cancelable) e.preventDefault();
      gsap.set(activeImg, { x: dx * 0.42 });
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    const dx    = e.changedTouches[0].clientX - this.touchStartX;
    const dy    = e.changedTouches[0].clientY - this.touchStartY;
    const dt    = Math.max(1, Date.now() - this.touchStartTime);
    const velX  = Math.abs(dx) / dt;
    const velY  = dy / dt;
    const activeImg = this.getActiveImg();

    if (this.swipingDown) {
      if (dy > 100 || velY > 0.55) {
        this.zone.run(() => this.close());
      } else if (activeImg) {
        gsap.to(activeImg, { y: 0, scale: 1, opacity: 1, duration: 0.38, ease: 'power3.out' });
      }
    } else if (Math.abs(dx) > 55 || velX > 0.38) {
      if (activeImg) gsap.set(activeImg, { x: 0 });
      if (dx < 0) this.zone.run(() => this.next());
      else        this.zone.run(() => this.prev());
    } else if (activeImg) {
      gsap.to(activeImg, { x: 0, duration: 0.3, ease: 'power3.out' });
    }

    this.swipingDown = false;
  }

  // ── Controls visibility ────────────────────────────────────────────────────

  private resetIdleTimer(): void {
    clearTimeout(this.idleTimer);
    if (!this.controlsShown) this.showControlsAnimated();
    this.idleTimer = setTimeout(() => this.hideControls(), 3600);
  }

  private hideControls(): void {
    if (!this.controlsShown) return;
    this.controlsShown = false;
    gsap.to(this.getControlEls(), { opacity: 0.15, duration: 0.65, ease: 'power2.out' });
  }

  private showControlsAnimated(): void {
    this.controlsShown = true;
    gsap.to(this.getControlEls(), { opacity: 1, duration: 0.28, ease: 'power2.out' });
  }

  private animateControlsIn(): void {
    const els = this.getControlEls();
    if (!els.length) return;
    // Fade-only to avoid conflicting with CSS transform on nav buttons
    gsap.fromTo(els,
      { opacity: 0 },
      { opacity: 1, stagger: 0.05, duration: 0.32, ease: 'power2.out', delay: 0.2 },
    );
  }

  private animateCounter(): void {
    const el = this.counterTextRef()?.nativeElement;
    if (!el) return;
    gsap.fromTo(el, { y: -7, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' });
  }

  // ── Event listener management ──────────────────────────────────────────────

  private attachListeners(): void {
    this.zone.runOutsideAngular(() => {
      this.keyHandler = (e: KeyboardEvent) => {
        this.resetIdleTimer();
        switch (e.key) {
          case 'Escape':     this.zone.run(() => this.close()); break;
          case 'ArrowLeft':  this.zone.run(() => this.prev());  break;
          case 'ArrowRight': this.zone.run(() => this.next());  break;
        }
      };
      document.addEventListener('keydown', this.keyHandler);

      const ov = this.overlayRef()?.nativeElement;
      if (!ov) return;

      this.mmHandler = (e: MouseEvent) => this.onMouseMove(e);
      this.tsHandler = (e: TouchEvent) => this.onTouchStart(e);
      this.tmHandler = (e: TouchEvent) => this.onTouchMove(e);
      this.teHandler = (e: TouchEvent) => this.onTouchEnd(e);

      ov.addEventListener('mousemove', this.mmHandler);
      ov.addEventListener('touchstart', this.tsHandler, { passive: true });
      ov.addEventListener('touchmove',  this.tmHandler, { passive: false });
      ov.addEventListener('touchend',   this.teHandler, { passive: true });
    });
  }

  private detachListeners(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
    const ov = this.overlayRef()?.nativeElement;
    if (ov) {
      if (this.mmHandler) ov.removeEventListener('mousemove', this.mmHandler);
      if (this.tsHandler) ov.removeEventListener('touchstart', this.tsHandler);
      if (this.tmHandler) ov.removeEventListener('touchmove',  this.tmHandler);
      if (this.teHandler) ov.removeEventListener('touchend',   this.teHandler);
    }
    this.mmHandler = this.tsHandler = this.tmHandler = this.teHandler = undefined;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  private getActiveImg(): HTMLImageElement | null {
    return this.activeSlot === 'a'
      ? this.imgARef()?.nativeElement ?? null
      : this.imgBRef()?.nativeElement ?? null;
  }

  private getSlotImg(slot: 'a' | 'b'): HTMLImageElement | null {
    return slot === 'a'
      ? this.imgARef()?.nativeElement ?? null
      : this.imgBRef()?.nativeElement ?? null;
  }

  private getControlEls(): HTMLElement[] {
    const els: (HTMLElement | undefined)[] = [
      this.counterRef()?.nativeElement,
      this.closeBtnRef()?.nativeElement,
      this.prevBtnRef()?.nativeElement,
      this.nextBtnRef()?.nativeElement,
    ];
    return els.filter((el): el is HTMLElement => !!el);
  }
}
