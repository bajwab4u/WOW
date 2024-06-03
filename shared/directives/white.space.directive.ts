import { Directive, ElementRef, HostListener, Input } from '@angular/core';


@Directive({
	selector: '[wowWhiteSpaceAllowed]'
})
export class WOWWhiteSpaceAllowedDirective {

	@Input('wowWhiteSpaceAllowed') isWhiteSpaceAllowed: boolean;

	private regex: RegExp = new RegExp(/.*\\s{2}.*/g);
	private specialKeys: Array<string> = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];

	constructor(private el: ElementRef) 
	{
		this.isWhiteSpaceAllowed = true;
	}
	
	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {

		if (this.isWhiteSpaceAllowed) {
			const current: string = this.el.nativeElement.value;
			const next: string = current.concat(event.key);
			if (next) {
				this.el.nativeElement.value = next.replace(/\s+/g, ' ').trim();
				// console.log('OnKeydown => ', this.el.nativeElement.value, this.el.nativeElement)
				// event.preventDefault();
			}
		}
		else {
			const character = event ? event.which : event.keyCode;
    		if (character == 32) return false;
		}
	}

}
