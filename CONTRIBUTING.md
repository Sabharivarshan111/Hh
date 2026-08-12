# Contributing

Thanks for taking the time to contribute.

## Workflow

1. Fork the repository and create a branch off `main`:
   ```bash
   git checkout -b my-change
   ```
2. Make your change, keeping commits focused and self-contained.
3. Run the tests and linters before pushing.
4. Open a pull request describing what changed and why.

## Commit messages

Use the imperative mood and a short summary line, with a body when the
change needs explanation:

```
Add rate limiting to the ingest endpoint

Requests were unbounded, which let a single client saturate the queue.
```

## Reporting issues

Open an issue with steps to reproduce, what you expected, and what
happened instead. Include versions and logs where relevant.
