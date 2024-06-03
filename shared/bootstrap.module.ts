import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TagInputModule } from 'ngx-chips';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ToastrModule } from 'ng6-toastr-notifications';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import { NgMultiSelect9DropDownModule } from 'ng-multiselect-dropdown9';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,

        NgbModule,
        TagInputModule,
        NgbModalModule,
        NgxPaginationModule,
        ImageCropperModule,
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        TimepickerModule.forRoot(),
        Daterangepicker,
        NgxMaskModule.forRoot(),
        ProgressbarModule.forRoot(),
        NgMultiSelect9DropDownModule.forRoot(),
        Angular2PromiseButtonModule.forRoot({
            // your custom config goes here
            spinnerTpl: '<span class="btn-spinner"></span>',
            // disable buttons when promise is pending
            disableBtn: true,
            // the class used to indicate a pending promise
            btnLoadingClass: 'is-loading',
            // only disable and show is-loading class for clicked button,
            // even when they share the same promise
            handleCurrentBtnOnly: false,
        }),
    ],
    exports: [
        NgbModule,
        TagInputModule,
        NgbModalModule,
        NgxPaginationModule,
        ToastrModule,
        TooltipModule,
        PopoverModule,
        TimepickerModule,
        NgMultiSelect9DropDownModule,
        Angular2PromiseButtonModule,
        Daterangepicker,
        ProgressbarModule,
        NgxMaskModule,
        ImageCropperModule
    ],
    providers: [
        PopoverModule
    ]
})
export class SharedBootstrapModule { }
