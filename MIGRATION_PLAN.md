# SSR to CSR + tRPC Migration Plan

## Goals
- Remove all React Router actions and loaders
- Implement tRPC with TanStack Query
- Keep cookie-based authentication
- Move away from Remix/React Router long term (but keep for now during migration)

## Phase 1: Setup tRPC Infrastructure & Remove Actions/Loaders

### Step 1: Install Dependencies
```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @tanstack/react-query superjson
```

### Step 2: Create tRPC Server Structure

#### File Structure
```
app/server/
├── trpc/
│   ├── context.ts              # Request context (extract userId from cookies)
│   ├── trpc.ts                 # tRPC instance, public/protected procedures
│   ├── routers/
│   │   ├── auth.ts             # login, signup, logout
│   │   ├── food.ts             # CRUD operations, aggregations, AI processing
│   │   ├── user.ts             # profile updates
│   │   └── index.ts            # Root app router (combines all routers)
│   └── middleware/
│       └── auth.ts             # Verify user is authenticated
```

#### Context Setup
```typescript
// app/server/trpc/context.ts
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { userIdFromRequest } from '../auth.server'

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const userId = await userIdFromRequest(req)

  return {
    userId,
    req,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

#### tRPC Instance
```typescript
// app/server/trpc/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be non-null
    },
  })
})
```

### Step 3: Create tRPC Routers

#### Auth Router
```typescript
// app/server/trpc/routers/auth.ts
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { UsersService } from '../../data/users.server'
import { authenticate, logout, userFromRequest } from '../../auth.server'

export const authRouter = router({
  login: publicProcedure
    .input(UsersService.loginParams)
    .mutation(async ({ input, ctx }) => {
      const result = await UsersService.login(input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid credentials',
          cause: result.errors
        })
      }

      // Note: Cookie setting will be handled differently in tRPC
      return { user: result.data, success: true }
    }),

  signup: publicProcedure
    .input(UsersService.signupParams)
    .mutation(async ({ input }) => {
      const result = await UsersService.signup(input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Signup failed',
          cause: result.errors
        })
      }

      return { user: result.data, success: true }
    }),

  logout: publicProcedure
    .mutation(async () => {
      return { success: true }
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await userFromRequest(ctx.req)
      return user
    }),
})
```

#### Food Router
```typescript
// app/server/trpc/routers/food.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { FoodService } from '../../data/food.server'

export const foodRouter = router({
  getEntriesForDay: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return FoodService.getEntriesForDay(ctx.userId, input.date)
    }),

  getAggregateForDay: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return FoodService.getAggregateForDay(ctx.userId, input.date)
    }),

  createEntry: protectedProcedure
    .input(z.object({
      content: z.string().optional(),
      day: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.createEntry(ctx.userId, input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to create entry',
          cause: result.errors
        })
      }

      return result.data
    }),

  updateEntry: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.updateEntry(ctx.userId, input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to update entry',
          cause: result.errors
        })
      }

      return result.data
    }),

  deleteEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteEntry(ctx.userId, input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to delete entry',
          cause: result.errors
        })
      }

      return result.data
    }),

  deleteAllEntries: protectedProcedure
    .input(z.object({ day: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteAllEntries(ctx.userId, input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to delete entries',
          cause: result.errors
        })
      }

      return result.data
    }),

  previewEntry: protectedProcedure
    .input(z.object({ input: z.string() }))
    .query(async ({ input }) => {
      const entry = await processFoodWithAI(input.input)

      if (entry.invalid) {
        return {
          success: false,
          error: 'Invalid prompt',
          input: input.input,
        }
      }

      const totals = {
        calories: entry.items.reduce((acc, item) => acc + item.calories, 0),
        protein: entry.items.reduce((acc, item) => acc + item.protein, 0),
        carbs: entry.items.reduce((acc, item) => acc + item.carbs, 0),
        fat: entry.items.reduce((acc, item) => acc + item.fat, 0),
        fiber: entry.items.reduce((acc, item) => acc + item.fiber, 0),
      }

      return {
        ...entry,
        success: true,
        totals,
        input: input.input
      }
    }),
})
```

#### User Router
```typescript
// app/server/trpc/routers/user.ts
import { router, protectedProcedure } from '../trpc'
import { UsersService } from '../../data/users.server'

export const userRouter = router({
  update: protectedProcedure
    .input(UsersService.updateParams)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.update(ctx.userId, input)

      if (result.errors) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to update profile',
          cause: result.errors
        })
      }

      return result.data
    }),
})
```

#### Root Router
```typescript
// app/server/trpc/routers/index.ts
import { router } from '../trpc'
import { authRouter } from './auth'
import { foodRouter } from './food'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  food: foodRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
```

### Step 4: Create tRPC HTTP Handler

```typescript
// app/routes/api.trpc.$.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '~/server/trpc/routers'
import { createContext } from '~/server/trpc/context'

