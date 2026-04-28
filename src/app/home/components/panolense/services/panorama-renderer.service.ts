import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PanoramaScene } from '../models/panorama.model';

declare const THREE: any;

export interface RendererState {
  loading: boolean;
  loadingText: string;
  ready: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class PanoramaRendererService implements OnDestroy {
  private scene: any;
  private camera: any;
  private renderer: any;
  private sphere: any;
  private currentMaterial: any;
  private textures: any[] = [];
  private animationId: number | null = null;

  private isMouseDown = false;
  private mouseX = 0;
  private mouseY = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private targetRotationX = 0;
  private targetRotationY = 0;
  private currentRotationX = 0;
  private currentRotationY = 0;

  readonly state$ = new Subject<RendererState>();

  constructor(private ngZone: NgZone) {}

  async initialize(container: HTMLElement, scenes: PanoramaScene[]): Promise<void> {
    this.emitState({ loading: true, loadingText: 'Initializing 3D engine…', ready: false, error: null });

    if (typeof (window as any).THREE === 'undefined') {
      this.emitState({ loading: false, loadingText: '', ready: false, error: 'THREE.js failed to load. Please refresh.' });
      return;
    }

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0.1);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    container.appendChild(this.renderer.domElement);

    // Sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    this.currentMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0xffffff });
    this.sphere = new THREE.Mesh(geometry, this.currentMaterial);
    this.scene.add(this.sphere);

    // Controls
    this.bindEvents(this.renderer.domElement);

    try {
      await this.preloadTextures(scenes);
    } catch (_) {
      // proceed with fallbacks
    }

    this.emitState({ loading: false, loadingText: '', ready: true, error: null });
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  loadScene(index: number, scenes: PanoramaScene[]): void {
    this.emitState({ loading: true, loadingText: `Loading ${scenes[index].name}…`, ready: true, error: null });
    setTimeout(() => {
      if (this.textures[index]) {
        this.applyTexture(this.textures[index]);
      } else {
        this.applyFallbackTexture(index, scenes[index]);
      }
      this.emitState({ loading: false, loadingText: '', ready: true, error: null });
    }, 300);
  }

  onResize(): void {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private async preloadTextures(scenes: PanoramaScene[]): Promise<void> {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const loadOne = (index: number) =>
      new Promise<void>(resolve => {
        this.emitState({ loading: true, loadingText: `Loading: ${scenes[index].name}`, ready: false, error: null });
        loader.load(
          scenes[index].url,
          (tex: any) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            this.textures[index] = tex;
            resolve();
          },
          undefined,
          () => {
            this.applyFallbackTexture(index, scenes[index]);
            resolve();
          }
        );
      });

    await loadOne(0);
    for (let i = 1; i < scenes.length; i++) loadOne(i);
  }

  private applyTexture(texture: any): void {
    if (this.currentMaterial.map) this.currentMaterial.map.dispose();
    this.currentMaterial.map = texture;
    this.currentMaterial.needsUpdate = true;
  }

  private applyFallbackTexture(index: number, scene: PanoramaScene): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, scene.fallbackColors[0]);
    grad.addColorStop(1, scene.fallbackColors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(scene.name, canvas.width / 2, canvas.height / 2);
    ctx.font = '30px sans-serif';
    ctx.fillText('360° Panorama', canvas.width / 2, canvas.height / 2 + 70);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    this.textures[index] = tex;
    this.applyTexture(tex);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.1;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;
    if (!this.isMouseDown) this.targetRotationX += 0.0003;
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.currentRotationX;
    this.camera.rotation.x = this.currentRotationY;
    this.renderer.render(this.scene, this.camera);
  }

  private bindEvents(el: HTMLElement): void {
    el.addEventListener('mousedown', (e: MouseEvent) => {
      this.isMouseDown = true;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      e.preventDefault();
    });
    el.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isMouseDown) return;
      this.targetRotationX += (e.clientX - this.mouseX) * 0.005;
      this.targetRotationY += (e.clientY - this.mouseY) * 0.005;
      this.targetRotationY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotationY));
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      e.preventDefault();
    });
    el.addEventListener('mouseup', () => (this.isMouseDown = false));
    el.addEventListener('mouseleave', () => (this.isMouseDown = false));
    el.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      this.camera.fov = Math.max(30, Math.min(120, this.camera.fov + e.deltaY * 0.05));
      this.camera.updateProjectionMatrix();
    }, { passive: false });
    el.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isMouseDown = true;
    }, { passive: false });
    el.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length !== 1 || !this.isMouseDown) return;
      e.preventDefault();
      this.targetRotationX += (e.touches[0].clientX - this.touchStartX) * 0.005;
      this.targetRotationY += (e.touches[0].clientY - this.touchStartY) * 0.005;
      this.targetRotationY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotationY));
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: false });
    el.addEventListener('touchend', () => (this.isMouseDown = false));
  }

  private emitState(s: RendererState): void {
    this.state$.next(s);
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
  }
}
