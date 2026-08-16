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

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const databases = new Databases(client);
  const users = new Users(client);

  try {
    
    const voterDoc = await databases
      .getDocument(DATABASE_ID, VOTERS_COLLECTION_ID, rollNo)
      .catch(() => null);
    if (!voterDoc) {
      return res.json({ ok: false, error: 'This roll number is not on the voter list.' }, 403);
    }

    const account = await users.get(userId);
    const firstName = String(voterDoc.name).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    const expectedEmail = `${firstName}_${rollNo.toLowerCase()}@iitp.ac.in`;
    if (String(account.email || '').toLowerCase() !== expectedEmail) {
      return res.json({ ok: false, error: "Your verified email doesn't match this roll number." }, 403);
    }

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
