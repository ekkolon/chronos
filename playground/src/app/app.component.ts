/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

import { NgxChronosTimeline, provideTimelineConfig } from 'chronos';

import { chronTimelineRecords } from './mocks/timeline-records';

@Component({
  standalone: true,
  imports: [CommonModule, NgxChronosTimeline],
  selector: 'chronos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [provideTimelineConfig()],
})
export class AppComponent {
  title = 'chronos';

  readonly timelinePosition = signal<number>(0);

  readonly timelineRecords = signal(chronTimelineRecords);
}
