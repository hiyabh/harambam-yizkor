# Session Primer - harambam-yizkor

**Last updated:** 2026-09-19 - v1.2.1 חי ב-GitHub Pages, הקהילה כבר מוסיפה שמות.

## Design style
**Apple / Fluid** - נבחר על ידי חייא ב-2026-09-19. נימוק: ממשק שנשלח לכל הקהילה במובייל, צריך להרגיש טבעי ומכובד. סקילים: `apple-design` + `emil-design-eng` נטענו לפני כתיבת ה-UI. פלטה נגזרת מלוגו בית הרמב"ם (כחול `#2f55b5`).

## Current focus
האתר נמסר ומוכן לשליחה לקהילה לפני ערב כיפור (20.9.2026). אין עבודה פתוחה בקוד.

## מצב
- אתר: https://hiyabh.github.io/harambam-yizkor/ · ריפו ציבורי `hiyabh/harambam-yizkor` · v1.2.1
- בסיס תשפ"ו: `data/names.json` (301 גברים, 205 נשים). הוספות: Supabase `bina_payment` (`idgwbzckafwblfuaztcb`) → `public.yizkor_names` (RLS anon select+insert; פרויקט חינמי נפרד לא נוצר - מכסה מלאה). נכון לסגירה: 13 שורות (10 מהרב, 3 מהקהילה).
- ייצוא: `export.html` → Word (David/RTL/A4/מספרי עמודים, `docx` ב-`vendor/`, אומת ב-PDF), הדפסה, העתקה, JSON.

## This session (short)
- נבנה מאפס ונפרס; 3 סבבי תיקונים של חייא: כותרת "הנפטרים", תצוגה מקדימה 12 + "הצג הכל", חיפוש חוצה-מגדר מקובץ, שם קובץ Word בגרשיים.
- הבא: לשלוח את הקישור; לפני התפילה להוריד Word; אחרי כיפור להכין `names.json` לשנה הבאה (README).
- חסם: אין admin UI למחיקה - דרך Supabase dashboard או Claude (MCP).

יומן מלא: `~/.claude/skills/session-journal/logs/2026-09-19-harambam-yizkor.md`
