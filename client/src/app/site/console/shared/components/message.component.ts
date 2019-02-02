import { Component, Input } from '@angular/core';
@Component({
  template: `<div class="console-message-value" [class.result-string]="!isCommand">{{message}}</div><i *ngIf="loading" class="fa fa-spinner fa-spin fa-fw"></i>`,
  styleUrls: ['./../../console.component.scss', './../../basic-console.component.scss'],
})
export class MessageComponent {
  @Input()
  message: string;
  @Input()
  loading: boolean;
  @Input()
  isCommand: boolean;
  constructor() {}
}
