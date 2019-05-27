import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequestModel } from '../models/LoginRequest.model';
import { LoginResponseModel } from '../models/LoginResponse.model';
import { ResponseModel, statusType } from '../models/Response.model';
import { environment as env } from '../../environments/environment';

@Injectable()
export class AuthService {

  isAuth: BehaviorSubject<boolean> = new BehaviorSubject(null);
  isAdmin: boolean;
  isAuth$ = this.isAuth.asObservable();

  loggedInfo: BehaviorSubject<LoginResponseModel> = new BehaviorSubject(null);

  constructor (private _http: HttpClient, private _router: Router) {

  }

  checkSession () {

    const accessToken = localStorage.getItem('accesstoken');
    const accessInfo = localStorage.getItem('accessInfo');

    if (accessToken && accessInfo) {
      this.isAuth.next(true);
      this.loggedInfo.next(JSON.parse(accessInfo));
    }
  }

  updateToken (accessToken) {
    localStorage.setItem('accesstoken', accessToken);
  }

  login (userRequest: LoginRequestModel) {

    if (env.useMockUps) {
      return this.doLoginDummy();
    }

    return new Promise((resolve, reject) => {
      const endpoint = `${env.endpoint}${env.urlUserServices}${env.loginUser}`;
      this._http.post(endpoint, JSON.stringify(userRequest)).subscribe(
        (res: ResponseModel<LoginResponseModel>) => {

          const [loggedData] = res.data;

          this.loggedInfo.next(loggedData);

          if (res.status === statusType.OK) { // Loggin Exitoso
            this.isAuth.next(true);
            this.isAdmin = loggedData.IdRole === 2;
            localStorage.setItem('accesstoken', res.accessToken);
            localStorage.setItem('accessInfo', JSON.stringify(loggedData));
            resolve();
          } else {
            this.isAuth.next(false);
            // Mensaje Propio de Login
            reject(`${res.error}`);
          }
        });
    });
  }

  doLoginDummy () {
    return new Promise((resolve, reject) => {
      const endpoint = `assets/data/loginUser.json`;
      this._http.get(endpoint).subscribe(
        (res: ResponseModel<LoginResponseModel>) => {

          const [loggedData] = res.data;

          this.loggedInfo.next(loggedData);

          if (res.status === statusType.OK) { // Loggin Exitoso
            this.isAuth.next(true);
            this.isAdmin = loggedData.IdRole === 2;
            localStorage.setItem('accesstoken', res.accessToken);
            localStorage.setItem('accessInfo', JSON.stringify(loggedData));
            resolve();
          } else {
            this.isAuth.next(false);
            // Mensaje Propio de Login
            reject(`${res.error}`);
          }
        });
    });
  }

  logout () {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('accessInfo');
    this.isAuth.next(false);
    this.loggedInfo.next(null);
    this._router.navigate(['/Vitant']).then();
  }
}

