import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriterioConfigComponent } from './criterio-config.component';

describe('CriterioConfigComponent', () => {
  let component: CriterioConfigComponent;
  let fixture: ComponentFixture<CriterioConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriterioConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriterioConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
