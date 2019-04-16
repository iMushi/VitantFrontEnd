import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { pagesToggleService } from '../@pages/services/toggler.service';
import emailMask from 'text-mask-addons/dist/emailMask';
import { LoginResponseModel } from '../models/LoginResponse.model';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-registro-contacto',
  templateUrl: './registro-contacto.component.html',
  styleUrls: ['./registro-contacto.component.scss'],
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
export class RegistroContactoComponent implements OnInit, AfterViewInit, OnDestroy {

  name;
  lastName;
  phoneNumber;
  email;

  voceroInfo: LoginResponseModel;

  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  phonePatter = '^\d{10,14}$';

  mask = {
    telephone: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    name: Array(50).fill(/^[a-zA-Z\s]*$/),
    password: Array(50).fill(/^[a-zA-Z\s.1-9]*$/),
    emailMask: emailMask
  };

  constructor (public _togglerService: pagesToggleService, private _auth: AuthService, private _registerService: RegisterService) {
  }

  ngOnInit () {
    this.voceroInfo = this._auth.loggedInfo.getValue();
  }

  ngAfterViewInit (): void {
    setTimeout(() => {
      this._togglerService.toggleAnimateEnter(false);
    }, 1000);
  }

  ngOnDestroy (): void {
    this._togglerService.toggleAnimateEnter(true);
  }

  registerContact (form: NgForm) {
    if (form.valid) {

      const {name, lastName, phoneNumber, email} = this;
      const idReferring = this.voceroInfo.IdCustomer;

      this._registerService.RegisterContact({
        name, lastName, phoneNumber, email, idReferring
      }).subscribe(
        resp => {

          form.resetForm();

          this._togglerService._messageBridge.next({
            type: 'success', msg: 'Contacto Registrado Correctamente',
            options: {
              Position: 'top-right',
              Style: 'simple',
              PauseOnHover: true,
              Title: 'Exito',
              Duration: 5000
            }
          });

        }
      );
    }
  }

}
