//Angular Core
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
//Routing
import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';
//Layouts
import { CondensedComponent, RootLayout } from './@pages/layouts';
//Layout Service - Required
import { pagesToggleService } from './@pages/services/toggler.service';
//Shared Layout Components
import { SidebarComponent } from './@pages/components/sidebar/sidebar.component';
import { HeaderComponent } from './@pages/components/header/header.component';
import { SharedModule } from './@pages/components/shared.module';

import { pgListViewModule } from './@pages/components/list-view/list-view.module';
import { pgCardModule } from './@pages/components/card/card.module';
import { pgCardSocialModule } from './@pages/components/card-social/card-social.module';
//Basic Bootstrap Modules
//Pages Globaly required Components - Optional
import { pgTabsModule } from './@pages/components/tabs/tabs.module';
import { pgSwitchModule } from './@pages/components/switch/switch.module';
import { ProgressModule } from './@pages/components/progress/progress.module';
//Thirdparty Components / Plugins - Optional
import { StepsformDirective } from './social/stepsform.directive';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
//Service - Demo content - Optional
import { SocialService } from './social/social.service';
//Social Page - Optional
import { SocialComponent } from './social/social.component';
import { CoverpageDirective } from './social/coverpage.directive';
//Sample Blank Pages - Optional
import { RegistroComponent } from './registro/registro.component';
import { RegistroContactoComponent } from './registro-contacto/registro-contacto.component';
import { ViewVoceroComponent } from './view-vocero/view-vocero.component';


import { SWIPER_CONFIG, SwiperConfigInterface, SwiperModule } from 'ngx-swiper-wrapper';
import { MisContactosComponent } from './mis-contactos/mis-contactos.component';
import { InformacionComponent } from './informacion/informacion.component';
import { TextMaskModule } from 'angular2-text-mask';
import { RegisterService } from './services/register.service';
import { HeaderInterceptor } from './Interceptors/HeaderInterceptor';
import { MessageService } from './@pages/components/message/message.service';
import { MessageModule } from './@pages/components/message/message.module';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { SignOutComponent } from './sign-out/sign-out.component';
import { AuthGuard } from './guard/auth.guard';
import { BackOfficeComponent } from './back-office/back-office.component';
import { pgDatePickerModule } from './@pages/components/datepicker/datepicker.module';
import { pgSelectModule } from './@pages/components/select/select.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalService, defineLocale, esLocale, ModalModule } from 'ngx-bootstrap';
import { BackOfficeService } from './services/back-office.service';
import { BackOfficeAuthGuard } from './guard/back-office-auth.guard';
import { EditContactComponent } from './back-office/edit-contact/edit-contact.component';


defineLocale('es', esLocale);


const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

//Hammer Config Overide
//https://github.com/angular/angular/issues/10541
export class AppHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'pinch': {enable: false},
    'rotate': {enable: false}
  };
}

@NgModule({
  declarations: [
    AppComponent,
    CondensedComponent,
    SidebarComponent,
    HeaderComponent,
    RootLayout,
    SocialComponent,
    StepsformDirective,
    CoverpageDirective,
    RegistroComponent,
    RegistroContactoComponent,
    ViewVoceroComponent,
    MisContactosComponent,
    InformacionComponent,
    LoginComponent,
    SignOutComponent,
    BackOfficeComponent,
    EditContactComponent,
  ],
  imports: [
    TextMaskModule,
    SwiperModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    ProgressModule,
    pgListViewModule,
    pgCardModule,
    pgCardSocialModule,
    RouterModule.forRoot(AppRoutes),
    ModalModule.forRoot(),
    pgTabsModule,
    PerfectScrollbarModule,
    pgSwitchModule,
    MessageModule,
    pgSelectModule,
    pgDatePickerModule,
    NgxDatatableModule
  ],
  entryComponents: [
    EditContactComponent
  ],
  providers: [pagesToggleService
    , SocialService
    , RegisterService
    , BackOfficeService
    , MessageService
    , AuthService
    , AuthGuard
    , BackOfficeAuthGuard
    , BsModalService
    , {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true},
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: AppHammerConfig
    }, {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
