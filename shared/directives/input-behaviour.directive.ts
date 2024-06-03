import { Directive, Input, HostBinding, ElementRef } from '@angular/core';

@Directive({
	selector: '[wowInputBehaviour]'
})
export class InputBehaviourDirective {
	@Input() type = 'none';
	@HostBinding('class') get getBorderColor() {
		if (this.type === 'none') {
			return 'regularfield';
		} else if (this.type === 'focusout') {
			return "focusedfield";
		}
		else {
			return "hoveronfield";
		}
	}
	constructor(private el: ElementRef) { }

}
