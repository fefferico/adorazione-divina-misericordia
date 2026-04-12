import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPicker } from './content-picker';

describe('ContentPicker', () => {
  let component: ContentPicker;
  let fixture: ComponentFixture<ContentPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
