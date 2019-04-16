import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import emailMask from 'text-mask-addons/dist/emailMask';
import { pagesToggleService } from '../@pages/services/toggler.service';
import { RegisterService } from '../services/register.service';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  password;
  userName;

  mask = {
    telephone: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    name: Array(50).fill(/^[a-zA-Z\s]*$/),
    password: Array(50).fill(/^[a-zA-Z\s.1-9]*$/),
    emailMask: emailMask
  };

  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

  constructor (
    public _togglerService: pagesToggleService,
    private _registerService: RegisterService,
    private _authService: AuthService,
    private _router: Router
  ) {
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

  doLogin (form: NgForm) {
    if (form.valid) {

      const {userName, password} = this;

      this._authService.login({userName, password}).catch(
        msg => {

          this._togglerService._messageBridge.next({
            type: 'danger', msg,
            options: {
              Position: 'top-right',
              Style: 'simple',
              PauseOnHover: true,
              Title: 'Error',
              Duration: 2000
            }
          });

        }).then(_ => {
        if (this._authService.isAuth.value) {
          this._router.navigate(['/Vocero']);
        }
      });
    }
  }
}

