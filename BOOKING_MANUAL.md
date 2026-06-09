# How to Mark Dates as Booked on the Website

When a guest confirms a booking, you need to update one file on GitHub so that those dates appear as unavailable (shown in red) in the calendar on the website.

---

## Where to find the file

1. Go to **github.com** and sign in.
2. Open your repository: **kwacker86 / CDLB_website**
3. Click the folder called **`data`**
4. Click the file called **`bookings.json`**

You are now looking at the file that controls which dates are shown as booked.

---

## What the file looks like

```json
{
  "booked": [
    { "from": "2026-07-05", "to": "2026-07-12" },
    { "from": "2026-08-02", "to": "2026-08-23" }
  ]
}
```

Each line between `[` and `]` represents **one booking**:
- **`from`** = the Saturday the guests **arrive** (check-in)
- **`to`** = the Saturday the guests **depart** (check-out)

The calendar will mark all the Saturdays within that period as booked (red and unclickable).

---

## How to add a new booking

1. Open the file on GitHub (see above).
2. Click the **pencil icon** (✏️) in the top-right corner of the file. It says *"Edit this file"* when you hover over it.
3. You will see the text of the file. Find the line that says `"booked": [`.
4. Add a new line for the booking. Copy the format exactly:

   ```
   { "from": "2026-07-05", "to": "2026-07-12" },
   ```

   Replace the dates with the actual check-in and check-out Saturdays.

5. **Important:** every line except the **last** one must end with a comma `,`. The last line must have **no comma**.

   Example with two bookings:
   ```json
   {
     "booked": [
       { "from": "2026-07-05", "to": "2026-07-12" },
       { "from": "2026-08-02", "to": "2026-08-23" }
     ]
   }
   ```

   Example with one booking (no comma at the end):
   ```json
   {
     "booked": [
       { "from": "2026-07-05", "to": "2026-07-12" }
     ]
   }
   ```

6. Scroll down to the bottom of the page. You will see a section called **"Commit changes"**.
7. You can leave the default message as it is, or type something like *"Add booking July 5"*.
8. Click the green button **"Commit changes"**.

The website will update automatically within a minute or two.

---

## How to remove a booking (after it has passed)

1. Open and edit the file the same way as above.
2. Delete the entire line for that booking, including the `{ "from": ... }` part.
3. Make sure there is no trailing comma left behind on the line above.
4. Commit the changes (step 6–8 above).

---

## Date format rules — important!

The dates **must** follow this exact format: **YYYY-MM-DD**

| Correct | Wrong |
|---------|-------|
| `"2026-07-05"` | `"05/07/2026"` |
| `"2026-08-23"` | `"23-8-2026"` |
| `"2026-12-06"` | `"6 December 2026"` |

- Year first, then month, then day.
- Always use two digits for the month and day (e.g. `07` not `7`).
- Use hyphens `-`, not slashes `/`.
- Both dates must be **Saturdays**.

---

## What happens if you make a mistake?

If the file has a formatting error (a missing comma, a wrong date format, etc.), the calendar will simply show **no bookings** — it will not crash. So there is no risk of breaking the website. You just need to fix the file and commit again.

If you are unsure whether your edit looks correct, compare it carefully to the examples above before committing.

---

## Quick reference — how to find what day of the week a date falls on

Open any calendar app (iPhone Calendar, Google Calendar, Apple Calendar) and navigate to the date. Bookings must always start and end on a **Saturday**.

---

## Summary — the three steps every time you confirm a booking

1. Go to `github.com → kwacker86/CDLB_website → data → bookings.json`
2. Click ✏️ Edit, add one line: `{ "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },`
3. Click **Commit changes**

Done. The calendar on the website will show those dates in red within a minute or two.
