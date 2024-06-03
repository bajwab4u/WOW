import { Directive, ElementRef, HostListener, HostBinding, Input } from '@angular/core';


@Directive({
	selector: '[wowLeftborderColored]'
})
export class LeftborderColoredDirective {

	@Input() borderleftcolor: string;
	@HostBinding('style.borderLeftColor') get getBorderColor() {
		if (this.borderleftcolor !== 'none') {
			return this.borderleftcolor;
		} else {
			return "transparent";
		}
	}
	constructor(private el: ElementRef) { }

}
