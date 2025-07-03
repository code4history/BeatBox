# @c4h/beatbox

Mapbox scheme URL parser and MVT configuration translator for JavaScript.

## Features

- Convert mapbox:// scheme URLs to HTTP URLs
- Parse Mapbox style configuration files
- Extract and translate all resource URLs (tiles, fonts, icons, sprites)
- Generate MVT configuration with fully resolved HTTP URLs
- Support for various Mapbox resource types:
  - Styles: `mapbox://styles/{username}/{style_id}`
  - Tiles: `mapbox://tiles/{tileset_id}/{z}/{x}/{y}`
  - Fonts: `mapbox://fonts/{username}/{font_stack}/{range}`
  - Sprites: `mapbox://sprites/{username}/{style_id}`

## Installation

### npm

```sh
npm install @c4h/beatbox
```

### Browser

```html
<script src="https://unpkg.com/@c4h/beatbox/dist/beatbox.umd.js"></script>
```

## Usage

```typescript
import { BeatBox } from '@c4h/beatbox';

// Initialize with your Mapbox access token
const beatbox = new BeatBox({
  accessToken: 'your-mapbox-access-token'
});

// Convert a single mapbox:// URL to HTTP
const httpUrl = beatbox.toHttpUrl('mapbox://styles/mapbox/streets-v11');
console.log(httpUrl);
// → https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=...

// Parse and translate a complete style configuration
const styleUrl = 'mapbox://styles/moritoru/ck3xqi0hh1pob1cqpanp3jxxo';
const translatedStyle = await beatbox.translateStyle(styleUrl);
// Returns style JSON with all mapbox:// URLs converted to HTTP URLs

// Get all resource URLs from a style
const resources = await beatbox.getStyleResources(styleUrl);
console.log(resources);
// → {
//     style: 'https://api.mapbox.com/styles/v1/...',
//     tiles: ['https://api.mapbox.com/v4/...'],
//     fonts: ['https://api.mapbox.com/fonts/v1/...'],
//     sprites: ['https://api.mapbox.com/styles/v1/.../sprite']
//   }
```

## API Documentation

### BeatBox

The main class for Mapbox URL translation.

#### Constructor Options

- `accessToken` (string): Your Mapbox access token (required)
- `apiUrl` (string): Custom Mapbox API URL (default: 'https://api.mapbox.com')

#### Methods

- `toHttpUrl(mapboxUrl: string): string` - Convert a single mapbox:// URL to HTTP URL
- `translateStyle(styleUrl: string): Promise<object>` - Fetch and translate a complete style configuration
- `getStyleResources(styleUrl: string): Promise<ResourceList>` - Extract all resource URLs from a style
- `parseMapboxUrl(url: string): MapboxUrlInfo` - Parse a mapbox:// URL into its components

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.