import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { PerformanceService } from '../services/performance.service';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';
  @Input() placeholder: string = '/assets/images/placeholder.svg';
  @Input() errorImage: string = '/assets/images/error-placeholder.svg';

  private observer?: IntersectionObserver;
  private loaded = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    private performanceService: PerformanceService
  ) {}

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupLazyLoading(): void {
    const img = this.el.nativeElement;
    
    // Set placeholder initially
    if (this.placeholder) {
      this.renderer.setAttribute(img, 'src', this.placeholder);
    }

    // Add loading class for styling
    this.renderer.addClass(img, 'lazy-loading');

    // Create intersection observer
    this.observer = this.performanceService.createIntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loaded) {
          this.loadImage();
        }
      });
    });

    this.observer.observe(img);
  }

  private loadImage(): void {
    const img = this.el.nativeElement;
    const imageUrl = this.appLazyLoad;

    if (!imageUrl) {
      return;
    }

    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Image loaded successfully
      this.renderer.setAttribute(img, 'src', imageUrl);
      this.renderer.removeClass(img, 'lazy-loading');
      this.renderer.addClass(img, 'lazy-loaded');
      this.loaded = true;
      
      // Disconnect observer as image is now loaded
      if (this.observer) {
        this.observer.disconnect();
      }
    };

    imageLoader.onerror = () => {
      // Image failed to load, use error placeholder
      if (this.errorImage) {
        this.renderer.setAttribute(img, 'src', this.errorImage);
      }
      this.renderer.removeClass(img, 'lazy-loading');
      this.renderer.addClass(img, 'lazy-error');
      this.loaded = true;
      
      if (this.observer) {
        this.observer.disconnect();
      }
    };

    // Start loading the image
    imageLoader.src = imageUrl;
  }
}