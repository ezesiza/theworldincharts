import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-info-panel',
  template: `
    <div class="panel" *ngIf="visible">
      <div class="eyebrow">360° Viewer</div>
      <div class="scene-name">{{ currentScene }}</div>
      <ul class="hints">
        <li><span class="key">Drag</span> to look around</li>
        <li><span class="key">Scroll</span> to zoom</li>
        <li><span class="key">Tap</span> a scene below to switch</li>
      </ul>
    </div>
  `,
  styles: [`
    .panel {
      position: fixed;
      top: 24px;
      left: 24px;
      background: rgba(10, 10, 18, 0.75);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(167, 139, 250, 0.2);
      border-radius: 12px;
      padding: 18px 22px;
      color: #fff;
      z-index: 100;
      max-width: 260px;
      font-family: 'Syne', sans-serif;
      animation: slideIn 0.4s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-8px) }
      to   { opacity: 1; transform: translateY(0) }
    }
    .eyebrow {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #a78bfa;
      margin-bottom: 6px;
    }
    .scene-name {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 14px;
      line-height: 1.2;
    }
    .hints {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .hints li {
      font-size: 12px;
      opacity: 0.65;
    }
    .key {
      display: inline-block;
      background: rgba(167,139,250,0.15);
      border: 1px solid rgba(167,139,250,0.3);
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 600;
      color: #c4b5fd;
      margin-right: 4px;
    }
  `]
})
export class InfoPanelComponent {
  @Input() visible = false;
  @Input() currentScene = '';
}
