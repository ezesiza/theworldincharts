import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'single-card',
  templateUrl: './single-card.component.html',
  styleUrl: './single-card.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleCardComponent implements OnInit {

  @Input() action: string = '';
  @Input() loading: boolean = false;
  isMinimized: boolean = false;

  constructor() {}

  ngOnInit() {
  }
}
