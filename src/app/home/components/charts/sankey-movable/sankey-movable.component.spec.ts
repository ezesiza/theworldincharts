import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SankeyMovableComponent } from './sankey-movable.component';

describe('SankeyMovableComponent', () => {
  let component: SankeyMovableComponent;
  let fixture: ComponentFixture<SankeyMovableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SankeyMovableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SankeyMovableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
