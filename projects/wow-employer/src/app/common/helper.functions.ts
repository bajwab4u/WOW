export class EmployerHelper 
{
    public static cardImage(type: string): string
    {
        if (type) {
            type = type.toLowerCase().replace(/ /g, '');
            if(type == 'mastercard') type = 'MasterCard';
            if(type == 'jcb') type = 'JCB';
            return 'assets/images/cards/'+type+'.svg';
        }
    }
}