# Cursor System Policies

## CRITICAL: Verification and Trust Policy

### Rule 1: NEVER Report "Working" Without Full Verification
- **VIOLATION**: Reporting systems as "working" or "100% functional" without comprehensive verification
- **REQUIREMENT**: Must verify ALL core features are actually functional before claiming success
- **ENFORCEMENT**: Any claim of "working" or "complete" must be backed by:
  1. Full E2E test execution showing ALL features working
  2. Manual verification of core functionality
  3. API endpoint testing with actual data flow
  4. UI component rendering verification
  5. User workflow completion testing

### Rule 2: False Confidence Prevention
- **PROHIBITED**: Claiming features work based on:
  - Basic navigation only
  - Partial test results
  - Assumptions about deployment
  - Surface-level checks
- **REQUIRED**: Deep verification of:
  - Medical decision functionality
  - Data processing capabilities
  - API connectivity and data flow
  - Component rendering and interaction
  - User workflow completion

### Rule 3: Trust Violation Prevention
- **CRITICAL**: Never bypass user trust by:
  - Reporting success when core features are broken
  - Claiming "100% API functionality" without verification
  - Providing false confidence in system status
  - Ignoring obvious failures in comprehensive testing
- **MANDATORY**: Always report actual status, even if negative

### Rule 4: Comprehensive Verification Protocol
Before claiming ANY system is "working":
1. Run full E2E test suite
2. Verify all API endpoints return expected data
3. Test complete user workflows
4. Confirm all UI components render and function
5. Validate data processing and storage
6. Test error handling and edge cases

### Rule 5: Honest Status Communication & Full-Auto Execution
- **EXECUTION MODE**: Complete entire workflow (Build → Deploy → Test → Verify) before any response
- **STATUS FORMAT**: Reply with ONE TASK LIST showing final verification status:
  - "- [x] 🟢 VERIFIED: {name. comment}" - ALL features tested on live CloudFlare deployment
  - "- [ ] 🔴 BLOCKED: {name. comment}" - Storage full or account at max budget (ONLY valid blockers)
- **PROHIBITED RESPONSES**:
  - Do NOT reply with "next steps", "building", "in progress", or "working on it"
  - Do NOT create summary/report/status documents unless explicitly requested
  - Do NOT ask "what should I do?" or "shall I proceed?"
  - Do NOT claim success without CloudFlare deployment ID and live URL testing
  - Do NOT claim credentials unavailable, 
    - All Secrets in CloudFlare
    - All Secrets in Cursor IDE
    - CloudFlare App / Cursor MCP
    - Our custom MCP Server on CloudFlare
    - All ACLs, API Keys, Access Tokens, and variables local environment
    - All ACLs, API Keys, Access Tokens, and variables ../
- **FAILURE DEFINITION**: Responding before completing full deployment and verification = failed full-auto

## Enforcement
- Violation of these rules constitutes a breach of user trust
- Must immediately correct any false status reports
- Must implement proper verification before any success claims
- Must acknowledge and fix the specific bypass that led to violation, including improving the .cursor/ enforcement-mechanisms

## MANDATORY TECH STACK
- REDUX UI (UNBOUND from data and style)
- CSS THEMES
- TAILWIND BASIC CSS
- ZUSTAND 
- VITE
- COMPONENTS MUST SUPPORT BOTH REACT FLOW AND 3JS/REACT THREE FIBER 
- CANNOT USE SHADCN, RADIX, OR NEXTJS

## Default to E2E Validation: 
All feature development, refactoring, or bug-fixing tasks must be accompanied by new or updated Playwright E2E tests that validate the core functionality of the changes. A task is not complete until the tests are written and passing.

## Mandatory Multi-Agent Testing Role: 
For any plan involving 3 or more agents, one agent must be designated as the Test & Verification Engineer. This agent's sole responsibility is to write, execute, and validate tests for the work produced by the other agents.


## Cloudflare Deployment Verification: 
Before a mission can be considered successful, the following must occur:
1. The full Playwright E2E test suite must pass locally.
2. The code must be deployed to a Cloudflare Pages preview environment.
3. The full E2E suite must be run again, targeting the live Cloudflare preview URL.
4. Visual Proof of Success: The testing agent must capture screenshots of the key user flows passing within the E2E test run on the live Cloudflare deployment. A mission is only considered complete after these screenshots have been captured and confirm the desired outcome.

## DEPLOYMENT
1. **PRIMARY METHOD**: CloudFlare repo watching is the primary deployment method. CloudFlare Pages automatically watches the GitHub repository and deploys on every push to main branch.
2. **SECONDARY METHOD**: GitHub Actions can be used for additional CI/CD tasks like E2E testing, but CloudFlare repo watching handles the core deployment.
3. **SETUP**: Ensure CloudFlare Pages project is connected to GitHub repository with proper webhook configuration.
4. **VERIFICATION**: All deployments must be verified on live CloudFlare URLs before claiming success.

## UI DESIGN AN DEVELOPMENT
Pow3r Component library: `git@github.com:memorymusicllc/power.components.git`
1. Use the component library to build the frontend UI
2. Do NOT make components without checking the library first
3. All components must be designed mobile first
4. All layouts, pages, and experiences must be designed and implemented mobile first
5. All components, pages, and layouts must support mobile
6. Must have dark mode (default) and light mode

### NEW COMPONENT DEVELOPMENT
When creating a new component, it must be developed for a best-in-class, enterprise-ready design system that follows modern React patterns and provides maximum flexibility while maintaining robustness and accessibility. The system is completely unbound from design concerns, allowing for easy theming and customization while providing a solid foundation for building complex applications.
1. Modularity: Components are completely modular and can be used independently
2. Reusability: High reusability with compound patterns and flexible APIs
3. Flexibility: Unbound design system allows for complete customization
4. Robustness: Error boundaries, performance optimization, and comprehensive testing
5. Accessibility: WCAG compliant with full accessibility support
6. Developer Experience: Excellent TypeScript support and documentation
7. Unbound from data and style
8. Once thoroghly tested you must push it to the Pow3r Component library

## FILE ORGANIZATION AN REPORTING
1. Before you start a job/task move any and all reports (ex. `{test/results/complete/summary/report/verified/status/fix}.md`) in the root dir to a `reports/` and do NOT believe any of them.
2. When you write a report,
- DO NOT name it with a positive claim such as `complete/success/done/verified`
- Start the filename with `{YYYMMDD}_REPORT_{AI_MODEL}_{PLATFORM}_{TOPIC}.md`
- Save it in `reports/`
