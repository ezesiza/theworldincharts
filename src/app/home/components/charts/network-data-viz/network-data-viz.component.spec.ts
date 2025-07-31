import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkDataVizComponent } from './network-data-viz.component';

describe('NetworkDataVizComponent', () => {
  let component: NetworkDataVizComponent;
  let fixture: ComponentFixture<NetworkDataVizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkDataVizComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NetworkDataVizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
