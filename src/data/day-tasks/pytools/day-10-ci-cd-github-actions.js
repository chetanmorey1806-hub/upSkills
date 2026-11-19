export default {
  lesson: 'day-10-ci-cd-github-actions',
  minutes: 30,
  intro: 'Check CI/CD with GitHub Actions: triggers, jobs, steps, runners, matrix builds, caching, secrets, deploying only from main and branch protection. Workflows cannot run here, so one Python task reasons about a workflow the way Actions does.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between **Continuous Delivery** and **Continuous Deployment**?',
      options: ['They are the same', 'Delivery: every change is automatically tested and READY to release, but a human approves the release; Deployment: every passing change goes to production automatically', 'Delivery is about Docker, Deployment about Git', 'Deployment means only running tests'],
      answer: 1,
      explain: 'CI = merge often and run tests on every push. Continuous Delivery keeps main always releasable with a manual "go" button; Continuous Deployment removes that button.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In which folder of the repository must GitHub Actions workflow YAML files be placed?',
      accept: ['.github/workflows', '.github/workflows/', './.github/workflows'],
      explain: 'Any `.yml` / `.yaml` file in `.github/workflows/` is a workflow. GitHub reads its `on:` triggers (push, pull_request, schedule, workflow_dispatch) to decide when to run it.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about GitHub Actions are TRUE? (choose all that apply)',
      options: ['Jobs run in parallel by default; `needs:` makes one job wait for another', 'Steps inside one job run in order on the same runner', 'A `strategy.matrix` with `python-version: ["3.11", "3.12", "3.13"]` creates 3 jobs', 'Secrets are read with `${{ secrets.NAME }}` and are masked in logs', 'Secrets are available to workflows triggered by pull requests from forks by default'],
      answers: [0, 1, 2, 3],
      explain: 'Forked PRs do NOT get your secrets by default, otherwise anyone could open a PR that prints them. `needs: test` is how you make the deploy job run only after tests pass.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which condition on a deploy job makes it run only for pushes to `main`?',
      options: ['`if: github.ref == \'refs/heads/main\' && github.event_name == \'push\'`', '`if: branch = main`', '`runs-on: main`', '`needs: main`'],
      answer: 0,
      explain: '`github.ref` holds the full ref name (`refs/heads/main`) and `github.event_name` the trigger. Without this check, a pull request run could also try to deploy. Combine it with `needs: [lint, test]`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A matrix with an `exclude` rule. How many jobs run, and which combination is the last one? (This Python code expands it the same way Actions does.)',
      code: `from itertools import product
matrix = {"os": ["ubuntu-latest", "windows-latest"], "python": ["3.11", "3.12", "3.13"]}
exclude = [{"os": "windows-latest", "python": "3.11"}]
jobs = [dict(zip(matrix, combo)) for combo in product(*matrix.values())]
jobs = [j for j in jobs if j not in exclude]
print(len(jobs))
print(jobs[-1]["os"], jobs[-1]["python"])`,
      expected: '5\nwindows-latest 3.13',
      explain: 'A matrix is the cartesian product of its lists: 2 × 3 = 6 combinations, minus 1 excluded = 5 jobs. Each runs independently, so a bug that only appears on Windows or Python 3.13 is caught before release.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `run_order(jobs)` where `jobs` is a dict `{job_name: [names it needs]}` (like `needs:` in a workflow). Return the list of "stages": each stage is a SORTED list of jobs that can run in parallel once all earlier stages are done. Return `None` if the `needs` form a cycle.\n\nExample: `{"lint": [], "test": [], "build": ["lint", "test"], "deploy": ["build"]}` → `[["lint", "test"], ["build"], ["deploy"]]`',
      example: { title: 'jobs whose needs are satisfied', code: 'ready = [j for j, needs in jobs.items()\n         if j not in done and all(n in done for n in needs)]' },
      starter: 'def run_order(jobs):\n    # TODO\n    return []\n',
      solution: 'def run_order(jobs):\n    done = set()\n    stages = []\n    while len(done) < len(jobs):\n        ready = sorted(j for j, needs in jobs.items() if j not in done and all(n in done for n in needs))\n        if not ready:\n            return None\n        stages.append(ready)\n        done.update(ready)\n    return stages\n',
      tests: [
        { call: 'run_order({"lint": [], "test": [], "build": ["lint", "test"], "deploy": ["build"]})', expect: [['lint', 'test'], ['build'], ['deploy']] },
        { call: 'run_order({"a": [], "b": ["a"], "c": ["a"], "d": ["b", "c"]})', expect: [['a'], ['b', 'c'], ['d']] },
        { call: 'run_order({"x": ["y"], "y": ["x"]})', expect: null, msg: 'A cycle can never start' },
        { call: 'run_order({})', expect: [] },
      ],
      explain: 'This is a level-by-level topological sort: jobs whose `needs` are all finished form the next parallel stage. GitHub rejects workflows with circular `needs`; here we return None when no job can start.',
    },
  ],
};
