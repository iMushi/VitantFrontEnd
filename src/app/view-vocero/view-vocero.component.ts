import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { pagesToggleService } from '../@pages/services/toggler.service';

@Component({
  selector: 'app-view-vocero',
  templateUrl: './view-vocero.component.html',
  styleUrls: ['./view-vocero.component.scss'],
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
export class ViewVoceroComponent implements OnInit, AfterViewInit, OnDestroy {

  configLiveWidget;
  index = 0;


  constructor (public _togglerService: pagesToggleService) {
  }

  ngOnInit () {

    this.configLiveWidget = {
      direction: 'vertical',
      autoplay: {
        delay: 5000,
      }
    }

  }

  ngAfterViewInit (): void {
    setTimeout(() => {
      this._togglerService.toggleAnimateEnter(false);
    }, 1000);
  }

  ngOnDestroy (): void {
    this._togglerService.toggleAnimateEnter(true);
  }
}



