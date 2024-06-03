import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from './toastr.service';
import { HttpCancelService } from './httpcancelservice';
import { LoaderService } from './loaderService';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [],
	providers: [
		LoaderService,
		ToastrService,
		HttpCancelService
	]
})
export class CoreModule { }
