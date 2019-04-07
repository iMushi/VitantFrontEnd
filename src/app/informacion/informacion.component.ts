import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ContactModel } from '../models/contact.model';
import { pagesToggleService } from '../@pages/services/toggler.service';
import { SocialService } from '../social/social.service';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.scss'],
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
export class InformacionComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor (public _togglerService: pagesToggleService) {
  }

  ngOnInit () {
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
