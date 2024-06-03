import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { SharedCustomValidator } from "shared/common/custom.validators";


export class CustomValidator
{

    static cannotContainSpace(control: AbstractControl) : ValidationErrors | null {
        return SharedCustomValidator.cannotContainSpace(control);
    }

	static sameNameValidator(controlValue: string, data: any[], key: string, idx: number) 
	{
		return SharedCustomValidator.sameNameValidator(controlValue, data, key, idx);
    }
}
