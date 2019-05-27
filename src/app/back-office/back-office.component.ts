import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { pagesToggleService } from '../@pages/services/toggler.service';
import * as moment from 'moment';
import { pgDatePickerComponent } from '../@pages/components/datepicker/datepicker.component';
import { BackOfficeService } from '../services/back-office.service';


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


  rowHeight = 30;
  summaryHeight = 50;
  summaryRow = true;
  lastScannedOffsetY: number;

  optionsFechas = [];
  selectedPeriodo: string;

  _startDate = null;
  _endDate = null;

  fechaDeInstance: pgDatePickerComponent;
  fechaAInstance: pgDatePickerComponent;

  porVocero = true;
  porReferido: boolean;
  porReferidoVocero: boolean;

  scrollBarHorizontal = (window.innerWidth < 960);

  showModalInfo: boolean;

  advanceRows: Array<any> = [];
  advanceRowsBck: Array<any> = [];

  constructor (public _togglerService: pagesToggleService
    , private _renderer: Renderer2
    , private _backOfficeService: BackOfficeService) {
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

  }

  ngAfterViewInit (): void {
    setTimeout(() => {
      this._togglerService.toggleAnimateEnter(false);
    }, 1000);
  }

  ngOnDestroy (): void {
    this._togglerService.toggleAnimateEnter(true);
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

    } catch (e) {

    }
  }

  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }

  }

  _endValueChange = () => {
    if (this._startDate > this._endDate) {
      this._startDate = null;
    }

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

    const type = this.porVocero ? 1 : this.porReferido ? 2 : 3;

    const request = {
      type
    };

    this._backOfficeService.getRegByType(request).subscribe(
      resp => {
        console.log(resp);
      }
    );

  }


  tableScroll (event) {

    if (!this.showModalInfo) {
      const {offsetY} = event;
      const totalH = (this.advanceRows.length * this.rowHeight); // altura Total;
      const totalAllowed = totalH; //+ this.summaryHeight;

      const element = document.querySelector('datatable-summary-row');
      let heightToSet = 330 + offsetY;

      if (heightToSet + this.summaryHeight >= totalH && heightToSet <= totalH) {
        heightToSet += 5;
      }

      heightToSet = heightToSet > totalAllowed ? totalAllowed : heightToSet;


      try {
        this._renderer.setStyle(element, 'transform', 'translate3d(0px,' + heightToSet + 'px, 0px)');
        this.lastScannedOffsetY = offsetY;
      } catch (e) {
        // aun no se renderea el summary
      }
    }

  }

}
