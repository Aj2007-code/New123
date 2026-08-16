// Appwrite Function: cast-vote
// -----------------------------------------------------------------------
// This is the ONLY code path allowed to write to the `votes` collection.
// The collection's own permissions grant no client (not even a signed-in
// student) create/read access — only this Function, running with the
// dynamic per-execution API key Appwrite injects, can touch it.
//
// It re-checks everything server-side, because nothing the browser sends
// can be trusted:
//   1. Caller must have a real Appwrite session (Appwrite sets this; can't
//      be spoofed — see req.headers['x-appwrite-user-id']).
//   2. The claimed roll number must exist in the `voters` roster collection.
//   3. The session's *verified* email (looked up server-side via the Users
//      API, not anything the client claims) must match the institute email
//      pattern for that exact roll number — firstname_rollno@iitp.ac.in.
//      This stops someone verifying their own inbox and then voting under
//      a different roll number.
//   4. Both candidate IDs must exist and belong to the right section.
//   5. The vote document ID is the roll number itself, so a second attempt
//      for the same roll number fails atomically with a 409 — no race
//      condition, no separate "already voted" check needed.
//
// Deploy: Appwrite Console > Functions > Create function > paste this file
// as src/main.js (with the package.json next to it), runtime Node.js 18+,
// entrypoint src/main.js. Give the function these scopes when creating it:
//   databases.read, databases.write, users.read
// and set "Execute access" to `users` only (not `any`) so guests can't
// even reach it.

import { Client, Databases, Users } from 'node-appwrite';

const DATABASE_ID = '6a8151d9002b3a0eadd3';
const VOTERS_COLLECTION_ID = 'voters';
const CANDIDATES_COLLECTION_ID = 'candidates';
const VOTES_COLLECTION_ID = 'votes';

export default async ({ req, res, log, error }) => {
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return res.json({ ok: false, error: 'You must be signed in to vote.' }, 401);
  }

  let body;
  try {
    body = JSON.parse(req.bodyText || '{}');
  } catch (e) {
    return res.json({ ok: false, error: 'Malformed request.' }, 400);
  }

  const rollNo = String(body.rollNo || '').trim().toUpperCase();
  const boysCandidateId = String(body.boysCandidateId || '').trim();
  const girlsCandidateId = String(body.girlsCandidateId || '').trim();

  if (!rollNo || !boysCandidateId || !girlsCandidateId) {
    return res.json({ ok: false, error: 'Missing roll number or candidate selection.' }, 400);
  }

  // Appwrite injects a short-lived, scoped API key for this execution only.
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const databases = new Databases(client);
  const users = new Users(client);

  try {
    // 1. Roll number must be on the roster.
    const voterDoc = await databases
      .getDocument(DATABASE_ID, VOTERS_COLLECTION_ID, rollNo)
      .catch(() => null);
    if (!voterDoc) {
      return res.json({ ok: false, error: 'This roll number is not on the voter list.' }, 403);
    }

    // 2. Verified account email must match this exact roll number's pattern.
    const account = await users.get(userId);
    const firstName = String(voterDoc.name).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    const expectedEmail = `${firstName}_${rollNo.toLowerCase()}@iitp.ac.in`;
    if (String(account.email || '').toLowerCase() !== expectedEmail) {
      return res.json({ ok: false, error: "Your verified email doesn't match this roll number." }, 403);
    }

    // 3. Candidates must exist and be in the right section.
    const [boysCandidate, girlsCandidate] = await Promise.all([
      databases.getDocument(DATABASE_ID, CANDIDATES_COLLECTION_ID, boysCandidateId).catch(() => null),
      databases.getDocument(DATABASE_ID, CANDIDATES_COLLECTION_ID, girlsCandidateId).catch(() => null),
    ]);
    if (!boysCandidate || boysCandidate.section !== 'boys') {
      return res.json({ ok: false, error: "Invalid Boys' CR selection." }, 400);
    }
    if (!girlsCandidate || girlsCandidate.section !== 'girls') {
      return res.json({ ok: false, error: "Invalid Girls' CR selection." }, 400);
    }

    // 4. Write the vote. Document ID = rollNo enforces one vote atomically.
    await databases.createDocument(DATABASE_ID, VOTES_COLLECTION_ID, rollNo, {
      rollNo,
      boysCandidateId,
      boysCandidateName: boysCandidate.name,
      girlsCandidateId,
      girlsCandidateName: girlsCandidate.name,
    });

    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 409) {
      return res.json({ ok: false, error: 'This roll number has already voted.' }, 409);
    }
    error(String(err.message || err));
    return res.json({ ok: false, error: 'Something went wrong. Please try again.' }, 500);
  }
};
