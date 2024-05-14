import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>sample works!</p>`,
  styleUrl: './sample.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleComponent { }
