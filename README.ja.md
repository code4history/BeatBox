# @c4h/beatbox

JavaScript用のMapboxスキームURLパーサーおよびMVT設定トランスレータです。

## 機能

- mapbox://スキームURLをHTTP URLに変換
- Mapboxスタイル設定ファイルの解析
- すべてのリソースURL（タイル、フォント、アイコン、スプライト）の抽出と変換
- 完全に解決されたHTTP URLを含むMVT設定の生成
- 各種Mapboxリソースタイプのサポート：
  - スタイル: `mapbox://styles/{username}/{style_id}`
  - タイル: `mapbox://tiles/{tileset_id}/{z}/{x}/{y}`
  - フォント: `mapbox://fonts/{username}/{font_stack}/{range}`
  - スプライト: `mapbox://sprites/{username}/{style_id}`

## インストール

### npm

```sh
npm install @c4h/beatbox
```

### ブラウザ

```html
<script src="https://unpkg.com/@c4h/beatbox/dist/beatbox.umd.js"></script>
```

## 使用方法

```typescript
import { BeatBox } from '@c4h/beatbox';

// Mapboxアクセストークンで初期化
const beatbox = new BeatBox({
  accessToken: 'your-mapbox-access-token'
});

// 単一のmapbox:// URLをHTTPに変換
const httpUrl = beatbox.toHttpUrl('mapbox://styles/mapbox/streets-v11');
console.log(httpUrl);
// → https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=...

// 完全なスタイル設定を解析して変換
const styleUrl = 'mapbox://styles/moritoru/ck3xqi0hh1pob1cqpanp3jxxo';
const translatedStyle = await beatbox.translateStyle(styleUrl);
// すべてのmapbox:// URLがHTTP URLに変換されたスタイルJSONを返します

// スタイルからすべてのリソースURLを取得
const resources = await beatbox.getStyleResources(styleUrl);
console.log(resources);
// → {
//     style: 'https://api.mapbox.com/styles/v1/...',
//     tiles: ['https://api.mapbox.com/v4/...'],
//     fonts: ['https://api.mapbox.com/fonts/v1/...'],
//     sprites: ['https://api.mapbox.com/styles/v1/.../sprite']
//   }
```

## APIドキュメント

### BeatBox

MapboxのURL変換のためのメインクラスです。

#### コンストラクタオプション

- `accessToken` (string): Mapboxアクセストークン（必須）
- `apiUrl` (string): カスタムMapbox API URL（デフォルト: 'https://api.mapbox.com'）

#### メソッド

- `toHttpUrl(mapboxUrl: string): string` - 単一のmapbox:// URLをHTTP URLに変換します
- `translateStyle(styleUrl: string): Promise<object>` - 完全なスタイル設定を取得して変換します
- `getStyleResources(styleUrl: string): Promise<ResourceList>` - スタイルからすべてのリソースURLを抽出します
- `parseMapboxUrl(url: string): MapboxUrlInfo` - mapbox:// URLをコンポーネントに解析します

## ライセンス

MIT License

## 貢献

貢献は歓迎します！お気軽にプルリクエストを送信してください。