import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';


import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { InfoPanelComponent } from '../info-panel/info-panel.component';
import { SceneControlsComponent } from '../scene-controls/scene-controls.component';
import { PanoramaScene } from '../models/panorama.model';
import { PanoramaDataService } from '../services/panorama-data.service';
import { PanoramaRendererService, RendererState } from '../services/panorama-renderer.service';

@Component({
  selector: 'app-panorama-viewer',
  template: `
    <app-loading-overlay
      [visible]="loading"
      [title]="loadingText"
      subtitle="Three.js Panorama Viewer"
    />

    <app-info-panel
      [visible]="ready"
      [currentScene]="currentSceneName"
    />

    <app-scene-controls
      [scenes]="scenes"
      [activeIndex]="activeIndex"
      [visible]="ready"
      (selectScene)="onSelectScene($event)"
    />

    <div class="error-box" *ngIf="error">
      <p>{{ error }}</p>
      <button (click)="reload()">Retry</button>
    </div>

    <!-- Three.js mounts here -->
    <div #container class="canvas-host"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      background: #000;
      overflow: hidden;
    }
    .canvas-host {
      width: 100%;
      height: 100%;
    }
    .error-box {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.9);
      color: #f87171;
      font-family: 'Syne', sans-serif;
      z-index: 300;
      gap: 16px;
    }
    .error-box button {
      padding: 10px 24px;
      background: #22c55e;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }
  `]
})
export class PanoramaViewerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  scenes: PanoramaScene[] = [];
  activeIndex = 0;
  loading = true;
  loadingText = 'Initializing…';
  ready = false;
  error: string | null = null;

  get currentSceneName(): string {
    return this.scenes[this.activeIndex]?.name ?? '';
  }

  private sub!: Subscription;
  private resizeHandler = () => this.renderer.onResize();

  constructor(
    private dataService: PanoramaDataService,
    private renderer: PanoramaRendererService
  ) { }

  async ngOnInit(): Promise<void> {
    this.scenes = this.dataService.scenes;

    this.sub = this.renderer.state$.subscribe((state: RendererState) => {
      this.loading = state.loading;
      this.loadingText = state.loadingText;
      this.ready = state.ready;
      this.error = state.error;
    });

    await this.renderer.initialize(this.containerRef.nativeElement, this.scenes);

    // Load first scene once ready
    this.renderer.loadScene(0, this.scenes);

    window.addEventListener('resize', this.resizeHandler);
  }

  onSelectScene(index: number): void {
    this.activeIndex = index;
    this.renderer.loadScene(index, this.scenes);
  }

  reload(): void {
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
