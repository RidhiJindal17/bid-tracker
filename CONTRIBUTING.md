# 🤝 Contributing to BidSphere AI

We are excited that you are interested in contributing to BidSphere AI! To maintain code quality, security, and velocity, we ask all contributors to review and adhere to the following guidelines.

---

## 🗺️ Development Branching Strategy

Our repository follows a structured branching model:

```
                      [main] (Production releases)
                        ▲
                        │ (Release Pull Request)
                     [develop] (Integration branch)
                        ▲
      ┌─────────────────┴─────────────────┐
      │                                   │
[feature/ai-chat]                [fix/auth-cookie-expiry]
(New feature build)              (Bug resolution build)
```

1. **`main`:** Contains production-ready code. Direct commits to `main` are strictly forbidden.
2. **`develop`:** The main integration branch. All features must be merged into `develop` before being released to `main`.
3. **Feature & Bug Branches:** Created off `develop`. Naming convention rules:
   * **New Features:** `feature/short-description` (e.g. `feature/ocr-parser`)
   * **Bug Fixes:** `fix/short-description` (e.g. `fix/jwt-expiration`)
   * **Documentation:** `docs/short-description` (e.g. `docs/api-update`)

---

## 🛠️ Local Development Workflow

1. **Fork the Repository:** Create a fork under your GitHub account.
2. **Clone Locally:**
   ```bash
   git clone https://github.com/your-username/ai-bid.git
   cd ai-bid
   ```
3. **Checkout Feature Branch:**
   ```bash
   git checkout -b feature/my-amazing-feature develop
   ```
4. **Setup Environment:** Configure `.env` files in both the `frontend` and `backend` directories as outlined in the [README.md](README.md#1-backend-configuration) file.
5. **Code and Test:** Implement your changes and verify that they compile locally with no linting errors.
   * Run frontend lint checks: `npm run lint` in `frontend`.

---

## 📝 Commit Message Guidelines

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. This ensures automated release notes generation works smoothly.

Format: `<type>(<scope>): <subject>`

### Common Types:
* `feat`: A new user-facing feature.
* `fix`: A backend or frontend bug fix.
* `docs`: Documentation updates only.
* `style`: Code style changes (whitespace, formatting, missing semi-colons) that do not affect compilation logic.
* `refactor`: A code change that neither fixes a bug nor adds a feature.
* `perf`: Changes aimed at improving response speed or rendering speed.
* `test`: Adding missing test coverage or refactoring existing tests.

### Examples:
* `feat(ai): integrate gemini conversational database chat engine`
* `fix(auth): extend jwt cookie expiry to prevent early logout`
* `docs(readme): correct server script command list`

---

## 🎨 Code Style & Quality Standards

* **Linting:** We enforce ES6 syntax rules using ESLint. Run `npm run lint` in the client directory before committing.
* **Formatting:** Maintain consistent layout patterns. Avoid single-letter variables except in loop iteration counters.
* **Comments & JSDoc:** Document controllers and helpers using JSDoc formatting templates:
  ```javascript
  /**
   * Generates AI risk reviews for a raw bid proposal.
   * @param {Object} req - Express request object containing bid id.
   * @param {Object} res - Express response helper.
   * @returns {Promise<void>} Resolves response with audit report JSON.
   */
  export const getAIRiskAnalysis = async (req, res) => { ... }
  ```

---

## 📋 Pull Request Submission Gateways

To merge changes, you must submit a Pull Request (PR) from your feature branch to the upstream `develop` branch.

### PR Requirements:
1. **Description:** Fully document what the code does, why it is necessary, and any migration details if schemas were edited.
2. **Linked Issues:** Link all corresponding GitHub issues resolved by the PR (e.g. `Closes #142`).
3. **Manual Verification:** Include screenshot/video captures illustrating the UI adjustments or REST testing client outputs.
4. **Review Requirement:** Every PR requires approval from at least one core maintainer before it is merged.
