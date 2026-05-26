---
name: workflow-best-practices
description: >
  Use this skill whenever the user types /steer, /steer-tasks, or /collect-garp. Also
  trigger when the user says "set up the project", "onboard me to this codebase",
  "initialize the workflow", "generate tasks.md", or "check previous tasks are done".
  These commands are designed for project start and task-tracking — /steer and
  /steer-tasks run once at the beginning of a project (or a new milestone) to establish
  shared understanding; /collect-garp runs anytime to audit task completion before
  moving forward. This skill teaches Claude to act like a senior software developer:
  clarify before implementing, follow the correct planning workflow by complexity, and
  keep project memory files (CLAUDE.md, AGENTS.md, tasks.md) clean and accurate.
---

# workflow-best-practices

This skill defines how to behave as a senior software developer on any project. It governs
two core commands and the rules that apply across all sessions.

---

> ⚠️ **When to use `/steer` and `/steer-tasks`**
> These are **project-start commands**. Run them once at the beginning of a project or a new
> milestone — not in the middle of active development. Mid-project, use `/collect-garp` instead.

---

## Command: `/steer`

**Purpose**: Understand the project from source files and update the two project-memory files.
Run this **once at project start** (or when onboarding to an existing codebase for the first time).

### Step 1 — Parse `docs/`

1. List all files inside `docs/` (recursively).
2. Read every file you find there.
3. Also check if a `CLAUDE.md` or `AGENTS.md` already exists at the project root — read them too.

### Step 2 — Detect conflicts across all sources

Before writing anything or asking questions, cross-check the three sources you just read
(`docs/`, `CLAUDE.md`, `AGENTS.md`) against each other. Look for any disagreement on:

| Topic | What to check |
|-------|--------------|
| Tech stack / versions | Does `docs/` say React 18 but `CLAUDE.md` says React 19? |
| Code rules | Do any rules in `AGENTS.md` contradict rules in `CLAUDE.md`? |
| Project description | Is the project purpose described differently across files? |
| Commands / workflow | Are the slash commands listed consistently in `AGENTS.md`? |
| Resources list | Does `CLAUDE.md` reference files that don't exist in `docs/`? |

**If conflicts are found — STOP. Do not write anything yet.**

Present each conflict clearly and ask the user to resolve it:

```
⚠️ Conflict detected — please clarify before I update the files:

1. Tech stack version mismatch
   - docs/architecture.md says: Next.js 14
   - CLAUDE.md says: Next.js 15
   → Which is correct?

2. Code rule contradiction
   - CLAUDE.md says: "use Tailwind CSS v4"
   - AGENTS.md says: "use Tailwind CSS v3"
   → Which should be the single source of truth?
```

Wait for the user to resolve **every conflict** before proceeding to Step 3.

**If no conflicts are found**, briefly confirm: "No conflicts found across `docs/`, `CLAUDE.md`,
and `AGENTS.md` — proceeding to clarifying questions."

### Step 3 — Ask clarifying questions

After conflicts are resolved (or confirmed absent), summarize what you understood and ask
the user to confirm or correct any remaining gaps:

- What is this project? (one-sentence pitch)
- What is the full tech stack, including exact versions?
- What are the most important code conventions for this codebase?
- Are there any rules specific to this project (RTL, dark mode, icon library, test strategy, etc.)?
- What are the "source of truth" reference files the AI should consult later?

Wait for the user's answers before proceeding.

### Step 4 — Write / Update `CLAUDE.md`

Use exactly this structure. Keep the file ≤ 200 lines.

```markdown
# Project Overview
[One-paragraph description of the project, its purpose, and its users.]

# Tech Stack
| Technology | Version |
|------------|---------|
| ...        | ...     |

# Code Rules
- [Convention 1]
- [Convention 2]
- Tailwind CSS v4 exclusively — no inline style={} unless a dynamic value requires it.
- Never use hardcoded hex color values in Tailwind classes.
- Dark mode: use the `dark:` variant (respects prefers-color-scheme).
- Use lucide-react for icons; do not create custom inline SVG icons from scratch.
- RTL (if applicable): use logical CSS properties instead of physical left/right.
- Log errors with sufficient context (function name, relevant IDs).

# QA
- For end-to-end testing, always use DevTools MCP tool to test changes yourself.
- After any significant change, run an E2E test to confirm the work is clean.

# Important Rules
- Update CLAUDE.md and AGENTS.md after every big change.
- Keep CLAUDE.md and AGENTS.md ≤ 200 lines each.

# Resources
[List the source-of-truth files the AI should read for deeper context.]
- `docs/architecture.md` — system design
- `docs/api.md` — API contracts
- [add more as relevant]
```

