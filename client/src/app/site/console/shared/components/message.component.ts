import { Component, Input, OnChanges } from '@angular/core';
@Component({
  template: `<div class="console-message-value">{{message}}</div><i *ngIf="loading" class="fa fa-spinner fa-spin fa-fw"></i>`,
  styleUrls: ['./../../console.component.scss'],
})
export class MessageComponent implements OnChanges {
  @Input()
  message: string;
  @Input()
  loading: boolean;
  constructor() {}
  ngOnChanges() {}
}
