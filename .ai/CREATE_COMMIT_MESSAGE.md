Your task is to prepare a commit message based on the uncommited changes in the working directory.

## Template

```
[TYPE]([TICKET NUMBER or CONTEXT OF THE CHANGE]): [SHORT DESCRIPTION]

- [BULLET POINT SUMMARY OF CHANGES]
```

## Examples

```
feat(DOCKER-DEPLOYMENT): add Docker deployment instructions

- Added a section in the README for Docker deployment
- Included commands to build and run the Docker container
```

```
fix(DEV-SERVER): correct development server URL
```

## Rules

- Focus on the main purpose of the changes.
- [SHORT DESCRIPTION] should be concise yet descriptive.
- Use bullet points to summarize key changes.
- If applicable, include a ticket number or context in parentheses after the type.
- Choose the appropriate type (feat, fix, docs, refactor).
- Avoid mentioning unrelated changes.
- When describing changes related to tests, only specify which tests were added or modified, not the implementation details. Avoid mentioning amount of tests or coverage percentages.
- Do not include any mention of being co-authored by an AI agent.
