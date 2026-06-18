# Node.js Setup — Placeholder

> **Status: Pending** — Node.js is not installed on this machine yet.  
> Complete this section once installation finishes, then delete or update this file.

---

## When Node is ready

1. **Verify installation** (new PowerShell window or restart Cursor first):

```powershell
node --version
npm --version
```

You should see version numbers (e.g. `v22.x.x` and `10.x.x`).

2. **Install project dependencies:**

```powershell
cd "c:\Users\DELL PC\Desktop\Website"
npm install
```

3. **Configure environment:**

```powershell
copy .env.local.example .env.local
```

Edit `.env.local` with your Supabase URL and anon key.

4. **Start the development server:**

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## If winget failed earlier

Use the website installer instead:

- Download LTS from [https://nodejs.org](https://nodejs.org)
- Run the `.msi` installer with default options
- Restart Cursor, then run the commands above

Or retry winget (skip Microsoft Store):

```powershell
winget install OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
```

---

## After Node works

- [ ] `npm install` completed
- [ ] `.env.local` created with Supabase keys
- [ ] SQL migration run in Supabase dashboard
- [ ] `npm run dev` runs without errors
- [ ] Site loads at localhost:3000

Then continue with Supabase setup in the main [README.md](./README.md).
