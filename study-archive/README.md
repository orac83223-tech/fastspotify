# 매일의 발견

A self-contained Korean educational archive. No account, API key, external script, font service, or application server is needed to read it. All internal URLs are relative, so the folder can be hosted at any subpath.

## Content

`data/articles.json` is the source of truth. Each record has:

- `id`: regular publications use `YYYY-MM-DD-learning` or `YYYY-MM-DD-insight`.
- `date`: actual Asia/Seoul publication date, `YYYY-MM-DD`.
- `feed`: `learning` or `insight`.
- `category`, `title`, `summary`: plain text.
- `minutes`: integer reading-time estimate.
- `sample`: optional boolean. Samples have distinct IDs and do not count as regular lessons.
- `sections`: an array of `{heading, paragraphs: [string]}`.
- `sources`: an array of `{title, url, detail}`, using checked HTTPS source URLs.
- `questions`: an array of `{question, answer}`.

Paragraphs and answers support only `[label](https://example.com)` links. Raw HTML is escaped. Formulae can use readable Unicode/plain-text notation. Links are opened with `noopener noreferrer`.

The initial entries are explicitly labeled short examples, not previously published lessons or historical records. Publication is not evidence that anyone has read or completed a lesson.

## Update

1. Read the current data before adding content; preserve all earlier entries.
2. Check actual dates and IDs. The same date and feed identify one regular publication. An identical existing item is a no-op; conflicting content requires review instead of silent replacement.
3. Include only generic educational material. Do not publish personal identities, email addresses, private profiles, company information, original private task prompts, or secrets.
4. Update `data/articles.json`, then run `python3 generate.py` with Python 3. No dependencies are required.
5. Validate JavaScript with `node --check app.js` and `node --check reading.js`, check generated links, and review the content.
6. Publish the changed JSON and generated HTML together in one commit. Limit changes to this archive folder. Preserve the hosting repository's other files and existing deployment configuration.
7. Confirm the exact commit and deployment result, then verify anonymous reading of the archive and new articles. Read before retrying an uncertain update.

Bookmark state is device-local and is not sent anywhere. Search/filter interactions run entirely in the browser. Article HTML remains readable with JavaScript disabled.
