export interface IEmployerBalance
{
    balance: string;
    lastTransactionDate: string;
}

export interface ICardsRes
{
    firstName: string;
    lastName: string;
    address: string;
    zipCode: string;
    cardNo: string;
    cardIssueNo: string;
    cardType: string;
    expirationDate: string;
    paymentProfileID: string;
    amount: number;
    accountName: string;
    selected?: boolean;
    defaultCard?: boolean;
    id: any;
}