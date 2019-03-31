import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RootLayout } from '../root/root.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
export class CondensedComponent extends RootLayout implements OnInit {

  menuLinks = [

    {
      label: 'Inicio',
      routerLink: '/Vitant',
      iconType: 'pg',
      iconName: 'home'
    },
    {
      label: 'Registro',
      routerLink: '/Vitant/registro',
      iconType: 'pg',
      iconName: 'form'
    },
    {
      label: 'Registro Contacto',
      routerLink: '/Vitant/registro-contacto',
      iconType: 'fa',
      iconName: 'user-plus'
    },
    {
      label: 'Vocero',
      routerLink: '/Vitant/vocero',
      iconType: 'fa',
      iconName: 'user'
    }

  ];

  ngOnInit () {

    /** aplicado para quitar espacio del header **/
  }

}
