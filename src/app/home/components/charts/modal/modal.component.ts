import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnChanges, OnDestroy {
  @ViewChild('modal') modal: ElementRef;
  @Input() isVisible: boolean = true;
  @Input() isLoading: boolean = false;
  @Input() minHeight: number;
  @Input() minWidth: number;
  @Input() enableResizing: boolean = true;

  @Output() event: EventEmitter<any> = new EventEmitter<any>();

  isResizing: boolean = false;
  height: number;
  width: number;
  unsubscribe$ = new Subject();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']) {
      this.toggleBodyScrolling();
    }
  }

  ngOnDestroy() {
    document.body.classList.remove('hide-overflow');
  }

  hideModal() {
    this.isVisible = false;
    this.event.emit(this.isVisible);

    this.toggleBodyScrolling();
  }

  toggleBodyScrolling() {
    if (this.isVisible) {
      document.body.classList.add('hide-overflow');
    } else {
      document.body.classList.remove('hide-overflow');
    }
  }

  onResizerMouseDown(event: MouseEvent) {
    if (!this.enableResizing) {
      return;
    }

    this.isResizing = true;

    var initialX = event.x;
    var initialY = event.y;

    var sizing = this.modal.nativeElement.getBoundingClientRect();
    this.width = sizing.width;
    this.height = sizing.height;

    fromEvent(document, 'mousemove')
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: Event) => {
        const mouseEvent = event as MouseEvent;
        const deltaX = initialX - mouseEvent.x;
        const deltaY = initialY - mouseEvent.y;

        initialX = mouseEvent.x;
        initialY = mouseEvent.y;

        const newWidth = this.width - deltaX;
        if (this.minWidth && this.minWidth > 0) {
          if (newWidth >= this.minWidth) {
            this.width = newWidth;
          }
        } else if (newWidth >= (window.innerWidth * 0.2)) {
          this.width = newWidth;
        }

        const newHeight = this.height - deltaY;
        if (this.minHeight && this.minHeight > 0) {
          if (newHeight >= this.minHeight) {
            this.height = newHeight;
          }
        } else if (newHeight > (window.innerHeight * 0.3)) {
          this.height = newHeight;
        }
      });

    fromEvent(document, 'mouseup')
      .pipe(take(1))
      .subscribe((event: Event) => {
        if (!this.isResizing) {
          return;
        }

        this.unsubscribe$.next(null);

        const mouseEvent = event as MouseEvent;
        const deltaX = initialX - mouseEvent.clientX;
        const deltaY = initialY - mouseEvent.clientY;

        this.isResizing = false;

        // if (this.gridOptions && this.gridOptions.columnApi) {
        // 	this.gridOptions.columnApi.autoSizeAllColumns();
        // 	this.gridOptions.api.setDomLayout('autoHeight');
        // }
      });
  }

}
