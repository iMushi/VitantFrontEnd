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
import { ResponseModel } from '../models/Response.model';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  DEFAULT_TIMEOUT = 180000;


  constructor () {

  }

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const timeout = Number(req.headers.get('timeout')) || this.DEFAULT_TIMEOUT;

    const headers = {
      'Content-Type': 'application/json'
    };

    const dummyrequest = req.clone({
      setHeaders: headers,
      withCredentials: true
    });


    const requestObserver = next.handle(dummyrequest).timeout(timeout).do(() => {
    }, err => {


      if (err instanceof HttpErrorResponse) {
      }
      if (err instanceof TimeoutError) {
      }

    }).map(resp => {


      const response = <HttpResponse<ResponseModel<Object>>>resp;
      const body = JSON.parse(req.body);

      return resp;
    });

    return requestObserver;
  }

}
