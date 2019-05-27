import { Injectable } from '@angular/core';
import { environment as env } from '../../environments/environment';
import { ResponseModel } from '../models/Response.model';
import { HttpClient } from '@angular/common/http';
import { RegisterUserModel } from '../models/RegisterUser.model';
import { ContactModel } from '../models/contact.model';
import { RegisterContactModel } from '../models/RegisterContact.model';

@Injectable()
export class RegisterService {

  constructor (private _http: HttpClient) {
  }

  RegisterUser (payload: RegisterUserModel) {
    const endpoint = `${env.endpoint}${env.urlUserServices}${env.registerUser}`;
    return this._http.post<ResponseModel<any>>(
      endpoint, JSON.stringify(payload)).map(res => res.data);
  }


  RegisterContact (payload: RegisterContactModel) {
    const endpoint = `${env.endpoint}${env.urlUserServices}${env.registerContacts}`;
    return this._http.post<ResponseModel<any>>(
      endpoint, JSON.stringify(payload)).map(res => res.data);
  }


  GetContacts () {
    if (env.useMockUps) {
      const endpoint = `assets/data/contacts.json`;
      return this._http.get<ResponseModel<ContactModel>>(endpoint).map(res => res.data);
    } else {
      const endpoint = `${env.endpoint}${env.urlUserServices}${env.getContacts}`;
      return this._http.post<ResponseModel<ContactModel>>(
        endpoint, JSON.stringify({})).map(res => res.data);
    }

  }

}
