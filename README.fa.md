# استودیو اسلاید ایران‌پوش (IranPoosh Slide Studio)

یک وب‌ابزار فارسی و راست‌به‌چپ، شبیه یک ادیتور ساده فیگما، برای ساخت **کاروسل اینستاگرام** برند پوشاک «ایران‌پوش».
تمام طراحی‌ها کدنویسی‌شده و لایه‌بازند؛ هیچ اسلایدی با ابزار تولید تصویر ساخته نمی‌شود. کاربر تم را انتخاب می‌کند، متن‌ها را ویرایش می‌کند، عکس محصول را **فقط در اسلات‌های مشخص‌شده** آپلود می‌کند و خروجی PNG استاندارد می‌گیرد.

---

## ۱. اجرا

پیش‌نیاز: Node.js نسخه ۱۸ یا بالاتر (با Node 22 تست شده) و اینترنت (برای دریافت فونت Vazirmatn از Google Fonts).

```bash
unzip iranpoosh-slide-studio.zip
cd iranpoosh-slide-studio
npm install
npm run dev
```

سپس آدرس چاپ‌شده (معمولاً `http://localhost:5173`) را در مرورگر باز کنید.

| دستور | کار |
|---|---|
| `npm run dev` | اجرای محیط توسعه |
| `npm run build` | بررسی TypeScript (strict) و ساخت نسخه نهایی در `dist/` |
| `npm run preview` | اجرای نسخه ساخته‌شده |
| `npm run typecheck` | فقط بررسی تایپ |

> نکته: اگر هنگام اکسپورت اینترنت قطع باشد، فونت از حافظه مرورگر استفاده می‌شود؛ برای تضمین فونت embed‌شده، یک بار صفحه را با اینترنت باز کنید.

---

## ۲. کار با ادیتور

| بخش | کار |
|---|---|
| **نوار بالا** | نام پروژه، واگرد/ازنو، قالب بوم (۴:۵ یا ۱:۱)، زوم، راهنماها، ورود/خروج JSON پروژه، خروجی PNG |
| **سمت راست: اسلایدها** | افزودن (از ۷ تمپلیت)، تکرار، حذف، جابه‌جایی با دکمه یا کشیدن و رها کردن |
| **وسط: بوم زنده** | پیش‌نمایش مقیاس‌شونده. روی هر متن یا اسلات عکس کلیک کنید تا فیلد آن در Inspector فوکوس شود. `Ctrl + چرخ ماوس` = زوم |
| **سمت چپ: ویرایش اسلاید** | متن‌ها (با شمارنده کاراکتر)، آپلود عکس با برچسب اسلات + نقطه تمرکز (focal point) + بزرگ‌نمایی، تنظیمات همان اسلاید (اندازه متن، جهت برش مورب، رنگ تأکید، نوار برند/نقطه‌ها) |
| **سمت چپ: تم و برند** | پریست‌ها، اطلاعات برند و لوگو، ویرایش زنده تمام توکن‌ها، ذخیره تم سفارشی |
| **پایین: پیش‌نمایش کاروسل** | همه اسلایدها کنار هم بدون فاصله، دقیقاً مثل ورق زدن در اینستاگرام (اسلاید اول سمت راست است) |

**راهنماها (Guides):** حاشیه امن، خطوط مرکز، قانون یک‌سوم‌ها، برش مربع ۱:۱ و **برش گرید پروفایل ۳:۴** (اینستاگرام اسلاید اول را در گرید پروفایل با نسبت ۳:۴ نشان می‌دهد؛ تیتر کاور را وسط نگه دارید).

**میان‌برها:** `Ctrl+Z` واگرد، `Ctrl+Shift+Z` یا `Ctrl+Y` ازنو، `←` اسلاید بعدی، `→` اسلاید قبلی (خارج از فیلدهای متن).

