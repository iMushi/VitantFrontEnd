import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { ResponseModel } from '../models/Response.model';
import { ContactModel } from '../models/contact.model';
import * as FileSaver from 'file-saver';

@Injectable()
export class BackOfficeService {

  constructor (private _http: HttpClient) {
  }

  getRegByType (request) {
    const endpoint = `${env.endpoint}${env.urlBackOfficeServices}${env.getRegByType}`;
    return this._http.post<ResponseModel<ContactModel>>(
      endpoint, JSON.stringify(request)).map(res => res.data);
  }

  getDependants (request) {
    const endpoint = `${env.endpoint}${env.urlBackOfficeServices}${env.getDependants}`;
    return this._http.post<ResponseModel<ContactModel>>(
      endpoint, JSON.stringify(request)).map(res => res.data);
  }

  saveEditDependants (request) {
    const endpoint = `${env.endpoint}${env.urlBackOfficeServices}${env.saveEditDependants}`;
    return this._http.post<ResponseModel<ContactModel>>(
      endpoint, JSON.stringify(request)).map(res => res.data);
  }

  excelExport (request) {
    const endpoint = `${env.endpoint}${env.urlBackOfficeServices}${env.excelExport}`;
    return this._http.post(
      endpoint, JSON.stringify(request), {
        responseType: 'blob'
      }).map(data => {
      const blob = new Blob([data], {type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'});
      FileSaver.saveAs(blob, `Voceros${request.startDate} - ${request.endDate}.xlsx`);
    });
  }

}
