import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { pagesToggleService } from '../@pages/services/toggler.service';
import * as moment from 'moment';
import { pgDatePickerComponent } from '../@pages/components/datepicker/datepicker.component';
import { BackOfficeService } from '../services/back-office.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { BsModalService } from 'ngx-bootstrap';
import { EditContactComponent } from './edit-contact/edit-contact.component';
import { Subject } from 'rxjs/Subject';
import emailMask from 'text-mask-addons/dist/emailMask';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import { pgSelectComponent } from '../@pages/components/select/select.component';


export const enum tipoQuery {
  'VOCERO' = 1,
  'REFERIDO' = 2,
  'REFERIDOVOCERO' = 3
}


@Component({
  selector: 'app-back-office',
  templateUrl: './back-office.component.html',
  styleUrls: ['./back-office.component.scss'],
  animations: [
    trigger('enterAnimation', [
      state('loading', style({
        opacity: '0',
        transform: 'translateY(8%)'
      })),
      state('ready', style({
        opacity: '1',
        transform: 'translateY(0)'
      })),
      transition('loading => ready', animate('500ms cubic-bezier(0.1, 0.0, 0.2, 1)'))
    ])
  ]
})
export class BackOfficeComponent implements OnInit, AfterViewInit, OnDestroy {

  detailRowHeight = 50;
  rowHeight = 30;
  summaryHeight = 50;
  summaryRow = true;
  lastScannedOffsetY: number;

  optionsFechas = [];
  selectedPeriodo: string;

  _startDate = null;
  _endDate = null;

  textSearchNombre = '';
  textSearchApellido = '';
  textSearchEmail = '';

  mask = {
    telephone: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    name: Array(50).fill(/^[a-zA-Z\s]*$/),
    textSearch: Array(50).fill(/^[a-zA-Z1-9@.\s]*$/),
    password: Array(50).fill(/^[a-zA-Z\s.1-9]*$/),
    emailMask: emailMask
  };

  fechaDeInstance: pgDatePickerComponent;
  fechaAInstance: pgDatePickerComponent;

  porVocero = true;
  porReferido: boolean;
  porReferidoVocero: boolean;

  scrollBarHorizontal = (window.innerWidth < 960);

  showModalInfo: boolean;

  advanceRows: Array<any> = [];
  advanceRowsBck: Array<any> = [];

  messages = {
    emptyMessage: 'No hay registros'
  };

  takeUntil = new Subject();

  @ViewChild('expTable') expTable: DatatableComponent;
  @ViewChild('busquedaNombreText') busquedaNombreText: ElementRef;
  @ViewChild('busquedaApellidoText') busquedaApellidoText: ElementRef;
  @ViewChild('busquedaEmailText') busquedaEmailText: ElementRef;

  expanded: any = {};
  disableSearchField: boolean;

  constructor (public _togglerService: pagesToggleService
    , private _renderer: Renderer2
    , private _backOfficeService: BackOfficeService
    , private _modalService: BsModalService) {
    moment.locale('es');
  }

  ngOnInit () {

    const dateStart = moment(new Date()).subtract(1, 'year');
    const dateEnd = moment(new Date());

    const tmpArray = [];

    while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
      tmpArray.push({
        value: dateStart.format('MM/YYYY'),
        label: dateStart.format('MMMM').toUpperCase() + ' - ' + dateStart.format('YYYY')
      });
      dateStart.add(1, 'month');
    }
    this.optionsFechas = tmpArray.reverse();

    this.selectedPeriodo = dateEnd.format('MM/YYYY');