export async function loader({ request }: LoaderFunctionArgs) {
  return handleRequest(request)
}

export async function action({ request }: ActionFunctionArgs) {
  return handleRequest(request)
}

function handleRequest(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  })
}
```

### Step 5: Setup tRPC Client

```typescript
// app/utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '~/server/trpc/routers'

export const trpc = createTRPCReact<AppRouter>()

export function createTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: '/api/trpc',
        // Include credentials to send cookies
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),
    ],
  })
}
```

### Step 6: Setup TanStack Query Provider in Root

```typescript
// app/root.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { trpc, createTRPCClient } from './utils/trpc'

export default function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  const [trpcClient] = useState(() => createTRPCClient())

  const { ENV, currentTheme } = useRootLoaderData()
  const { toast } = useToast()

  useEffect(() => {
    if (currentTheme === "system") applySystemTheme()
  }, [currentTheme, toast])

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Document className={currentTheme}>
          {/* ... rest of the document */}
          <Outlet />
        </Document>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

### Step 7: Disable SSR

```typescript
// react-router.config.ts
export default {
  ssr: false,  // Disable SSR
  future: {
    unstable_optimizeDeps: true,
  },
  presets: [vercelPreset()],
} satisfies Config;
```

### Step 8: Migrate Route Components

#### Example: Diary Route
```typescript
// app/routes/__authed.diary.tsx - BEFORE
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const date = new URL(request.url).searchParams.get("date") ?? new Date().toISOString()
  const userId = await userIdFromRequest(request)
  const entries = await FoodService.getEntriesForDay(userId, date)
  const entriesTotals = await FoodService.getAggregateForDay(userId, date)

  return { entriesForToday: entries, entriesTotals, unparsedDate: date }
}

export const action = async ({ request }: Route.ActionArgs) => {
  // ... action logic
}

export default function DiaryPage() {
  const { entriesForToday, entriesTotals, unparsedDate } = useLoaderData<DiaryRouteData>()

  return (
    <>
      <DiaryNavigation />
      <DiaryEntryForm />
      <DiaryDailySummary />
      <DiaryList />
    </>
  )
}
```

```typescript
// app/routes/__authed.diary.tsx - AFTER
import { trpc } from '~/utils/trpc'
import { useSearchParams } from 'react-router'

export default function DiaryPage() {
  const [searchParams] = useSearchParams()
  const date = searchParams.get('date') ?? new Date().toISOString()

  const { data: entries, isLoading: entriesLoading } = trpc.food.getEntriesForDay.useQuery({ date })
  const { data: totals, isLoading: totalsLoading } = trpc.food.getAggregateForDay.useQuery({ date })

  if (entriesLoading || totalsLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <DiaryNavigation />
      <DiaryEntryForm date={date} />
      <DiaryDailySummary totals={totals} />
      <DiaryList entries={entries} />
    </>
  )
}
```

#### Example: DiaryEntryForm with Mutations
```typescript
// app/modules/Diary/DiaryEntryForm.tsx - AFTER
import { trpc } from '~/utils/trpc'

export default function DiaryEntryForm({ date }: { date: string }) {
  const utils = trpc.useUtils()

  const createEntry = trpc.food.createEntry.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.food.getEntriesForDay.invalidate()
      utils.food.getAggregateForDay.invalidate()
      toast({ title: 'Entry created!' })
    },
    onError: (error) => {
      toast({
        title: 'Failed to create entry',
        description: error.message,
        variant: 'destructive'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    createEntry.mutate({
      content: formData.get('content') as string,
      day: date,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input name="content" />
      <Button type="submit" isLoading={createEntry.isPending}>
        Add Entry
      </Button>
    </form>
  )
}
```

#### Example: Preview Route
```typescript
// app/routes/__authed.preview.tsx - AFTER
import { trpc } from '~/utils/trpc'
import { useSearchParams } from 'react-router'

export default function Preview() {
  const [searchParams, setSearchParams] = useSearchParams()
  const input = searchParams.get('input') ?? ''

  const { data: entry, isLoading } = trpc.food.previewEntry.useQuery(
    { input },
    { enabled: !!input } // Only run query if input exists
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSearchParams({ input: formData.get('input') as string })
  }

  return (
    <main className="max-w-xl w-full mx-auto grow flex flex-col mb-4">
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <Input autoComplete="off" name="input" defaultValue={input} />
        <Button isLoading={isLoading} className="w-30">
          Search
        </Button>
      </form>

      {entry && !entry.success && (
        <Card className="border-destructive/50 bg-destructive/5">
          {/* Error card UI */}
        </Card>
      )}

      {entry && entry.success && (
        <DiaryEntry entry={{ /* ... */ }} />
      )}
    </main>
  )
}
```

#### Example: Profile Route
```typescript
// app/routes/__authed.profile.tsx - AFTER
import { trpc } from '~/utils/trpc'

export default function Profile() {
  const { data: user } = trpc.auth.me.useQuery()
  const utils = trpc.useUtils()

  const updateProfile = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate()
      toast({ title: 'Profile updated!' })
    },
    onError: (error) => {
      toast({
        title: 'Failed to update profile',
        variant: 'destructive'
      })
    },
  })

  const handleSubmit = (data: any) => {
    updateProfile.mutate(data)
  }

  if (!user) return <LoadingSpinner />

  return (
    <Card>
      <ProfileForm
        user={user}
        onSubmit={handleSubmit}
        isLoading={updateProfile.isPending}
      />
    </Card>
  )
}
```

#### Example: Login Route
```typescript
// app/routes/__unauthed.login.tsx - AFTER
import { trpc } from '~/utils/trpc'
import { useNavigate } from 'react-router'

export default function LoginPage() {
  const navigate = useNavigate()
  const utils = trpc.useUtils()

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      // Invalidate user query to refetch
      await utils.auth.me.invalidate()
      navigate('/diary')
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      })
    },
  })

  return <Login onSubmit={(data) => login.mutate(data)} />
}
```

### Step 9: Update Service Layer (if needed)

The service layer (FoodService, UsersService) can remain mostly unchanged. You may need to:
1. Remove FormData-specific validation
2. Update to accept plain objects instead of FormData
3. Keep the business logic the same

Example:
```typescript
// app/server/data/food.server.ts - UPDATE createEntry signature
static async createEntry(
  userId: string,
  params: { content?: string; day: string }
): Promise<DataResult<FoodEntry>> {
  // Remove zfd.formData validation
  // Keep the rest of the logic
}
```

### Step 10: Handle Authentication Cookie Setting

Since tRPC doesn't directly handle Response headers, you have two options:

**Option A: Set cookies in tRPC handler**
```typescript
// app/routes/api.trpc.$.ts
function handleRequest(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
    onError: ({ error, type, path, input, ctx, req }) => {
      console.error('tRPC Error:', { type, path, error })
    },
    responseMeta: ({ ctx, paths, errors, type }) => {
      // Set cookies here if needed
      return {}
    },
  })
}
```

**Option B: Use separate endpoint for auth (cleaner)**
Keep login/signup as traditional React Router actions that set cookies, use tRPC for everything else.

---

## Migration Checklist for Phase 1

### Setup
- [ ] Install tRPC and TanStack Query dependencies
- [ ] Create tRPC server structure (context, routers, middleware)
- [ ] Create tRPC HTTP handler route
- [ ] Setup tRPC client
- [ ] Add TanStack Query provider to root
- [ ] Disable SSR in react-router.config.ts

### Backend
- [ ] Create auth router (login, signup, logout, me)
- [ ] Create food router (all CRUD + preview)
- [ ] Create user router (update profile)
- [ ] Update service layer to accept plain objects (not FormData)
- [ ] Handle authentication cookie setting

### Frontend - Routes
- [ ] Migrate __authed.tsx (remove loader, use trpc.auth.me)
- [ ] Migrate __authed.diary.tsx
- [ ] Migrate __authed.preview.tsx
- [ ] Migrate __authed.profile.tsx
- [ ] Migrate __unauthed.login.tsx
- [ ] Migrate __unauthed.signup.tsx

### Frontend - Components
- [ ] Update DiaryEntryForm to use mutations
- [ ] Update DiaryList to use query data as props
- [ ] Update DiaryDailySummary to use query data as props
- [ ] Update DiaryEntryUpdate to use mutations
- [ ] Update DiaryEntryDeleteOne to use mutations
- [ ] Update DiaryClearDay to use mutations
- [ ] Update ProfileForm to accept onSubmit callback
- [ ] Update Login component to accept onSubmit callback

### Testing
- [ ] Test authentication flow
- [ ] Test diary CRUD operations
- [ ] Test preview functionality
- [ ] Test profile updates
- [ ] Test error handling
- [ ] Test loading states

### Cleanup
- [ ] Remove all loader exports from routes
- [ ] Remove all action exports from routes
- [ ] Remove clientAction from routes
- [ ] Remove unused imports (useLoaderData, useActionData, Form)
- [ ] Update types (remove Route.ComponentProps["loaderData"])

---

## File Upload Strategy (Future Phase)

For now, image uploads can be handled with:
1. Convert File to base64 on client
2. Send as string via tRPC
3. Process in AI endpoint

Future optimization:
- Separate upload endpoint
- Return URL
- Pass URL to tRPC mutation

---

## Notes

- Keep React Router v7 for now (routing, layouts, etc.)
- Only remove actions/loaders
- Migration to different routing solution can happen later
- Focus on getting tRPC working first
