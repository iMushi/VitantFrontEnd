import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { TimeoutError } from 'rxjs/util/TimeoutError';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/operator/sample';
import 'rxjs/add/operator/isEmpty';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import { ResponseModel, statusType } from '../models/Response.model';
import { MessageService } from '../@pages/components/message/message.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  DEFAULT_TIMEOUT = 180000;


  constructor (private _notification: MessageService, private _auth: AuthService) {

  }

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const timeout = Number(req.headers.get('timeout')) || this.DEFAULT_TIMEOUT;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accesstoken') || ''
    };

    const dummyrequest = req.clone({
      setHeaders: headers,
      withCredentials: true
    });


    const requestObserver = next.handle(dummyrequest).timeout(timeout).do(() => {
    }, err => {


      if (err instanceof HttpErrorResponse) {

        let mjs = '';

        if (err.status === 401 || err.status === 403) {
          mjs = `${err.error.status} - ${err.error.error}`;
          this._auth.logout();
        } else {
          mjs = `${err.status} - ${err.statusText}`;
        }
        this.showModal(mjs);
      }
      if (err instanceof TimeoutError) {
        const mjs = 'El tiempo de espera de la petici\u00F3n se ha agotado.\nIntente de nuevo.';
        this.showModal(mjs);
      }

    }).map(resp => {


      const response = <HttpResponse<ResponseModel<Object>>>resp;
      const body = JSON.parse(req.body);

      if (response.status === 200 && req.responseType === 'blob'){
        return resp;
      }

      if (response.body) {
        this._auth.updateToken(response.body.accessToken);
      }

      if (body && body.avoidMsg) {
        return resp;
      }
      // servicio ejecutado correctamente, pero hubo error interno... alerta para todos los servicios en general

      if (response.status === 200 && response.body.status !== statusType.OK) {
        const mjs = `${response.body.status} - ${response.body.error}`;
        this.showModal(mjs);
        throw new HttpErrorResponse({});
      } else {
        return resp;
      }

    });

    return requestObserver;
  }

  showModal (mjs: string) {
    this._notification.create(
      'danger',
      mjs,
      {
        Position: 'top-right',
        Style: 'flip',
        PauseOnHover: true,
        Title: 'Error',
        Duration: 5000
      }
    );
  }
}
