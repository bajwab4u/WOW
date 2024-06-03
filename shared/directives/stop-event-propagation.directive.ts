import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[wowStopEventPropagation]'
})
export class StopEventPropagationDirective {

	constructor() { }
	@HostListener("click", ["$event"])
	public onClick(event: any): void {
		event.stopPropagation();
	}
}
