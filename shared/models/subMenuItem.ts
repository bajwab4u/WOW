export interface SubMenuItem {
    name: string;
    tooltipcontent: string;
    tooltipPosition?: 'top' | 'bottom' | 'right' | 'left';
    bordercolor: string;
    url?: string;
    id?: number;
    showCount?: boolean;
    count?: number;
    countColor?: string;
}