    this._startDate = moment().startOf('month').toDate();
    this._endDate = moment().subtract(1, 'day').toDate();
    this.getData();

  }

  ngAfterViewInit (): void {
    setTimeout(() => {
      this._togglerService.toggleAnimateEnter(false);
    }, 1000);


    Observable.fromEvent(this.busquedaNombreText.nativeElement, 'input')
    .map((event: any) => event.target.value)
    .debounceTime(500)
    .distinctUntilChanged()
    .takeUntil(this.takeUntil)
    .subscribe(value => this.inputNextEvent(value));

    Observable.fromEvent(this.busquedaApellidoText.nativeElement, 'input')
    .map((event: any) => event.target.value)
    .debounceTime(500)
    .distinctUntilChanged()
    .takeUntil(this.takeUntil)
    .subscribe(value => this.inputNextEvent(value));

    Observable.fromEvent(this.busquedaEmailText.nativeElement, 'input')
    .map((event: any) => event.target.value)
    .debounceTime(500)
    .distinctUntilChanged()
    .takeUntil(this.takeUntil)
    .subscribe(value => this.inputNextEvent(value));

  }

  inputNextEvent(value: string) {

    this.disableSearchField = this.textSearchNombre.length >= 1
      || this.textSearchApellido.length >= 1
      || this.textSearchEmail.length >= 1;

    if (!value.length || value.length >= 3) {
      this.getData();
    }

  }

  ngOnDestroy (): void {
    this._togglerService.toggleAnimateEnter(true);
    this.takeUntil.next(true);
  }

  _startValuePeriodoChange = () => {

    try {
      const currentDate = moment(new Date());
      const [mesSeleccionado, anioSeleccionado] = this.selectedPeriodo.split('/');
      const selectedPeriodo = moment(`${mesSeleccionado}-01-${anioSeleccionado}`, 'MM-DD-YYYY');

      this._startDate = selectedPeriodo.toDate();

      if (selectedPeriodo.get('month') === currentDate.get('month')) {
        this._endDate = moment().subtract(1, 'day').toDate();
      } else {
        this._endDate = selectedPeriodo.endOf('month').toDate();
      }

      this.getData();

    } catch (e) {

    }
  }

  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
      return;
    }
    this.getData();
  }

  _endValueChange = () => {
    if (this._startDate > this._endDate) {
      this._startDate = null;
      return;
    }
    this.getData();
  }

  _disabledStartDate = (startValue) => {
    if (!startValue || !this._endDate) {
      return false;
    }
    return startValue.getTime() >= this._endDate.getTime();
  }

  _disabledEndDate = (endValue) => {
    if (!endValue || !this._startDate) {
      return false;
    }
    return endValue.getTime() <= this._startDate.getTime();
  }

  changeAgrup () {
    this.getData();
  }


  getData () {

    const type = this.porVocero ? tipoQuery.VOCERO : this.porReferido ? tipoQuery.REFERIDO : tipoQuery.REFERIDOVOCERO;

    const endDate = moment(this._endDate).format('YYYY-MM-DD');
    const startDate = moment(this._startDate).format('YYYY-MM-DD');
    const textSearchNombre = this.textSearchNombre;
    const textSearchApellido = this.textSearchApellido;
    const textSearchEmail = this.textSearchEmail;
    const request = {type, endDate, startDate, textSearchNombre, textSearchApellido, textSearchEmail};

    this._backOfficeService.getRegByType(request).subscribe(
      resp => {
        this.advanceRows = resp.map(reg => ({...reg, CompleteName: `${reg.Name} ${reg.LastName}`}));
      }
    );
  }


  detailsContacto (row) {
    console.log(row);

    const {IdCustomer, IdCustomerType} = row;

    const request = {
      IdCustomer,
      IdCustomerType
    };

    this._backOfficeService.getDependants(request).subscribe(
      resp => {

        const initialState = {
          contact: row,
          dependants: resp
        };

        this._modalService.onHide.take(1).takeUntil(this.takeUntil).subscribe(() => {
          this.advanceRows = [...this.advanceRows.map(reg => ({...reg, CompleteName: `${reg.Name} ${reg.LastName}`}))];
        });

        this._modalService.show(EditContactComponent, {'class': 'modal-xl', initialState});
      }
    );

  }

  getRowHeight (row) {
    if (!row) {
      return 50;
    }
    if (row.height === undefined) {
      return 50;
    }
    return row.height;
  }

  exportData () {

    const endDate = moment(this._endDate).format('YYYY-MM-DD');
    const startDate = moment(this._startDate).format('YYYY-MM-DD');

    const request = {endDate, startDate};

    this._backOfficeService.excelExport(request).subscribe(
      resp => {

      }
    );
  }

  changeBuyState (row: any) {

    const request = {
      updateStack: [row]
    };

    this._backOfficeService.saveEditDependants(request).subscribe(
      resp => {
        this._togglerService._messageBridge.next({
          type: 'success', msg: 'Información Actualizada',
          options: {
            Position: 'top-right',
            Style: 'simple',
            PauseOnHover: true,
            Title: 'Exito',
            Duration: 5000
          }
        });
      }
    );

  }

}
