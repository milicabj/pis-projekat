export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category:{
    _id: string;
    name: string;
  };
  manufacturer?: {
    _id: string;
    name: string;
  };
}