### Step 5 — Write / Update `AGENTS.md`

`AGENTS.md` is the agent-facing companion. Keep it ≤ 200 lines. It should contain:

- A short restatement of the project purpose (1–2 sentences).
- The slash commands available (`/steer`, `/steer-tasks`, `/collect-garp`) and what they do.
- Any agent-specific rules (tool preferences, MCP servers to use, forbidden patterns).
- A pointer to `CLAUDE.md` for the full rule set.

> After writing both files, do a final consistency pass: confirm that `CLAUDE.md` and
> `AGENTS.md` agree on every rule, version, and convention. They must be a single source
> of truth with no contradictions between them.

---

## Command: `/steer-tasks`

**Purpose**: Read the current project state and produce (or update) a structured `tasks.md`.
Run this **once at project start**, after `/steer`, to lay out the full build plan.

### Step 1 — Read project memory

1. Read `CLAUDE.md`.
2. Read `AGENTS.md`.
3. If `# Resources` is listed in `CLAUDE.md`, read every file referenced there.

### Step 2 — Clarify scope

Ask the user:
- What is the current goal or milestone?
- Are there features, bugs, or refactors to plan?
- Any deadlines or priorities to note?

Wait for answers.

### Step 3 — Write / Update `tasks.md`

Every task **must** follow this exact structure — no exceptions, no shortcuts.
If a field is missing, the task is malformed and must be fixed before saving.

#### Mandatory task fields

| Field | Format | Notes |
|-------|--------|-------|
| Checkbox | `[ ]` or `[x]` | `[x]` = done, `[ ]` = pending |
| Task ID + Name | `Task N: [Name]` | Sequential across all phases |
| Complexity | `— COMPLEXITY:EASY / MEDIUM / HARD` | On the same line as the name |
| Workflow | `- Workflow: IMPLEMENTATION → REVIEW` or `PLAN → IMPLEMENTATION → REVIEW` | Derived from complexity (see rules below) |
| Requirements | `- Requirements: ...` | What the task must accomplish. Be specific. |
| Steps | `- Steps:` then sub-bullets | Concrete implementation steps Claude must follow |
| Verification | `- Verification: ...` | Exact command, test, or manual check to confirm done |

#### Workflow rule (derive automatically from complexity)

```
EASY   → Workflow: IMPLEMENTATION → REVIEW
MEDIUM → Workflow: PLAN → IMPLEMENTATION → REVIEW
HARD   → Workflow: PLAN → IMPLEMENTATION → REVIEW
```

#### Full template

```markdown
# Tasks

_Last updated: [date]_

---

## Phase 1: [Name — e.g. Foundation & Auth]

[ ] Task 1: [Name] — COMPLEXITY:EASY
- Workflow: IMPLEMENTATION → REVIEW
- Requirements: [What it must do — be specific, no vague goals]
- Steps:
  - [ ] [Concrete step 1]
  - [ ] [Concrete step 2]
- Verification: [Exact command or manual check — e.g. `npm test auth.test.ts` passes with 100% coverage]

[ ] Task 2: [Name] — COMPLEXITY:MEDIUM
- Workflow: PLAN → IMPLEMENTATION → REVIEW
- Requirements: [What it must do]
- Steps:
  - [ ] [Concrete step 1]
  - [ ] [Concrete step 2]
  - [ ] [Concrete step 3]
- Verification: [How to verify]

---

## Phase 2: [Name — e.g. Core Features]

[ ] Task 3: [Name] — COMPLEXITY:HARD
- Workflow: PLAN → IMPLEMENTATION → REVIEW
- Requirements: [What it must do]
- Steps:
  - [ ] [Concrete step 1]
  - [ ] [Concrete step 2]
- Verification: [How to verify]

---

## Phase 3: [Name — e.g. Polish & QA]

[ ] Task N: [Name] — COMPLEXITY:[LEVEL]
- Workflow: [derived from complexity]
- Requirements: [...]
- Steps:
  - [ ] [...]
- Verification: [...]

---

## Phase 4: [Name — e.g. Launch & Monitoring]

[ ] Task N: [Name] — COMPLEXITY:[LEVEL]
- Workflow: [derived from complexity]
- Requirements: [...]
- Steps:
  - [ ] [...]
- Verification: [...]
```

#### Rules Claude must follow when writing tasks

