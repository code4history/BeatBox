export interface BeatBoxOptions {
  accessToken?: string;
  apiUrl?: string;
}

export interface MapboxUrlInfo {
  type: 'styles' | 'tiles' | 'fonts' | 'sprites' | 'unknown';
  username?: string;
  id?: string;
  fontstack?: string;
  range?: string;
  z?: number;
  x?: number;
  y?: number;
  format?: string;
  highDpi?: boolean;
}

export interface ResourceList {
  style?: string;
  tiles: string[];
  fonts: string[];
  sprites: string[];
  glyphs?: string;
}

export interface StyleConfig {
  version: number;
  name?: string;
  sources?: Record<string, any>;
  layers?: any[];
  sprite?: string;
  glyphs?: string;
  [key: string]: any;
}

export class BeatBox {
  private accessToken?: string;
  private apiUrl: string;

  constructor(options: BeatBoxOptions = {}) {
    this.accessToken = options.accessToken;
    this.apiUrl = options.apiUrl || 'https://api.mapbox.com';
  }

  /**
   * Parse a mapbox:// URL into its components
   */
  parseMapboxUrl(url: string): MapboxUrlInfo {
    const result: MapboxUrlInfo = { type: 'unknown' };

    if (!url.startsWith('mapbox://')) {
      return result;
    }

    const path = url.slice(9); // Remove 'mapbox://'

    // Parse styles: mapbox://styles/{username}/{style_id}
    const stylesMatch = path.match(/^styles\/([^/]+)\/([^/]+)$/);
    if (stylesMatch) {
      return {
        type: 'styles',
        username: stylesMatch[1],
        id: stylesMatch[2]
      };
    }

    // Parse sprites: mapbox://sprites/{username}/{style_id}
    const spritesMatch = path.match(/^sprites\/([^/]+)\/([^/]+)$/);
    if (spritesMatch) {
      return {
        type: 'sprites',
        username: spritesMatch[1],
        id: spritesMatch[2]
      };
    }

    // Parse fonts: mapbox://fonts/{username}/{fontstack}/{range}.pbf
    const fontsMatch = path.match(/^fonts\/([^/]+)\/([^/]+)\/(\d+-\d+)\.pbf$/);
    if (fontsMatch) {
      return {
        type: 'fonts',
        username: fontsMatch[1],
        fontstack: fontsMatch[2],
        range: fontsMatch[3]
      };
    }

    // Parse tiles: mapbox://tiles/{tileset_id}/{z}/{x}/{y}[@2x].{format}
    const tilesMatch = path.match(/^tiles\/([^/]+)\/(\d+)\/(\d+)\/(\d+)(@2x)?\.(\w+)$/);
    if (tilesMatch) {
      return {
        type: 'tiles',
        id: tilesMatch[1],
        z: parseInt(tilesMatch[2]),
        x: parseInt(tilesMatch[3]),
        y: parseInt(tilesMatch[4]),
        highDpi: !!tilesMatch[5],
        format: tilesMatch[6]
      };
    }

    // Simple tiles without coordinates: mapbox://tiles/{tileset_id}
    const simpleTilesMatch = path.match(/^tiles\/([^/]+)$/);
    if (simpleTilesMatch) {
      return {
        type: 'tiles',
        id: simpleTilesMatch[1]
      };
    }

    return result;
  }

  /**
   * Convert a mapbox:// URL to HTTP URL
   */
  toHttpUrl(mapboxUrl: string): string {
    const parsed = this.parseMapboxUrl(mapboxUrl);
    const token = this.accessToken ? `?access_token=${this.accessToken}` : '';

    switch (parsed.type) {
      case 'styles':
        return `${this.apiUrl}/styles/v1/${parsed.username}/${parsed.id}${token}`;

      case 'sprites':
        // Note: Actual sprite URLs will have .json or .png appended by the client
        return `${this.apiUrl}/styles/v1/${parsed.username}/${parsed.id}/sprite${token}`;

      case 'fonts':
        return `${this.apiUrl}/fonts/v1/${parsed.username}/${parsed.fontstack}/${parsed.range}.pbf${token}`;

      case 'tiles':
        if (parsed.z !== undefined && parsed.x !== undefined && parsed.y !== undefined) {
          const format = parsed.format || 'mvt';
          const hdpi = parsed.highDpi ? '@2x' : '';
          return `${this.apiUrl}/v4/${parsed.id}/${parsed.z}/${parsed.x}/${parsed.y}${hdpi}.${format}${token}`;
        } else {
          // Return TileJSON endpoint for tileset
          return `${this.apiUrl}/v4/${parsed.id}.json${token}`;
        }

      default:
        // Handle tile URL templates with placeholders like {z}/{x}/{y}
        if (mapboxUrl.startsWith('mapbox://tiles/')) {
          const templateMatch = mapboxUrl.match(/^mapbox:\/\/tiles\/([^/]+)\/\{z\}\/\{x\}\/\{y\}(\.\w+)?$/);
          if (templateMatch) {
            const id = templateMatch[1];
            const format = templateMatch[2] ? templateMatch[2].slice(1) : 'mvt';
            return `${this.apiUrl}/v4/${id}/{z}/{x}/{y}.${format}${token}`;
          }
        }
        return mapboxUrl; // Return original if cannot parse
    }
  }

