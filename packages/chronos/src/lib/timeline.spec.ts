import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxChronosTimeline } from './timeline';
import { provideTimelineConfig } from './timeline-config';

describe('NgxChronosTimeline', () => {
  let component: NgxChronosTimeline;
  let fixture: ComponentFixture<NgxChronosTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxChronosTimeline],
      providers: [provideTimelineConfig()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxChronosTimeline);
    component = fixture.componentInstance;
    component.records = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
