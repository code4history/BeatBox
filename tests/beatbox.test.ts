import { describe, it, expect } from 'vitest';
import { BeatBox } from '../src/index';

describe('BeatBox', () => {
  describe('parseMapboxUrl', () => {
    it('should parse style URLs', () => {
      const beatbox = new BeatBox();
      const result = beatbox.parseMapboxUrl('mapbox://styles/mapbox/streets-v11');
      
      expect(result).toEqual({
        type: 'styles',
        username: 'mapbox',
        id: 'streets-v11'
      });
    });

    it('should parse sprite URLs', () => {
      const beatbox = new BeatBox();
      const result = beatbox.parseMapboxUrl('mapbox://sprites/mapbox/streets-v11');
      
      expect(result).toEqual({
        type: 'sprites',
        username: 'mapbox',
        id: 'streets-v11'
      });
    });

    it('should parse font URLs', () => {
      const beatbox = new BeatBox();
      const result = beatbox.parseMapboxUrl('mapbox://fonts/mapbox/Arial Unicode MS Bold/0-255.pbf');
      
      expect(result).toEqual({
        type: 'fonts',
        username: 'mapbox',
        fontstack: 'Arial Unicode MS Bold',
        range: '0-255'
      });
    });

    it('should parse simple tile URLs', () => {
      const beatbox = new BeatBox();
      const result = beatbox.parseMapboxUrl('mapbox://tiles/mapbox.mapbox-streets-v8');
      
      expect(result).toEqual({
        type: 'tiles',
        id: 'mapbox.mapbox-streets-v8'
      });
    });

    it('should parse tile URLs with coordinates', () => {
      const beatbox = new BeatBox();
      const result = beatbox.parseMapboxUrl('mapbox://tiles/mapbox.satellite/1/0/0.jpg');
      
      expect(result).toEqual({
        type: 'tiles',
        id: 'mapbox.satellite',
        z: 1,
        x: 0,
        y: 0,
        format: 'jpg',
        highDpi: false
      });
    });

    it('should parse high-DPI tile URLs', () => {
      const beatbox = new BeatBox();
      const result = beatbox.parseMapboxUrl('mapbox://tiles/mapbox.satellite/1/0/0@2x.png');
      
      expect(result).toEqual({
        type: 'tiles',
        id: 'mapbox.satellite',
        z: 1,
        x: 0,
        y: 0,
        format: 'png',
        highDpi: true
      });
    });

    it('should return unknown type for invalid URLs', () => {
      const beatbox = new BeatBox();
      
      expect(beatbox.parseMapboxUrl('http://example.com')).toEqual({ type: 'unknown' });
      expect(beatbox.parseMapboxUrl('mapbox://invalid/url')).toEqual({ type: 'unknown' });
    });
  });

  describe('toHttpUrl', () => {
    it('should convert style URLs without access token', () => {
      const beatbox = new BeatBox();
      const result = beatbox.toHttpUrl('mapbox://styles/mapbox/streets-v11');
      
      expect(result).toBe('https://api.mapbox.com/styles/v1/mapbox/streets-v11');
    });

    it('should convert style URLs with access token', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const result = beatbox.toHttpUrl('mapbox://styles/mapbox/streets-v11');
      
      expect(result).toBe('https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=test-token');
    });

    it('should convert sprite URLs', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const result = beatbox.toHttpUrl('mapbox://sprites/mapbox/streets-v11');
      
      expect(result).toBe('https://api.mapbox.com/styles/v1/mapbox/streets-v11/sprite?access_token=test-token');
    });

    it('should convert font URLs', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const result = beatbox.toHttpUrl('mapbox://fonts/mapbox/Arial Unicode MS Bold/0-255.pbf');
      
      expect(result).toBe('https://api.mapbox.com/fonts/v1/mapbox/Arial Unicode MS Bold/0-255.pbf?access_token=test-token');
    });

    it('should convert simple tile URLs to TileJSON endpoint', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const result = beatbox.toHttpUrl('mapbox://tiles/mapbox.mapbox-streets-v8');
      
      expect(result).toBe('https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?access_token=test-token');
    });

    it('should convert tile URLs with coordinates', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const result = beatbox.toHttpUrl('mapbox://tiles/mapbox.satellite/1/0/0.jpg');
      
      expect(result).toBe('https://api.mapbox.com/v4/mapbox.satellite/1/0/0.jpg?access_token=test-token');
    });

    it('should handle high-DPI tiles', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const result = beatbox.toHttpUrl('mapbox://tiles/mapbox.satellite/1/0/0@2x.png');
      
      expect(result).toBe('https://api.mapbox.com/v4/mapbox.satellite/1/0/0@2x.png?access_token=test-token');
    });

    it('should use custom API URL', () => {
      const beatbox = new BeatBox({ 
        accessToken: 'test-token',
        apiUrl: 'https://custom.mapbox.com'
      });
      const result = beatbox.toHttpUrl('mapbox://styles/mapbox/streets-v11');
      
      expect(result).toBe('https://custom.mapbox.com/styles/v1/mapbox/streets-v11?access_token=test-token');
    });

    it('should return original URL if cannot parse', () => {
      const beatbox = new BeatBox();
      const result = beatbox.toHttpUrl('http://example.com');
      
      expect(result).toBe('http://example.com');
    });
  });

  describe('translateStyleUrls', () => {
    it('should translate sprite URL', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const style = {
        version: 8,
        sprite: 'mapbox://sprites/mapbox/streets-v11'
      };
      
      const result = beatbox.translateStyleUrls(style);
      
      expect(result.sprite).toBe('https://api.mapbox.com/styles/v1/mapbox/streets-v11/sprite?access_token=test-token');
    });

    it('should translate glyphs URL template', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const style = {
        version: 8,
        glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
      };
      
      const result = beatbox.translateStyleUrls(style);
      
      expect(result.glyphs).toBe('https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=test-token');
    });

    it('should translate source URLs', () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      const style = {
        version: 8,
        sources: {
          'mapbox-streets': {
            type: 'vector',
            url: 'mapbox://tiles/mapbox.mapbox-streets-v8'
          },
          'satellite': {
            type: 'raster',
            tiles: [
              'mapbox://tiles/mapbox.satellite/{z}/{x}/{y}.jpg'
            ]
          }
        }
      };
      
      const result = beatbox.translateStyleUrls(style);
      
      expect(result.sources?.['mapbox-streets'].url).toBe(
        'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?access_token=test-token'
      );
      expect(result.sources?.['satellite'].tiles[0]).toBe(
        'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg?access_token=test-token'
      );
    });

    it('should not modify non-mapbox URLs', () => {
      const beatbox = new BeatBox();
      const style = {
        version: 8,
        sprite: 'https://example.com/sprite',
        sources: {
          'custom': {
            type: 'vector',
            url: 'https://example.com/tiles.json'
          }
        }
      };
      
      const result = beatbox.translateStyleUrls(style);
      
      expect(result.sprite).toBe('https://example.com/sprite');
      expect(result.sources?.['custom'].url).toBe('https://example.com/tiles.json');
    });

    it('should handle missing properties gracefully', () => {
      const beatbox = new BeatBox();
      const style = { version: 8 };
      
      const result = beatbox.translateStyleUrls(style);
      
      expect(result).toEqual({ version: 8 });
    });
  });

  describe('getStyleResources', () => {
    it('should extract all resource URLs', async () => {
      const beatbox = new BeatBox({ accessToken: 'test-token' });
      
      // Mock the translateStyle method
      beatbox.translateStyle = async () => ({
        version: 8,
        sprite: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/sprite?access_token=test-token',
        glyphs: 'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=test-token',
        sources: {
          'mapbox-streets': {
            type: 'vector',
            url: 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?access_token=test-token'
          }
        },
        layers: [
          {
            id: 'text-layer',
            layout: {
              'text-font': ['Arial Unicode MS Bold', 'DIN Pro Medium']
            }
          }
        ]
      });
      
      const resources = await beatbox.getStyleResources('mapbox://styles/mapbox/streets-v11');
      
      expect(resources.style).toBe('https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=test-token');
      expect(resources.sprites).toContain('https://api.mapbox.com/styles/v1/mapbox/streets-v11/sprite?access_token=test-token.png');
      expect(resources.sprites).toContain('https://api.mapbox.com/styles/v1/mapbox/streets-v11/sprite?access_token=test-token@2x.json');
      expect(resources.tiles).toContain('https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?access_token=test-token');
      expect(resources.fonts).toContain('Arial Unicode MS Bold');
      expect(resources.fonts).toContain('DIN Pro Medium');
      expect(resources.glyphs).toBe('https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=test-token');
    });
  });
});