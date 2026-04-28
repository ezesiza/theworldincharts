import { Injectable } from '@angular/core';
import { PanoramaScene } from '../models/panorama.model';

@Injectable({ providedIn: 'root' })
export class PanoramaDataService {
  readonly scenes: PanoramaScene[] = [
    {
      name: 'Tokyo Street',
      description: 'Busy street in Tokyo with neon signs',
      url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=4194&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=100&fit=crop&crop=center',
      fallbackColors: ['#1a1a2e', '#16213e'],
    },
    {
      name: 'Mountain Lake',
      description: 'Peaceful mountain lake with clear water',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=100&fit=crop&crop=center',
      fallbackColors: ['#1e3a8a', '#0ea5e9'],
    },
    {
      name: 'Forest Path',
      description: 'Sunlit path through a dense forest',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&h=100&fit=crop&crop=center',
      fallbackColors: ['#064e3b', '#059669'],
    },
    {
      name: 'Desert Sunset',
      description: 'Beautiful sunset over sand dunes',
      url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=3026&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&h=100&fit=crop&crop=center',
      fallbackColors: ['#7c2d12', '#f59e0b'],
    },
    {
      name: 'Northern Lights',
      description: 'Aurora borealis over snowy landscape',
      url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=200&h=100&fit=crop&crop=center',
      fallbackColors: ['#1e1b4b', '#3730a3'],
    },
    {
      name: 'Ocean Waves',
      description: 'Powerful ocean waves crashing on rocks',
      url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=100&fit=crop&crop=center',
      fallbackColors: ['#1e3a8a', '#06b6d4'],
    },
  ];
}