**ذخیره خودکار:** پروژه بعد از هر تغییر در `localStorage` ذخیره می‌شود. حافظه مرورگر حدود ۵ مگابایت است؛ عکس‌ها هنگام آپلود به حداکثر ۲۰۰۰ پیکسل کوچک می‌شوند. اگر حافظه پر شود، برنامه هشدار می‌دهد و متن‌ها را بدون عکس ذخیره می‌کند. برای نگهداری کامل پروژه (با عکس‌ها) از «خروجی JSON» استفاده کنید.

---

## ۳. خروجی PNG

دکمه «خروجی PNG» یک پنجره باز می‌کند:

- **کدام اسلایدها:** همه (ZIP) یا فقط اسلاید انتخاب‌شده (یک PNG)
- **قالب:** عمودی `1080×1350` و/یا مربع `1080×1080`
- **کیفیت:** `pixelRatio = 2` (پیش‌فرض: خروجی `2160×2700`) یا ۱× (دقیقاً `1080×1350`، اندازه آپلود اینستاگرام)

نام فایل‌ها ترتیبی است: `01-cover.png`، `02-product.png`، … اگر هر دو قالب انتخاب شود، فایل‌ها در پوشه‌های `portrait-1080x1350/` و `square-1080x1080/` قرار می‌گیرند.
فونت Vazirmatn هنگام اکسپورت به‌صورت base64 داخل تصویر embed می‌شود (فایل `src/utils/exporter.ts`).
هر اسلاید در یک المان مخفی و خارج از صفحه، با اندازه واقعی ۱۰۸۰ پیکسل رندر و با `modern-screenshot` ثبت می‌شود؛ بنابراین خروجی به اندازه پنجره یا زوم شما وابسته نیست.

---

## ۴. معماری

```
src/
├─ tokens/                  # ← توکن‌های طراحی (themes/*.json)
│  ├─ editorial-dark.json   #   ذغالی تیره، برش مورب تند
│  ├─ minimal-light.json    #   روشن و مینیمال
│  ├─ bold-sale.json        #   زرد/مشکی/قرمز برای جشنواره
│  ├─ iranpoosh-classic.json#   سرمه‌ای + زعفرانی
│  └─ index.ts              #   رجیستری پریست‌ها
├─ types.ts                 # تایپ Theme، Project، Slide، قراردادهای تمپلیت
├─ store.ts                 # zustand + zundo (واگرد/ازنو) + ذخیره خودکار
├─ data/defaultProject.json # کمپین نمونه ۷ اسلایدی
├─ utils/
│  ├─ theme.ts              # ادغام تم + توکن‌های ویرایش‌شده، تبدیل توکن به CSS variables
│  ├─ style.ts              # C / S / R / typeCss: دسترسی توکن‌محور برای تمپلیت‌ها
│  ├─ geometry.ts           # برش‌های مورب (clip-path)
│  ├─ project.ts            # اسکیما، اعتبارسنجی و migration، ذخیره‌سازی
│  ├─ exporter.ts           # رندر خارج از صفحه، embed فونت، PNG و ZIP، JSON
│  ├─ image.ts, fa.ts       # کوچک‌سازی تصویر آپلودی، ارقام فارسی
└─ components/
   ├─ primitives/           # SlideFrame, BrandBar, PageDots, DiagonalPanel, AutoFitText(+Block), ImageSlot, Text, Icons
   ├─ templates/            # CoverSlide … CtaSlide + registry.ts + SlideRenderer.tsx
   └─ editor/               # Canvas, SlideManager, Inspector, ThemePanel, TopBar, CarouselStrip, ExportDialog
```

### توکن‌های طراحی

