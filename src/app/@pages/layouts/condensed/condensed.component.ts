import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RootLayout } from '../root/root.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'condensed-layout',
  templateUrl: './condensed.component.html',
  styleUrls: ['./condensed.component.scss'],
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
export class CondensedComponent extends RootLayout implements OnInit, OnDestroy {

  loggedInItems = [
    {
      label: 'Vocero',
      routerLink: '/Vocero',
      iconType: 'fa',
      iconName: 'laptop'
    },
    {
      label: 'Contactos',
      routerLink: '/Registro-contacto',
      iconType: 'fa',
      iconName: 'user-plus'
    },
    {
      label: 'Mis Contactos',
      routerLink: '/Contactos',
      iconType: 'fa',
      iconName: 'users'
    },
    {
      label: 'Información',
      routerLink: '/Informacion',
      iconType: 'fa',
      iconName: 'info'
    },
    {
      label: 'Salir',
      routerLink: '/Sign-out',
      iconType: 'fa',
      iconName: 'sign-out'
    }
  ];
  normalItems = [
    {
      label: 'Inicio',
      routerLink: '/Vitant',
      iconType: 'pg',
      iconName: 'home'
    },
    {
      label: 'Registro',
      routerLink: '/Registro',
      iconType: 'pg',
      iconName: 'form'
    },
    {
      label: 'Ingreso',
      routerLink: '/Login',
      iconType: 'fa',
      iconName: 'sign-in'
    }];
  menuLinks = [];
  takeWhile$ = new Subject();

  ngOnDestroy () {
    super.ngOnDestroy();
    this.takeWhile$.next(false);
  }

  ngOnInit () {

    this._authService.checkSession();

    this._authService.isAuth.takeUntil(this.takeWhile$).subscribe(
      isAuth => {
        this.menuLinks = isAuth ? this.loggedInItems : this.normalItems;
      }
    );

  }

}
