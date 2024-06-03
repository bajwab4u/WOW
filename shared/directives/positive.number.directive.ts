import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[wowOnlyNumbers]',
})
export class WOWPositveNumberDirective {
  @Input('wowOnlyNumbers') isDecimal: boolean;

  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  private specialKeys: Array<string> = [
    'Backspace',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'Control',
    'V',
    'v'
  ];

  constructor(private el: ElementRef) {
    this.isDecimal = false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.regex = this.isDecimal
      ? new RegExp(/^\d*\.?\d{0,2}$/g)
      : new RegExp(/^[0-9]*$/g);
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: any) {
    let onlyNumbers = '';
    let text = event?.clipboardData.getData('Text');
    for (let i = 0; i < text.length; i++) {
      switch (text[i]) {
        case '0':
          onlyNumbers += text[i];
          break;
        case '1':
          onlyNumbers += text[i];
          break;
        case '2':
          onlyNumbers += text[i];
          break;
        case '3':
          onlyNumbers += text[i];
          break;
        case '4':
          onlyNumbers += text[i];
          break;
        case '5':
          onlyNumbers += text[i];
          break;
        case '6':
          onlyNumbers += text[i];
          break;
        case '7':
          onlyNumbers += text[i];
          break;
        case '8':
          onlyNumbers += text[i];
          break;
        case '9':
          onlyNumbers += text[i];
          break;
        case '-':
          onlyNumbers += text[i];
          break;
        default:
          console.log('Not a valid pasteable character :=> ', text[i]);
          break;
      }
    }
    let len: number = parseInt((this.el.nativeElement as HTMLElement).getAttribute('maxlength'),10);
    (this.el.nativeElement as HTMLInputElement).value = onlyNumbers.substring(0,len);
    event.preventDefault();
  }
}