  /**
   * Translate mapbox:// URLs in a style configuration object
   */
  translateStyleUrls(style: StyleConfig): StyleConfig {
    const translated = { ...style };

    // Translate sprite URL
    if (translated.sprite && translated.sprite.startsWith('mapbox://')) {
      translated.sprite = this.toHttpUrl(translated.sprite);
    }

    // Translate glyphs URL template
    if (translated.glyphs && translated.glyphs.includes('mapbox://')) {
      translated.glyphs = translated.glyphs.replace(
        /mapbox:\/\/fonts\/([^/]+)\//,
        `${this.apiUrl}/fonts/v1/$1/`
      );
      if (this.accessToken) {
        translated.glyphs = translated.glyphs.replace(
          '.pbf',
          `.pbf?access_token=${this.accessToken}`
        );
      }
    }

    // Translate sources
    if (translated.sources) {
      for (const [key, source] of Object.entries(translated.sources)) {
        if (typeof source === 'object' && source !== null) {
          const sourceCopy = { ...source };

          // Handle url property
          if (sourceCopy.url && typeof sourceCopy.url === 'string' && sourceCopy.url.startsWith('mapbox://')) {
            sourceCopy.url = this.toHttpUrl(sourceCopy.url);
          }

          // Handle tiles array
          if (Array.isArray(sourceCopy.tiles)) {
            sourceCopy.tiles = sourceCopy.tiles.map((tile: string) =>
              tile.startsWith('mapbox://') ? this.toHttpUrl(tile) : tile
            );
          }

          translated.sources[key] = sourceCopy;
        }
      }
    }

    return translated;
  }

  /**
   * Fetch and translate a complete style configuration
   */
  async translateStyle(styleUrl: string): Promise<StyleConfig> {
    if (!this.accessToken) {
      throw new Error('Access token is required to fetch style configuration');
    }

    const httpUrl = styleUrl.startsWith('mapbox://') 
      ? this.toHttpUrl(styleUrl)
      : styleUrl;

    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch style: ${response.statusText}`);
    }

    const style = await response.json();
    return this.translateStyleUrls(style);
  }

  /**
   * Extract all resource URLs from a style configuration
   */
  async getStyleResources(styleUrl: string): Promise<ResourceList> {
    const style = await this.translateStyle(styleUrl);
    const resources: ResourceList = {
      tiles: [],
      fonts: [],
      sprites: []
    };

    // Add style URL itself
    resources.style = styleUrl.startsWith('mapbox://') 
      ? this.toHttpUrl(styleUrl)
      : styleUrl;

    // Extract sprite URLs
    if (style.sprite) {
      resources.sprites.push(style.sprite + '.png');
      resources.sprites.push(style.sprite + '.json');
      resources.sprites.push(style.sprite + '@2x.png');
      resources.sprites.push(style.sprite + '@2x.json');
    }

    // Extract glyphs URL template
    if (style.glyphs) {
      resources.glyphs = style.glyphs;
    }

    // Extract tile URLs from sources
    if (style.sources) {
      for (const source of Object.values(style.sources)) {
        if (typeof source === 'object' && source !== null) {
          // TileJSON URL
          if (source.url && typeof source.url === 'string') {
            resources.tiles.push(source.url);
          }

          // Direct tile URLs
          if (Array.isArray(source.tiles)) {
            resources.tiles.push(...source.tiles);
          }
        }
      }
    }

    // Extract fonts from layers
    if (style.layers) {
      const fontSet = new Set<string>();
      for (const layer of style.layers) {
        if (layer.layout && layer.layout['text-font'] && Array.isArray(layer.layout['text-font'])) {
          layer.layout['text-font'].forEach((font: string) => fontSet.add(font));
        }
      }
      resources.fonts = Array.from(fontSet);
    }

    return resources;
  }
}

