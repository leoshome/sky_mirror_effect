/* 天空之鏡 — 引擎斷言(browser 與 Node 共用)
 * test.html 載入這份;runAll(S) 執行全部斷言並回傳 results。
 */
(function (global) {
  'use strict';

  function runAll(S) {
    var results = [];

    function check(name, fn, detail) {
      var ok = false;
      var info = '';
      try {
        ok = fn() === true;
      } catch (err) {
        info = String(err && err.message || err);
      }
      results.push({ name: name, ok: ok, detail: info || detail || '' });
    }

    function near(a, b, eps) { return Math.abs(a - b) < (eps == null ? 0.01 : eps); }

    if (!S) {
      results.push({ name: 'render.js 載入', ok: false, detail: 'window.SkyMirror 不存在' });
      return results;
    }

    var T = S._test;

    check('measureExport(6000, 4000, 4096)', function () {
      var r = T.measureExport(6000, 4000, 4096);
      return r.width === 4096 && r.height === 2731;
    }, '應為 4096 × 2731');

    check('measureExport(6000, 4000, null)', function () {
      var r = T.measureExport(6000, 4000, null);
      return r.width === 6000 && r.height === 4000;
    }, '應保持原尺寸');

    check('geometry 未傾斜時左右等高', function () {
      var g = T.geometry(1000, 500, S.DEFAULTS);
      return near(g.yL, 250, 0.001) && near(g.yR, 250, 0.001);
    }, '應為 250 / 250（水平線預設 50%）');

    check('geometry 傾斜 10° 時右端較低', function () {
      var g = T.geometry(1000, 500, { horizon: 0.62, tilt: 10 });
      return near(g.yR - g.yL, Math.tan(10 * Math.PI / 180) * 1000, 0.01);
    }, '斜率應為 tan(10°)×1000');

    check('reflectPoint 未傾斜時垂直鏡射（compression 1）', function () {
      var p = T.reflectPoint(123, 400, 1000, 500, { horizon: 0.62, tilt: 0, compression: 1 });
      return near(p.x, 123, 0.001) && near(p.y, 220, 0.001);
    }, '應為 (123, 220)');

    check('reflectPoint 水平線上的點不動（任意傾斜）', function () {
      var g = T.geometry(1000, 500, { horizon: 0.62, tilt: 12 });
      var x = 300;
      var y = g.centerY + (x - 500) * g.slope;
      var p = T.reflectPoint(x, y, 1000, 500, { horizon: 0.62, tilt: 12 });
      return near(p.x, x, 0.001) && near(p.y, y, 0.001);
    }, '線上的點應映射到自己');

    check('reflectPoint 傾斜時倒影仍在同一欄垂直鏡射', function () {
      var st = { horizon: 0.62, tilt: 12, compression: 1 };
      var g = T.geometry(1000, 500, st);
      for (var x = 100; x <= 900; x += 100) {
        var lineY = g.centerY + (x - 500) * g.slope;
        var p = T.reflectPoint(x, lineY + 80, 1000, 500, st);
        if (!near(p.x, x, 0.001)) return false;
        if (!near(p.y, lineY - 80, 0.001)) return false;
      }
      return true;
    }, '傾斜時不應水平偏移；來源＝局部線高正上方 80px');

    check('reflectPoint 傾斜時倒影長度以垂直深度計算', function () {
      var st = { horizon: 0.62, tilt: -15, compression: 0.5 };
      var g = T.geometry(1000, 500, st);
      var x = 400;
      var lineY = g.centerY + (x - 500) * g.slope;
      var p = T.reflectPoint(x, lineY + 60, 1000, 500, st);
      return near(p.x, x, 0.001) && near(p.y, lineY - 120, 0.001);
    }, 'compression 0.5：來源在局部線高上方 120px');

    check('paintRows 傾斜時倒影取自同欄（物理垂直）', function () {
      var w = 600, h = 400;
      var src = new Uint8ClampedArray(w * h * 4);
      for (var i = 0; i < w * h; i++) {
        var q = i * 4;
        src[q] = 128; src[q + 1] = 128; src[q + 2] = 128; src[q + 3] = 255;
      }
      for (var my = 50; my < 70; my++) {
        for (var mx = 290; mx <= 310; mx++) {
          var r = (my * w + mx) * 4;
          src[r] = 255; src[r + 1] = 0; src[r + 2] = 0;
        }
      }
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, {
        ...S.DEFAULTS, horizon: 0.5, tilt: 12, compression: 1,
        ripple: 0, glint: 0, tint: 0, fade: 0
      }, 0, h);
      function isRed(x, y) {
        var q = (y * w + x) * 4;
        return out[q] > 200 && out[q + 1] < 60 && out[q + 2] < 60;
      }
      return isRed(300, 340) && !isRed(245, 323);
    }, '紅色標記應出現在同欄正下方，而非沿傾斜線偏移處');

    check('normalize 傾斜夾在 ±89', function () {
      return T.normalize({ tilt: 120 }).tilt === 89 && T.normalize({ tilt: -120 }).tilt === -89;
    }, '應夾在 ±89');

    check('lineSpan 未傾斜時兩端在左右邊界', function () {
      var s = T.lineSpan(1000, 500, { horizon: 0.62, tilt: 0 });
      return near(s.ax, 0, 0.001) && near(s.ay, 310, 0.001) &&
        near(s.bx, 1000, 0.001) && near(s.by, 310, 0.001);
    }, '應為 (0,310) 與 (1000,310)');

    check('lineSpan 傾斜 89° 兩端在上下邊界且通過線中心', function () {
      var s = T.lineSpan(1000, 500, { horizon: 0.5, tilt: 89 });
      var mx = (s.ax + s.bx) / 2, my = (s.ay + s.by) / 2;
      return near(s.ay, 0, 0.01) && near(s.by, 500, 0.01) &&
        Math.abs(s.ax - 500) < 10 && Math.abs(s.bx - 500) < 10 &&
        near(mx, 500, 0.01) && near(my, 250, 0.01);
    }, '近垂直線：兩端在上／下邊，中點＝線中心');

    check('reflectPoint 89° 仍同欄垂直（值有限）', function () {
      var st = { horizon: 0.5, tilt: 89, compression: 1 };
      var g = T.geometry(1000, 500, st);
      if (!near(g.slope, Math.tan(89 * Math.PI / 180), 0.001)) return false;
      var p0 = T.reflectPoint(500, 300, 1000, 500, st);
      if (!near(p0.x, 500, 0.001) || !near(p0.y, 200, 0.001)) return false;
      for (var x = 200; x <= 800; x += 300) {
        var p = T.reflectPoint(x, 300, 1000, 500, st);
        if (!near(p.x, x, 0.001)) return false;
        if (!isFinite(p.y)) return false;
      }
      return true;
    }, '極端傾斜時欄位仍不位移、數值有限');

    check('paintRows 89° 水域偏左，−89° 偏右', function () {
      var w = 24, h = 24;
      var src = makeTestSource(w, h);
      function changedSides(tilt) {
        var out = new Uint8ClampedArray(src);
        T.paintRows(src, out, w, h, {
          ...S.DEFAULTS, horizon: 0.5, tilt: tilt, compression: 1,
          ripple: 0, glint: 0, tint: 0, fade: 0
        }, 0, h);
        var left = 0, right = 0;
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var i = (y * w + x) * 4;
            if (out[i] !== src[i] || out[i + 1] !== src[i + 1] || out[i + 2] !== src[i + 2]) {
              if (x < w / 2) left++; else right++;
            }
          }
        }
        return { left: left, right: right };
      }
      var pos = changedSides(89);
      var neg = changedSides(-89);
      return pos.right * 5 < pos.left && neg.left * 5 < neg.right;
    }, '陡角時水域應落在對應側');

    check('rippleOffset 水平線為 0、越深振幅越大', function () {
      var a = T.rippleOffset(0, 500, S.DEFAULTS);
      var shallow = T.waveSample(50, 0.5, 500, S.DEFAULTS);
      var deep = T.waveSample(450, 0.5, 500, S.DEFAULTS);
      return a.dx === 0 && a.dy === 0 && deep.amp > shallow.amp;
    }, '振幅應隨深度增加');

    check('normalize 壓縮允許 0 到 2', function () {
      return T.normalize({ compression: -1 }).compression === 0 &&
        T.normalize({ compression: 3 }).compression === 2;
    }, '應夾在 0–2');

    check('normalize 透明度夾在 0 到 100', function () {
      return T.normalize({ transparency: -1 }).transparency === 0 &&
        T.normalize({ transparency: 101 }).transparency === 100;
    }, '應夾在 0–100');

    check('垂直線鏡射（右側）', function () {
      var p = T.reflectPoint(400, 300, 1000, 500, {
        horizon: 0.3, axis: 'v', side: 1, compression: 1, tilt: 0
      });
      return near(p.x, 200, 0.001) && near(p.y, 300, 0.001);
    }, 'x=400 應映射到 200');

    check('垂直線上的點不動', function () {
      var p = T.reflectPoint(300, 400, 1000, 500, {
        horizon: 0.3, axis: 'v', side: 1, compression: 1, tilt: 0
      });
      return near(p.x, 300, 0.001) && near(p.y, 400, 0.001);
    }, '線上的點應映射到自己');

    check('波光由波峰斜率產生', function () {
      var a = T.waveSample(450, 0.2, 500, { ...S.DEFAULTS, ripple: 60, glint: 60 });
      var b = T.waveSample(450, 0.7, 500, { ...S.DEFAULTS, ripple: 60, glint: 60 });
      return a.glint !== b.glint;
    }, '不同位置的波光應不同');

    check('波紋振幅與 ripple 成正比', function () {
      var a = T.waveSample(450, 0.5, 500, { ...S.DEFAULTS, ripple: 40 });
      var b = T.waveSample(450, 0.5, 500, { ...S.DEFAULTS, ripple: 80 });
      return Math.abs(b.amp / a.amp - 2) < 0.005;
    }, 'ripple 加倍，振幅應加倍');

    check('波紋頻率不隨深度壓縮（無摩爾紋）', function () {
      var H = 500, prev = null, diffs = [];
      for (var i = 0; i <= 400; i++) {
        var v = T.waveSample(H * i / 400, 0.5, H, { ...S.DEFAULTS, ripple: 60 }).dt;
        if (prev !== null) diffs.push(Math.abs(v - prev));
        prev = v;
      }
      diffs.sort(function (a, b) { return a - b; });
      var median = diffs[diffs.length >> 1];
      var max = diffs[diffs.length - 1];
      return median > 0 && max < median * 8;
    }, '相鄰深度的位移差不可在水面線附近爆走');

    check('「山泉池塘」有 <10px 的細波', function () {
      var pond = null;
      for (var i = 0; i < S.PRESETS.length; i++) {
        if (S.PRESETS[i].id === 'pond') pond = S.PRESETS[i];
      }
      if (!pond) return false;
      var H = 288; // 1080×721 影像的大略水域深度
      var finest = Infinity;
      for (var j = 0; j < T.WAVES.length; j++) {
        var wl = H * pond.values.scale / T.WAVES[j].fs;
        if (wl < finest) finest = wl;
      }
      return T.WAVES.length >= 5 && finest < 10;
    }, '山泉池塘最細波長應小於 10px');

    check('細波的垂直位移權重高於粗波', function () {
      var first = T.WAVES[0];
      var last = T.WAVES[T.WAVES.length - 1];
      return last.nv > first.nv * 2;
    }, '高頻細波應以垂直拉伸為主');

    function makeTestSource(w, h) {
      var src = new Uint8ClampedArray(w * h * 4);
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var i = (y * w + x) * 4;
          src[i] = x * 16;
          src[i + 1] = y * 16;
          src[i + 2] = (x + y) * 8;
          src[i + 3] = 255;
        }
      }
      return src;
    }

    check('透明度 100 等於原圖', function () {
      var w = 24, h = 24;
      var src = makeTestSource(w, h);
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, { ...S.DEFAULTS, transparency: 100, ripple: 0 }, 0, h);
      for (var i = 0; i < src.length; i++) {
        if (out[i] !== src[i]) return false;
      }
      return true;
    }, '水體應完全透出原圖');

    check('透明度 0 會改變水面', function () {
      var w = 24, h = 24;
      var src = makeTestSource(w, h);
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, {
        ...S.DEFAULTS, transparency: 0, ripple: 0, compression: 1, tint: 0, fade: 0
      }, 0, h);
      for (var i = 0; i < src.length; i++) {
        if (out[i] !== src[i]) return true;
      }
      return false;
    }, '不透明時水面應有倒影');

    check('透明度 50 介於原圖與完整倒影之間', function () {
      var w = 24, h = 24;
      var src = makeTestSource(w, h);
      var out0 = new Uint8ClampedArray(src);
      var out50 = new Uint8ClampedArray(src);
      var out100 = new Uint8ClampedArray(src);
      var st = { ...S.DEFAULTS, ripple: 0, glint: 0, tint: 0, fade: 0, compression: 1 };
      T.paintRows(src, out0, w, h, { ...st, transparency: 0 }, 0, h);
      T.paintRows(src, out50, w, h, { ...st, transparency: 50 }, 0, h);
      T.paintRows(src, out100, w, h, { ...st, transparency: 100 }, 0, h);
      var changed = false;
      for (var i = 0; i < src.length; i++) {
        if (out100[i] !== src[i]) return false;
        var lo = Math.min(out0[i], src[i]) - 1;
        var hi = Math.max(out0[i], src[i]) + 1;
        if (out50[i] < lo || out50[i] > hi) return false;
        if (out50[i] !== out0[i] && out50[i] !== src[i]) changed = true;
      }
      return changed;
    }, '50% 應為兩者中點');

    check('hslToRgb / rgbToHsl 色相往返', function () {
      var rgb = T.hslToRgb(200, 0.45, 0.32);
      var hsl = T.rgbToHsl(rgb.r, rgb.g, rgb.b);
      return Math.abs(hsl.h - 200) < 1;
    });

    check('normalize style 驗證（只剩 natural / calm）', function () {
      return T.normalize({ style: 'calm' }).style === 'calm' &&
        T.normalize({ style: 'natural' }).style === 'natural' &&
        /* 舊版存下來的已移除風格值必須安全降級，不能報錯 */
        T.normalize({ style: 'painterly' }).style === 'natural' &&
        T.normalize({ style: 'bogus' }).style === 'natural' &&
        T.normalize({}).style === 'natural';
    }, '未支援或已移除的風格值一律回 natural');

    check('normalize 不再產生已移除的參數', function () {
      var a = T.normalize({});
      var b = T.normalize({ motionBlur: 80, lineStrength: 80, lineLength: 80, motionLength: 20, motionDepth: 20 });
      return a.motionBlur === undefined && a.motionLength === undefined &&
        a.motionDepth === undefined && a.lineStrength === undefined &&
        a.lineLength === undefined && b.motionBlur === undefined &&
        b.lineStrength === undefined;
    }, '垂直動態模糊與波光線的參數必須完全不存在');

    check('normalize 不再產生已移除的噪聲參數', function () {
      var a = T.normalize({});
      var b = T.normalize({ noiseDetail: 4, noiseGain: 90, noiseAngle: 45, noiseContrast: 80, noiseDepth: 0 });
      return a.noiseDetail === undefined && a.noiseGain === undefined &&
        a.noiseAngle === undefined && a.noiseContrast === undefined &&
        a.noiseDepth === undefined && b.noiseDetail === undefined &&
        b.noiseContrast === undefined &&
        a.noiseAmt === S.DEFAULTS.noiseAmt && a.noiseDir === S.DEFAULTS.noiseDir;
    }, '已移除的 5 個噪聲參數必須不存在，保留的 3 個仍正常');

    check('DEFAULTS 基底風格與特徵預設', function () {
      return S.DEFAULTS.style === 'natural' && S.DEFAULTS.noiseAmt === 0 &&
        S.DEFAULTS.perspAmt === 0;
    }, 'style=natural、噪聲與透視預設關閉');

    check('水平線預設為 0.5', function () {
      return S.DEFAULTS.horizon === 0.5 && T.normalize({}).horizon === 0.5;
    }, '未指定水平線時應在畫面中央');

    check('風格預設不含水平線', function () {
      return S.PRESETS.length === 2 && S.PRESETS.every(function (p) {
        return !Object.prototype.hasOwnProperty.call(p.values, 'horizon');
      });
    }, '切換鹽湖／山泉不得移動水平線');

    check('calmOffset 振幅隨深度單調', function () {
      var st = { ...S.DEFAULTS, style: 'calm', ripple: 40 };
      return T.calmOffset(450, 500, st).amp > T.calmOffset(50, 500, st).amp;
    }, '深處振幅應大於淺處');

    check('calmOffset scale 變大波長變長', function () {
      function crossings(scale) {
        var st = { ...S.DEFAULTS, style: 'calm', ripple: 40, scale: scale };
        var prev = null, count = 0;
        for (var s = 20; s <= 480; s += 4) {
          var v = T.calmOffset(s, 500, st).dt;
          if (prev !== null && ((prev < 0 && v >= 0) || (prev >= 0 && v < 0))) count++;
          prev = v;
        }
        return count;
      }
      return crossings(1) > crossings(2);
    }, 'scale=2 的過零次數應少於 scale=1');

    check('calm 位移純水平（同列連續、無垂直分量）', function () {
      var w = 400, h = 400;
      var src = new Uint8ClampedArray(w * h * 4);
      for (var i = 0; i < w * h; i++) {
        var q = i * 4;
        src[q] = 128; src[q + 1] = 128; src[q + 2] = 128; src[q + 3] = 255;
      }
      for (var my = 50; my <= 70; my++) {
        for (var mx = 299; mx <= 301; mx++) {
          var r = (my * w + mx) * 4;
          src[r] = 255; src[r + 1] = 0; src[r + 2] = 0;
        }
      }
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, {
        ...S.DEFAULTS, style: 'calm', horizon: 0.5, tilt: 0, compression: 1,
        ripple: 40, glint: 0, tint: 0, fade: 0
      }, 0, h);
      function isRed(x, y) {
        var q = (y * w + x) * 4;
        return out[q] > 200 && out[q + 1] < 60 && out[q + 2] < 60;
      }
      var minRow = Infinity, maxRow = -Infinity;
      for (var y = 220; y < h; y++) { // 只掃水域；y=50–70 的來源紅條仍在原處
        var minx = Infinity, maxx = -Infinity;
        for (var x = 260; x < 340; x++) {
          if (isRed(x, y)) {
            if (x < minx) minx = x;
            if (x > maxx) maxx = x;
          }
        }
        if (minx !== Infinity) {
          if (maxx - minx > 5) return false; // 同列紅色必須連續且窄（純水平位移）
          if (y < minRow) minRow = y;
          if (y > maxRow) maxRow = y;
        }
      }
      return minRow >= 329 && maxRow <= 351; // 鏡射列範圍 ±1，無垂直位移
    }, '紅條倒影應每列整體平移，不垂直擴散');

    check('calm 水色為線性基底混合', function () {
      var w = 40, h = 100;
      var src = new Uint8ClampedArray(w * h * 4);
      for (var i = 0; i < w * h; i++) {
        var q = i * 4;
        src[q] = 255; src[q + 1] = 255; src[q + 2] = 255; src[q + 3] = 255;
      }
      var b0 = T.hslToRgb(200, 0.45, 0.32);
      var b1 = T.hslToRgb(200, 0.30, 0.16);
      function baseAt(dn) {
        return {
          r: b0.r + (b1.r - b0.r) * dn,
          g: b0.g + (b1.g - b0.g) * dn,
          b: b0.b + (b1.b - b0.b) * dn
        };
      }
      var st = { ...S.DEFAULTS, style: 'calm', horizon: 0.5, tilt: 0, compression: 1,
        ripple: 0, glint: 0, fade: 0, tint: 100, hue: 200 };
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, st, 0, h);
      var rows = [{ y: 75, dn: 0.5 }, { y: 90, dn: 0.8 }]; // depthH=50；s>blendLen
      for (var k = 0; k < rows.length; k++) {
        var base = baseAt(rows[k].dn);
        var expR = 255 * 0.25 + base.r * 0.75;
        var expG = 255 * 0.25 + base.g * 0.75;
        var expB = 255 * 0.25 + base.b * 0.75;
        var q = (rows[k].y * w + 20) * 4;
        if (Math.abs(out[q] - expR) > 1) return false;
        if (Math.abs(out[q + 1] - expG) > 1) return false;
        if (Math.abs(out[q + 2] - expB) > 1) return false;
      }
      return true;
    }, 'tint=100 應為 255×0.25 + base×0.75');

    check('calm 陡角水域側向正確且異於 natural', function () {
      var w = 48, h = 48;
      var src = makeTestSource(w, h);
      function render(tilt, style) {
        var out = new Uint8ClampedArray(src);
        T.paintRows(src, out, w, h, {
          ...S.DEFAULTS, style: style, horizon: 0.5, tilt: tilt, compression: 1,
          ripple: 40, glint: 0, tint: 20, fade: 10
        }, 0, h);
        return out;
      }
      function sideCounts(out) {
        var left = 0, right = 0;
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var i = (y * w + x) * 4;
            if (out[i] !== src[i] || out[i + 1] !== src[i + 1] || out[i + 2] !== src[i + 2]) {
              if (x < w / 2) left++; else right++;
            }
          }
        }
        return { left: left, right: right };
      }
      var pos = sideCounts(render(89, 'calm'));
      var neg = sideCounts(render(-89, 'calm'));
      var sideOK = pos.right * 5 < pos.left && neg.left * 5 < neg.right;
      if (!sideOK) return false;
      var nat = render(45, 'natural');
      var cal = render(45, 'calm');
      var diff = 0;
      for (var j = 0; j < src.length; j += 4) {
        if (cal[j] !== nat[j]) diff++;
      }
      return diff > 10;
    }, '±89° 水域側向正確，且 calm 輸出 ≠ natural');

    check('natural 水色曲線可預測', function () {
      var w = 40, h = 100;
      var src = new Uint8ClampedArray(w * h * 4);
      for (var i = 0; i < w * h; i++) {
        var q = i * 4;
        src[q] = 255; src[q + 1] = 255; src[q + 2] = 255; src[q + 3] = 255;
      }
      /* glint/tint/fade 全關 → 只剩 reflK 水色曲線（白源，位移不改變取樣值） */
      var st = { ...S.DEFAULTS, style: 'natural', horizon: 0.5, tilt: 0, compression: 1,
        ripple: 0, glint: 0, fade: 0, tint: 0, hue: 200 };
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, st, 0, h);
      var waterMid = T.hslToRgb(200, 0.36, 0.24);
      var rows = [{ y: 75, dn: 0.5 }, { y: 90, dn: 0.8 }]; // depthH=50
      for (var k = 0; k < rows.length; k++) {
        var reflK = 0.80 + 0.14 * (1 - rows[k].dn);
        var invK = 1 - reflK;
        var expR = 255 * reflK + waterMid.r * invK;
        var expG = 255 * reflK + waterMid.g * invK;
        var expB = 255 * reflK + waterMid.b * invK;
        var q = (rows[k].y * w + 20) * 4;
        if (Math.abs(out[q] - expR) > 1) return false;
        if (Math.abs(out[q + 1] - expG) > 1) return false;
        if (Math.abs(out[q + 2] - expB) > 1) return false;
      }
      return true;
    }, '應為 255×reflK + waterMid×(1−reflK)');

    check('calm 不產生波光', function () {
      var w = 40, h = 100;
      var src = new Uint8ClampedArray(w * h * 4);
      for (var i = 0; i < w * h; i++) {
        var q = i * 4;
        src[q] = 255; src[q + 1] = 255; src[q + 2] = 255; src[q + 3] = 255;
      }
      /* calm 分支把 glint 強制為 0；tint=0 時白源輸出必為 255 */
      var st = { ...S.DEFAULTS, style: 'calm', horizon: 0.5, tilt: 0, compression: 1,
        ripple: 60, glint: 100, fade: 0, tint: 0, hue: 200 };
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, st, 0, h);
      for (var y = 53; y < h; y++) { // depthH=50、blendLen=2；s>blendLen
        for (var x = 5; x < 35; x++) {
          var q = (y * w + x) * 4;
          if (out[q] !== 255 || out[q + 1] !== 255 || out[q + 2] !== 255) return false;
        }
      }
      return true;
    }, 'calm 應忽略 glint（即使 glint=100）');

    check('rowSpan 未傾斜全寬、傾斜時單側縮', function () {
      var g0 = T.geometry(1000, 500, { horizon: 0.62, tilt: 0 });
      var s0 = T.rowSpan(g0, 400, 1000);
      if (s0.x0 !== 0 || s0.x1 !== 1000) return false;
      var g12 = T.geometry(1000, 500, { horizon: 0.62, tilt: 12 });
      var s12 = T.rowSpan(g12, 400, 1000);
      /* 手算：s = nX*(x-cx)+nY*dy ≥ 0；nX<0 → xEnd=floor(lim) */
      var dy = 400 - g12.centerY;
      var sConst = g12.normalY * dy - g12.normalX * g12.centerX;
      var lim = -sConst / g12.normalX;
      var expEnd = Math.floor(Math.min(1000, lim));
      if (s12.x0 !== 0 || s12.x1 !== expEnd) return false;
      /* 整列都在線上方 → 空範圍 */
      var above = T.rowSpan(g12, 150, 1000);
      return above.x0 === 0 && above.x1 === 0;
    }, '未傾斜應全寬；傾斜時 xEnd=floor(lim)；線上方為空');

    check('perspGain 關閉時恆為 1', function () {
      var st = { ...S.DEFAULTS, perspAmt: 0 };
      return T.perspGain(0, st) === 1 && T.perspGain(0.5, st) === 1 && T.perspGain(1, st) === 1;
    }, 'perspAmt=0 時 gain 必為 1');

    check('perspGain 雙向且有界', function () {
      var st = { ...S.DEFAULTS, perspAmt: 100, perspMax: 150, perspNear: 50 };
      var C = 1.5, okRange = true, mono = true, prev = Infinity;
      for (var i = 0; i <= 20; i++) {
        var dn = i / 20, g = T.perspGain(dn, st);
        if (g < 1 / C - 1e-9 || g > C + 1e-9) okRange = false;
        if (g > prev + 1e-9) mono = false; /* gain 應隨 dn 遞減（p 遞增） */
        prev = g;
      }
      return okRange && mono && T.perspGain(1, st) < 1 && T.perspGain(0, st) > 1;
    }, 'gain ∈ [1/1.5,1.5]、對 dn 單調遞減（p 遞增）、近水面線 >1、前景 <1');

    check('perspGain perspNear=0 時前景不動', function () {
      var st = { ...S.DEFAULTS, perspAmt: 100, perspNear: 0 };
      return near(T.perspGain(1, st), 1, 1e-9) && T.perspGain(0, st) > 1;
    }, 'perspNear=0：dn=1 處 gain=1，僅壓縮遠處');

    check('perspStart 限制影響範圍（0 = 關閉）', function () {
      var off = { ...S.DEFAULTS, perspAmt: 100, perspStart: 0 };
      var full = { ...S.DEFAULTS, perspAmt: 100, perspStart: 100 };
      var half = { ...S.DEFAULTS, perspAmt: 100, perspStart: 50 };
      for (var i = 0; i <= 20; i++) {
        if (T.perspGain(i / 20, off) !== 1) return false;
      }
      if (!(T.perspGain(0, full) > 1)) return false;
      if (T.perspGain(0.8, half) !== 1) return false;   /* 深度 0.8 > 0.5 → 不受影響 */
      if (!(T.perspGain(0, half) > 1)) return false;    /* 近水面線仍受影響 */
      return true;
    }, 'perspStart=0 關閉；perspStart=50 使深度 0.8 不受影響');

    check('透視讓近水面線更密、前景更疏（natural）', function () {
      function crossings(perspAmt) {
        var H = 500, st = { ...S.DEFAULTS, ripple: 60, perspAmt: perspAmt, perspNear: 50, perspMax: 150 };
        var nearC = 0, farC = 0, pPrev = null, fPrev = null, s, v;
        for (s = 5; s <= 100; s += 2) {
          v = T.waveSample(s, 0.5, H, st).dt;
          if (pPrev !== null && ((pPrev < 0) !== (v < 0))) nearC++;
          pPrev = v;
        }
        for (s = 400; s <= 495; s += 2) {
          v = T.waveSample(s, 0.5, H, st).dt;
          if (fPrev !== null && ((fPrev < 0) !== (v < 0))) farC++;
          fPrev = v;
        }
        return { nearC: nearC, farC: farC };
      }
      var off = crossings(0), on = crossings(100);
      return on.nearC > off.nearC && on.farC < off.farC;
    }, '開啟透視：近水面線過零次數增加、前景減少');

    check('透視 calm 只改深度頻率、不改振幅', function () {
      var base = { ...S.DEFAULTS, style: 'calm', ripple: 40, perspAmt: 0 };
      var on = { ...S.DEFAULTS, style: 'calm', ripple: 40, perspAmt: 100, perspNear: 0 };
      return T.perspGain(0, on) > 1 &&
        Math.abs(T.calmOffset(50, 500, on).amp - T.calmOffset(50, 500, base).amp) < 0.01;
    }, 'calm 的 amp 不隨透視改變');

    check('透視 compression=0 無效（僅水色）', function () {
      var w = 40, h = 60, src = new Uint8ClampedArray(w * h * 4);
      for (var i = 0; i < w * h; i++) { var q = i * 4; src[q] = 200; src[q + 1] = 200; src[q + 2] = 200; src[q + 3] = 255; }
      var base = { ...S.DEFAULTS, style: 'natural', horizon: 0.5, compression: 0, perspAmt: 0 };
      var on = { ...S.DEFAULTS, style: 'natural', horizon: 0.5, compression: 0, perspAmt: 100, perspMax: 150 };
      var a = new Uint8ClampedArray(src); T.paintRows(src, a, w, h, base, 0, h);
      var b = new Uint8ClampedArray(src); T.paintRows(src, b, w, h, on, 0, h);
      for (var j = 0; j < a.length; j++) if (a[j] !== b[j]) return false;
      return true;
    }, '無倒影時透視不得改變輸出（僅水色漸層）');

    check('noiseOffset 關閉時為 0', function () {
      var st = { ...S.DEFAULTS, noiseAmt: 0 };
      var a = T.noiseOffset(120, 200, 0.5, 500, st);
      return a.dt === 0 && a.dn === 0;
    }, 'noiseAmt=0 時位移必為 0');

    check('noiseOffset 決定性', function () {
      var st = { ...S.DEFAULTS, noiseAmt: 80 };
      var a = T.noiseOffset(123.4, 210.7, 0.5, 500, st);
      var b = T.noiseOffset(123.4, 210.7, 0.5, 500, st);
      return a.dt === b.dt && a.dn === b.dn;
    }, '同輸入兩次呼叫必相同');

    check('noiseOffset 振幅隨 noiseAmt 單調', function () {
      function maxAbs(amt) {
        var st = { ...S.DEFAULTS, noiseAmt: amt }, m = 0;
        for (var i = 0; i < 200; i++) {
          var o = T.noiseOffset(i * 7.3, i * 3.1, 0.6, 500, st);
          m = Math.max(m, Math.abs(o.dt), Math.abs(o.dn));
        }
        return m;
      }
      return maxAbs(80) > maxAbs(40) && maxAbs(40) > 0;
    }, 'noiseAmt 愈大振幅愈大');

    check('noiseOffset 方向配比', function () {
      var stH = { ...S.DEFAULTS, noiseAmt: 80, noiseDir: 0 };
      var stV = { ...S.DEFAULTS, noiseAmt: 80, noiseDir: 100 };
      var h = 0, v = 0, hdn = 0, vdt = 0;
      for (var i = 0; i < 100; i++) {
        var oH = T.noiseOffset(i * 5.1, i * 2.7, 0.6, 500, stH);
        var oV = T.noiseOffset(i * 5.1, i * 2.7, 0.6, 500, stV);
        h = Math.max(h, Math.abs(oH.dt)); hdn = Math.max(hdn, Math.abs(oH.dn));
        vdt = Math.max(vdt, Math.abs(oV.dt)); v = Math.max(v, Math.abs(oV.dn));
      }
      return h > 0 && hdn < 1e-6 && v > 0 && vdt < 1e-6;
    }, 'noiseDir=0 純切線、=100 純法線');

    check('noiseOffset 兩組場不相關（R/G 正交）', function () {
      var st = { ...S.DEFAULTS, noiseAmt: 80, noiseDir: 50 }, xs = [], ys = [];
      for (var i = 0; i < 400; i++) {
        var o = T.noiseOffset(i * 11.7, i * 5.3, 0.6, 500, st);
        xs.push(o.dt); ys.push(o.dn);
      }
      var mx = 0, my = 0, n = xs.length;
      for (var j = 0; j < n; j++) { mx += xs[j]; my += ys[j]; }
      mx /= n; my /= n;
      var cov = 0, vx = 0, vy = 0;
      for (var k = 0; k < n; k++) { cov += (xs[k] - mx) * (ys[k] - my); vx += (xs[k] - mx) * (xs[k] - mx); vy += (ys[k] - my) * (ys[k] - my); }
      return Math.abs(cov / Math.sqrt(vx * vy + 1e-9)) < 0.25;
    }, 'dt 與 dn 相關係數應接近 0（兩組獨立噪聲）');

    check('noiseOffset noiseScale / noiseDir 有作用', function () {
      function sample(over) {
        var st = { ...S.DEFAULTS, noiseAmt: 80 }; for (var k in over) st[k] = over[k];
        return [0, 1, 2, 3, 4, 5].map(function (i) { var o = T.noiseOffset(i * 13.1 + 3, i * 7.7 + 5, 0.6, 500, st); return o.dt + o.dn * 1e-3; }).join(',');
      }
      return sample({}) !== sample({ noiseScale: 0.5 }) &&
        sample({}) !== sample({ noiseDir: 90 });
    }, '尺度／方向改變都會改變輸出');

    check('noiseAmt>0 改變輸出且決定性', function () {
      var w = 32, h = 32, src = makeTestSource(w, h);
      var st = { ...S.DEFAULTS, noiseAmt: 70, ripple: 40, tint: 0, fade: 0, compression: 1 };
      function run() { var o = new Uint8ClampedArray(src); T.paintRows(src, o, w, h, st, 0, h); return o; }
      var a = run(), b = run();
      var same = true; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) same = false;
      var off = new Uint8ClampedArray(src); T.paintRows(src, off, w, h, { ...st, noiseAmt: 0 }, 0, h);
      var diff = 0; for (var j = 0; j < a.length; j += 4) if (a[j] !== off[j]) diff++;
      return same && diff > 20;
    }, '噪聲開啟：可重現且非零差異');

    check('噪聲 + 傾斜 45° 水面線以上不變', function () {
      var w = 32, h = 32, src = makeTestSource(w, h);
      var st = { ...S.DEFAULTS, noiseAmt: 90, tilt: 45, compression: 1, tint: 0, fade: 0 };
      var out = new Uint8ClampedArray(src); T.paintRows(src, out, w, h, st, 0, h);
      var g = T.geometry(w, h, st);
      for (var x = 0; x < w; x++) {
        var yLimit = Math.floor(g.centerY + g.slope * (x - w / 2)) - 2;
        for (var y = 0; y <= Math.min(yLimit, h - 1); y++) {
          if (y < 0) continue; var q = (y * w + x) * 4;
          if (out[q] !== src[q] || out[q + 1] !== src[q + 1] || out[q + 2] !== src[q + 2]) return false;
        }
      }
      return true;
    }, '噪聲位移不得污染水面線上方');

    check('噪聲＋透視全開 透明度100 = 原圖', function () {
      var w = 48, h = 48, src = makeTestSource(w, h);
      var st = { ...S.DEFAULTS, noiseAmt: 80, perspAmt: 80,
        style: 'natural', transparency: 100 };
      var out = new Uint8ClampedArray(src);
      T.paintRows(src, out, w, h, st, 0, h);
      for (var i = 0; i < src.length; i++) if (out[i] !== src[i]) return false;
      return true;
    }, '透明度 100 時兩特徵全開仍等於原圖');

    check('分塊 + 噪聲＋透視 = 整段', function () {
      var w = 48, h = 48, src = makeTestSource(w, h);
      var st = { ...S.DEFAULTS, style: 'natural', noiseAmt: 70, perspAmt: 60, ripple: 40, tint: 10, fade: 10, compression: 1 };
      var A = new Uint8ClampedArray(src); T.paintRows(src, A, w, h, st, 0, h);
      var B = new Uint8ClampedArray(src); var mid = h >> 1;
      T.paintRows(src, B, w, h, st, 0, mid); T.paintRows(src, B, w, h, st, mid, h);
      for (var i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
      return true;
    }, '分塊渲染必須與整段逐位元相同');

    if (typeof document !== 'undefined') {
      check('renderPreview 反映風格與特徵（瀏覽器）', function () {
        var w = 240, h = 180;
        var maker = document.createElement('canvas');
        maker.width = w; maker.height = h;
        var ctx = maker.getContext('2d');
        var grad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#33507a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h * 0.5);
        /* 高頻直條：位移類特徵（噪聲／透視／基底正弦）才量得到差異；
         * 純垂直漸層在水平方向均勻，噪聲位移幾乎不改變取樣值。 */
        ctx.fillStyle = '#1d2438';
        for (var sx = 0; sx < w; sx += 12) {
          ctx.fillRect(sx, 0, 6, h * 0.5);
        }
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, h * 0.5, w, h * 0.5);
        var canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px';
        canvas.style.top = '0';
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        document.body.appendChild(canvas);
        function shot(over) {
          var base = { ...S.DEFAULTS, horizon: 0.5, tilt: 0, compression: 1, ripple: 30, tint: 0, fade: 0 };
          S.renderPreview(canvas, maker, { ...base, ...over });
          return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.slice();
        }
        function diffCount(a, b) {
          var n = 0;
          for (var i = 0; i < a.length; i += 4) {
            if (Math.abs(a[i] - b[i]) > 2) n++;
          }
          return n;
        }
        try {
          var natural = shot({ style: 'natural' });
          var calm = shot({ style: 'calm' });
          var noisy = shot({ style: 'natural', noiseAmt: 70 });
          var persp = shot({ style: 'natural', perspAmt: 80 });
          return diffCount(natural, calm) > 500 &&
            diffCount(natural, noisy) > 100 &&
            diffCount(natural, persp) > 100;
        } finally {
          canvas.remove();
        }
      }, 'renderPreview 必須反映風格切換與兩層特徵');
    }

    return results;
  }

  global.EngineTests = { runAll: runAll };
})(typeof window !== 'undefined' ? window : globalThis);
