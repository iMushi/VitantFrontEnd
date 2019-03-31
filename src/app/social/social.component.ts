import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { animate, state, style, transition, trigger } from '@angular/animations';

import { SocialService } from './social.service';
import { pagesToggleService } from '../@pages/services/toggler.service';

declare var stepsForm: any;
declare var pg: any;

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('enterAnimation', [
      state('loading', style({
        opacity: '0',
        transform: 'translateY(8%)'
      })),
      state('ready', style({
        opacity: '1',
        transform: 'translateY(0)'
      })),
      transition('loading => ready', animate('500ms cubic-bezier(0.1, 0.0, 0.2, 1)'))
    ])
  ]
})
export class SocialComponent implements OnInit, OnDestroy {

  feed = [];

  constructor (private _service: SocialService, public _togglerService: pagesToggleService) {
  }

  ngOnInit () {
    // Retrieve posts from the API
    setTimeout(() => {
      this._togglerService.toggleAnimateEnter(false);
    }, 1000);
  }

  ngOnDestroy (): void {
    this._togglerService.toggleAnimateEnter(true);
  }

}
