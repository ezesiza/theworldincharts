import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldVizualizerComponent } from './world-vizualizer.component';

describe('WorldVizualizerComponent', () => {
  let component: WorldVizualizerComponent;
  let fixture: ComponentFixture<WorldVizualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldVizualizerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorldVizualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
