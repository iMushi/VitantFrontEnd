import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { ResponseModel } from '../models/Response.model';
import { ContactModel } from '../models/contact.model';

@Injectable()
export class BackOfficeService {

  constructor (private _http: HttpClient) {
  }

  getRegByType (request) {
    const endpoint = `${env.endpoint}${env.urlBackOfficeServices}${env.getRegByType}`;
    return this._http.post<ResponseModel<ContactModel>>(
      endpoint, JSON.stringify(request)).map(res => res.data);
  }

}
