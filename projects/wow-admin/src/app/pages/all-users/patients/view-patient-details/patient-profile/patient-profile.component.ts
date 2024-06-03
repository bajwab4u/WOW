import { IPatient } from 'projects/wow-admin/src/app/models/patient.model';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'wow-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent {
  private _unsubscribeAll: Subject<any>;
  @Input() selectedPatient: IPatient;
  @Output() signals: EventEmitter<ISignal>;

  form: FormGroup;
  imageUrl: string;

  constructor(private formBuilder: FormBuilder,
      private sharedService: WOWCustomSharedService) {
      this.form = this.formBuilder.group({});
      this.imageUrl = '';

      this.signals = new EventEmitter();
      this._unsubscribeAll = new Subject();

  }

  ngOnInit(): void {
      this.initializeForm();
      this.imageUrl = this.selectedPatient.logoPath;
  }

  ngOnDestroy(): void {
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
  }

  initializeForm(): void {
      this.form.addControl('firstName', new FormControl(null));
      this.form.addControl('lastName', new FormControl(null));
      this.form.addControl('email', new FormControl(null));
      this.form.addControl('phoneMobile', new FormControl(null));
      this.form.patchValue(this.selectedPatient);
  }

  onChangeImage(ev): void {
      if (ev && ev.hasOwnProperty('logoPath')) {
          this.selectedPatient.logoPath = ev.logoPath;
          this.imageUrl = ev['fileUrl'];
          this.form.markAsDirty();
          this.sharedService.unsavedChanges = true;
      }
  }
}
