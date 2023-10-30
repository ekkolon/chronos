import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxChronosTimeline } from './timeline';

describe('NgxChronosTimeline', () => {
  let component: NgxChronosTimeline;
  let fixture: ComponentFixture<NgxChronosTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxChronosTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxChronosTimeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
