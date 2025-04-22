import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernPanelComponent } from './user-panel.component';

describe('UsernPanelComponent', () => {
  let component: UsernPanelComponent;
  let fixture: ComponentFixture<UsernPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsernPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsernPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
