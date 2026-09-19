# רשימת הנזכרים ליום הכיפורים - בית כנסת בית הרמב"ם מודיעין

אתר סטטי (GitHub Pages) שבו הקהילה בודקת אם יקיריה נמצאים ברשימת האזכרה ליום הכיפורים ומוסיפה שמות חסרים.
כתובת: https://hiyabh.github.io/harambam-yizkor/

## איך זה עובד

| רכיב | מקור |
|---|---|
| הרשימה של שנה שעברה | `data/names.json` (סטטי בריפו) |
| שמות שהקהילה מוסיפה השנה | טבלת `yizkor_names` ב-Supabase (פרויקט `bina_payment`) |
| ייצוא לתפילה | `export.html` - Word / הדפסה / העתקה / JSON |

הדפדפן ממזג את שני המקורות. גם אם Supabase לא זמין, הרשימה הבסיסית מוצגת וניתן לחפש.

## פעולות שגרתיות

**להוציא את הרשימה הסופית לפני יום כיפור** - לפתוח `export.html`, ללחוץ "הורד קובץ Word" (או "הדפס").

**למחוק שם שגוי / ספאם** - ב-Supabase Dashboard: Table Editor → `yizkor_names` → מחיקת השורה. משתמשים אנונימיים לא יכולים למחוק או לערוך (RLS).

**להתחיל שנה חדשה**
1. ב-`export.html` ללחוץ "הורד JSON" ולהחליף בו את `data/names.json` (כולל ההוספות של השנה).
2. לרוקן את הטבלה: `delete from public.yizkor_names;`
3. לעדכן את `yearLabel` ב-`js/config.js` ואת השנה ב-`index.html` (כותרת, OG) וב-`scripts/make_assets.py` (תמונת השיתוף) → להריץ `python scripts/make_assets.py "<לוגו>"`.
4. commit + push. GitHub Pages מתעדכן תוך דקה.

**לבנות מחדש את הרשימה מקובץ Word** - `python scripts/build_names_json.py "<קובץ>.docx"` (מאחד כפילויות מדויקות).

## פיתוח מקומי

```bash
python -m http.server 8765 --bind 127.0.0.1   # ואז http://127.0.0.1:8765/
```
אין build. JavaScript מודולרי ללא תלויות; ספריית `docx` נטענת מ-CDN רק בדף הייצוא.

## אבטחה

מפתח ה-Supabase שבקוד הוא מפתח **publishable** ציבורי. מדיניות RLS מאפשרת למשתמש אנונימי רק קריאה של שורות מאושרות והוספה. אינדקס ייחודיות על (מגדר, שם מנורמל) מונע כפילויות. GitHub Action שבועי (`.github/workflows/keepalive.yml`) שומר על הפרויקט פעיל.