هر فایل `src/tokens/*.json` یک تم کامل است: `canvas` (اندازه بوم و حاشیه امن)، `colors` (۱۲ نقش رنگ)، `type.scale` (۸ سطح: display تا price با اندازه/ضخامت/ارتفاع خط)، `radius`، `spacing` و `motif` (زاویه برش مورب، نوع نقطه‌های صفحه، الگوی پس‌زمینه، ضخامت خط).
`SlideFrame` تم فعال را به **CSS variable** تبدیل می‌کند (`--c-accent`, `--t-title-size`, `--s-md`, `--r-lg`, …) و تمپلیت‌ها فقط از `C.accent`, `S.md`, `R.lg`, `typeCss('title')` استفاده می‌کنند. به همین دلیل هیچ رنگ یا اندازه hardcoded در تمپلیت‌ها نیست و تعویض تم، همه اسلایدها را یک‌جا عوض می‌کند. ابعاد چیدمان فقط نسبت‌هایی از بوم هستند (مثلاً «۵۰٪ ارتفاع») یا مشتق از توکن‌ها.

لایه‌های ادغام: `تم پایه (پریست یا سفارشی)` ← `brandKit.tokenOverrides` (ویرایش زنده) ← `slide.overrides` (فقط همان اسلاید).

### اسکیمای `project.json` (نسخه ۱)

```jsonc
{
  "schemaVersion": 1,
  "name": "کمپین پاییز ۱۴۰۵ — ایران‌پوش",
  "brandKit": {
    "name": "ایران‌پوش", "nameLatin": "IRANPOOSH",
    "website": "www.iranpoosh.ir", "handle": "@iranpoosh",
    "logoAssetId": null,
    "themeId": "editorial-dark",      // پریست یا تم سفارشی
    "tokenOverrides": {},             // ویرایش‌های زنده توکن (جزئی)
    "customThemes": []                // تم‌های ذخیره‌شده توسط کاربر
  },
  "assets": { "a-xxxx": { "name": "coat.jpg", "dataUrl": "data:image/jpeg;base64,…", "width": 1600, "height": 2000 } },
  "slides": [
    {
      "id": "s-cover",
      "template": "cover",            // cover | product | feature | sale | content | gallery | cta
      "content": {
        "title": "کالکشن پاییزه مردانه جدید",
        "images": { "hero": { "assetId": "a-xxxx", "fx": 50, "fy": 30, "zoom": 1 } }
      },
      "overrides": { "textScale": 1, "flipDiagonal": false, "colors": { "accent": "#ff8800" } }
    }
  ]
}
```

فایل کاملاً قابل ویرایش دستی است؛ فیلدهای جاافتاده با مقادیر پیش‌فرض تمپلیت پر می‌شوند و `parseProject` فایل‌های خراب را با پیام فارسی رد می‌کند.
**استفاده مجدد برای کمپین بعدی:** پروژه را JSON بگیرید، متن‌ها و عکس‌ها را عوض کنید (یا در خود ادیتور ویرایش کنید) و دوباره اکسپورت کنید.

### پرایمیتیوها

| کامپوننت | نقش |
|---|---|
| `SlideFrame` | بوم ۱۰۸۰×۱۳۵۰ (یا ۱۰۸۰×۱۰۸۰)، RTL، متغیرهای CSS تم، الگوی پس‌زمینه، ناحیه محتوا داخل حاشیه امن، لایه راهنماها |
| `BrandBar` | نشان + نام برند + متن جانبی؛ حالت‌های `default / onImage / onPanel` |
| `PageDots` | نقطه‌های موقعیت کاروسل + نشانگر «ادامه» (جهت RTL) |
| `DiagonalPanel` | بلوک تمام‌عرض با یک لبه مورب؛ دو پنل روی هم، نوار رنگی تأکید می‌سازند |
| `AutoFitText` / `AutoFitBlock` | کوچک‌کردن خودکار فونت با جست‌وجوی دودویی تا متن در کادرش جا شود (ارتفاع و عرض)؛ متن طولانی فارسی هرگز چیدمان را نمی‌شکند |
| `ImageSlot` | تنها جایی که عکس می‌نشیند: `object-fit: cover` حول نقطه تمرکز + زوم؛ حالت خالی یک placeholder است که در خروجی PNG بدون متن راهنما رندر می‌شود |

