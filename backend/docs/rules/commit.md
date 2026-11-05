# Conventional Commits — AI Agent Guide

Use **Conventional Commits** for every Git commit.

## Format

```text
<type>[optional scope]: <description>
```

For breaking changes:

```text
<type>[scope]!: <description>
```

## Types

| Type       | Use for                                          |
| ---------- | -------------------------------------------------|
| `feat`     | New functionality                                |
| `fix`      | Bug fixes                                        |
| `refactor` | Code restructuring without behavior change       |
| `perf`     | Performance improvements                         |
| `test`     | Adding or changing tests                         |
| `docs`     | Documentation                                    |
| `style`    | Code Formatting/style-only changes               |
| `chore`    | Maintenance, tooling, dependencies               |

## Examples

```text
feat(posts): add post filtering
fix(auth): reject expired sessions
refactor(posts): extract validation helper
perf(posts): reduce database queries
test(posts): add repository tests
docs(posts): document filtering API
chore(deps): update hono and zod
```

Breaking change:

```text
feat(posts)!: change post response structure
```

## Agent Rules

* Always use a valid Conventional Commit.
* Keep the description short and imperative.
* Add a scope when it clearly identifies the affected feature/module.
* Choose the type based on the **actual change**, not the reason for making it.
* Do not combine unrelated changes into one commit.
* Do not create commits unless explicitly instructed to commit.
