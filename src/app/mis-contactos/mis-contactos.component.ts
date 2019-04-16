import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { pagesToggleService } from '../@pages/services/toggler.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ContactModel } from '../models/contact.model';
import { SocialService } from '../social/social.service';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-mis-contactos',
  templateUrl: './mis-contactos.component.html',
  styleUrls: ['./mis-contactos.component.scss'],
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
export class MisContactosComponent implements OnInit, AfterViewInit, OnDestroy {

  contacts: Array<ContactModel> = [];

  constructor (public _togglerService: pagesToggleService, private _registerService: RegisterService) {
  }

  ngOnInit () {

    this._registerService.GetContacts().subscribe(
      resp => {
        this.contacts = resp;
      }
    );

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
