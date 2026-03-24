@AGENTS.md

# Rushtown HR Platform

A full-stack HR management platform built with **Next.js 16** (App Router), **Supabase**, **Tailwind CSS v4**, and **shadcn/ui** components.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, React 19) |
| Database & Auth | Supabase (PostgreSQL + Row-Level Security) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Forms | react-hook-form + zod |
| Tables | @tanstack/react-table |
| Charts | recharts |
| Date handling | date-fns |
| Type safety | TypeScript 5 |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                        # Authenticated app shell
│   │   ├── layout.tsx                # Sidebar + Topbar shell
│   │   ├── dashboard/
│   │   │   ├── employee/page.tsx
│   │   │   ├── executive/page.tsx
│   │   │   ├── hr/page.tsx
│   │   │   └── manager/page.tsx
│   │   └── employees/
│   │       ├── page.tsx              # Employee list
│   │       └── [employeeId]/
│   │           ├── page.tsx          # Redirects → /overview
│   │           ├── overview/page.tsx
│   │           ├── personal/page.tsx
│   │           ├── employment/page.tsx
│   │           ├── compensation/page.tsx
│   │           ├── documents/page.tsx
│   │           ├── onboarding/page.tsx
│   │           ├── performance/page.tsx
│   │           ├── recognition/page.tsx
│   │           ├── strikes/page.tsx
│   │           ├── pto/page.tsx
│   │           ├── attendance/page.tsx
│   │           ├── schedule/page.tsx
│   │           └── notes/page.tsx
│   ├── (auth)/                       # Unauthenticated pages
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── api/auth/callback/route.ts    # Supabase OAuth callback
│   └── layout.tsx                    # Root layout (fonts, globals)
│
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── dashboards/
│   │   ├── EmployeeDashboard.tsx
│   │   ├── ExecutiveDashboard.tsx
│   │   ├── HRDashboard.tsx
│   │   ├── ManagerDashboard.tsx
│   │   └── widgets/
│   │       ├── HeadcountWidget.tsx
│   │       ├── OnboardingProgressWidget.tsx
│   │       ├── OpenReviewsWidget.tsx
│   │       ├── PtoRequestsWidget.tsx
│   │       ├── RecentStrikesWidget.tsx
│   │       └── RecognitionFeedWidget.tsx
│   ├── employees/
│   │   ├── EmployeeTable.tsx         # Searchable/sortable list
│   │   ├── EmployeeProfileTabs.tsx   # Tab navigation bar (client)
│   │   └── tabs/
│   │       ├── OverviewTab.tsx
│   │       ├── PersonalTab.tsx
│   │       ├── EmploymentTab.tsx
│   │       ├── CompensationTab.tsx
│   │       ├── DocumentsTab.tsx
│   │       ├── OnboardingTab.tsx
│   │       ├── PerformanceTab.tsx
│   │       ├── RecognitionTab.tsx
│   │       ├── StrikesTab.tsx
│   │       ├── PtoTab.tsx
│   │       ├── AttendanceTab.tsx
│   │       ├── ScheduleTab.tsx
│   │       └── NotesTab.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   ├── shared/
│   │   ├── ConfirmDialog.tsx
│   │   ├── DataTable.tsx
│   │   ├── DepartmentBadge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FormSection.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── PermissionGate.tsx        # Client-side role gate
│   │   └── RoleBadge.tsx
│   └── ui/                           # shadcn/ui primitives
│
├── hooks/
│   ├── useCurrentUser.ts
│   ├── useDebounce.ts
│   ├── useNotifications.ts
│   ├── usePermissions.ts
│   └── useRealtimeChannel.ts
│
├── lib/
│   ├── auth/
│   │   ├── getSession.ts             # Server-side session → SessionUser
│   │   ├── permissions.ts            # Role → Permission[] map + helpers
│   │   └── requireRole.ts            # Throws/redirects if role insufficient
│   ├── constants/
│   │   ├── roles.ts                  # Role type, labels, colors
│   │   ├── departments.ts
│   │   ├── pto-types.ts
│   │   └── strike-levels.ts
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client + service client
│   │   └── storage.ts                # Storage bucket helpers
│   └── utils/
│       ├── cn.ts                     # clsx + tailwind-merge
│       ├── csv-parser.ts
│       ├── export.ts
│       ├── format.ts                 # formatDate, formatCurrency, etc.
│       └── health-score.ts
│
├── middleware.ts                     # Auth guard + /dashboard role redirect
└── types/
    ├── app.types.ts
    └── database.types.ts             # Auto-generated from Supabase CLI
