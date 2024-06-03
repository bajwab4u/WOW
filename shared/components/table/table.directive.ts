import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';


@Directive({selector: '[dataTableCell]'})
export class DataTableCellDirective
{
    @Input() dataTableCell: string;
    constructor(public templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef)
    { }
}