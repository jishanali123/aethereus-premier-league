# Cursor Mastery Plan (Senior → Architect Track)

A curated, phased plan to master Cursor and AI-assisted development to an expert level.
Built from Cursor's official docs/blog plus the best current community resources (2026).

> **How to use this doc:** work top-to-bottom, one phase per week. Tick the checkboxes as you go.
> The **Architect Track** at the bottom is the part that actually differentiates a senior heading toward architect.

---

## The mental model first (read before anything else)

Cursor in 2026 is not "autocomplete + chat." It's an **agent harness** — a system where the model is a
first-class citizen and *your leverage comes from engineering the context and guardrails around it*, not from
typing clever prompts. The community has converged on a six-layer mental model:

1. **Context Engineering** — Rules (`.cursor/rules/*.mdc`), `AGENTS.md`, User/Team rules
2. **Dynamic Knowledge** — Skills (`.cursor/skills/`), MCP servers, semantic index
3. **Agent Modes** — Plan, Agent, Ask, Debug
4. **Automation** — Hooks, Commands, the "grind loop"
5. **Parallelism & Scale** — Git worktrees, Best-of-N, Cloud Agents
6. **Distribution** — Plugins, Marketplace

📖 Best single conceptual read: [Building an Agentic Developer Experience with Cursor — A Six-Layer System Design](https://gist.github.com/s3u/d4fb484c305909b54b2c6d1816f2dd17)

> **This repo already lives high on that stack.** It ships `.cursor/skills/` (test-gen, PR review, pipelines,
> PagerDuty investigation) and multiple MCP servers (Azure DevOps, Atlassian, Azure, Figma, Chrome DevTools),
> plus the `.cursor/rules/` created alongside this plan. Study these as real-world examples of context engineering.

---

## Phase 0 — Foundations (Week 1, ~4 hrs)

**Goal:** fluency in the surfaces so muscle memory stops costing you attention.

- [ ] Watch: [Cursor 101 (official, 2026)](https://www.youtube.com/watch?v=yjK7zypCXs4) — orientation, indexing, the four modes, MCP, rules/skills, cloud agents, BugBot.
- [ ] Watch: [Master Cursor in 50 Minutes — Lee Robinson (Cursor VP DevEx)](https://www.youtube.com/watch?v=mm8cn53_pdU) — planning, TDD, building "the right way" instead of vibe coding. Highest-signal beginner→intermediate video.
- [ ] Skim: [Official Cursor Docs](https://cursor.com/docs) — Agent, Rules, MCP, Skills, CLI.

**Know cold when to use each surface:**

| Surface | Use for |
|---|---|
| **Tab** | Low-latency completion (Cursor's own model) |
| **Cmd+K** | Surgical single-file edits |
| **Ask (Cmd+L)** | Read-only exploration / architecture Q&A *before* writing |
| **Composer / Agent (Cmd+I)** | Multi-file changes; Agent when there's a clear "definition of done" |

Rule of thumb: 1 function → **Cmd+K**; 3–10 files → **Composer**; whole-repo or test-loop → **Agent**.

---

## Phase 1 — Context Engineering (Week 2, highest-leverage skill)

This is where seniors pull away. The model is a commodity; *your context is your moat.*

- [ ] Read: [Cursor Rules: Complete .mdc Guide & 15 Templates (2026)](https://www.vibecodingacademy.ai/blog/cursor-rules-complete-guide)
- [ ] Browse/steal from: [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) and [cursor.directory](https://cursor.directory/)
- [ ] Read this repo's own `.cursor/rules/*.mdc` and `.cursor/skills/*/SKILL.md` end-to-end.

**Principles that actually matter:**

- Keep `alwaysApply` rules tiny; every rule word is a token stolen from code context.
- Prefer **glob-scoped** (`modules/client/**/*.tsx`) and **agent-requested** rules over `alwaysApply: true`.
- Use `@`-mentions for precise context: `@codebase` to discover, then pin explicit files once scope is clear.
- Commit `.cursor/rules/` to version control so the whole team shares AI behavior.
- Manage the context window like a budget — long, stale context degrades output.

---

## Phase 2 — Agent workflows & the Plan-first loop (Week 3)

- [ ] Read (canonical): [Best practices for coding with agents · Cursor](https://cursor.com/blog/agent-best-practices)
- [ ] Watch: [Cursor 201 (official)](https://www.youtube.com/watch?v=z4xruISaBfc) — advanced prompting, model/mode selection, MCP for heavy workloads, large codebases.
- [ ] Watch: [How I Use Cursor Like a Pro](https://www.youtube.com/watch?v=XKT1WWhxyyQ) — real project build with Plan mode + rules + branch-per-agent.

**The Plan → Execute → Verify loop (default for anything non-trivial):**

1. **Plan mode** (Shift+Tab) with a high-reasoning model → produce a written plan.
2. **Execute** with a fast agentic model following that plan.
3. **Debug mode** for hard bugs — forms hypotheses from runtime evidence instead of guessing.
4. Always `git commit` before an agent run (clean recovery point). **Read every diff** — never trust the agent's summary.

**Model routing (senior habit):** a strong general model for ~80% of work; a top reasoning model for
architecture/deep debugging (sparingly); a huge-context model for "explain this whole subsystem"; a cheap
model for mechanical bulk refactors.

---

## Phase 3 — MCP, Skills & Automation (Week 4)

- [ ] Read: [Best MCP Servers for Cursor AI](https://www.truefoundry.com/blog/best-mcp-servers-for-cursor-ai)
- [ ] Drive a real workflow through this repo's existing MCP servers (e.g. "investigate this PagerDuty alert and find the code path", or "review this Azure DevOps PR").
- [ ] Author one new Skill in `.cursor/skills/<name>/SKILL.md` for a repeatable task you do often.

Notes: MCP config lives in `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global). Watch the ~40-tool
limit — disable unused tools to keep the agent focused and save tokens.

---

## Phase 4 — Scale & Security (Week 5+, architect differentiators)

- [ ] Learn parallelism: Cloud Agents (`cursor.com/agents`), git worktrees, Best-of-N, background agents.
- [ ] Read: [Cursor Hardening Guide](https://howtoharden.com/guides/cursor/)

**Security essentials (non-negotiable for an architect):**

- The single most impactful control: **disable auto-run ("YOLO") mode** — require human approval before terminal commands.
- Treat the agent like "a fast junior engineer with root access."
- Known 2026 threats: MCP prompt injection (CurXecute), poisoned MCP configs (MCPoison), malicious extensions.

---

## The Architect Track (the real differentiator)

Tooling is table stakes within a year. Durable value is in *how you think*. Prioritize these four reads:

- [ ] [2026 Agentic Coding Trends Report (Anthropic)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) — value shifts to *system architecture, agent coordination, quality evaluation, problem decomposition*. Operating model: **delegate → review → own.**
- [ ] [From Vibe Programmers to Agentic Architects](https://doi.org/10.36227/techrxiv.177220800.05055576/v1) — names the role you're aiming at: the **Agentic Architect**, who encodes a project's methodology into persistent AI tool config (rules, skills, quality gates).
- [ ] [Comprehension Debt — Addy Osmani](https://addyosmani.com/blog/comprehension-debt/) — the central risk of AI-heavy teams: the gap between code volume and genuine understanding. The engineer who truly understands the system becomes *more* valuable as AI output scales.
- [ ] [The Future of Software Engineering with AI — Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/the-future-of-software-engineering-with-ai) — how real orgs actually roll out agentic workflows.

**Architect skills to deliberately build (not just read about):**

1. **Context/methodology-as-code** — own the team's `.cursor/rules/`, `AGENTS.md`, and skills library. Make correct architecture the *path of least resistance* for the agent.
2. **Spec-first, declarative delegation** — write success criteria and formal specs; review the spec and the diff, not keystrokes.
3. **Deterministic guardrails** — CI-gated architectural invariants, tests, and reviews so system logic can't drift as agents scale output.
4. **Comprehension discipline** — insist that "I understand why this change is correct" ranks above "tests passed."

---

## Ongoing feed (bookmark these)

- [Official Cursor blog](https://cursor.com/blog) & [changelog](https://cursor.com/changelog) — source of truth; the tool changes monthly.
- [cursor.directory](https://cursor.directory/) — rules, MCP servers, community patterns.
- [Cursor Community Forum](https://forum.cursor.com/) — power-user threads.

---

## Suggested cadence

| Weeks | Focus | Outcome |
|---|---|---|
| 1 | Foundations (101 + Lee Robinson) | Fluent in modes/shortcuts |
| 2 | Context engineering | A real `.cursor/rules/` set for this repo |
| 3 | Plan→Execute→Verify + model routing | Ship a feature agent-driven, reviewed properly |
| 4 | MCP + Skills authoring | Author 1 new skill + drive 1 MCP workflow |
| 5+ | Scale, security, architect track | Cloud agents, hardening, methodology-as-code |

The meta-point from every 2026 source: **the widening gap is between people who orchestrate agents well and
those who don't.** You're early enough to be on the right side of it.
