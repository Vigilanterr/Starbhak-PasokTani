# Git Branch Convention

We follow **Conventional Branch v1.1.0** for Git branch naming.

## Format

```text
<type>/<description>
```

## Branch Types

| Type       | Purpose               | Example                     |
| ---------- | --------------------- | --------------------------- |
| `feature/` | New features          | `feature/add-login-page`    |
| `bugfix/`  | Bug fixes             | `bugfix/fix-header-bug`     |
| `hotfix/`  | Urgent fixes          | `hotfix/security-patch`     |
| `release/` | Release preparation   | `release/v1.2.0`            |
| `chore/`   | Non-code tasks        | `chore/update-dependencies` |

Short aliases `feat/` and `fix/` are also supported.

## Rules

* Use lowercase letters and numbers.
* Separate words with hyphens (`-`).
* Do not use spaces or underscores (`_`).
* Do not use consecutive, leading, or trailing hyphens.
* Dots (`.`) are allowed for release versions.
* Keep descriptions clear and concise.
* Include a ticket number when applicable.

## Trunk Branches

These branches do not use a prefix:

```text
main
master
develop
```

## Examples

```text
feature/add-login-page
fix/header-bug
hotfix/security-patch
release/v1.2.0
chore/update-dependencies
```
