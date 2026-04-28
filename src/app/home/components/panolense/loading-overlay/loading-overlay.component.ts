import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div class="overlay" *ngIf="visible">
      <div class="spinner"></div>
      <div class="title">{{ title }}</div>
      <div class="sub">{{ subtitle }}</div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 200;
      color: #fff;
      font-family: 'Syne', sans-serif;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .spinner {
      width: 44px;
      height: 44px;
      border: 2px solid rgba(255,255,255,0.15);
      border-top-color: #a78bfa;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin { to { transform: rotate(360deg) } }
    .title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .sub {
      font-size: 12px;
      opacity: 0.5;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() visible = true;
  @Input() title = 'Loading…';
  @Input() subtitle = '';
}
