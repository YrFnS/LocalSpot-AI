
import { WeatherState, WeatherCondition } from '../types';

// Mock weather service since we don't have an external API key for weather in this environment.
// This allows the user to simulate different conditions to test the AI's response.

export const getRandomWeather = (): WeatherState => {
    const conditions: WeatherCondition[] = ['Sunny', 'Cloudy', 'Foggy', 'Rainy'];
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 19;
    
    // Weighted random
    const baseCondition = isNight ? 'Night' : conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
        condition: baseCondition,
        temperature: Math.floor(Math.random() * (30 - 10) + 10), // 10C to 30C
        isSimulated: true
    };
};

export const getIconForCondition = (condition: WeatherCondition): string => {
    switch (condition) {
        case 'Sunny': return '☀️';
        case 'Rainy': return '🌧️';
        case 'Cloudy': return '☁️';
        case 'Foggy': return '🌫️';
        case 'Night': return '🌙';
        default: return '🌤️';
    }
};

export const getWeatherDescription = (weather: WeatherState): string => {
    return `${weather.condition}, ${weather.temperature}°C`;
};