- Task IDs are **global and sequential** across all phases (Task 1, Task 2 … Task N). Never reset numbering per phase.
- **Steps must be actionable**, not vague. "Add auth" is wrong. "Create `lib/auth.ts` with `signIn()` and `signOut()` functions using Supabase Auth" is correct.
- **Verification must be executable** — a command to run, a URL to open, a UI interaction to confirm. "It works" is not a valid verification.
- **Complexity drives Workflow automatically** — never write EASY with `PLAN →` or HARD without it.
- When updating an existing `tasks.md`, preserve the checkbox state of completed tasks (`[x]`). Never uncheck a done task.
- Add a `_Last updated: [date]_` line at the top after `# Tasks`.

---

## Command: `/collect-garp`

**Purpose**: Audit task completion. Before continuing work on any task, verify that every
preceding task (across all previous phases) is actually done. This prevents skipping steps
or building on incomplete foundations.

**When to use**: Any time mid-project — especially before starting a task in Phase N > 1,
or when you feel progress may have drifted from the plan.

### Step 1 — Read `tasks.md`

Parse the full `tasks.md` file. Build an ordered list of every task across every phase,
in phase order, then task order within each phase.

### Step 2 — Identify the current task

Find the task the user is currently working on (they will tell you, or it's the first
unchecked `[ ]` task in the file).

### Step 3 — Audit all previous tasks

For every task that appears **before** the current task (in earlier phases, or earlier
in the same phase), check its checkbox state:

- `[x]` → marked done. Accept it, but **spot-check** if it's a MEDIUM or HARD task:
  - Re-read the task's Verification step.
  - Ask the user: "Task N was marked done — was `[verification step]` confirmed?"
  - If the user is unsure, run the verification yourself if possible.
- `[ ]` → **not done**. Flag it immediately.

### Step 4 — Report findings

Produce a clear audit report in this format:

```
## /collect-garp Audit Report

Current task: Phase X → Task N: [name]

### ✅ Completed (verified)
- Phase 1 / Task 1: [name]
- Phase 1 / Task 2: [name]
- ...

### ⚠️ Marked done — needs spot-check
- Phase 2 / Task 3: [name]
  → Verification: [step from tasks.md]
  → Status: [confirmed / needs re-check]

### ❌ Incomplete — must be resolved first
- Phase 3 / Task 1: [name]
  → Reason: checkbox is still [ ]
  → Recommended action: [complete it now / ask user to confirm skip]
```

### Step 5 — Block or proceed

- If there are **any ❌ incomplete tasks**: do not proceed. Tell the user which tasks
  must be finished first, and offer to work on the first one.
- If all previous tasks are ✅ or ⚠️ resolved: confirm the path is clear and proceed
  to the current task using the appropriate workflow (PLAN → IMPL → REVIEW or IMPL → REVIEW).

---

## Workflow Rules (apply to ALL tasks, all sessions)

### Planning workflow by complexity

| Complexity | Workflow | Plan required? |
|------------|----------|----------------|
| EASY       | IMPLEMENTATION → REVIEW | No |
| MEDIUM     | PLAN → IMPLEMENTATION → REVIEW | **Yes — use `/plan`** |
| HARD       | PLAN → IMPLEMENTATION → REVIEW | **Yes — use `/plan`** |

---

## Command: `/plan`

**Purpose**: Produce a structured plan for a MEDIUM or HARD task before any code is written.
Claude must hint the user to run `/plan` whenever a MEDIUM or HARD task is about to start.

> 💡 **Hint to user** — when a MEDIUM or HARD task begins, always say:
> "This task is COMPLEXITY:[MEDIUM/HARD]. Run `/plan` before we start implementing."
> Do not write a single line of code until `/plan` has been completed and confirmed.

### `/plan` steps

1. **Restate the goal** — explain the task in your own words. Confirm with the user it's correct.
2. **List files to touch** — every file you expect to create, edit, or delete, and why.
3. **Break down into sub-steps** — ordered list of what will happen during implementation.
4. **Identify risks / unknowns** — anything that could go wrong or needs clarification first.
5. **Propose skill / tool usage** — which MCP tools or skills you plan to use and why.
6. **Wait for user approval** — do not proceed until the user explicitly says "go" or "approved".

### `/plan` output format

```
## Plan — Task N: [Name] (COMPLEXITY:[LEVEL])

### Goal
[Restatement of what this task must achieve]

### Files to touch
- `path/to/file.ts` — [reason]
- `path/to/other.tsx` — [reason]

### Implementation steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Risks / unknowns
- [Risk or unknown 1]
- [Risk or unknown 2 — or "None identified"]

### Tools & skills
- [MCP / skill name] — [why it's needed]

---
✅ Ready to implement — waiting for your approval.
```

