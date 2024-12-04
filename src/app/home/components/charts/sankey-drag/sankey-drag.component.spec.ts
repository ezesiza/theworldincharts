import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SankeyDragComponent } from './sankey-drag.component';

describe('SankeyDragComponent', () => {
  let component: SankeyDragComponent;
  let fixture: ComponentFixture<SankeyDragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SankeyDragComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SankeyDragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
