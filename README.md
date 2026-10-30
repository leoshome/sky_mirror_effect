# 天空之鏡 · Sky Mirror

把任何一張風景照變成「天空之鏡」的水面倒影。純前端、免安裝、照片不會上傳到任何伺服器。

Turn any landscape photo into a mirror-flat water reflection. Runs entirely in your browser — nothing to install, and your photos never leave your device.

線上版本 / Live demo: <https://leoshome.github.io/sky_mirror_effect/>

[繁體中文](#繁體中文) · [English](#english)

---

## 繁體中文

上傳照片 → 拖曳水面線 → 調整倒影與水色 → 拖曳裁切框 → 下載原像素圖片。

### 功能

- **傾斜水面線 ±89°**：拖曳白線移動水面，拖曳兩端圓點調整角度，範圍 ±89°。倒影是物理鏡射：一律沿重力方向垂直翻轉，不隨傾斜水平偏移；兩端把手永遠落在水面線與畫面邊緣的交點上，任何角度都抓得到。
- **換照片隨時可用**：頂部列常駐「換照片」按鈕；也可以把新照片直接拖到預覽上或 `Ctrl/⌘ + V` 貼上。每次載入照片都會還原初始參數（含裁切框）。
- **即時預覽**：所有調整立即反應；按住「看原圖」可隨時比對（直接顯示原圖，不受水面線影響）。
- **三種同層風格**：面板常駐「水波風格」選擇器——平靜湖水、鹽湖天空之鏡、山泉池塘；後兩者底層都是同一套自然波場（五組方向波列），差別只在參數組。載入即選鹽湖天空之鏡；切換風格只換水波與水色相關參數，**水平線與角度不動**。
- **倒影長度 0–2**：`0` 只留水色、沒有倒影；`1` 是 1:1 鏡射；`2` 是倒影拉長兩倍。
- **自然水波（鹽湖／山泉）**：五組方向波列，波長只跟水深成正比、振幅隨深度展開；後兩組是高頻細波（垂直拉伸為主）。鹽湖天空之鏡最靜、近純鏡射；山泉池塘可做出密集的碎波紋。搭配波峰斜率產生的稀疏波光與固定的輕微柔化。平靜湖水的波幅／波長，與波紋強度、波紋尺度、波光一起收在「進階水波」內。
- **可疊加的特徵層（預設全關）**：兩個與水波風格正交、都能量在任何基底風格上的特徵，各自 0 即關。
  - **噪聲位移**：兩組獨立值噪聲（R/G 正交交叉紋），可調強度、尺度、方向。決定性（同參數必同輸出）。
  - **深度透視**：雙向、有界地調變波長——近水面線變密、前景波長拉寬；可調強度、前景加寬、影響範圍、曲線、壓縮上限（防摩爾紋）。
  - 切換風格會套建議值：鹽湖／山泉套各自參數、平靜湖水示範輕度透視；水平線一律不動。
- **水面透明度 0–100%**：預設 0%（完整倒影）；100% 完全透出原圖。透明度只影響水體與原圖的混合，下載圖片仍是不透明成品。
- **下載即裁切**：下載頁一進去就顯示裁切框，可直接拖曳移動、拉四角或四邊縮放；比例可選原始、1:1、4:5、16:9、自由。
- **不放大、不縮小**：輸出寬高就是裁切框覆蓋的原圖像素，例如 2400×1600 的圖選 1:1 會得到 1600×1600。
- **兩種重設**：面板「重設參數」只歸零滑桿，保留裁切框；舞台「重設」會把參數與裁切框全部歸零。載入新照片時也會自動還原初始參數。
- **中英文介面**：預設依系統語言（`zh-*` → 繁中，其餘 → 英文），可隨時切換；語言只影響本次瀏覽，不寫入儲存。
- **手機完整支援**：底部抽屜面板、觸控拖曳、直式照片自動適應。
- **完全在瀏覽器內運算**：不使用後端、不載入任何外部資源、不寫入本機儲存。

### 使用方式

1. 拖放照片、點「選擇照片」、頂部「換照片」，或直接 `Ctrl/⌘ + V` 貼上。
2. 拖曳畫面中的白線決定水面位置（預設在 50%）；拖曳兩端圓點可傾斜水面線（±89°）。
3. 在「水波風格」選擇平靜湖水／鹽湖天空之鏡／山泉池塘；用右側（手機為底部面板）的滑桿調整倒影、水色與水面透明度；需要時展開「進階水波」。
4. 切到「下載」選擇比例與格式。裁切框會直接顯示在畫面上，拖曳框內移動、拉四角或四邊縮放，再按「下載圖片」。

> 倒影只取自水面線另一側的畫面，因此被前景遮住的景物不會出現在水裡。這是此技法的本質限制。

### 裁切與輸出尺寸

下載頁的比例選項是「原始 / 1:1 / 4:5 / 16:9 / 自由」。裁切框以原圖的正規化座標儲存，輸出寬高直接等於框內的原圖像素，不會放大。選固定比例後，拖曳四角或四邊會維持該比例；選「自由」則可任意縮放。

匯出裁切時，引擎會先以裁切後的像素密度渲染**完整原圖**，再把裁切框取出來。這樣倒影取樣不會被裁切邊界截斷，成品與預覽看到的一致。

尺寸過大時（例如超過 iOS Safari 的畫布上限，或需要較多記憶體）會先跳出確認。若下載失敗，改用較小的原圖。

### 本機使用

直接雙擊 `index.html` 即可，不需要伺服器。若想用本機伺服器：

```bash
python -m http.server 8000
# 開啟 http://localhost:8000
```

### 隱私

照片只在你的瀏覽器記憶體中處理，不會上傳、不會儲存、不會寫入任何追蹤或分析服務。關閉分頁後即消失。

### 瀏覽器支援

- 桌面：Chrome、Edge、Firefox、Safari 最新版
- 手機：iOS Safari 16+、Android Chrome 最新版

使用 Canvas 2D 與 Pointer Events。HEIC/HEIF 目前無法在瀏覽器解碼，請先轉成 JPEG。

### 授權

MIT

---

## English

Upload a photo → drag the water line → tune reflection and water colour → adjust the crop → download at the original pixel size.

### Features

- **Tiltable water line, ±89°**: drag the white line to move the water, drag either end dot to tilt it, up to ±89°. The reflection is a physical mirror: it is always flipped vertically along gravity and never shifts sideways as the line tilts. Both handles always sit on the intersection of the water line and the image edge, so they stay grabbable at any angle.
- **Swap photos at any time**: the top bar keeps a "Change photo" button; you can also drop a new photo onto the preview or paste one with `Ctrl/⌘ + V`. Every load resets the parameters (including the crop box).
- **Live preview**: every adjustment renders immediately; hold "Show original" to compare against the untouched photo, unaffected by the water line.
- **Three water styles on the same layer**: a permanent "Water style" picker offers Calm Lake, Salt Flat Mirror and Mountain Spring. The latter two share one natural wave field (five directional wave trains) and differ only in parameters. Salt Flat Mirror is selected on load; switching style changes only wave and water-colour parameters — **the water line and its angle never move**.
- **Reflection length, 0–2**: `0` keeps only the water colour with no reflection; `1` is a 1:1 mirror; `2` stretches the reflection to twice its length.
- **Natural waves (salt flat / mountain spring)**: five directional wave trains whose wavelength scales only with depth and whose amplitude grows with depth; the last two trains are high-frequency ripples (mostly vertical stretching). Salt Flat Mirror is the calmest, close to a pure mirror; Mountain Spring produces dense choppy ripples. Sparse glints derived from wave-crest slope and a fixed slight softening are applied on top. For Calm Lake, amplitude, wavelength, ripple strength, ripple scale and glints live under "Advanced waves".
- **Stackable feature layers (all off by default)**: two features orthogonal to the water style that can be layered on any base style; each is off at `0`.
  - **Noise warp**: two independent value-noise fields (R/G crossed, orthogonal), with adjustable strength, scale and direction. Deterministic — the same parameters always produce the same output.
  - **Depth perspective**: bidirectional, bounded wavelength modulation — denser near the water line, stretched toward the foreground; adjustable strength, foreground widening, range, curve and compression cap (anti-moiré).
  - Switching style applies suggested values: salt flat and mountain spring use their own parameters, Calm Lake demonstrates light perspective; the water line is never touched.
- **Water opacity, 0–100%**: default `0` (full reflection); `100` shows the original photo through. Opacity only blends the water body with the original; the downloaded image is always fully opaque.
- **Crop on download**: the crop box appears as soon as you open the download tab. Drag it, or resize from corners and edges; aspect ratios are Original, 1:1, 4:5, 16:9 and Free.
- **No upscaling or downscaling**: output width and height are exactly the original pixels covered by the crop box. A 2400×1600 photo cropped to 1:1 yields 1600×1600.
- **Two kinds of reset**: "Reset parameters" in the panel zeroes the sliders but keeps the crop box; "Reset" on the stage clears both parameters and crop box. Loading a new photo also restores the initial parameters.
- **Chinese and English UI**: defaults to the system language (`zh-*` → Traditional Chinese, everything else → English), switchable at any time. The choice affects only the current visit and is not persisted.
- **Full mobile support**: bottom-sheet panel, touch dragging, and automatic fitting for portrait photos.
- **Runs entirely in the browser**: no backend, no external assets, no local storage.

### Usage

1. Drop a photo, click "Choose photo", use "Change photo" in the top bar, or paste with `Ctrl/⌘ + V`.
2. Drag the white line to set the water level (50% by default); drag either end dot to tilt the water line (±89°).
3. Pick Calm Lake / Salt Flat Mirror / Mountain Spring under "Water style", then use the sliders on the right (bottom panel on mobile) for reflection, water colour and water opacity; expand "Advanced waves" when needed.
4. Switch to the download tab, choose a ratio and format. The crop box is drawn on the image — drag inside it to move it, drag corners or edges to resize, then press "Download image".

> The reflection is sampled only from the side of the water line opposite the water, so anything hidden behind foreground objects cannot appear in it. That is an inherent limit of the technique.

### Crop and output size

The download tab offers Original / 1:1 / 4:5 / 16:9 / Free. The crop box is stored in normalised coordinates, and the output width and height equal the original pixels inside the box — nothing is upscaled. With a fixed ratio, dragging corners or edges preserves that ratio; with Free you can resize in any direction.

When exporting a crop, the engine first renders the **entire original photo** at the cropped pixel density and then extracts the crop box, so reflection sampling is never cut off at the crop boundary and the result matches the preview.

If the image is very large (beyond the iOS Safari canvas limit, or needing a lot of memory) a confirmation appears first. If the download fails, use a smaller source photo.

### Running locally

Double-click `index.html` — no server required. If you prefer a local server:

```bash
python -m http.server 8000
# open http://localhost:8000
```

### Privacy

Photos are processed only in your browser's memory. They are not uploaded, not stored, and not sent to any tracking or analytics service. Everything disappears when the tab closes.

### Browser support

- Desktop: current Chrome, Edge, Firefox and Safari
- Mobile: iOS Safari 16+, current Android Chrome

Built on Canvas 2D and Pointer Events. HEIC/HEIF cannot currently be decoded in the browser — convert to JPEG first.

### License

MIT
