export interface FertilizationApplication {
  id: string;
  time: string;
  date: string;
  waterAmount: string;
  duration: string;
  products: Product[];
}

export interface TopFeedingApplication {
  id: string;
  time: string;
  date: string;
  products: Product[];
}

export interface Product {
  name: string;
  quantity: string;
}

export interface GreenhouseControls {
  temperature: string;
  humidity: string;
  waterEC: string;
  waterPH: string;
  rootProblem: boolean;
  vegetativeProblem: boolean;
  generativeProblem: boolean;
  averageBrix: string;
  averageChlorophyll: string;
  averageLight: string;
}

export interface WeatherForecast {
  day: string;
  icon: string;
  minTemp: string;
  maxTemp: string;
}

export interface ConsultantNote {
  id: string;
  note: string;
}

export interface Recipe {
  id: string;
  producerId: string;
  producerName: string;
  fertilization1: string;
  fertilization2: string;
  fertilization3: string;
  topFeeding: string;
  notes: string;
  weatherData: WeatherData[];
  selectedSeraKontrolData?: any;
  tuzakBilgileri?: string;
  zararlıBilgileri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  date: string;
  day: string;
  icon: string;
  minTemp: number;
  maxTemp: number;
  description: string;
}

export interface CreateRecipeData {
  producerId: string;
  producerName: string;
  fertilization1: string;
  fertilization2: string;
  fertilization3: string;
  topFeeding: string;
  notes: string;
  selectedSeraKontrolId?: string;
  selectedSeraKontrolData?: any;
  tuzakBilgileri?: string;
  zararlıBilgileri?: string;
  weatherData: WeatherData[];
} 