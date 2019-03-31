import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { pagesToggleService } from '../@pages/services/toggler.service';

@Component({
  selector: 'app-registro-contacto',
  templateUrl: './registro-contacto.component.html',
  styleUrls: ['./registro-contacto.component.scss'],
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
export class RegistroContactoComponent implements OnInit, AfterViewInit, OnDestroy {

  fName;
  lName;
  phone;
  password;
  email;

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
