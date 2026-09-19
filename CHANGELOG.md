# Changelog

כל שינוי משמעותי לפרויקט מתועד כאן.
פורמט: [Keep a Changelog](https://keepachangelog.com) · גרסאות: [SemVer](https://semver.org).

## [Unreleased]

## [1.1.0] - 2026-09-19

### Added (תוסף)
- הרשימה מוצגת בתצוגה מקדימה של 12 שמות עם כפתור "הצג את כל השמות", כדי שהטופס והכפרות יישארו בהישג יד - [app.js](js/app.js)
- 10 שמות שהתקבלו מהרב בוואטסאפ נוספו למאגר (7 נשים, 3 גברים)

### Changed (שונה)
- הכותרת שונתה מ"רשימת הנזכרים" ל"רשימת הנפטרים" בכל האתר, בתגי השיתוף ובתמונת השיתוף

## [1.0.0] - 2026-09-19

### Added (תוסף)
- אתר ראשי עם הרשימה של תשפ"ו (301 גברים, 205 נשים אחרי איחוד כפילויות) - [index.html](index.html)
- חיפוש מיידי עם נירמול (רווחים, גרש/גרשיים, ניקוד, בר=בן) - [normalize.js](js/normalize.js)
- טופס הוספת נפטר/נפטרת עם זיהוי כפילות תוך כדי הקלדה ושמירה ב-Supabase - [add-form.js](js/add-form.js)
- Bottom sheet נגרר עם velocity dismissal ו-rubber-band (Apple/Fluid) - [sheet.js](js/sheet.js)
- סעיף פדיון כפרות עם קישור PayBox והעתקת מספר Bit
- תגי Open Graph ותמונת שיתוף לוואטסאפ ולרשתות - [og-image.png](assets/og-image.png)
- דף ייצוא: Word (David, RTL, מספרי עמודים), הדפסה, העתקה, JSON - [export.html](export.html)
- GitHub Action שבועי לשמירת פרויקט Supabase פעיל
