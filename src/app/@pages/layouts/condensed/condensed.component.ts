import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {RootLayout} from '../root/root.component';
import {pagesToggleService} from '../../services/toggler.service';

@Component({
  selector: 'condensed-layout',
  templateUrl: './condensed.component.html',
  styleUrls: ['./condensed.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CondensedComponent extends RootLayout implements OnInit {
  menuLinks = [

    /*
    {
        label: 'Dashboard',
        details: '12 New Updates',
        routerLink: 'dashboard',
        iconType: 'pg',
        iconName: 'home',
        thumbNailClass: 'bg-success'
    },

    */

    {
      label: 'Home',
      routerLink: '/Vitant',
      iconType: 'pg',
      iconName: 'home'
    }
  ];

  ngOnInit() {

    /** aplicado para quitar espacio del header **/
  }

}
