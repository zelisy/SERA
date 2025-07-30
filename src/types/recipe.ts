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
  producerTC: string;
  producerPhone: string;
  producerAddress: string;
  producerDecare: string;
  createdAt: string;
  fertilizationApplications: FertilizationApplication[];
  topFeedingApplications: TopFeedingApplication[];
  greenhouseControls: GreenhouseControls;
  weatherForecast: WeatherForecast[];
  consultantNotes: ConsultantNote[];
} 