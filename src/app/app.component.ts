import { Component, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subscription, timer } from 'rxjs';

import { AsyncStatus } from '@bugtamer/async-status/lib/async-status';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  processAsyncStatus!: AsyncStatus;

  readonly initialDelay = 1_000;
  readonly delayControl = new UntypedFormControl(this.initialDelay);
  message!: string;
  elapsedTime!: number;
  private subscription!: Subscription;


  constructor() {
    this.newAsyncStatus();
  }


  async process(): Promise<void> {
    const simulatedProcessDuration = this.delayControl.value || this.initialDelay;
    try {
      this.processAsyncStatus.start();
      this.updateElapsedTime();
      this.message = 'Running';
      this.subscription = timer(simulatedProcessDuration).subscribe(
        value => {
          this.subscription.unsubscribe();
          this.message = 'Successfully ended';
          this.processAsyncStatus.end();
          this.updateElapsedTime();
        }
      );
    } catch (error) {
      this.subscription.unsubscribe();
      const fixRequired = '"disabled" property of the Run process button should be fixed to avoid this error.'
      this.message = `${error} ${fixRequired}`;
      this.updateElapsedTime();
    }
  }


  abort(): void {
    if (!!this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
      this.message = `Aborted`;
      this.processAsyncStatus.abort();
      this.updateElapsedTime();
    }
  }


  updateElapsedTime(): void {
    this.elapsedTime = this.processAsyncStatus.elapsedTime;
  }


  reset(): void {
    this.processAsyncStatus.resetAttemptStats();
    this.message = 'Reset';
    this.updateElapsedTime();
  }


  newAsyncStatus(): void {
    this.processAsyncStatus = new AsyncStatus();
    this.message = '"processAsyncStatus" instantiation';
    this.updateElapsedTime();
  }

}
