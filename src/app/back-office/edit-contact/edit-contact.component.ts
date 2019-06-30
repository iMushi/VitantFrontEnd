import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactModel } from '../../models/contact.model';
import emailMask from 'text-mask-addons/dist/emailMask';
import { BackOfficeService } from '../../services/back-office.service';
import { pagesToggleService } from '../../@pages/services/toggler.service';
import { tipoQuery } from '../back-office.component';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.scss']
})
export class EditContactComponent implements OnInit {

  @Input() contact: ContactModel;
  @Input() dependants: Array<ContactModel>;

  formaPagoForm: FormGroup;

  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  phonePatter = '^\d{10,14}$';

  editing: any = {};
  scrollBarHorizontal = (window.innerWidth < 960);
  rowHeight = 30;
  referidoPor: string;

  updateStack: Array<ContactModel> = [];

  mask = {
    telephone: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    name: Array(50).fill(/^[a-zA-Z\s]*$/),
    password: Array(50).fill(/^[a-zA-Z\s.1-9]*$/),
    emailMask: emailMask
  };

  constructor (public _togglerService: pagesToggleService, private _bsRef: BsModalRef, private _backOfficeService: BackOfficeService) {
  }

  closeModal () {
    this._bsRef.hide();
  }


  ngOnInit () {

    const controlsArray = {};

    Object.keys(this.contact).forEach(key => {
      Object.assign(controlsArray, {[key]: new FormControl('', Validators.required)});
    });

    this.formaPagoForm = new FormGroup(controlsArray);
    this.formaPagoForm.setValue({...this.contact});

    if (this.contact.IdCustomerType === tipoQuery.REFERIDO) {
      const [refferal] = this.dependants;
      this.referidoPor = `${refferal.Name} ${refferal.LastName}`;
    }
  }


  updateValue (event, cell, rowIndex) {

    try{
      this.editing[rowIndex + '-' + cell] = false;
    }catch (e) {}

    this.dependants[rowIndex][cell] = event.target.value;
    this.dependants = [...this.dependants.map(reg => ({...reg, CompleteName: `${reg.Name} ${reg.LastName}`}))];

    const updatedInfo = {...this.dependants[rowIndex]};
    const toUpdateStack = this.updateStack.findIndex(reg => reg.IdCustomer === updatedInfo.IdCustomer);

    if (toUpdateStack !== -1) {
      this.updateStack[toUpdateStack] = updatedInfo;
    } else {
      this.updateStack.push(updatedInfo);
    }

  }

  saveData () {

    const newUpdateStack = [
      ...this.updateStack,
      this.contact
    ];

    const request = {
      updateStack: newUpdateStack
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
        this.closeModal();
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
}
