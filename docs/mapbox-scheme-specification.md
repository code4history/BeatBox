# Mapbox Scheme Specification

This document summarizes the research findings on Mapbox URL schemes and their HTTP endpoint conversions.

## Overview

Mapbox uses a custom `mapbox://` protocol scheme as a shorthand notation for accessing various map resources. These URLs need to be converted to HTTP endpoints for actual resource access.

## URL Scheme Patterns

### 1. Styles
```
mapbox://styles/{username}/{style_id}
→ https://api.mapbox.com/styles/v1/{username}/{style_id}?access_token={token}
```

### 2. Vector Tiles
```
mapbox://tiles/{tileset_id}
→ https://api.mapbox.com/v4/{tileset_id}.json?access_token={token}

mapbox://tiles/{tileset_id}/{z}/{x}/{y}.mvt
→ https://api.mapbox.com/v4/{tileset_id}/{z}/{x}/{y}.mvt?access_token={token}
```

### 3. Fonts (Glyphs)
```
mapbox://fonts/{username}/{fontstack}/{range}.pbf
→ https://api.mapbox.com/fonts/v1/{username}/{fontstack}/{range}.pbf?access_token={token}
```

### 4. Sprites
```
mapbox://sprites/{username}/{style_id}
→ https://api.mapbox.com/styles/v1/{username}/{style_id}/sprite?access_token={token}
```

Note: Sprite URLs get additional extensions appended by clients:
- `.png` for the sprite image
- `.json` for the sprite metadata
- `@2x.png` for high-DPI sprite image
- `@2x.json` for high-DPI sprite metadata

## Style Configuration Structure

A Mapbox style is a JSON document that defines the visual appearance of a map. Key properties include:

### Required Properties
- `version`: Must be 8
- `layers`: Array of layer definitions

### Resource References
- `sources`: Data sources (vector tiles, raster tiles, GeoJSON, etc.)
- `sprite`: URL template for icons and patterns
- `glyphs`: URL template for fonts

### Example Style Structure
```json
{
  "version": 8,
  "name": "My Custom Style",
  "sprite": "mapbox://sprites/{username}/{style_id}",
  "glyphs": "mapbox://fonts/{username}/{fontstack}/{range}.pbf",
  "sources": {
    "mapbox-streets": {
      "type": "vector",
      "url": "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#f8f4f0"
      }
    }
  ]
}
```

## URL Template Tokens

### Tile URL Templates
- `{z}`: Zoom level
- `{x}`: Tile column
- `{y}`: Tile row
- `{ratio}`: Resolution (@2x for retina)

### Font URL Templates
- `{fontstack}`: Comma-separated list of font names
- `{range}`: Unicode range (e.g., "0-255")

## API Endpoints Summary

| Resource | Mapbox Scheme | HTTP Endpoint |
|----------|---------------|---------------|
| Style | `mapbox://styles/{user}/{id}` | `https://api.mapbox.com/styles/v1/{user}/{id}` |
| Vector Tiles | `mapbox://tiles/{id}` | `https://api.mapbox.com/v4/{id}.json` |
| Tile | `mapbox://tiles/{id}/{z}/{x}/{y}` | `https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.mvt` |
| Fonts | `mapbox://fonts/{user}/{font}/{range}.pbf` | `https://api.mapbox.com/fonts/v1/{user}/{font}/{range}.pbf` |
| Sprites | `mapbox://sprites/{user}/{id}` | `https://api.mapbox.com/styles/v1/{user}/{id}/sprite` |

## Additional Notes

1. **Access Token**: All HTTP endpoints require `?access_token={token}` parameter
2. **Cache Headers**: Vector Tiles API sets `Cache-Control: max-age=43200,s-maxage=300`
3. **Rate Limits**: Default 100,000 requests per minute for Vector Tiles API
4. **WMTS Support**: Styles also have WMTS endpoints for GIS applications
5. **High-DPI Support**: Append `@2x` before file extension for retina displays

## References

- [Mapbox Styles API Documentation](https://docs.mapbox.com/api/maps/styles/)
- [Mapbox Vector Tiles API](https://docs.mapbox.com/api/maps/vector-tiles/)
- [Mapbox Style Specification](https://docs.mapbox.com/style-spec/reference/)
- [Mapbox GL JS Style Specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/)