# 🏀 Admin Suite — March Madness Bracket App

This document explains the full architecture, purpose, and usage of the admin suite.

---

# 📁 Directory Structure

```
app/
  admin/
    page.tsx
    AdminClient.tsx

    games/
      page.tsx
      GamesClient.tsx

    brackets/
      page.tsx
      BracketsClient.tsx

    mulligans/
      page.tsx
      MulligansClient.tsx

    users/
      page.tsx
      UsersClient.tsx

    tools/
      page.tsx
      ToolsClient.tsx

    leaderboard/
      page.tsx
      LeaderboardClient.tsx
```

---

# 🔐 Authentication & Authorization

Admin access is controlled by a **hardcoded email allowlist**:

```ts
const ADMIN_EMAILS = [
  "adamjpwestsr@gmail.com",
  "lfahearn@gmail.com"
];
```

Every admin route:

- checks Supabase session  
- verifies email is in the allowlist  
- redirects unauthorized users to `/`

---

# 🧩 Architecture

Each admin page uses the same pattern:

### **Server Component (`page.tsx`)**
- loads Supabase session  
- checks admin permissions  
- renders the client component  

### **Client Component (`SomethingClient.tsx`)**
- contains all UI  
- contains all Supabase calls  
- contains all admin logic  
- uses dark slate inline styling  

This keeps server logic clean and UI logic isolated.

---

# 🛠 Admin Tools Overview

## `/admin`
Dashboard linking to all tools.

---

## `/admin/games`
Game result editor:

- set winners  
- propagate winners to future rounds  
- save results  
- reload games  

---

## `/admin/brackets`
Bracket management:

- view all brackets  
- view picks  
- reset bracket  
- delete bracket  
- view submission status  
- view tiebreaker  

---

## `/admin/mulligans`
Mulligan approval center:

- view pending requests  
- approve / deny  
- propagate replacement picks  
- update future rounds  

---

## `/admin/users`
User management:

- view all users  
- view user brackets  
- view user mulligans  
- jump to bracket/mulligan admin pages  

---

## `/admin/tools`
Commissioner tools:

- generate chalk bracket  
- generate upset bracket  
- generate perfect bracket  
- simulate rounds  
- reset tournament  

---

## `/admin/leaderboard`
Leaderboard recalculation:

- recalc scores  
- recalc mulligan stars  
- recalc rank changes  
- recalc tiebreakers  
- full leaderboard rebuild  

---

# 🧱 Database Tables Required

- `users`
- `games`
- `brackets`
- `picks`
- `bracket_submissions`
- `mulligan_requests`
- `leaderboard`

A migration script is provided below.

---

# 🚀 Extending the Admin Suite

To add a new admin tool:

1. Create a new folder under `app/admin/<tool>`
2. Add `page.tsx` (server)
3. Add `<Tool>Client.tsx` (client)
4. Add a link in `AdminClient.tsx`

The architecture is fully modular.

---

# 🎨 Styling

The admin suite uses:

- dark slate theme  
- inline styles  
- consistent spacing  
- consistent card layout  
- consistent button styles  

---

# 🧹 Maintenance Tips

- Keep server components small  
- Keep client components focused  
- Extract shared UI components if needed  
- Keep Supabase queries grouped logically  
- Avoid duplicating logic across tools  

---

# 🏁 End of README
