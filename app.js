/* 天空之鏡 — 介面與流程
 * 依賴 render.js 提供的 window.SkyMirror；若引擎缺席，介面仍可運作（僅顯示原圖）。
 */
(function () {
  'use strict';

  var SM = window.SkyMirror || null;

  /* ---------- 語系 ---------- */

  var STRINGS = {
    zh: {
      pageTitle: '天空之鏡 — 把風景照變成水面倒影',
      metaDesc: '上傳風景照，拖一條白線決定水面位置，下半部就變成倒影，再下載成圖片。全程在瀏覽器完成，照片不會上傳。',
      appName: '天空之鏡',
      tagline: '把風景照變成水面倒影',
      privacy: '照片不會離開你的瀏覽器',
      privacyShort: '照片不會上傳，只在你的瀏覽器裡處理。',
      langAria: '語言',
      stageAria: '預覽區',
      uploadAria: '上傳照片',
      dzTitle: '拖放風景照到這裡',
      dzOr: '或',
      dzChoose: '選擇照片',
      dzHint: '上傳後拖曳白線決定水面位置，再調整倒影與水色。支援 JPEG、PNG、WebP，也可直接貼上（Ctrl/⌘+V）。',
      loading: '讀取照片…',
      compare: '看原圖',
      reset: '重設',
      resetParams: '重設參數',
      panelAria: '設定面板',
      gripAria: '展開或收合面板',
      tabAdjust: '調整',
      tabDownload: '下載',
      groupWaterline: '水面位置',
      levelBtn: '擺正水平線',
      resetHorizon: '回到 50%',
      openPhoto: '換照片',
      horizon: '水平線高度',
      horizonMinusAria: '水平線往上 1 像素',
      horizonPlusAria: '水平線往下 1 像素',
      horizonNumberAria: '水面線高度百分比',
      tilt: '水面傾斜角度',
      tiltAria: '水面傾斜角度',
      horizonAria: '水平線位置',
      horizonHint: '拖曳畫面中的白線決定水面高度；拖兩端的圓點可以傾斜。也可以用上面的數字微調。',
      groupReflection: '倒影',
      groupWater: '水色',
      advanced: '進階水波',
      hintFoot: '倒影只用水平線以上的畫面。被前景擋住的景物，水裡不會出現。',
      outputSize: '裁切比例',
      outputSizeAria: '裁切比例',
      ratioOriginal: '原始',
      ratioFree: '自由',
      cropNote: '拖曳框內可移動；拉四角或四邊可調整大小。',
      cropFrameAria: '下載裁切範圍',
      format: '格式',
      formatAria: '輸出格式',
      jpegQuality: 'JPEG 品質',
      downloadBtn: '下載圖片',
      cancel: '取消',
      downloadHint: '輸出尺寸就是裁切框內的原圖像素，不會放大。',
      ctrlCompression: '倒影長度',
      ctrlRipple: '波紋強度',
      ctrlScale: '波紋大小',
      ctrlGlint: '波光',
      ctrlHue: '色調',
      ctrlTint: '水色深淺',
      ctrlFade: '遠處淡出',
      ctrlTransparency: '水面透明度',
      groupStyle: '水波風格',
      exampleTitle: '線上製作天空之鏡倒影照片',
      exampleBody1: '「天空之鏡」是鹽湖或雨後薄水把整片天空翻到地面的景象。上傳風景照、拖白線定出水面位置，線以下就變成倒影，可調倒影長度、水色與水波；照片不會上傳，全部在瀏覽器內完成。',
      exampleBeforeAlt: '十個人站在草原稜線上的剪影，天空布滿雲層，下半部是一片暗色草地，尚未套用倒影效果',
      exampleAfterAlt: '同一張剪影照片套用天空之鏡效果後，下半部變成鏡面水面，映出整片天空與每個人的倒影',
      exampleCaption: '左：原始照片。右：同一張照片套用倒影後的結果，由這個工具直接輸出。',
      exampleTagBefore: '原始',
      exampleTagAfter: '套用後',
      styleCalm: '平靜湖水',
      ctrlCalmAmp: '波浪大小',
      ctrlCalmScale: '波浪間距',
      ctrlNoiseAmt: '起伏強度',
      ctrlNoiseScale: '起伏粗細',
      ctrlNoiseDir: '起伏方向',
      ctrlPerspAmt: '透視強度',
      ctrlPerspNear: '前景放大',
      ctrlPerspStart: '影響範圍',
      ctrlPerspCurve: '曲線',
      ctrlPerspMax: '上限',
      featNoise: '不規則波紋',
      featPersp: '遠近透視',
      presetSalt: '鹽湖天空之鏡',
      presetPond: '山泉池塘',
      toastPreset: '已套用「{name}」',
      toastHeic: 'HEIC 格式無法在瀏覽器解碼，請先轉成 JPEG 再上傳。',
      toastNotImage: '這不是圖片檔，請選擇 JPEG、PNG 或 WebP。',
      toastDecode: '無法讀取這張照片。',
      toastStarted: '已開始下載。',
      toastCancelled: '已取消下載。',
      toastFailed: '下載失敗，請再試一次。',
      toastBlobFailed: '產生圖片失敗，請改用較小的尺寸再試一次。',
      toastInvalidSize: '請輸入 64 到 12000 之間的尺寸。',
      confirmIOS: '這個尺寸是 {w} × {h}（{mp} MP），超過 iOS Safari 的畫布上限，可能下載失敗。\n\n建議縮小裁切框。仍要繼續嗎？',
      confirmMemory: '這個尺寸需要較多記憶體（約 {mb} MB），手機上可能失敗。要繼續嗎？',
      estSmall: '原圖較小，維持原尺寸',
      estCropped: '已裁切'
    },
    en: {
      pageTitle: 'Sky Mirror — Turn a photo into a water reflection',
      metaDesc: 'Upload a landscape photo, drag the white line to set where the water starts, and the lower half becomes a reflection. Everything runs in your browser; photos are never uploaded.',
      appName: 'Sky Mirror',
      tagline: 'Turn a photo into a water reflection',
      privacy: 'Your photos never leave your browser',
      privacyShort: 'Photos are processed locally and never uploaded.',
      langAria: 'Language',
      stageAria: 'Preview',
      uploadAria: 'Upload a photo',
      dzTitle: 'Drop a landscape photo here',
      dzOr: 'or',
      dzChoose: 'choose a photo',
      dzHint: 'After uploading, drag the white line to set the waterline, then adjust the reflection and water color. JPEG, PNG or WebP — or paste with Ctrl/⌘+V.',
      loading: 'Reading photo…',
      compare: 'Compare',
      reset: 'Reset',
      resetParams: 'Reset settings',
      panelAria: 'Settings panel',
      gripAria: 'Expand or collapse the panel',
      tabAdjust: 'Adjust',
      tabDownload: 'Download',
      groupWaterline: 'Waterline',
      levelBtn: 'Straighten',
      resetHorizon: 'Reset to 50%',
      openPhoto: 'New photo',
      horizon: 'Waterline height',
      horizonMinusAria: 'Move horizon up 1 pixel',
      horizonPlusAria: 'Move horizon down 1 pixel',
      horizonNumberAria: 'Waterline height percentage',
      tilt: 'Waterline angle',
      tiltAria: 'Waterline angle',
      horizonAria: 'Horizon position',
      horizonHint: 'Drag the white line to set where the water starts. Drag either end dot to tilt it. Use the fields above for fine tuning.',
      groupReflection: 'Reflection',
      groupWater: 'Water color',
      advanced: 'Advanced water',
      hintFoot: 'The reflection only uses what is above the waterline. Anything hidden by the foreground stays hidden.',
      outputSize: 'Crop ratio',
      outputSizeAria: 'Crop ratio',
      ratioOriginal: 'Original',
      ratioFree: 'Free',
      cropNote: 'Drag inside the frame to move it; drag a corner or edge to resize.',
      cropFrameAria: 'Download crop area',
      format: 'Format',
      formatAria: 'Output format',
      jpegQuality: 'JPEG quality',
      downloadBtn: 'Download image',
      cancel: 'Cancel',
      downloadHint: 'The export uses the original pixels inside the crop frame, with no upscaling.',
      ctrlCompression: 'Reflection length',
      ctrlRipple: 'Ripple strength',
      ctrlScale: 'Ripple size',
      ctrlGlint: 'Glints',
      ctrlHue: 'Tone',
      ctrlTint: 'Tint depth',
      ctrlFade: 'Distance fade',
      ctrlTransparency: 'Water transparency',
      groupStyle: 'Water style',
      exampleTitle: 'Make a sky-mirror reflection photo online',
      exampleBody1: 'A "sky mirror" is the thin sheet of water on a salt flat after rain that flips the whole sky onto the ground. Upload a landscape, drag the white line to set where the water starts, and everything below it becomes a reflection you can tune. Your photo never leaves the browser.',
      exampleBeforeAlt: 'Silhouettes of ten people standing on a grassy ridge under a cloudy sky, the lower half plain dark grass, before the reflection effect',
      exampleAfterAlt: 'The same silhouette photo with the sky-mirror effect applied: the lower half becomes a mirror surface reflecting the sky and every person',
      exampleCaption: 'Left: the original photo. Right: the same photo after the reflection, exported directly by this tool.',
      exampleTagBefore: 'Before',
      exampleTagAfter: 'After',
      styleCalm: 'Calm lake',
      ctrlCalmAmp: 'Wave size',
      ctrlCalmScale: 'Wave spacing',
      ctrlNoiseAmt: 'Amount',
      ctrlNoiseScale: 'Detail size',
      ctrlNoiseDir: 'Direction',
      ctrlPerspAmt: 'Amount',
      ctrlPerspNear: 'Foreground width',
      ctrlPerspStart: 'Range',
      ctrlPerspCurve: 'Curve',
      ctrlPerspMax: 'Limit',
      featNoise: 'Irregular ripples',
      featPersp: 'Perspective',
      presetSalt: 'Salt Flat',
      presetPond: 'Mountain Pond',
      toastPreset: 'Applied "{name}"',
      toastHeic: "HEIC can't be decoded in the browser. Convert it to JPEG first.",
      toastNotImage: "That's not an image. Choose a JPEG, PNG or WebP.",
      toastDecode: "Couldn't read that photo.",
      toastStarted: 'Download started.',
      toastCancelled: 'Download cancelled.',
      toastFailed: 'Download failed. Try again.',
      toastBlobFailed: "Couldn't create the image. Try a smaller size.",
      toastInvalidSize: 'Enter a size between 64 and 12000.',
      confirmIOS: 'This size is {w} × {h} ({mp} MP), above iOS Safari\'s canvas limit and may fail.\n\nTry a smaller crop frame. Continue?',
      confirmMemory: 'This size needs about {mb} MB of memory and may fail on phones. Continue?',
      estSmall: 'photo is smaller — keeps original size',
      estCropped: 'cropped'
    }
  };

  function detectLang() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      if (/^zh/i.test(list[i])) return 'zh';
    }
    return 'en';
  }

  var currentLang = detectLang();

  function t(key, vars) {
    var table = STRINGS[currentLang] || STRINGS.zh;
    var out = table[key] || STRINGS.zh[key] || key;
    if (vars) {
      out = out.replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] != null ? vars[k] : m;
      });
    }
    return out;
  }

  /* ---------- 常數 ---------- */

  var DEFAULTS = {
    horizon: 0.5,
    tilt: 0,
    compression: 0.97,
    ripple: 10,
    scale: 1.3,
    hue: 195,
    tint: 10,
    fade: 12,
    glint: 24,
    transparency: 0,
    style: 'natural',
    noiseAmt: 0,
    noiseScale: 1,
    noiseDir: 50,
    perspAmt: 0,
    perspNear: 50,
    perspStart: 100,
    perspCurve: 50,
    perspMax: 150,
    axis: 'h',
    side: 1
  };

  var FALLBACK_PRESETS = [
    { id: 'salt', name: '鹽湖天空之鏡', values: { compression: 0.97, ripple: 10, scale: 1.3, hue: 195, tint: 10, fade: 12, glint: 24 } },
    { id: 'pond', name: '山泉池塘', values: { compression: 0.94, ripple: 70, scale: 0.75, hue: 205, tint: 16, fade: 14, glint: 40 } }
  ];

  var PRESETS = (SM && Array.isArray(SM.PRESETS) && SM.PRESETS.length) ? SM.PRESETS : FALLBACK_PRESETS;

  var PRESET_I18N = {
    salt: 'presetSalt',
    pond: 'presetPond'
  };

  var CONTROL_DEFS = [
    { key: 'compression', i18n: 'ctrlCompression', min: 0, max: 2, step: 0.01, group: 'reflection', format: function (v) { return Number(v).toFixed(2); } },
    { key: 'ripple', i18n: 'ctrlRipple', min: 0, max: 100, step: 1, group: 'advanced', i18nByStyle: { calm: 'ctrlCalmAmp' }, format: function (v) { return Math.round(v); } },
    { key: 'scale', i18n: 'ctrlScale', min: 0.5, max: 2, step: 0.05, group: 'advanced', i18nByStyle: { calm: 'ctrlCalmScale' }, format: function (v) { return Number(v).toFixed(2); } },
    { key: 'glint', i18n: 'ctrlGlint', min: 0, max: 100, step: 1, group: 'advanced', styles: ['natural'], format: function (v) { return Math.round(v); } },
    { key: 'noiseAmt', i18n: 'ctrlNoiseAmt', min: 0, max: 100, step: 1, group: 'noise', format: function (v) { return Math.round(v); } },
    { key: 'noiseScale', i18n: 'ctrlNoiseScale', min: 0.2, max: 3, step: 0.05, group: 'noise', format: function (v) { return Number(v).toFixed(2); } },
    { key: 'noiseDir', i18n: 'ctrlNoiseDir', min: 0, max: 100, step: 1, group: 'noise', format: function (v) { return Math.round(v); } },
    { key: 'perspAmt', i18n: 'ctrlPerspAmt', min: 0, max: 100, step: 1, group: 'persp', format: function (v) { return Math.round(v); } },
    { key: 'perspNear', i18n: 'ctrlPerspNear', min: 0, max: 100, step: 1, group: 'persp', format: function (v) { return Math.round(v); } },
    { key: 'perspStart', i18n: 'ctrlPerspStart', min: 0, max: 100, step: 1, group: 'persp', format: function (v) { return Math.round(v); } },
    { key: 'perspCurve', i18n: 'ctrlPerspCurve', min: 0, max: 100, step: 1, group: 'persp', format: function (v) { return Math.round(v); } },
    { key: 'perspMax', i18n: 'ctrlPerspMax', min: 100, max: 250, step: 1, group: 'persp', format: function (v) { return Math.round(v); } },
    { key: 'hue', i18n: 'ctrlHue', min: 160, max: 260, step: 1, group: 'water', hue: true, format: function (v) { return Math.round(v) + '°'; } },
    { key: 'tint', i18n: 'ctrlTint', min: 0, max: 100, step: 1, group: 'water', format: function (v) { return Math.round(v); } },
    { key: 'fade', i18n: 'ctrlFade', min: 0, max: 100, step: 1, group: 'water', format: function (v) { return Math.round(v); } },
    { key: 'transparency', i18n: 'ctrlTransparency', min: 0, max: 100, step: 1, group: 'water', format: function (v) { return Math.round(v) + '%'; } }
  ];

  /* 三種同層風格：平靜湖水，以及自然波場的兩個端點（鹽湖、山泉）。
   * 後兩者底層 style 仍是 natural，差別只在參數組。 */
  var STYLE_DEFS = [
    { id: 'calm', i18n: 'styleCalm' },
    { id: 'salt', i18n: 'presetSalt', preset: 'salt' },
    { id: 'pond', i18n: 'presetPond', preset: 'pond' }
  ];

  /* 特徵參數的中性值（0 = 關）；切風格時一律先歸中性，再套該風格建議值。 */
  var FEATURE_NEUTRAL = {
    noiseAmt: 0, noiseScale: 1, noiseDir: 50,
    perspAmt: 0, perspNear: 50, perspStart: 100, perspCurve: 50, perspMax: 150
  };

  /* 切換風格時套用的建議值；horizon/tilt/compression/hue/transparency 為共用值不動。
   * 鹽湖／山泉的參數由 PRESETS 提供；平靜湖水在此。
   * 切換風格一律不動水平線與角度。 */
  var STYLE_DEFAULTS = {
    calm: assign({}, FEATURE_NEUTRAL, { ripple: 40, scale: 1.0, tint: 35, perspAmt: 20 })
  };

  var RATIO_DEFS = [
    { value: 'original', i18n: 'ratioOriginal' },
    { value: '1:1', aspect: 1 },
    { value: '4:5', aspect: 4 / 5 },
    { value: '16:9', aspect: 16 / 9 },
    { value: 'free', i18n: 'ratioFree' }
  ];

  /* ---------- 狀態 ---------- */

  var state = assign({}, DEFAULTS);
  var image = null;
  /* 預設選鹽湖天空之鏡（底層 natural）；DEFAULTS 即其參數。 */
  var activePreset = 'salt';
  var compareActive = false;
  var rafPending = false;
  var ratioMode = 'original';
  var cropAspect = null;
  var cropRect = { x: 0, y: 0, w: 1, h: 1 };
  var outputFormat = 'jpeg';
  var jpegQuality = 92;
  var exportController = null;
  var toastTimer = null;
  var controls = {};
  var cropDrag = null;
  var handleDrag = null;
  var activeTab = 'adjust';
  var DEG = Math.PI / 180;

  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* ---------- 小工具 ---------- */

  function $(id) { return document.getElementById(id); }

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) continue;
      for (var k in src) {
        if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
      }
    }
    return target;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function timeStamp() {
    var d = new Date();
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
  }

  function toast(message, isError) {
    var el = $('toast');
    el.textContent = message;
    el.classList.toggle('is-error', !!isError);
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 3400);
  }

  /* ---------- DOM ---------- */

  var stage = $('stage');
  var stageInner = $('stageInner');
  var emptyState = $('emptyState');
  var dropzone = $('dropzone');
  var frameEl = $('canvasFrame');
  var canvas = $('preview');
  var horizonEl = $('horizon');
  var horizonLabel = $('horizonLabel');
  var horizonRange = $('horizonRange');
  var horizonNumber = $('horizonNumber');
  var tiltRange = $('tiltRange');
  var tiltValue = $('tiltValue');
  var cropLayer = $('cropLayer');
  var cropFrame = $('cropFrame');
  var cropSize = $('cropSize');
  var stageMeta = $('stageMeta');
  var loadingEl = $('loading');
  var loadingText = $('loadingText');
  var styleOptionsEl = $('styleOptions');
  var fileInput = $('fileInput');
  var panel = $('panel');
  var sheetGrip = $('sheetGrip');
  var tabAdjust = $('tabAdjust');
  var tabDownload = $('tabDownload');
  var paneAdjust = $('paneAdjust');
  var paneDownload = $('paneDownload');
  var ratioOptionsEl = $('ratioOptions');
  var handleLEl = document.querySelector('.horizon-handle--left');
  var handleREl = document.querySelector('.horizon-handle--right');
  var cropNote = $('cropNote');
  var formatOptionsEl = $('formatOptions');
  var estimateEl = $('estimate');
  var qualityRow = $('qualityRow');
  var qualityInput = $('quality');
  var qualityValue = $('qualityValue');
  var exportBtn = $('exportBtn');
  var exportProgress = $('exportProgress');
  var progressBar = $('progressBar');
  var progressText = $('progressText');
  var cancelExportBtn = $('cancelExport');
  var compareBtn = $('compareBtn');
  var resetBtn = $('resetBtn');
  var resetParamsBtn = $('resetParamsBtn');
  var levelBtn = $('levelBtn');

  /* ---------- 建立控制項 ---------- */

  function buildControls() {
    var groups = {
      reflection: $('controlsReflection'),
      water: $('controlsWater'),
      advanced: $('controlsAdvanced'),
      noise: $('controlsNoise'),
      persp: $('controlsPersp')
    };

    CONTROL_DEFS.forEach(function (def) {
      var wrap = document.createElement('div');
      wrap.className = 'control' + (def.hue ? ' control-hue' : '');

      var head = document.createElement('div');
      head.className = 'control-head';

      var label = document.createElement('label');
      label.setAttribute('for', 'ctrl-' + def.key);
      label.dataset.i18n = def.i18n;
      label.textContent = t(def.i18n);

      var value = document.createElement('span');
      value.className = 'control-value';
      value.id = 'value-' + def.key;
      value.textContent = def.format(state[def.key]);

      head.appendChild(label);
      head.appendChild(value);

      var input = document.createElement('input');
      input.type = 'range';
      input.id = 'ctrl-' + def.key;
      input.min = def.min;
      input.max = def.max;
      input.step = def.step;
      input.value = state[def.key];

      wrap.appendChild(head);
      wrap.appendChild(input);
      groups[def.group].appendChild(wrap);

      controls[def.key] = { def: def, input: input, value: value, wrap: wrap, label: label };

      input.addEventListener('input', function () {
        var v = parseFloat(input.value);
        if (!isFinite(v)) return;
        state[def.key] = v;
        paintControl(def, input);
        value.textContent = def.format(v);
        scheduleRender();
      });

      paintControl(def, input);
    });
  }

  function paintControl(def, input) {
    var pct = (parseFloat(input.value) - def.min) / (def.max - def.min) * 100;
    input.style.setProperty('--fill', clamp(pct, 0, 100) + '%');
  }

  /* ---------- 水波風格 ---------- */

  function buildStyleOptions() {
    STYLE_DEFS.forEach(function (def) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seg-btn';
      btn.dataset.i18n = def.i18n;
      btn.textContent = t(def.i18n);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.mode = def.id;
      btn.addEventListener('click', function () { applyStyleOption(def); });
      styleOptionsEl.appendChild(btn);
    });
  }

  function styleLabelKey(def) {
    if (def.i18nByStyle && def.i18nByStyle[state.style]) return def.i18nByStyle[state.style];
    return def.i18n;
  }

  function updateStyleUI() {
    var style = state.style || 'natural';
    /* 鹽湖／山泉底層是 natural，靠 activePreset 分辨；平靜湖水用 style 本身。 */
    var mode = style === 'calm' ? 'calm' : activePreset;
    Array.prototype.forEach.call(styleOptionsEl.children, function (btn) {
      var isActive = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    CONTROL_DEFS.forEach(function (def) {
      var c = controls[def.key];
      if (!c || !c.wrap) return;
      c.wrap.hidden = !(!def.styles || def.styles.indexOf(style) >= 0);
      var key = styleLabelKey(def);
      c.label.dataset.i18n = key;
      c.label.textContent = t(key);
    });
    /* 特徵子區塊：若其內所有滑桿都被該風格隱藏，整塊也隱藏。 */
    [['featureNoise', 'controlsNoise'], ['featurePersp', 'controlsPersp']].forEach(function (pair) {
      var section = $(pair[0]);
      var box = $(pair[1]);
      if (!section || !box) return;
      var anyVisible = false;
      Array.prototype.forEach.call(box.children, function (w) { if (!w.hidden) anyVisible = true; });
      section.hidden = !anyVisible;
    });
  }

  function findPreset(id) {
    for (var i = 0; i < PRESETS.length; i++) {
      if (PRESETS[i].id === id) return PRESETS[i];
    }
    return null;
  }

  function applyStyleOption(def) {
    if (def.preset) {
      var preset = findPreset(def.preset);
      if (!preset) return;
      /* 鹽湖／山泉是自然波場的參數組；只換水波／水色，不動水平線與角度。
       * 切風格一律先把特徵歸中性，再套該組參數。 */
      state.style = 'natural';
      assign(state, FEATURE_NEUTRAL);
      assign(state, preset.values);
      activePreset = def.preset;
      syncUI();
      scheduleRender();
      var key = PRESET_I18N[preset.id];
      toast(t('toastPreset', { name: key ? t(key) : preset.name }));
      return;
    }
    if (!STYLE_DEFAULTS[def.id]) return;
    state.style = def.id;
    assign(state, STYLE_DEFAULTS[def.id]);
    activePreset = null;
    syncUI();
    scheduleRender();
  }

  function buildRatioOptions() {
    RATIO_DEFS.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seg-btn';
      if (opt.i18n) {
        btn.dataset.i18n = opt.i18n;
        btn.textContent = t(opt.i18n);
      } else {
        btn.textContent = opt.value;
      }
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.ratio = opt.value;
      btn.addEventListener('click', function () { selectRatio(opt.value); });
      ratioOptionsEl.appendChild(btn);
    });
  }

  function buildFormatOptions() {
    [{ id: 'jpeg', label: 'JPEG' }, { id: 'png', label: 'PNG' }].forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seg-btn';
      btn.textContent = opt.label;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.format = opt.id;
      btn.addEventListener('click', function () {
        outputFormat = opt.id;
        updateFormatUI();
      });
      formatOptionsEl.appendChild(btn);
    });
  }

  /* ---------- 語系套用 ---------- */

  function applyLanguage() {
    document.documentElement.lang = currentLang === 'zh' ? 'zh-Hant' : 'en';
    document.title = t('pageTitle');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('metaDesc'));

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-alt]'), function (el) {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.lang-toggle button'), function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.lang === currentLang ? 'true' : 'false');
    });

    syncHorizon();
    updateStyleUI();
    updateRatioUI();
    updateFormatUI();
    updateEstimate();
    updateCropOverlay();
  }

  function setLanguage(next) {
    if (next !== 'zh' && next !== 'en') return;
    if (next === currentLang) return;
    currentLang = next;
    applyLanguage();
  }

  /* ---------- 同步 UI ---------- */

  function syncUI() {
    syncHorizon();
    updateStyleUI();
    CONTROL_DEFS.forEach(function (def) {
      var c = controls[def.key];
      if (!c) return;
      c.input.value = state[def.key];
      c.value.textContent = def.format(state[def.key]);
      paintControl(def, c.input);
    });

    qualityInput.value = jpegQuality;
    qualityValue.textContent = jpegQuality;
    paintQuality();

    updateRatioUI();
    updateFormatUI();
    updateEstimate();
    updateCropOverlay();
  }

  function syncHorizon() {
    var pct = clamp(state.horizon, 0, 1) * 100;
    var tilt = clamp(state.tilt, -89, 89);

    /* 覆蓋層線長固定為畫面對角線，任何角度都能橫跨畫面（框 overflow 裁掉多餘）。
     * 兩端把手改放在「線與畫面框的交點」上，陡角時線從上／下邊離開畫面才抓得到。 */
    var w = frameEl.clientWidth || 600;
    var h = frameEl.clientHeight || 400;
    /* 把手尺寸（桌機 14／手機 18）；右把手要以右緣對齊交點，往框內縮一個寬度。 */
    var handleW = (handleREl && handleREl.offsetWidth) || 14;
    var diag = Math.sqrt(w * w + h * h);
    var linePct = diag / w * 100;

    horizonEl.style.width = linePct + '%';
    horizonEl.style.height = '';
    horizonEl.style.left = ((100 - linePct) / 2) + '%';
    horizonEl.style.top = pct + '%';
    horizonEl.style.transform = 'rotate(' + tilt + 'deg)';

    var span = SM.lineSpan(w, h, state);
    var cx = w / 2;
    var cy = state.horizon * h;
    var tx = Math.cos(tilt * DEG);
    var ty = Math.sin(tilt * DEG);
    var half = diag / 2;
    /* 兩端把手都放在「線與畫面框的交點」上，但對齊方向不同：
     * 左把手以左緣對齊交點、向右（框內）延伸；右把手以右緣對齊交點、向左（框內）延伸。
     * 若右把手也用左緣對齊，整個圓點會落在框外，被 .canvas-frame 的 overflow:hidden 裁掉。 */
    if (handleLEl) {
      handleLEl.style.left = (half + (span.ax - cx) * tx + (span.ay - cy) * ty) + 'px';
    }
    if (handleREl) {
      handleREl.style.left = (half + (span.bx - cx) * tx + (span.by - cy) * ty - handleW) + 'px';
    }

    horizonLabel.style.left = '50%';
    horizonLabel.style.top = pct + '%';
    horizonLabel.style.transform = 'translate(-50%, calc(-100% - 12px))';

    var txt = pct.toFixed(2) + '%';
    if (Math.abs(tilt) >= 0.05) {
      txt += ' · ' + (tilt > 0 ? '+' : '') + tilt.toFixed(1) + '°';
    }
    horizonLabel.textContent = txt;
    horizonEl.setAttribute('aria-valuenow', pct.toFixed(1));
    horizonEl.setAttribute('aria-valuetext', txt);

    horizonRange.value = pct;
    horizonRange.setAttribute('aria-valuetext', txt);
    horizonRange.style.setProperty('--fill', pct + '%');
    if (document.activeElement !== horizonNumber) {
      horizonNumber.value = pct.toFixed(2);
    }

    tiltRange.value = tilt;
    tiltRange.setAttribute('aria-valuetext', (tilt > 0 ? '+' : '') + tilt.toFixed(1) + '°');
    tiltRange.style.setProperty('--fill', ((tilt + 89) / 178 * 100) + '%');
    tiltValue.textContent = (tilt > 0 ? '+' : '') + tilt.toFixed(1) + '°';
  }

  function updateRatioUI() {
    Array.prototype.forEach.call(ratioOptionsEl.children, function (btn) {
      var active = btn.dataset.ratio === ratioMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
  }

  function updateFormatUI() {
    Array.prototype.forEach.call(formatOptionsEl.children, function (btn) {
      var active = btn.dataset.format === outputFormat;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    qualityRow.hidden = outputFormat !== 'jpeg';
  }

  function paintQuality() {
    var pct = (jpegQuality - 60) / 40 * 100;
    qualityInput.style.setProperty('--fill', clamp(pct, 0, 100) + '%');
  }

  /* ---------- 裁切比例 / 範圍 ---------- */

  function clampCropRect(rect) {
    var minW = image ? Math.min(1, 32 / image.width) : 0.05;
    var minH = image ? Math.min(1, 32 / image.height) : 0.05;
    var w = clamp(rect.w, minW, 1);
    var h = clamp(rect.h, minH, 1);
    return {
      x: clamp(rect.x, 0, 1 - w),
      y: clamp(rect.y, 0, 1 - h),
      w: w,
      h: h
    };
  }

  function resetCropToFull() {
    cropRect = { x: 0, y: 0, w: 1, h: 1 };
    ratioMode = 'original';
    cropAspect = null;
    updateRatioUI();
    updateEstimate();
    updateCropOverlay();
  }

  function selectRatio(value) {
    var def = null;
    for (var i = 0; i < RATIO_DEFS.length; i++) {
      if (RATIO_DEFS[i].value === value) { def = RATIO_DEFS[i]; break; }
    }
    ratioMode = value;
    cropAspect = def && def.aspect ? def.aspect : null;

    if (value === 'original') {
      cropRect = { x: 0, y: 0, w: 1, h: 1 };
    } else if (cropAspect && image) {
      var imgAspect = image.width / image.height;
      var normalizedAspect = cropAspect / imgAspect;
      var w = normalizedAspect >= 1 ? 1 : normalizedAspect;
      var h = normalizedAspect >= 1 ? 1 / normalizedAspect : 1;
      var cx = cropRect.x + cropRect.w / 2;
      var cy = cropRect.y + cropRect.h / 2;
      cropRect = {
        x: clamp(cx - w / 2, 0, 1 - w),
        y: clamp(cy - h / 2, 0, 1 - h),
        w: w,
        h: h
      };
    }

    updateRatioUI();
    updateEstimate();
    updateCropOverlay();
  }

  function getOutputSpec() {
    if (!image) return null;
    return {
      width: Math.max(1, Math.round(cropRect.w * image.width)),
      height: Math.max(1, Math.round(cropRect.h * image.height)),
      crop: { x: cropRect.x, y: cropRect.y, w: cropRect.w, h: cropRect.h },
      cropped: cropRect.w < 0.999 || cropRect.h < 0.999,
      noUpscale: true
    };
  }

  function updateEstimate() {
    var spec = getOutputSpec();
    if (!spec) {
      estimateEl.textContent = '—';
      cropNote.hidden = true;
      updateExportBtn();
      return;
    }
    var mp = spec.width * spec.height / 1e6;
    var bits = [spec.width + ' × ' + spec.height, mp.toFixed(1) + ' MP'];
    if (spec.cropped) bits.push(t('estCropped'));
    estimateEl.textContent = bits.join(' · ');
    cropNote.hidden = false;
    updateExportBtn();
  }

  function isCropVisible() {
    return !!image && activeTab === 'download';
  }

  function updateCropOverlay() {
    var show = isCropVisible();
    cropLayer.hidden = !show;
    frameEl.classList.toggle('is-cropping', show);
    if (!show) return;

    var spec = getOutputSpec();
    cropFrame.style.left = (cropRect.x * 100).toFixed(4) + '%';
    cropFrame.style.top = (cropRect.y * 100).toFixed(4) + '%';
    cropFrame.style.width = (cropRect.w * 100).toFixed(4) + '%';
    cropFrame.style.height = (cropRect.h * 100).toFixed(4) + '%';
    cropSize.textContent = spec.width + ' × ' + spec.height;
  }

  function updateExportBtn() {
    exportBtn.disabled = !image || !!exportController;
  }

  /* ---------- 預覽 ---------- */

  function scheduleRender() {
    if (!image || rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      renderNow();
    });
  }

  function renderNow() {
    if (!image) return;
    if (SM) {
      try {
        SM.renderPreview(canvas, image.source, state, { plain: compareActive });
        return;
      } catch (err) {
        /* 引擎出錯時退回原圖顯示，不讓整個介面壞掉 */
      }
    }
    drawFallback(state);
  }

  function drawFallback(st) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(frameEl.clientWidth * dpr));
    var h = Math.max(1, Math.round(frameEl.clientHeight * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image.source, 0, 0, w, h);
    if (compareActive) return;
    var hy = st.horizon * h;
    var slope = Math.tan((st.tilt || 0) * DEG);
    var yL = hy - (w / 2) * slope;
    var yR = hy + (w / 2) * slope;
    ctx.fillStyle = 'rgba(9, 14, 18, .6)';
    ctx.beginPath();
    ctx.moveTo(0, yL);
    ctx.lineTo(w, yR);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, .45)';
    ctx.beginPath();
    ctx.moveTo(0, yL);
    ctx.lineTo(w, yR);
    ctx.stroke();
  }

  function fitCanvas() {
    if (!image) return;
    var cs = getComputedStyle(stageInner);
    var availW = stageInner.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    var availH = stageInner.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    if (availW < 4 || availH < 4) return;

    var ratio = image.width / image.height;
    var w = availW;
    var h = w / ratio;
    if (h > availH) {
      h = availH;
      w = h * ratio;
    }
    frameEl.style.width = Math.max(1, Math.round(w)) + 'px';
    frameEl.style.height = Math.max(1, Math.round(h)) + 'px';
    syncHorizon();
    scheduleRender();
  }

  /* ---------- 水平線 / 傾斜 ---------- */

  function setHorizon(ratio) {
    var next = clamp(ratio, 0, 1);
    if (Math.abs(next - state.horizon) < 1e-6) {
      scheduleRender();
      return;
    }
    state.horizon = next;
    syncHorizon();
    scheduleRender();
  }

  function setTilt(value) {
    var next = clamp(Number(value) || 0, -89, 89);
    if (Math.abs(next) < 0.05) next = 0;
    if (Math.abs(next - state.tilt) < 1e-6) {
      scheduleRender();
      return;
    }
    state.tilt = next;
    syncHorizon();
    scheduleRender();
  }

  var dragPointer = null;

  function isCropBlocking() {
    return !cropLayer.hidden;
  }

  function pointToHorizon(e) {
    var r = frameEl.getBoundingClientRect();
    var slope = Math.tan(state.tilt * DEG);
    if (state.axis === 'v') {
      if (r.width <= 0) return;
      var vx = e.clientX - r.left;
      var vy = clamp(e.clientY - r.top, 0, r.height);
      /* 讓傾斜線通過游標，而不是只把線的中心移到游標 x。 */
      var centerV = vx + (vy - r.height / 2) * slope;
      setHorizon(centerV / r.width);
    } else {
      if (r.height <= 0) return;
      var hx = clamp(e.clientX - r.left, 0, r.width);
      var hy = e.clientY - r.top;
      var centerH = hy - (hx - r.width / 2) * slope;
      setHorizon(centerH / r.height);
    }
  }

  frameEl.addEventListener('pointerdown', function (e) {
    if (!image || isCropBlocking()) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button, input, a, .horizon-handle, .crop-frame')) return;
    dragPointer = e.pointerId;
    try { frameEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    pointToHorizon(e);
    e.preventDefault();
  });

  frameEl.addEventListener('pointermove', function (e) {
    if (dragPointer === null || e.pointerId !== dragPointer) return;
    pointToHorizon(e);
    e.preventDefault();
  });

  function endHorizonDrag(e) {
    if (dragPointer === null) return;
    if (e && e.pointerId !== undefined && e.pointerId !== dragPointer) return;
    try { frameEl.releasePointerCapture(dragPointer); } catch (err) { /* ignore */ }
    dragPointer = null;
  }

  frameEl.addEventListener('pointerup', endHorizonDrag);
  frameEl.addEventListener('pointercancel', endHorizonDrag);

  horizonRange.addEventListener('input', function () {
    setHorizon(parseFloat(horizonRange.value) / 100);
  });

  horizonNumber.addEventListener('input', function () {
    var v = parseFloat(horizonNumber.value);
    if (isFinite(v)) setHorizon(clamp(v, 0, 100) / 100);
  });

  horizonNumber.addEventListener('blur', syncHorizon);

  $('horizonMinus').addEventListener('click', function () {
    var span = state.axis === 'v' ? (image ? image.width : 1000) : (image ? image.height : 1000);
    setHorizon(state.horizon - 1 / span);
  });

  $('horizonPlus').addEventListener('click', function () {
    var span = state.axis === 'v' ? (image ? image.width : 1000) : (image ? image.height : 1000);
    setHorizon(state.horizon + 1 / span);
  });

  $('resetHorizon').addEventListener('click', function () {
    setHorizon(DEFAULTS.horizon);
  });

  levelBtn.addEventListener('click', function () {
    setTilt(0);
  });

  tiltRange.addEventListener('input', function () {
    setTilt(parseFloat(tiltRange.value));
  });

  horizonEl.addEventListener('keydown', function (e) {
    var px = e.shiftKey ? 10 : 1;
    var span = image ? (state.axis === 'v' ? image.width : image.height) : 1000;
    var step = px / span;
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        setHorizon(state.horizon - step);
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        setHorizon(state.horizon + step);
        e.preventDefault();
        break;
      case 'Home':
        setHorizon(0);
        e.preventDefault();
        break;
      case 'End':
        setHorizon(1);
        e.preventDefault();
        break;
      case 'PageUp':
        setHorizon(state.horizon - 0.01);
        e.preventDefault();
        break;
      case 'PageDown':
        setHorizon(state.horizon + 0.01);
        e.preventDefault();
        break;
      default:
        break;
    }
  });

  /* 兩端把手：以另一端為支點調整傾角 */
  function startHandle(e, end, el) {
    if (!image || isCropBlocking()) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    handleDrag = { id: e.pointerId, end: end, el: el };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  }

  function moveHandle(e) {
    if (!handleDrag || e.pointerId !== handleDrag.id) return;
    var r = frameEl.getBoundingClientRect();
    var w = r.width;
    var h = r.height;
    if (w < 2 || h < 2) return;

    var px = clamp(e.clientX - r.left, 0, w);
    var py = clamp(e.clientY - r.top, 0, h);
    var maxSlope = Math.tan(89 * DEG);
    var fixedX, fixedY, ns, nc;

    if (state.axis === 'v') {
      var centerX = state.horizon * w;
      var slopeV = Math.tan(state.tilt * DEG);
      if (handleDrag.end === 'left') {
        fixedX = centerX - (h / 2) * slopeV;
        fixedY = h;
      } else {
        fixedX = centerX + (h / 2) * slopeV;
        fixedY = 0;
      }
      var dy = py - fixedY;
      if (Math.abs(dy) < 2) return;
      ns = clamp((px - fixedX) / dy, -maxSlope, maxSlope);
      nc = fixedX + (h / 2 - fixedY) * ns;
      state.horizon = clamp(nc / w, 0, 1);
      state.tilt = -Math.atan(ns) / DEG;
    } else {
      /* 固定端＝另一端把手所在的「線與畫面框交點」；
         陡角時線從上／下邊離開畫面，端點不再假設在左右邊界。 */
      var span = SM.lineSpan(w, h, state);
      if (handleDrag.end === 'left') {
        fixedX = span.bx;
        fixedY = span.by;
      } else {
        fixedX = span.ax;
        fixedY = span.ay;
      }
      var dx = px - fixedX;
      if (Math.abs(dx) < 2) return;
      ns = clamp((py - fixedY) / dx, -maxSlope, maxSlope);
      nc = fixedY + (w / 2 - fixedX) * ns;
      state.horizon = clamp(nc / h, 0, 1);
      state.tilt = Math.atan(ns) / DEG;
    }

    syncHorizon();
    scheduleRender();
    e.preventDefault();
  }

  function endHandle(e) {
    if (!handleDrag) return;
    if (e && e.pointerId !== undefined && e.pointerId !== handleDrag.id) return;
    try { handleDrag.el.releasePointerCapture(handleDrag.id); } catch (err) { /* ignore */ }
    handleDrag = null;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.horizon-handle'), function (el) {
    el.addEventListener('pointerdown', function (e) { startHandle(e, el.dataset.end, el); });
    el.addEventListener('pointermove', moveHandle);
    el.addEventListener('pointerup', endHandle);
    el.addEventListener('pointercancel', endHandle);
  });

  /* ---------- 重設 ---------- */

  function resetParameters(resetCrop) {
    assign(state, DEFAULTS);
    /* 重設後回到預設風格：鹽湖天空之鏡。 */
    activePreset = 'salt';
    if (resetCrop) resetCropToFull();
    syncUI();
    updateCropOverlay();
    scheduleRender();
  }

  resetBtn.addEventListener('click', function () {
    resetParameters(true);
  });

  resetParamsBtn.addEventListener('click', function () {
    resetParameters(false);
  });

  /* ---------- 比較原圖 ---------- */

  function setCompare(on) {
    if (compareActive === on) return;
    compareActive = on;
    compareBtn.classList.toggle('is-active', on);
    compareBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    scheduleRender();
  }

  compareBtn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    setCompare(true);
    try { compareBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  compareBtn.addEventListener('pointerup', function () { setCompare(false); });
  compareBtn.addEventListener('pointercancel', function () { setCompare(false); });
  compareBtn.addEventListener('pointerleave', function () { setCompare(false); });
  compareBtn.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setCompare(true); }
  });
  compareBtn.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter') setCompare(false);
  });
  compareBtn.addEventListener('blur', function () { setCompare(false); });

  /* ---------- 上傳 ---------- */

  function isHeic(file) {
    return /heic|heif/i.test(file.type || '') || /\.(heic|heif)$/i.test(file.name || '');
  }

  function setLoading(on, text) {
    loadingEl.hidden = !on;
    if (text) loadingText.textContent = text;
  }

  function showEditor() {
    emptyState.hidden = true;
    frameEl.hidden = false;
    stageMeta.textContent = image.width + ' × ' + image.height;
    fitCanvas();
    scheduleRender();
    updateEstimate();
    updateCropOverlay();
  }

  async function handleFile(file) {
    if (!file) return;
    if (isHeic(file)) {
      toast(t('toastHeic'), true);
      return;
    }
    if (file.type && !/^image\//.test(file.type)) {
      toast(t('toastNotImage'), true);
      return;
    }

    setLoading(true, t('loading'));
    try {
      var loaded;
      if (SM && SM.loadImage) {
        loaded = await SM.loadImage(file);
      } else {
        loaded = await loadImageFallback(file);
      }
      image = loaded;
      /* 每次載入照片都還原初始參數（含裁切框），不沿用上一張的設定 */
      resetParameters(true);
      setLoading(false);
      showEditor();
    } catch (err) {
      setLoading(false);
      toast(t('toastDecode'), true);
    }
  }

  function loadImageFallback(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('decode failed'));
      };
      img.src = url;
    });
  }

  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  /* 頂部列常駐的「換照片」按鈕 */
  $('openPhotoBtn').addEventListener('click', function () { fileInput.click(); });

  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (file) handleFile(file);
  });

  /* 拖放 */

  ['dragenter', 'dragover'].forEach(function (type) {
    stage.addEventListener(type, function (e) {
      e.preventDefault();
      if (!image) dropzone.classList.add('is-drag');
    });
  });

  ['dragleave', 'dragend'].forEach(function (type) {
    stage.addEventListener(type, function (e) {
      if (e.target === stage || !stage.contains(e.relatedTarget)) {
        dropzone.classList.remove('is-drag');
      }
    });
  });

  stage.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('is-drag');
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  /* 貼上 */

  document.addEventListener('paste', function (e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image/') === 0) {
        var file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
          return;
        }
      }
    }
  });

  /* ---------- 裁切框拖曳 / 縮放 ---------- */

  function cropMinSize() {
    return {
      w: image ? Math.min(1, 32 / image.width) : 0.05,
      h: image ? Math.min(1, 32 / image.height) : 0.05
    };
  }

  /* cropAspect 是輸出像素的長寬比；裁切框用 0–1 正規化座標，
     因此換算成比例時要再除以原圖長寬比。 */
  function cropAspectNorm() {
    if (!cropAspect || !image) return null;
    return cropAspect / (image.width / image.height);
  }

  function resizeCropCorner(handle, nx, ny, start) {
    var rect = start.rect;
    var min = cropMinSize();
    var aspect = cropAspectNorm();
    var isLeft = handle.indexOf('w') >= 0;
    var isTop = handle.indexOf('n') >= 0;
    var anchorX = isLeft ? rect.x + rect.w : rect.x;
    var anchorY = isTop ? rect.y + rect.h : rect.y;
    var maxW = isLeft ? anchorX : 1 - anchorX;
    var maxH = isTop ? anchorY : 1 - anchorY;
    var w = Math.max(min.w, Math.abs(nx - anchorX));
    var h = Math.max(min.h, Math.abs(ny - anchorY));

    if (aspect) {
      var fit = Math.min(w, h * aspect);
      w = Math.max(fit, Math.max(min.w, min.h * aspect));
      h = w / aspect;
      if (w > maxW) { w = maxW; h = w / aspect; }
      if (h > maxH) { h = maxH; w = h * aspect; }
    } else {
      w = Math.min(w, maxW);
      h = Math.min(h, maxH);
    }

    return clampCropRect({
      x: isLeft ? anchorX - w : anchorX,
      y: isTop ? anchorY - h : anchorY,
      w: w,
      h: h
    });
  }

  function resizeCropEdge(handle, nx, ny, start) {
    var rect = start.rect;
    var min = cropMinSize();
    var aspect = cropAspectNorm();
    var horizontal = handle === 'e' || handle === 'w';

    if (horizontal) {
      var isLeft = handle === 'w';
      var anchorX = isLeft ? rect.x + rect.w : rect.x;
      var maxW = isLeft ? anchorX : 1 - anchorX;
      var w = clamp(Math.abs(nx - anchorX), Math.max(min.w, aspect ? min.h * aspect : min.w), maxW);
      var h = rect.h;
      var y = rect.y;
      if (aspect) {
        h = w / aspect;
        var cy = rect.y + rect.h / 2;
        var maxH = 2 * Math.min(cy, 1 - cy);
        if (h > maxH) { h = maxH; w = h * aspect; }
        y = cy - h / 2;
      }
      return clampCropRect({ x: isLeft ? anchorX - w : anchorX, y: y, w: w, h: h });
    }

    var isTop = handle === 'n';
    var anchorY = isTop ? rect.y + rect.h : rect.y;
    var maxH = isTop ? anchorY : 1 - anchorY;
    var height = clamp(Math.abs(ny - anchorY), Math.max(min.h, aspect ? min.w / aspect : min.h), maxH);
    var width = rect.w;
    var x = rect.x;
    if (aspect) {
      width = height * aspect;
      var cx = rect.x + rect.w / 2;
      var maxW = 2 * Math.min(cx, 1 - cx);
      if (width > maxW) { width = maxW; height = width / aspect; }
      x = cx - width / 2;
    }
    return clampCropRect({ x: x, y: isTop ? anchorY - height : anchorY, w: width, h: height });
  }

  cropFrame.addEventListener('pointerdown', function (e) {
    if (cropLayer.hidden) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    var r = frameEl.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    var handleEl = e.target.closest('.crop-handle');
    if (handleEl && ratioMode === 'original') {
      /* 從「原始」直接拉把手縮放時，比例已不再是原始比例。 */
      ratioMode = 'free';
      cropAspect = null;
      updateRatioUI();
      updateEstimate();
    }
    cropDrag = {
      id: e.pointerId,
      handle: handleEl ? handleEl.dataset.handle : 'move',
      px: e.clientX,
      py: e.clientY,
      rect: { x: cropRect.x, y: cropRect.y, w: cropRect.w, h: cropRect.h },
      fw: r.width,
      fh: r.height
    };
    try { cropFrame.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });

  cropFrame.addEventListener('pointermove', function (e) {
    if (!cropDrag || e.pointerId !== cropDrag.id) return;

    if (cropDrag.handle === 'move') {
      var dx = (e.clientX - cropDrag.px) / cropDrag.fw;
      var dy = (e.clientY - cropDrag.py) / cropDrag.fh;
      cropRect = clampCropRect({
        x: cropDrag.rect.x + dx,
        y: cropDrag.rect.y + dy,
        w: cropDrag.rect.w,
        h: cropDrag.rect.h
      });
    } else {
      var r = frameEl.getBoundingClientRect();
      var nx = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
      var ny = clamp((e.clientY - r.top) / Math.max(1, r.height), 0, 1);
      if (cropDrag.handle === 'n' || cropDrag.handle === 's' ||
          cropDrag.handle === 'e' || cropDrag.handle === 'w') {
        cropRect = resizeCropEdge(cropDrag.handle, nx, ny, cropDrag);
      } else {
        cropRect = resizeCropCorner(cropDrag.handle, nx, ny, cropDrag);
      }
    }

    updateEstimate();
    updateCropOverlay();
    e.preventDefault();
  });

  function endCropDrag(e) {
    if (!cropDrag) return;
    if (e && e.pointerId !== undefined && e.pointerId !== cropDrag.id) return;
    try { cropFrame.releasePointerCapture(cropDrag.id); } catch (err) { /* ignore */ }
    cropDrag = null;
  }

  cropFrame.addEventListener('pointerup', endCropDrag);
  cropFrame.addEventListener('pointercancel', endCropDrag);

  cropFrame.addEventListener('keydown', function (e) {
    if (cropLayer.hidden) return;
    var step = e.shiftKey ? 0.05 : 0.01;
    switch (e.key) {
      case 'ArrowLeft': cropRect = clampCropRect({ x: cropRect.x - step, y: cropRect.y, w: cropRect.w, h: cropRect.h }); break;
      case 'ArrowRight': cropRect = clampCropRect({ x: cropRect.x + step, y: cropRect.y, w: cropRect.w, h: cropRect.h }); break;
      case 'ArrowUp': cropRect = clampCropRect({ x: cropRect.x, y: cropRect.y - step, w: cropRect.w, h: cropRect.h }); break;
      case 'ArrowDown': cropRect = clampCropRect({ x: cropRect.x, y: cropRect.y + step, w: cropRect.w, h: cropRect.h }); break;
      default: return;
    }
    updateEstimate();
    updateCropOverlay();
    e.preventDefault();
  });

  /* ---------- 下載 ---------- */

  function setExportBusy(busy) {
    exportProgress.hidden = !busy;
    if (busy) {
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
    }
    exportProgress.setAttribute('aria-hidden', busy ? 'false' : 'true');
    updateExportBtn();
  }

  function updateProgress(ratio) {
    var pct = clamp(ratio * 100, 0, 100);
    progressBar.style.width = pct.toFixed(1) + '%';
    progressText.textContent = Math.round(pct) + '%';
  }

  async function doExport() {
    if (!image || !SM || exportController) return;
    var spec = getOutputSpec();
    if (!spec) {
      toast(t('toastInvalidSize'), true);
      return;
    }
    var pixels = spec.width * spec.height;

    if (pixels > 16777216 && isIOS) {
      var proceed = window.confirm(t('confirmIOS', {
        w: spec.width,
        h: spec.height,
        mp: (pixels / 1e6).toFixed(1)
      }));
      if (!proceed) return;
    }

    /* 裁切匯出會先渲染完整原圖再取出裁切框，因此記憶體估算要把完整原圖算進去。 */
    var fullPixels = spec.cropped ? image.width * image.height : 0;
    var estimatedBytes = pixels * 8 + fullPixels * 12;
    if (estimatedBytes > 256 * 1024 * 1024) {
      if (!window.confirm(t('confirmMemory', { mb: Math.round(estimatedBytes / 1048576) }))) {
        return;
      }
    }

    exportController = new AbortController();
    setExportBusy(true);
    var outCanvas = document.createElement('canvas');

    try {
      var result = await SM.renderToCanvas(outCanvas, image.source, state, {
        width: spec.width,
        height: spec.height,
        crop: spec.crop,
        signal: exportController.signal,
        onProgress: function (done, total) { updateProgress(done / total); }
      });

      if (exportController.signal.aborted || (result && result.aborted)) {
        toast(t('toastCancelled'));
        return;
      }

      updateProgress(1);
      var mime = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
      var blob = await new Promise(function (resolve) {
        outCanvas.toBlob(resolve, mime, outputFormat === 'png' ? undefined : jpegQuality / 100);
      });
      if (!blob) throw new Error(t('toastBlobFailed'));
      if (exportController.signal.aborted) {
        toast(t('toastCancelled'));
        return;
      }

      await deliver(blob, mime);
      toast(t('toastStarted'));
    } catch (err) {
      if (err && err.name === 'AbortError') {
        toast(t('toastCancelled'));
      } else {
        toast((err && err.message) || t('toastFailed'), true);
      }
    } finally {
      exportController = null;
      setExportBusy(false);
    }
  }

  async function deliver(blob, mime) {
    var ext = mime === 'image/png' ? 'png' : 'jpg';
    var name = 'sky-mirror-' + timeStamp() + '.' + ext;

    if (isIOS && navigator.canShare) {
      try {
        var file = new File([blob], name, { type: mime });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 15000);
  }

  exportBtn.addEventListener('click', doExport);

  cancelExportBtn.addEventListener('click', function () {
    if (exportController) exportController.abort();
  });

  qualityInput.addEventListener('input', function () {
    jpegQuality = parseFloat(qualityInput.value);
    qualityValue.textContent = jpegQuality;
    paintQuality();
  });

  /* ---------- 頁籤與手機抽屜 ---------- */

  var isMobileMQ = window.matchMedia('(max-width: 899px)');
  var sheetState = 'peek';

  function activateTab(which) {
    activeTab = which === 'download' ? 'download' : 'adjust';
    var adjust = activeTab === 'adjust';
    tabAdjust.classList.toggle('is-active', adjust);
    tabDownload.classList.toggle('is-active', !adjust);
    tabAdjust.setAttribute('aria-selected', adjust ? 'true' : 'false');
    tabDownload.setAttribute('aria-selected', adjust ? 'false' : 'true');
    paneAdjust.hidden = !adjust;
    paneDownload.hidden = adjust;
    var scroller = panel.querySelector('.panel-scroll');
    if (scroller) scroller.scrollTop = 0;
    updateCropOverlay();
    if (isMobileMQ.matches && sheetState === 'peek') setSheet('half');
  }

  tabAdjust.addEventListener('click', function () { activateTab('adjust'); });
  tabDownload.addEventListener('click', function () { activateTab('download'); });

  function setSheet(next) {
    sheetState = next;
    panel.classList.toggle('is-peek', next === 'peek');
    panel.classList.toggle('is-half', next === 'half');
    panel.classList.toggle('is-full', next === 'full');
    panel.classList.remove('is-dragging');
    panel.style.transition = '';
    panel.style.transform = '';
    sheetGrip.setAttribute('aria-expanded', next === 'peek' ? 'false' : 'true');
    updateStageInset();
    if (image) fitCanvas();
  }

  /* 手機上讓畫布避開底部面板，半開時仍能看到完整照片與水平線 */
  function updateStageInset() {
    if (!isMobileMQ.matches) {
      stageInner.style.paddingBottom = '';
      return;
    }
    if (sheetState === 'full') return;
    var pad = sheetState === 'peek'
      ? 108
      : Math.round(window.innerHeight * 0.48) + 14;
    stageInner.style.paddingBottom = pad + 'px';
  }

  var sheetDrag = null;

  sheetGrip.addEventListener('pointerdown', function (e) {
    if (!isMobileMQ.matches) return;
    sheetDrag = {
      id: e.pointerId,
      startY: e.clientY,
      top: panel.getBoundingClientRect().top,
      lastTop: panel.getBoundingClientRect().top,
      moved: false
    };
    panel.classList.add('is-dragging');
    panel.style.transition = 'none';
    try { sheetGrip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    e.preventDefault();
  });

  sheetGrip.addEventListener('pointermove', function (e) {
    if (!sheetDrag || e.pointerId !== sheetDrag.id) return;
    var dy = e.clientY - sheetDrag.startY;
    if (Math.abs(dy) > 4) sheetDrag.moved = true;
    if (!sheetDrag.moved) return;
    var top = clamp(sheetDrag.top + dy, 0, window.innerHeight - 96);
    sheetDrag.lastTop = top;
    panel.style.transform = 'translateY(' + top + 'px)';
  });

  function endSheetDrag(e) {
    if (!sheetDrag || (e && e.pointerId !== undefined && e.pointerId !== sheetDrag.id)) return;
    var dragInfo = sheetDrag;
    sheetDrag = null;

    if (!dragInfo.moved) {
      setSheet(sheetState === 'peek' ? 'half' : 'peek');
    } else {
      var vh = window.innerHeight;
      var h = panel.offsetHeight;
      var targets = [
        { name: 'full', top: vh - h },
        { name: 'half', top: vh * 0.52 },
        { name: 'peek', top: vh - 96 }
      ];
      targets.sort(function (a, b) {
        return Math.abs(a.top - dragInfo.lastTop) - Math.abs(b.top - dragInfo.lastTop);
      });
      setSheet(targets[0].name);
    }

    try { sheetGrip.releasePointerCapture(dragInfo.id); } catch (err) { /* ignore */ }
  }

  sheetGrip.addEventListener('pointerup', endSheetDrag);
  sheetGrip.addEventListener('pointercancel', endSheetDrag);

  sheetGrip.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSheet(sheetState === 'peek' ? 'half' : sheetState === 'half' ? 'full' : 'peek');
    }
  });

  isMobileMQ.addEventListener('change', function () {
    if (!isMobileMQ.matches) {
      panel.classList.remove('is-peek', 'is-half', 'is-full', 'is-dragging');
      panel.style.transform = '';
      updateStageInset();
    } else {
      setSheet('peek');
    }
    fitCanvas();
  });

  /* ---------- 語系按鈕 ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('.lang-toggle button'), function (btn) {
    btn.addEventListener('click', function () { setLanguage(btn.dataset.lang); });
  });

  /* ---------- 尺寸監聽 ---------- */

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(function () { fitCanvas(); }).observe(stageInner);
  }
  window.addEventListener('resize', function () {
    updateStageInset();
    fitCanvas();
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(function () {
      updateStageInset();
      fitCanvas();
    }, 120);
  });

  /* ---------- 初始化 ---------- */

  buildControls();
  buildStyleOptions();
  buildRatioOptions();
  buildFormatOptions();
  syncUI();
  applyLanguage();
  setSheet('peek');

  if (!SM) {
    console.warn('[SkyMirror] render.js 未載入，介面將以原始圖片呈現。');
  }
})();
