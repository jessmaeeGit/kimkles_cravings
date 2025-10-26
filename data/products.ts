import { Category, Product } from '../store/types';

export const CATEGORIES: Category[] = ['Brownies', 'Cookies', 'Crinkles'];

export const PRODUCTS: Product[] = [
  { id: 'brow-01', name: 'Plain Brownies', price: 380, category: 'Brownies', available: true, image: require('../images/brownies/Plain Brownie Cake.png') },
  { id: 'brow-02', name: 'Birthday Brownies', price: 420, category: 'Brownies', available: true, image: require('../images/brownies/Birthday Brownies.png') },
  { id: 'cook-01', name: 'Classic Choco', price: 35, category: 'Cookies', available: true, image: require('../images/cookies/Classic Choco.png') },
  { id: 'cook-02', name: 'White Matcha', price: 35, category: 'Cookies', available: true, image: require('../images/cookies/White Matcha.png') },
  { id: 'crin-01', name: 'Plain Kimkles', price: 11, category: 'Crinkles', available: true, image: require('../images/crinkles/Plain Kimkles.png') },
  { id: 'crin-02', name: 'Kimkles Creamcheese', price: 35, category: 'Crinkles', available: true, image: require('../images/crinkles/Kimkles Creamcheese.png') },
  { id: 'cook-03', name: 'Sampler Box (5pcs)', price: 200, category: 'Cookies', available: true, image: require('../images/cookies/Sampler Box.png') },
];
