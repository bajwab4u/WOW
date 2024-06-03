import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlphabetFilterModule } from 'alphabet-filter';

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { SharedBootstrapModule } from './bootstrap.module';
import { ConfirmDialogComponent } from './components/alert/confirm.component';
import { AssignStafforServiceComponent } from './components/assign-staffor-service/assign-staffor-service.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LoginDevComponent } from './components/login/login-dev/login.dev.component';
import { WOWLoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PaginationComponent } from './components/pagination-control/pagination.component';
import { SearchFormComponent } from './components/search-control/search.form.component';
import { SharedMapComponent } from './components/shared-map/shared-map.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { SupportComponent } from './components/support/support.component';
import { DataTableCellDirective } from './components/table/table.directive';
import { WOWTableComponent } from './components/table/table.component';
import { WOWTabGroupComponent } from './components/tabs/tab-group/tab.group.component';
import { WOWTabItemComponent } from './components/tabs/tab-item/tab.item.component';
import { WOWTimePickerControlComponent } from './components/time-picker/time.picker.control.component';
import { EqualValidator } from './directives/equal-validator.directive';
import { InputBehaviourDirective } from './directives/input-behaviour.directive';
import { LeftborderColoredDirective } from './directives/leftborder-colored.directive';
import { WOWPositveNumberDirective } from './directives/positive.number.directive';
import { StopEventPropagationDirective } from './directives/stop-event-propagation.directive';
import { WOWWhiteSpaceAllowedDirective } from './directives/white.space.directive';
import { LayoutModule } from './modules/layout/layout.module';
import { AutoCompleteComponent } from './components/auto-complete/auto.complete.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { WOWMonthPickerControlComponent } from './components/month-picker/month.picker.control.component';
import { CustomMaxValidator } from './directives/custom-max-validator';
import { FilePickerComponent } from './components/file-picker/file.component';
import { ImageCropperPickerComponent } from './components/file-picker/image-cropper/image.cropper.component';
import { AppendPercentageDirective } from './directives/append-percentage.directive';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		OverlayModule,
		PortalModule,

		AlphabetFilterModule,

		SharedBootstrapModule,
		LayoutModule
	],

	declarations: [
		ChangePasswordComponent,
		PageNotFoundComponent,
		StopEventPropagationDirective,
		EqualValidator,
		LoaderComponent,
		SubMenuComponent,
		LeftborderColoredDirective,
		AssignStafforServiceComponent,
		InputBehaviourDirective,
		WOWPositveNumberDirective,
		WOWWhiteSpaceAllowedDirective,
		SharedMapComponent,
		SearchFormComponent,
		ConfirmDialogComponent,
		WOWTimePickerControlComponent,
		WOWLoginComponent,
		SupportComponent,
		LoginDevComponent,
		PaginationComponent,
		WOWTabGroupComponent,
		WOWTabItemComponent,
		WOWTableComponent,
		DataTableCellDirective,
		AutoCompleteComponent,
		ProfileSettingsComponent,
		WOWMonthPickerControlComponent,
		CustomMaxValidator,
		FilePickerComponent,
		ImageCropperPickerComponent,
		AppendPercentageDirective
	],
	exports: [
		CommonModule,
		FormsModule,
		LayoutModule,
		PageNotFoundComponent,
		LoaderComponent,
		StopEventPropagationDirective,
		EqualValidator,
		ChangePasswordComponent,
		SubMenuComponent,
		LeftborderColoredDirective,
		AssignStafforServiceComponent,
		AlphabetFilterModule,
		InputBehaviourDirective,
		SharedMapComponent,
		SearchFormComponent,
		ConfirmDialogComponent,
		WOWTimePickerControlComponent,
		WOWPositveNumberDirective,
		WOWWhiteSpaceAllowedDirective,
		WOWLoginComponent,
		SupportComponent,
		LoginDevComponent,
		PaginationComponent,
		WOWTabGroupComponent,
		WOWTabItemComponent,
		WOWTableComponent,
		DataTableCellDirective,
		AutoCompleteComponent,
		ProfileSettingsComponent,
		WOWMonthPickerControlComponent,
		CustomMaxValidator,
		FilePickerComponent,
		ImageCropperPickerComponent,
		AppendPercentageDirective
	],
	entryComponents: [
		SharedMapComponent
	],
	providers: []
})
export class RootSharedModule { }
