export interface Order{
    productName:string;
    productNumber:string;
    paymentStatus: 'Due' | 'Refunded' | 'Paid';
    status: 'Pending' | 'Declined' | 'Active'
}