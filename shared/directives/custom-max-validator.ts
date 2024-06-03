import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validators, FormControl } from '@angular/forms';

@Directive ({
    selector: '[customMax][formControlName], [customMax][formControl], [customMax][ngModel]',
    providers: [{provide: NG_VALIDATORS, useExisting: CustomMaxValidator, multi: true}]
})



export class CustomMaxValidator implements Validators {
    @Input() customMax: string;
    
    validate(c: FormControl): {[key: string]: any} {
        let v = Number(c.value);
        console.log("custom validator", v,this.customMax)
        if(v > Number(this.customMax)){
            console.log('true')
        }
        return ( v > Number(this.customMax)) ? {"customMax": true} : null;
    }
}
