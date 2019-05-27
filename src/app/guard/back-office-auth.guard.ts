import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';
import { LoginResponseModel } from '../models/LoginResponse.model';

@Injectable()
export class BackOfficeAuthGuard implements CanActivate {

  constructor (private _auth: AuthService, private router: Router) {
  }

  canActivate (next: ActivatedRouteSnapshot,
               state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this._auth.checkSession();

    return this._auth.loggedInfo.do((user: LoginResponseModel) => {
      if (user === null || !this._auth.isAdmin) {
        this.router.navigate(['/Vitant']);
      }
    }).map((user: LoginResponseModel) => !!user);

  }
}
