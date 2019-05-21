import { Routes } from '@angular/router';
// Layouts
import { CondensedComponent } from './@pages/layouts';
// Sample Pages
import { SocialComponent } from './social/social.component';
import { RegistroComponent } from './registro/registro.component';
import { RegistroContactoComponent } from './registro-contacto/registro-contacto.component';
import { ViewVoceroComponent } from './view-vocero/view-vocero.component';
import { MisContactosComponent } from './mis-contactos/mis-contactos.component';
import { InformacionComponent } from './informacion/informacion.component';
import { LoginComponent } from './login/login.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { AuthGuard } from './guard/auth.guard';
import { BackOfficeComponent } from './back-office/back-office.component';

export const AppRoutes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Home'
    },
    component: CondensedComponent,
    children: [{
      path: 'BackOffice',
      data:{
        backOffice: true
      },
      component: BackOfficeComponent
    }, {
      path: 'Vitant',
      component: SocialComponent
    }, {
      path: 'Registro',
      component: RegistroComponent
    }, {
      path: 'Registro-contacto',
      canActivate: [AuthGuard],
      component: RegistroContactoComponent
    }, {
      path: 'Vocero',
      canActivate: [AuthGuard],
      component: ViewVoceroComponent
    }, {
      path: 'Contactos',
      canActivate: [AuthGuard],
      component: MisContactosComponent
    }, {
      path: 'Informacion',
      canActivate: [AuthGuard],
      component: InformacionComponent
    }, {
      path: 'Login',
      component: LoginComponent
    }, {
      path: 'Sign-out',
      canActivate: [AuthGuard],
      component: SignOutComponent
    }]
  }
];
