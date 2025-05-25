export interface Order {
  id: string;
  userName: string;
  userImage?: string;
  jobTitle: string;
  company: string;
  rate: number;
  rateType: 'hour' | 'day';
  status: 'Pending' | 'Declined' | 'Active';
}

export const orders: Order[] = [
  {
      id: '1',
      userName: 'John Doe',
      userImage: '/src/lib/assets/images/Alex Gonley.jpg',
      jobTitle: 'English Teacher',
      company: 'Cambridge International School',
      rate: 25,
      rateType: 'hour',
      status: 'Pending'
  },
  {
      id: '2',
      userName: 'Sarah Wilson',
      userImage: '/src/lib/assets/images/Sarita Limbu.jpg',
      jobTitle: 'Mathematics Teacher',
      company: 'St. Mary High School',
      rate: 200,
      rateType: 'day',
      status: 'Active'
  },
  {
      id: '3',
      userName: 'Mike Johnson',
      userImage: '/src/lib/assets/images/Zinzu Chan Lee.jpg',
      jobTitle: 'Physics Teacher',
      company: 'International Grammar School',
      rate: 30,
      rateType: 'hour',
      status: 'Declined'
  },
  {
    id: '4',
    userName: 'Mike Johnson',
    userImage: '/src/lib/assets/images/Jeet Saru.jpg',
    jobTitle: 'Physics Teacher',
    company: 'International Grammar School',
    rate: 30,
    rateType: 'hour',
    status: 'Declined'
},
{
  id: '5',
  userName: 'Mike Johnson',
  userImage: '/src/lib/assets/images/Jeet Saru.jpg',
  jobTitle: 'Physics Teacher',
  company: 'International Grammar School',
  rate: 30,
  rateType: 'hour',
  status: 'Declined'
}
];