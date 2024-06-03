import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


export class SharedCustomValidator {

	static cannotContainSpace(control: AbstractControl): ValidationErrors | null {
		if ((control.value as string).indexOf(' ') >= 0) {
			return { cannotContainSpace: true }
		}

		return null;
	}

	static sameNameValidator(controlValue: string, data: any[], key: string, idx: number, matchIdx: boolean = true) {
		let hasError: boolean = false;
		if (controlValue) controlValue = controlValue.toLowerCase().trim();

		data.forEach((row, index) => {
			let compVal = row[key];
			if (compVal) compVal = compVal.toLowerCase().trim();

			if (matchIdx) {
				if (index !== idx && controlValue === compVal) {
					hasError = true;
				}
			}
			else {
				if (controlValue === compVal) {
					hasError = true;
				}
			}

		});

		return hasError ? { isError: true } : null;
	}

	static validPhoneFormat(control: AbstractControl) : ValidationErrors | null {

		const value = control.value as string;

        if (value && value.length > 0 && value.length < 10) {
            return { inValidFormat: true }
        }
  
        return null;
    }
}
