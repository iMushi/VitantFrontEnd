import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pg-menu-icon',
  templateUrl: './menu-icon.component.html',
  styleUrls: ['./menu-icon.component.scss'],
  host: {
    '[class]': '_classMap'
  }
})
export class MenuIconComponent implements OnInit {
  _classMap: string;
  _orginalClass = 'icon-thumbnail ';
  @Input() IconType: string;
  @Input() IconName: string;

  constructor () {
    this._classMap = 'icon-thumbnail ';
  }

  @Input()
  set ExtraClass (value: string) {
    if (value !== undefined) {
      this._classMap = this._orginalClass + value;
    }
  }

  ngOnInit () {
  }

}
