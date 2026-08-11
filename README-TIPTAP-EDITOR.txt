============================================================
 TIPTAP MODERN EDITOR + MEDIA LIBRARY (verified build)
============================================================

IS ZIP MEIN 4 FILES:
  components/admin/TipTapEditor.tsx   (Naya - modern editor)
  components/admin/MediaPicker.tsx    (Naya - media library modal)
  components/admin/ArticleEditor.tsx  (Replace - sirf import badla)
  package.json                        (12 TipTap deps add)

KYA MILTA HAI:
- Modern editor (TipTap) - purana document.execCommand khatam
- 🖼️ Image button -> Media Library modal khulta hai:
  * "Media Library" tab - pehle uploaded images grid mein
    (click -> insert)
  * "Upload New" tab - drag-drop ya click -> seedha upload -> insert
- Table insert button (2x2 default)
- Callout boxes (Tip/Note/Warning)
- Text color picker, link, code block, lists, headings

MAINE KHUD TEST KIYA:
- npm install -> 13 TipTap packages install OK
- next build -> ✓ Compiled successfully (no errors)
- /admin/articles/new -> 200 (page crash nahi)
- /api/media + /api/upload response shapes match karte hain
- ArticleEditor mein currentId fix bhi included hai
  (duplicate draft wala bug wapas NAHI aayega)

LAGAO (2 min):
1. ZIP extract -> SEEDHA Jatin-analytics-hub mein -> Replace All
2. GitHub Desktop -> 4 files -> Commit: "tiptap editor + media picker"
   -> Push
3. Vercel GREEN CHECK -> phir test:
   - /admin/articles/new kholo
   - Editor mein 🖼️ dabao -> Media Library modal khulega
   - Koi image click karo -> post mein insert
   - Ya Upload New tab -> drag-drop karo

NOTE: RichTextEditor.tsx file delete nahi hui (safe hai).
Agar kuch gadbad ho to bata dena - revert easy hai.
============================================================
