# BeatBox Implementation Notes

## Project Purpose

BeatBox is a Mapbox scheme URL parser and MVT (Mapbox Vector Tile) configuration translator for JavaScript. It provides functionality to:

1. Convert `mapbox://` scheme URLs to HTTP URLs
2. Parse Mapbox style configuration files
3. Extract and translate all resource URLs (tiles, fonts, icons, sprites)
4. Generate MVT configuration with fully resolved HTTP URLs

## Implementation Details

### Core Components

#### 1. URL Parser (`parseMapboxUrl`)
Parses mapbox:// URLs into structured components:
- Identifies URL type (styles, tiles, fonts, sprites)
- Extracts relevant parameters (username, IDs, coordinates, etc.)
- Returns structured `MapboxUrlInfo` object

#### 2. URL Converter (`toHttpUrl`)
Converts parsed mapbox:// URLs to their HTTP equivalents:
- Applies correct API endpoint patterns
- Adds access token as query parameter
- Handles special cases (e.g., TileJSON vs individual tiles)

#### 3. Style Translator (`translateStyleUrls`)
Processes style configuration objects:
- Translates sprite URLs
- Converts glyphs URL templates
- Processes all sources (both `url` and `tiles` properties)
- Returns modified style with HTTP URLs

#### 4. Style Fetcher (`translateStyle`)
Async function that:
- Fetches style configuration from Mapbox API
- Applies URL translations to the fetched style
- Returns fully translated style object

#### 5. Resource Extractor (`getStyleResources`)
Analyzes style configuration to extract all resources:
- Style URL itself
- Sprite URLs (including @2x variants)
- Glyphs URL template
- Tile source URLs
- Font names used in layers

### Key Design Decisions

1. **Optional Access Token**: The library works without an access token for URL conversion, but requires one for fetching style configurations.

2. **Configurable API URL**: Allows using custom Mapbox API endpoints (useful for proxies or self-hosted solutions).

3. **Comprehensive URL Parsing**: Handles all known Mapbox URL patterns including edge cases.

4. **Non-destructive Translation**: Creates copies of objects rather than modifying originals.

5. **TypeScript Interfaces**: Provides clear type definitions for all data structures.

### URL Pattern Details

#### Styles
- Pattern: `mapbox://styles/{username}/{style_id}`
- HTTP: `https://api.mapbox.com/styles/v1/{username}/{style_id}`

#### Tiles
- Simple: `mapbox://tiles/{tileset_id}`
- With coords: `mapbox://tiles/{tileset_id}/{z}/{x}/{y}[@2x].{format}`
- HTTP: `https://api.mapbox.com/v4/{tileset_id}/{z}/{x}/{y}.mvt`

#### Fonts
- Pattern: `mapbox://fonts/{username}/{fontstack}/{range}.pbf`
- HTTP: `https://api.mapbox.com/fonts/v1/{username}/{fontstack}/{range}.pbf`

#### Sprites
- Pattern: `mapbox://sprites/{username}/{style_id}`
- HTTP: `https://api.mapbox.com/styles/v1/{username}/{style_id}/sprite`
- Note: Client appends `.png`, `.json`, `@2x.png`, or `@2x.json`

### Testing Considerations

When testing the library, consider:
1. Various URL formats and edge cases
2. Styles with and without mapbox:// URLs
3. Access token presence/absence
4. Network error handling
5. Invalid URL formats
6. Nested source configurations

### Future Enhancements

Potential improvements:
1. Caching for fetched styles
2. Batch URL conversion
3. Validation of Mapbox URLs
4. Support for additional Mapbox URL types
5. Progress callbacks for large style processing
6. Offline mode with pre-fetched styles