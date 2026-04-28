import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanoramaScene } from '../models/panorama.model';
// import { PanoramaScene } from '../../models/panorama.model';

@Component({
  selector: 'app-scene-controls',
  template: `
    <div class="controls" *ngIf="visible">
      <button
        *ngFor="let scene of scenes; let i = index"
        [class.active]="i === activeIndex"
        [disabled]="i === activeIndex"
        (click)="selectScene.emit(i)"
        class="scene-btn"
      >
        <img [src]="scene.thumbnail" [alt]="scene.name" class="thumb" />
        <span class="label">{{ scene.name }}</span>
      </button>
    </div>
  `,
  styles: [`
    .controls {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      z-index: 100;
      max-width: 92vw;
      background: rgba(10, 10, 18, 0.75);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(167, 139, 250, 0.15);
      border-radius: 16px;
      padding: 12px 16px;
      animation: slideUp 0.4s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(12px) }
      to   { opacity: 1; transform: translateX(-50%) translateY(0) }
    }
    .scene-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.8);
      padding: 8px 14px 8px 8px;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      letter-spacing: 0.02em;
    }
    .scene-btn:hover:not(:disabled) {
      background: rgba(167, 139, 250, 0.2);
      border-color: rgba(167, 139, 250, 0.4);
      color: #fff;
      transform: translateY(-2px);
    }
    .scene-btn.active {
      background: rgba(167, 139, 250, 0.25);
      border-color: #a78bfa;
      color: #fff;
      cursor: default;
    }
    .scene-btn:disabled {
      opacity: 0.9;
    }
    .thumb {
      width: 52px;
      height: 28px;
      object-fit: cover;
      border-radius: 6px;
      opacity: 0.75;
      transition: opacity 0.2s;
    }
    .scene-btn:hover .thumb,
    .scene-btn.active .thumb {
      opacity: 1;
    }
    .scene-btn.active .thumb {
      outline: 2px solid #a78bfa;
      outline-offset: 1px;
    }
  `]
})
export class SceneControlsComponent {
  @Input() scenes: PanoramaScene[] = [];
  @Input() activeIndex = 0;
  @Input() visible = false;
  @Output() selectScene = new EventEmitter<number>();
}
