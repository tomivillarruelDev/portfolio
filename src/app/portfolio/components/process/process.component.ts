import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProcessComponent implements AfterViewInit, OnDestroy {
  @ViewChild('timelineContainer') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('timelineSvg') svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('pathLine') pathLineRef!: ElementRef<SVGPathElement>;
  @ViewChild('pathTrail') pathTrailRef!: ElementRef<SVGPathElement>;
  @ViewChild('lineClip') lineClipRef!: ElementRef<SVGClipPathElement>;
  @ViewChildren('stepCircle') circleRefs!: QueryList<ElementRef<HTMLElement>>;

  private animated = false;
  private intersectionObserver!: IntersectionObserver;
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.buildPath();
        this.setupIntersectionObserver();
        this.setupResizeObserver();
      })
    );
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private buildPath(): void {
    if (!this.containerRef || !this.svgRef || !this.pathLineRef || !this.pathTrailRef) return;

    const container = this.containerRef.nativeElement;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (w === 0 || h === 0) return;

    const svgEl = this.svgRef.nativeElement;
    svgEl.setAttribute('width', `${w}`);
    svgEl.setAttribute('height', `${h}`);

    const pts = this.circleRefs.toArray().map(ref => {
      const r = ref.nativeElement.getBoundingClientRect();
      return {
        x: r.left - rect.left + r.width / 2,
        y: r.top - rect.top + r.height / 2,
      };
    });

    if (pts.length < 2) return;

    const d = this.smoothPath(pts, w);
    this.pathTrailRef.nativeElement.setAttribute('d', d);
    this.pathLineRef.nativeElement.setAttribute('d', d);

    this.updateClipPath(pts, w, h);

    const total = this.pathLineRef.nativeElement.getTotalLength();
    const line = this.pathLineRef.nativeElement;
    line.style.transition = 'none';
    line.style.strokeDasharray = `${total}`;
    line.style.strokeDashoffset = this.animated ? '0' : `${total}`;
  }

  private smoothPath(pts: { x: number; y: number }[], totalWidth: number): string {
    let d = `M 0 ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = (a.x + b.x) / 2;
      d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
    }
    d += ` L ${totalWidth} ${pts[pts.length - 1].y}`;
    return d;
  }

  private updateClipPath(pts: { x: number; y: number }[], w: number, h: number): void {
    if (!this.lineClipRef) return;
    const clipEl = this.lineClipRef.nativeElement;

    // Circle radius (36) + border (2) + 4px clearance = 42
    const r = 42;

    // evenodd: outer rect is visible area; each circle arc punches a hole
    let d = `M0,0 H${w} V${h} H0 Z`;
    pts.forEach(p => {
      d += ` M${p.x - r},${p.y} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 -${r * 2},0`;
    });

    clipEl.innerHTML = '';
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('fill-rule', 'evenodd');
    clipEl.appendChild(pathEl);
  }

  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          this.animatePath();
          this.intersectionObserver.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    this.intersectionObserver.observe(this.containerRef.nativeElement);
  }

  private animatePath(): void {
    this.animated = true;
    const line = this.pathLineRef.nativeElement;
    requestAnimationFrame(() => {
      line.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.4, 0, 0.2, 1)';
      line.style.strokeDashoffset = '0';
    });
    this.circleRefs.forEach((ref, i) => {
      setTimeout(() => ref.nativeElement.classList.add('visible'), 350 + i * 500);
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => this.buildPath());
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }
}