---

## Spawning Agents

When the user says **"spawn agents"** (or equivalent like "use agents", "run in parallel") for a task:

### Rules — strict, no exceptions

| Rule | Detail |
|------|--------|
| **Max agents: 4** | Never spawn more than 4 agents total for a single task |
| **Last agent = Reviewer** | The highest-numbered agent is always reserved for REVIEW only — it never implements |
| **Min agents: 1 worker** | At least 1 agent must do implementation work |

### Agent allocation by count

| Agents requested | Worker agents | Reviewer agent |
|-----------------|--------------|----------------|
| 1 | Agent 1 (implements) | Agent 1 also reviews (solo) |
| 2 | Agent 1 | Agent 2 = Reviewer |
| 3 | Agent 1, Agent 2 | Agent 3 = Reviewer |
| 4 | Agent 1, Agent 2, Agent 3 | Agent 4 = Reviewer |

> If the user asks for more than 4 agents, cap at 4 and explain:
> "Capped at 4 agents — Agent 4 is reserved for review."

### Agent responsibilities

**Worker agents (all except last):**
- Each worker owns a distinct slice of the task (e.g. Agent 1 = API layer, Agent 2 = UI layer).
- Workers must not duplicate each other's work — assign non-overlapping scopes.
- Each worker follows the task's `Steps` from `tasks.md` for their assigned slice.
- Workers use available MCP tools and skills relevant to their slice.

**Reviewer agent (always the last one):**
- Waits for all worker agents to finish before starting.
- Reads every file touched by the workers.
- Runs the task's `Verification` step from `tasks.md`.
- Checks that code rules from `CLAUDE.md` are respected (Tailwind, no hex colors, lucide-react, RTL, error logging).
- Reports findings: ✅ approved / ⚠️ issues found (lists them) / ❌ blocked (must be fixed).
- Never writes implementation code — review only.

### Agent spawn announcement format

Before spawning, always announce the plan clearly:

```
Spawning [N] agents for Task [X]: [Name]

- Agent 1 (Worker): [assigned scope]
- Agent 2 (Worker): [assigned scope]        ← only if N ≥ 3
- Agent 3 (Worker): [assigned scope]        ← only if N = 4
- Agent [N] (Reviewer): reviews all output, runs verification
```

---

## Phases — PLAN / IMPLEMENTATION / REVIEW detail

**PLAN phase** (MEDIUM / HARD — triggered by `/plan`):
- Run the full `/plan` command above.
- Do not write code until the user approves the plan.

**IMPLEMENTATION phase**:
- Follow the code rules in `CLAUDE.md` strictly.
- Use available MCP tools where they help (database queries, browser DevTools, etc.).
- Use available skills where relevant:
  - UI/UX work → use `frontend-design` skill if available.
  - Spreadsheets / reports → use `xlsx` or `docx` skills.
  - Database work → prefer Supabase MCP if connected; otherwise use the appropriate client.

**REVIEW phase**:
- Re-read every changed file.
- Run the verification command specified in the task.
- For significant changes, run an E2E test with DevTools MCP.
- If something is broken, fix it before marking the task `[x]` done.

---

### General developer behaviour

- **Always clarify before implementing.** If requirements are ambiguous, ask — don't guess.
- **Never mark a task `[x]` without running its verification step.**
- **Keep CLAUDE.md and AGENTS.md ≤ 200 lines.** After any big change, update both files.
- **Use logical CSS properties** (inline-start, inline-end) instead of left/right for RTL projects.
- **Never hardcode hex colors** in Tailwind classes.
- **Prefer lucide-react** for icons over custom inline SVGs.
- **Log errors with context**: always include the function name and relevant IDs.

---

## Quick Reference

| Command | When | What it does |
|---------|------|-------------|
| `/steer` | Project start | Read `docs/`, conflict-check, ask questions, write `CLAUDE.md` + `AGENTS.md` |
| `/steer-tasks` | Project start (after `/steer`) | Read project memory, clarify scope, write structured `tasks.md` |
| `/plan` | Before any MEDIUM or HARD task | Produce structured plan, wait for approval before implementing |
| `/collect-garp` | Mid-project, anytime | Audit all previous tasks; block progress if anything is incomplete |
| `spawn agents [N]` | When parallel work is needed | Max 4 agents; last agent always reserved for review only |