---

## ۵. افزودن تمپلیت جدید

۱. فایل `src/components/templates/MyThingSlide.tsx` را بسازید. هر تمپلیت دو چیز export می‌کند: کامپوننت و `meta`:

```tsx
import type { SlideContent, TemplateProps } from '../../types';
import { AutoFitText, BrandBar, PageDots, SlideFrame } from '../primitives';
import { C } from '../../utils/style';
import type { TemplateMeta } from './shared';
import { withDefaults } from './shared';

interface MyContent { title: string }

export const myThingMeta: TemplateMeta = {
  id: 'mything',                 // ۲) به TemplateId در types.ts اضافه شود
  label: 'تمپلیت من',
  fileSlug: 'mything',           // نام فایل خروجی: 03-mything.png
  description: 'توضیح کوتاه برای منوی افزودن اسلاید',
  fields: [{ key: 'title', label: 'تیتر', kind: 'textarea', maxChars: 50 }],   // کدام فیلدها در Inspector بیایند
  slots: [],                     // اسلات‌های عکس: [{ id, label, aspectHint }]
  defaults: { title: 'تیتر نمونه', images: {} },
};

export function MyThingSlide({ content }: TemplateProps) {
  const c = withDefaults<MyContent>(content as SlideContent, myThingMeta.defaults);
  return (
    <SlideFrame>
      <BrandBar />
      <AutoFitText text={c.title} type="headline" field="title" color={C.ink} />
      <PageDots />
    </SlideFrame>
  );
}
```

۲. `'mything'` را به union نوع `TemplateId` در `src/types.ts` اضافه کنید.
۳. در `src/components/templates/registry.ts` آن را در `TEMPLATES` و `TEMPLATE_ORDER` ثبت کنید.

Inspector (فیلدها و اسلات‌های عکس)، منوی «افزودن»، اکسپورت و نام‌گذاری فایل‌ها خودکار از `meta` ساخته می‌شوند.
قواعد: فقط از `C.*`, `S.*`, `R.*`, `typeCss()` استفاده کنید؛ متن‌های متغیر را با `AutoFitText` بنویسید؛ هر `field="…"` که بگذارید، کلیک روی آن در بوم، فیلد متناظر را فوکوس می‌کند (کلید `list` به شکل `features.0` و `pairs` به شکل `points.1.title`).

### افزودن تم جدید

یک فایل JSON هم‌ساختار با تم‌های موجود در `src/tokens/` بسازید و آن را در `src/tokens/index.ts` به `PRESET_THEMES` اضافه کنید. یا در ادیتور تم را بسازید و با «دریافت JSON تم فعلی» فایلش را بگیرید.

---

## ۶. نکات تایپوگرافی فارسی (مهم)

- **هرگز `letter-spacing` روی متن فارسی نگذارید**؛ حروف به هم متصل‌اند و فاصله‌گذاری آن‌ها را می‌شکند (فقط برای متن لاتین مثل `IRANPOOSH` استفاده شده است).
- ارقام فارسی (`۱۲۳`) را مستقیم در متن بنویسید؛ کد تخفیف و URL با `dir="ltr"` نمایش داده می‌شوند.
- برای شکستن خط در تیتر از Enter استفاده کنید (`white-space: pre-line`).

## ۷. وضعیت راستی‌آزمایی

در محیط ساخت، این موارد واقعاً اجرا و بررسی شدند: `tsc --noEmit` (strict) بدون خطا، `vite build` موفق، رندر هر ۷ اسلاید در هر ۴ تم و هر دو قالب در Chromium بدون‌سر، آپلود عکس + ذخیره خودکار + بازیابی بعد از ریلود، و اکسپورت ZIP (۱۴ فایل PNG با ابعاد `2160×2700` و `2160×2160`).
بررسی دستی توسط شما روی مرورگر دسکتاپ خودتان همچنان توصیه می‌شود (مخصوصاً با عکس‌های واقعی محصول).
