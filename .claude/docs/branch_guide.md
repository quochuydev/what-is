# Branch Guide

We're building the future of gesture-controlled 3D interfaces. Here's how we work together.

---

## At a Glance

| Branch | Purpose | Stability |
|--------|---------|-----------|
| `main` | Production-ready code | Stable |
| `develop` | Integration branch | Semi-stable |
| `feature/*` | New capabilities | Experimental |
| `fix/*` | Bug fixes | Targeted |

---

## Our Philosophy

VisionPipe3D emerged from a simple idea: your hands should control your digital world. We move fast, ship often, and maintain quality through disciplined branching.

**One mission.** Make gesture control accessible to every developer.

---

## Branch Workflow

### Main Branch

The `main` branch is sacred. Every commit here is deployable, tested, and documented. Direct pushes are not allowed—all changes flow through pull requests.

### Feature Branches

Building something new? Create a feature branch.

```bash
git checkout -b feature/palm-rotation-tracking
```

Name it clearly. Work iteratively. Keep commits focused.

### Fix Branches

Found a bug? Isolate the fix.

```bash
git checkout -b fix/camera-permission-handler
```

Reference the issue. Test thoroughly. Submit for review.

### Develop Branch

Features merge here first. This is our integration layer—where new code meets existing functionality. Run the full test suite before merging to `main`.

---

## Commit Standards

Write commits that tell a story.

```
Add palm rotation detection for Z-axis control

- Implement rotation angle calculation from landmarks
- Update Three.js scene to respond to palm twist
- Add sensitivity configuration option
```

**Be specific.** Future you will thank present you.

---

## Pull Request Process

1. **Create** your branch from `develop`
2. **Build** your feature or fix
3. **Test** locally with webcam enabled
4. **Push** and open a pull request
5. **Review** happens within 24 hours
6. **Merge** after approval

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start feature | `git checkout -b feature/your-feature develop` |
| Start fix | `git checkout -b fix/your-fix develop` |
| Update branch | `git pull origin develop` |
| Push changes | `git push -u origin your-branch` |

---

## Questions?

Open an issue or reach out. We're here to help you contribute.
