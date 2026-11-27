import { siteUrl } from "@/lib/site-url";

// llms.txt (llmstxt.org): a short Markdown summary of the public site for language models.
export async function GET() {
  const site = await siteUrl();
  const body = `# Job Outreach

> Job Outreach finds recruiter emails in LinkedIn hiring posts and sends your CV from your own Gmail or SMTP account, on a schedule, with follow-ups and reply detection. It is free: a Chrome extension plus a web dashboard.

Accounts are created by an admin; there is no public sign-up. Everything behind sign-in (contacts, campaigns, emails) is private and not for crawling.

## Pages

- [Home](${site}/): what Job Outreach does, how it works, security and FAQ
- [Sign in](${site}/login): sign-in page for existing accounts

## Key facts

- Emails are sent from the user's own address, so replies land in their own inbox
- SMTP and IMAP app passwords are encrypted with AES-256-GCM; login passwords are stored only as bcrypt hashes
- The inbox is checked for replies every 10 minutes; a reply stops follow-ups to that recruiter
`;
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
