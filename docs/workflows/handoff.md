# Workflow: Session Handoff

Follow this protocol before concluding any substantial development session to maintain seamless continuity across different AI models and engineers.

---

## 1. Handoff Protocol Steps

1. **Review Changed Files**:
   - Inspect git status to inventory all files modified, added, or deleted during the session.

2. **Verify Documentation Updates**:
   - Update `docs/COMPONENT_INVENTORY.md` if new components were implemented.
   - Update `docs/ROUTE_MAP.md` if new routes were created.
   - Update `docs/DECISIONS.md` if non-trivial architectural decisions were made.
   - Update `docs/design/DESIGN_REFERENCE_INDEX.md` if design references were processed.

3. **Update Status & Handoff**:
   - Update `docs/IMPLEMENTATION_STATUS.md` with completed items and current backlog.
   - Update `docs/handoffs/CURRENT_HANDOFF.md` with:
     - Current task state
     - Modified files
     - Existing reusable components
     - Outstanding tasks & next recommended action

4. **Security Check**:
   - Confirm no secrets, tokens, or credentials exist in `.env.example`, code, or documentation.

5. **Provide Concise Final Summary**:
   - Conclude with a factual, high-level summary of what was accomplished and the immediate next step.
