import { City } from './types';

export const CITIES: City[] = [
  {
    id: 1,
    name: 'Washington, D.C.',
    position: [38.9072, -77.0369],
    description: 'The capital of the United States.'
  },
  {
    id: 2,
    name: 'London',
    position: [51.5074, -0.1278],
    description: 'The capital of the United Kingdom.'
  },
  {
    id: 3,
    name: 'Beijing',
    position: [39.9042, 116.4074],
    description: 'The capital of China.'
  },
  {
    id: 4,
    name: 'Moscow',
    position: [55.7558, 37.6173],
    description: 'The capital of Russia.'
  },
  {
    id: 5,
    name: 'Brasília',
    position: [-15.8267, -47.9218],
    description: 'The capital of Brazil.'
  },
  {
    id: 6,
    name: 'Cairo',
    position: [30.0444, 31.2357],
    description: 'The capital of Egypt.'
  },
  {
    id: 7,
    name: 'Canberra',
    position: [-35.2809, 149.1300],
    description: 'The capital of Australia.'
  }
];

// A larger, more diverse color palette for political allegiances
export const COLOR_PALETTE = [
  '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6',
  '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3',
  '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#fdb462', '#bebada', '#fb8072', '#80b1d3',
  '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'
];