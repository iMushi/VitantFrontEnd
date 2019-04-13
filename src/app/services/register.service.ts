import { Injectable } from '@angular/core';
import { environment as env } from '../../environments/environment';
import { ResponseModel } from '../models/Response.model';
import { HttpClient } from '@angular/common/http';
import { RegisterUserModel } from '../models/RegisterUser.model';

@Injectable()
export class RegisterService {

  constructor(private _http: HttpClient) { }

  RegisterUser(payload: RegisterUserModel) {
    const endpoint = `${env.urlServices}${env.registerUser}`;

    return this._http.post<ResponseModel<any>>(
      endpoint, JSON.stringify(payload) ).map(res => res.data);
  }
}
