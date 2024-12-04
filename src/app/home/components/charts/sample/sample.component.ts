import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  template: `<p>sample works!</p>`,
  templateUrl: './sample.component.html',
  styleUrl: './sample.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleComponent { }
