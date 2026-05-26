# Stockify — Requirements & Verification Checklist

## Global Guidelines
- Tailwind CSS v4 exclusively — no inline `style={}` unless dynamic values require it
- No hardcoded hex colors — use CSS variables from `globals.css`
- Dark mode via `dark:` variant
- All icons from `lucide-react`
- RTL-first: use logical properties (`start`/`end`, `ps`/`pe`) — never `left`/`right`
- Arabic-first (Egyptian dialect in chatbot), English toggle
- Log errors: `console.error("[functionName]", id, error.message)`
- Supabase client: `createClient()` from `@/lib/supabase/server` in all API routes
- after big event like ending phase update @CLAUDE.md file and @AGENT.md file. 

## Verification Checklist (per task)
1. TypeScript compiles: `npx tsc --noEmit`
2. No hardcoded colors or `left`/`right` CSS properties introduced
3. E2E test via DevTools MCP where applicable
4. RLS respected — no cross-role data leaks
5. Error states handled with Arabic fallback messages

## Current Focus Areas
- Phase 3.4: Cashier delivery order visibility (in progress)
- Phase 5: Mark implemented items as complete in tasks.md
- Phase 6.3: Chatbot widget UX polish
- Phase 7: QA, RTL audit, Security, Deployment
