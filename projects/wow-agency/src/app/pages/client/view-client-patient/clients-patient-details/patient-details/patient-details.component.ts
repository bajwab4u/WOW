import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'wow-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit {

  @Input() selectedRow: any;
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.init();
    console.log("row =>", this.selectedRow)
    this.form.patchValue(this.selectedRow);
    this.form.controls.name.setValue(this.selectedRow?.firstName + ' ' + this.selectedRow?.lastName)
  }

  init(): void {
    this.form.addControl('name', new FormControl(null, []));
    this.form.addControl('phoneNumber', new FormControl(null, []));
    this.form.addControl('email', new FormControl(null, []));
  }

}
