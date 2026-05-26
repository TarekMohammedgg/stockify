---
name: lightweight-task-workflow-collaborative
description: "FOLLOW THE STATE MACHINE IN SKILL.MD. When user says 'continue': (1) FIRST: Run pwd, (2) Announce STATE: CHECK_STATUS, (3) Read .claude/session.md to check Status field, (4) Route based on Status. Tracks multi-agent/multi-model contributions in a session log. NEVER auto-advance tasks. NEVER use TodoWrite. NEVER create git commits."
version: 1.1.0
---

# Lightweight Task Workflow (Collaborative Edition)

**🚨 CRITICAL: YOU MUST FOLLOW THE STATE MACHINE BELOW 🚨**
**🚨 EVERY SINGLE MESSAGE MUST START WITH: `🔵 STATE: [STATE_NAME]` 🚨**

This skill is a persistent todo list based on 3 files in `.claude/`: `tasks.md` (checklist), `requirements.md` (specs), `session.md` (current state & actor log).

## 👥 Permitted Actors Matrix
When updating the log or session files, the agent must identify themselves and their environment matching one item from each column:

| AI Provider / Model Family | Interface Environment |
| :--- | :--- |
| • `Gemini from antigravity` <br>• `gpt from codex` <br>• `claude from claude code` <br>• `Glm from opencode` | • `[model name - ide]` (e.g., Gemini 1.5 Pro - VS Code)<br>• `[model name - cli]` (e.g., Claude 3.7 Sonnet - Claude Code CLI) |

---

## 🔄 State Machine & Core Protocol

When the user says "continue", you MUST:
1. Run `pwd` to check the current working directory.
2. Announce `🔵 STATE: CHECK_STATUS`.
3. Read `.claude/session.md` from the current project directory.
4. Follow the state machine below based on the Status field.

```


 

 
                     user: "continue"
                            ↓
                   ┌────────────────┐
               ┌───│ CHECK_STATUS   │←──────────┬──────────┐
               │   │ Read session.md│           │          │
               │   └────────┬───────┘           │          │
               │            │                   │          │
    Status=    │            │ Status=           │          │
    "Complete" │            │ "in progress"     │          │
               │            │                   │          │
               ↓            ↓                   │          │
       ┌───────────┐  ┌──────────────┐          │          │
       │ AWAITING_ │  │ WORKING      │←────┐    │          │
       │ COMMIT    │  │              │     │    │          │
       │           │  │ Read:        │     │    │          │
       │ Ask       │  │ requirements │     │    │          │
       │ permission│  │ tasks.md     │     │    │          │
       │ STOP      │  │              │     │    │          │
       └─────┬─────┘  │ Write:       │     │    │          │
             │        │ session.md   │     │    │          │
   user: yes │        └──────┬───────┘     │    │          │
             │               │             │    │          │
             │               │ task done   │    │          │
             │               │             │    │          │
             ↓               ↓             │    │          │
       ┌──────────────┐┌──────────────┐    │    │          │
       │ MARK_TASK_   ││ VERIFY       │    │    │          │
       │ COMPLETE     ││              │    │    │          │
       │              ││ Run steps    │    │    │          │
       │ Write: tasks ││ from         │────┘    │          │
       │ Write: sess  ││ requirements │ fail     │          │
       └──────────────┘└──────┬───────┘          │          │
                              │                  │          │
                              │ pass             │          │
                              │                  │          │
                              ↓                  │          │
                       ┌──────────────┐          │          │
                       │ COMPLETE     │          │          │
                       │              │          │          │
                       │ Write:       │          │          │
                       │ session.md   │          │          │
                       │ Status=      │──────────┘          │
                       │ "Complete"   │                     │
                       └──────────────┘                     │
```
 

 

---

## 📝 Updated File Specifications (`.claude/`)

### 1. `.claude/tasks.md`
Standard markdown checklist mapping tasks.

### 2. `.claude/requirements.md`
Global guidelines, verification checklist, and design specs.

### 3. `.claude/session.md` (Updated with Actor Logs)
This file tracks session progress and **exactly who performed each action**. Multiple models are allowed to collaborate on the same task. 

 markdown
**Current Task:** Task 3: Implement Webhook Handlers
**Status:** in progress

## What's Done
- **Task 1: Database Migration** 
  - *Completed by:* `gpt from codex` [GPT-4o - VS Code]
  - *Commit:* `a1b2c3d`
- **Task 2: API Route Validation**
  - *Completed by:* `claude from claude code` [Claude 3.7 Sonnet - CLI]
  - *Commit:* `e4f5g6h`

## Session & Contribution Log
| Timestamp | Actor | Environment | Action / Update | Task Associated |
| :--- | :--- | :--- | :--- | :--- |
| 2026-05-26 08:30 | `claude from claude code` | Claude 3.7 Sonnet - CLI | Initialized task list and requirements baseline. | Task 1 |
| 2026-05-26 08:45 | `gpt from codex` | GPT-4o - VS Code | Fixed syntax issues in DB connection strings and ran migration scripts. | Task 1 |
| 2026-05-26 09:15 | `Gemini from antigravity` | Gemini 1.5 Pro - Cursor IDE | Added missing unit test cases for token timeouts. | Task 2 |
| 2026-05-26 10:02 | `Glm from opencode` | GLM-4 - CLI | Executed local benchmark performance checking on routes. | Task 2 |

## Next Steps
1. Finish Task 3: Process incoming event payloads safely.



---

## ⚠️ Skill Operational Rules

1. **Log Every Handoff/Action:** Every time a tool touches a task or updates `session.md` at one of the 4 triggers (Start task, End of TDD cycle, Hit blocker, Complete task), it **MUST** append a row to the `## Session & Contribution Log` table.
2. **Strict Identity Matching:** The model must identify itself using the precise string notation provided in the Actor Matrix. If it cannot perfectly deduce its model variation, it should use its primary family identifier (e.g., `Gemini from antigravity [Gemini 1.5 Flash - CLI]`).
3. **Never Overwrite Historical Actor Records:** When multiple models work on the same task, their log table history must be preserved as chronological rows. Do not delete what a previous AI provider did.
4. **All State Rules Remain Enforced:** Prepend every system response message with `🔵 STATE: [STATE_NAME]` or `🟢 TRANSITION: [STATE_A] → [STATE_B]`.

 

---

### What Changed in this Expert Revision:
* **The Actors Matrix:** Explicitly maps out your exact format criteria (`[Provider] [model name - ide/cli]`).
* **Collaborative Logging:** The `session.md` blueprint was refactored away from a single text summary into a concrete markdown audit table. 
* **Multi-Model Capability:** The logic safely allows distinct systems (`gpt from codex`, `Gemini from antigravity`, etc.) to register contributions to a single task step without overwriting each other's history.

You can drop this configuration directly into your `.claude/` project workflow directory or global agent profiles to enforce cross-platform logging! Let me know if you would like me to adjust any tracking attributes.
