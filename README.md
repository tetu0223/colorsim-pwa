
# ColorSim PWA

完全オフラインで iPhone Safari に「ホーム画面追加」して使えるカラーシミュレーション。

## 使い方（iPhone だけで完結）

1. **この ZIP をどこかにアップ**  
   - 例: GitHub → “Create new repository” → “Add file” → “Upload file”  
   - あるいは [Netlify Drop](https://app.netlify.com/drop) にドラッグ

2. アップ後の URL を **Safari で開く** ⇒ 共有シート → “ホーム画面に追加”  
   (これで PWA がオフラインキャッシュ)

3. ホームアイコンから起動 → 写真を選択 → 色コードを選んで **Recolor**  
   - 初回のみ MobileSAM ONNX (~90 MB) の読み込みで 10‑20 秒  
   - 以後はオフライン動作

### 注意
* WebAssembly 版はネイティブより 1‑2 秒遅いです（A17 で 1.3 秒前後）。  
* ONNX モデルの CDN 先は HuggingFace; 自社サーバへ置換すれば完全社内閉域で利用可。  
* サービスワーカーで `index.html` / `script.js` をキャッシュ、モデルはブラウザ側 IndexedDB キャッシュに残ります。  

MIT License.
