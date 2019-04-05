import { Routes } from '@angular/router';
// Layouts
import { CondensedComponent } from './@pages/layouts';
// Sample Pages
import { SocialComponent } from './social/social.component';
import { RegistroComponent } from './registro/registro.component';
import { RegistroContactoComponent } from './registro-contacto/registro-contacto.component';
import { ViewVoceroComponent } from './view-vocero/view-vocero.component';

export const AppRoutes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Home'
    },
    component: CondensedComponent,
    children: [{
      path: 'Vitant',
      component: SocialComponent
    }, {
      path: 'Registro',
      component: RegistroComponent
    }, {
      path: 'Registro-contacto',
      component: RegistroContactoComponent
    }, {
      path: 'Vocero',
      component: ViewVoceroComponent
    }]
  }
];