```

---

## Authentication & Sessions

- Auth is handled by **Supabase Auth** (email/password).
- `src/middleware.ts` protects all routes except `/login`, `/forgot-password`, `/reset-password`, `/auth/*`.
- Authenticated users hitting `/dashboard` are redirected to their role-specific dashboard.
- Server pages call `getSession()` which returns `SessionUser`:

```ts
interface SessionUser {
  id: string;
  email: string;
  role: Role;           // "owner" | "hr_manager" | "department_manager" | "employee" | "executive"
  employeeId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}
```

---

## Roles & Permissions

Five roles defined in `src/lib/constants/roles.ts`:

| Role | Description |
|---|---|
| `owner` | Full access to everything |
| `hr_manager` | Full HR access, no admin.manage_users |
| `department_manager` | Team-scoped HR operations |
| `employee` | Own profile only |
| `executive` | Read-only org-wide view + reports |

Permissions are checked via `hasPermission(role, permission)` from `src/lib/auth/permissions.ts`. Example permissions: `compensation.view`, `strikes.issue`, `schedules.manage`, `attendance.enter`, `employees.edit`.

Use `<PermissionGate permission="...">` for client-side UI gating.

---

## Database Schema (Supabase / PostgreSQL)

Migrations live in `supabase/migrations/`. Run in order:

| Migration | Tables |
|---|---|
| 001 | `roles`, `permissions`, `role_permissions` |
| 002 | `users`, `locations` |
| 003 | `departments`, `department_managers`, `job_titles` |
| 004 | `employees` |
| 005 | `compensation_records`, `benefits_enrollments` |
| 006 | `documents` |
| 007 | `onboarding_templates`, `onboarding_tasks`, `employee_onboarding` |
| 008 | `training_courses`, `employee_training` |
| 009 | `performance_cycles`, `performance_reviews` |
| 010 | `recognition_categories`, `recognition_events` |
| 011 | `strike_categories`, `strike_rules`, `strike_events`, `disciplinary_actions` |
| 012 | `attendance_events` |
| 013 | `pto_policies`, `pto_balances`, `pto_requests` |
| 014 | `shift_templates`, `schedules` |
| 015 | `surveys`, `survey_questions`, `survey_responses` |
| 016 | `notifications`, `audit_log`, `notes` |
| 017 | Row-Level Security policies |

Seed data in `supabase/seed/`: roles, departments, locations, job titles, strike/recognition categories, and demo users.

### Key table relationships

```
users ──── employees ──┬── compensation_records
                       ├── benefits_enrollments
                       ├── documents
                       ├── employee_onboarding
                       ├── performance_reviews
                       ├── recognition_events
                       ├── strike_events
                       ├── disciplinary_actions
                       ├── attendance_events
                       ├── schedules
                       ├── pto_requests
                       └── notes (entity_type='employee', entity_id=employee.id)
```

---

## Employee Profile Tabs

Each tab is a **Server Component page** that fetches its own data. The `EmployeeProfileTabs` client component renders the navigation bar.

| Tab | Route | Required Permission |
|---|---|---|
| Overview | `/overview` | any authenticated |
| Personal | `/personal` | any authenticated |
| Employment | `/employment` | any authenticated |
| Compensation | `/compensation` | `compensation.view` |
| Documents | `/documents` | `documents.view_nonsensitive` |
| Onboarding | `/onboarding` | any authenticated |
| Performance | `/performance` | any authenticated |
| Recognition | `/recognition` | any authenticated |
| Strikes | `/strikes` | any authenticated |
| PTO | `/pto` | any authenticated |
| Attendance | `/attendance` | `attendance.enter` |
| Schedule | `/schedule` | `schedules.manage` |
| Notes | `/notes` | `employees.edit` (sensitive) |

Employees are redirected to their own dashboard if they attempt to view another employee's profile.

---

## Dashboards

Role-specific dashboards (`/dashboard/hr`, `/dashboard/manager`, `/dashboard/executive`, `/dashboard/employee`) each render a different component with relevant widgets. The middleware auto-redirects `/dashboard` to the correct route based on the user's role.

---

## Utility Helpers

**`src/lib/utils/format.ts`**
- `formatDate(date)` — `"Jan 1, 2024"`
- `formatDateTime(date)` — with time
- `formatRelative(date)` — `"3 days ago"`
- `formatCurrency(amount)` — `"$1,234.56"`
- `formatHours(hours)` — `"8.0h"`
- `formatPhoneNumber(phone)` — `"(555) 123-4567"`
- `getInitials(name)` — `"JD"`

**`src/lib/utils/cn.ts`** — `cn(...classes)` combines clsx + tailwind-merge.

---

## Common Patterns

### Server page with auth + data fetch

```tsx
export default async function SomePage({ params }: { params: Promise<{ employeeId: string }> }) {
  const { employeeId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // Role guard
  if (!hasPermission(session.role, "some.permission")) {
    redirect(`/employees/${employeeId}/overview`);
  }

  const supabase = await createClient();
  const { data } = await supabase.from("some_table").select("*").eq("employee_id", employeeId);

  return <SomeTab data={data ?? []} />;
}
```

### Regenerate database types after migrations

```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```

### Dev server

```bash
npm run dev
```
