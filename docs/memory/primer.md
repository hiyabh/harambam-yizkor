# Session Primer - harambam-yizkor

## Design style
**Apple / Fluid** - נבחר על ידי חייא ב-2026-09-19. נימוק: ממשק שנשלח לכל הקהילה במובייל, צריך להרגיש טבעי ומכובד. סקילים: `apple-design` + `emil-design-eng` נטענו לפני כתיבת ה-UI. פלטה נגזרת מלוגו בית הרמב"ם (כחול `#2f55b5`).

## מצב נוכחי (2026-09-19)
- אתר GitHub Pages: https://hiyabh.github.io/harambam-yizkor/ (ריפו ציבורי `hiyabh/harambam-yizkor`)
- הרשימה הבסיסית (תשפ"ו): `data/names.json` - 301 גברים, 205 נשים (30 כפילויות מדויקות אוחדו).
- הוספות הקהילה: Supabase פרויקט `bina_payment` (`idgwbzckafwblfuaztcb`), טבלה `public.yizkor_names`, RLS: anon select(approved)+insert. פרויקט חינמי נפרד לא נוצר - החשבון במכסת 2 פרויקטים חינמיים.
- ייצוא: `export.html` - Word (David/RTL/מספרי עמודים, ספריית `docx` מקומית ב-`vendor/`), הדפסה, העתקה, JSON.

## מה נעשה בסשן הזה
- בנייה מאפס: HTML/CSS/JS vanilla, bottom sheet נגרר, זיהוי כפילות חי, OG image, keepalive workflow.
- אומת ב-Playwright: iPhone/Samsung/דסקטופ, light/dark, חיפוש, הוספה אמיתית, ייצוא DOCX.

## הבא בתור
- לשלוח את הקישור לקהילה (ערב כיפור 20.9.2026).
- לפני התפילה: `export.html` → "הורד קובץ Word".
- אחרי כיפור: לשקול ניקוי הטבלה והכנת `names.json` לשנה הבאה (הוראות ב-README).

## חסמים / החלטות פתוחות
- אין admin UI למחיקה; מחיקה דרך Supabase dashboard או דרך Claude (MCP).
