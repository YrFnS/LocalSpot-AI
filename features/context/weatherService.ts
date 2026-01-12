
import { WeatherState, WeatherCondition } from '../../types';

// Mock weather service since we don't have an external API key for weather in this environment.
// This allows the user to simulate different conditions to test the AI's response.

export const getRandomWeather = (): WeatherState => {
    // Determine strict time of day for the icon
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 19;
    
    // Conditions available for random selection (excluding Night, which is time-forced)
    const dayConditions: WeatherCondition[] = ['Sunny', 'Cloudy', 'Foggy', 'Rainy'];
    
    let baseCondition: WeatherCondition = 'Sunny';

    if (isNight) {
        baseCondition = 'Night';
    } else {
        // Simple random weighted towards Sunny/Cloudy for demo purposes
        const rand = Math.random();
        if (rand > 0.8) baseCondition = 'Rainy';
        else if (rand > 0.6) baseCondition = 'Foggy';
        else if (rand > 0.3) baseCondition = 'Cloudy';
        else baseCondition = 'Sunny';
    }
    
    return {
        condition: baseCondition,
        temperature: Math.floor(Math.random() * (25 - 12) + 12), // 12C to 25C range
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
