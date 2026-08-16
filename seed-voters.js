// Run this ONCE, locally, after creating the `voters` collection in
// Appwrite (see SETUP.md). It bulk-loads the roster so the cast-vote
// Function can check eligibility server-side.
//
// Usage:
//   npm install node-appwrite
//   node seed-voters.js
//
// You'll need a temporary API key: Console > Overview > Integrations >
// API Keys > Create API key, scope databases.write. Delete this key again
// once the script has finished running — it should never live in the
// front-end code.

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // e.g. https://fra.cloud.appwrite.io/v1
  .setProject('6a814ea00015892ba475')
  .setKey('standard_eae8d0d3ced1c8440301fd9d016f0563b4dc4c0d1dfafa6d6d1e4fd041155b76714321a639dd2b36779783189568c6a9c41c550b90b0363eaf8a773bc63ea8d8dbf4acbf65d61d63fa07a9f472080ef6c7e017dd11f0bbe827518e54f903f8bb83b9409e8aff3f5e7d7ca7cb3305281601fbeecb9312d894b88db437843c4464');

const databases = new Databases(client);
const DATABASE_ID = '6a8151d9002b3a0eadd3';
const VOTERS_COLLECTION_ID = 'voters';

const STUDENTS = [
  { r: '2601CB01', n: 'Shorya Sharma' },
  { r: '2601CB02', n: 'Aditi Kumari' },
  { r: '2601CB03', n: 'Animesh Kumar Jha' },
  { r: '2601CB04', n: 'Rathod Ritesh' },
  { r: '2601CB05', n: 'Siriki Hemanth' },
  { r: '2601CB06', n: 'Anshul Tyagi' },
  { r: '2601CB07', n: 'Kota Manideep' },
  { r: '2601CB08', n: 'Adarsh Mohanty' },
  { r: '2601CB09', n: 'Manash Kachari' },
  { r: '2601CB10', n: 'Krishna Sardar' },
  { r: '2601CB11', n: 'Jeetesh Kumar Sahu' },
  { r: '2601CB12', n: 'Utkarsh Yadav' },
  { r: '2601CB13', n: 'Ishan Saraswat' },
  { r: '2601CB14', n: 'Tej Pratap' },
  { r: '2601CB15', n: 'Dipesh Prajapat' },
  { r: '2601CB16', n: 'Shreyas Gaurav Tarway' },
  { r: '2601CB17', n: 'Shourya Pandey' },
  { r: '2601CB19', n: 'Abhinaba Ghosh' },
  { r: '2601CB20', n: 'Agniva Biswas' },
  { r: '2601CB21', n: 'Jharana Lathigara' },
  { r: '2601CB22', n: 'Adway Vijay Shinde' },
  { r: '2601CB23', n: 'Ujwal Kumar Jha' },
  { r: '2601CB24', n: 'Ayush Gupta' },
  { r: '2601CB25', n: 'Tanushka Sharma' },
  { r: '2601CB26', n: 'Swarit Srivastava' },
  { r: '2601CB27', n: 'Sameer Kardam' },
  { r: '2601CB28', n: 'Yadlapalli Sahiti' },
  { r: '2601CB29', n: 'Gaurav Agnihotri' },
  { r: '2601CB30', n: 'Mohammad Ibrahim' },
  { r: '2601CB31', n: 'Samarth Pratap Singh' },
  { r: '2601CB32', n: 'Satyam Kumar Kashyap' },
  { r: '2601CB33', n: 'Ranveer Raj' },
  { r: '2601CB34', n: 'Yogeshwar Singh' },
  { r: '2601CB35', n: 'Abhay Yadav' },
  { r: '2601CB36', n: 'Nikhil Sonkar' },
  { r: '2601CB37', n: 'Omraj Kumar' },
  { r: '2601CB38', n: 'Khushi Kishor Paulbudhe' },
  { r: '2601CB39', n: 'Satyam Kumar' },
  { r: '2601CB40', n: 'Tanay Sanghvi' },
  { r: '2601CB41', n: 'Wathore Harsh Datta' },
  { r: '2601CB42', n: 'Abhinav Singh' },
  { r: '2601CB44', n: 'Soham Ghosh' },
  { r: '2601CB45', n: 'Aditya Gupta' },
  { r: '2601CB46', n: 'Shobhit Airan' },
  { r: '2601CB47', n: 'Nasir Raza' },
  { r: '2601CB48', n: 'Jitin Kumar' },
  { r: '2601CB49', n: 'Shubhi Jain' },
  { r: '2601CB50', n: 'Pushpraj Nigwal' },
  { r: '2601CB51', n: 'Akula Anjana Sowmya' },
  { r: '2601CB52', n: 'Shagun Singh' },
  { r: '2601CB53', n: 'Nikhil' },
  { r: '2601CB54', n: 'Pintu Mondal' },
  { r: '2601CB55', n: 'Varahi Rohit Pardeshi' },
  { r: '2601CB56', n: 'Mudavath Divya' },
  { r: '2601CB57', n: 'Sharad Rajesh Namdeo' },
  { r: '2601CB58', n: 'Umesh Soni' },
  { r: '2601CB59', n: 'Illa Ramya' },
  { r: '2601CB60', n: 'Lohit S' },
  { r: '2601CB61', n: 'Ankit Kumar Subai' },
  { r: '2601CB62', n: 'Sampathi Mayank' },
  { r: '2601CB63', n: 'Gyanvi Priya' },
  { r: '2601CB64', n: 'Peddaram Sahasra Vardhini' },
  { r: '2601CB65', n: 'Gangapatnam Shyam Abhishek' },
  { r: '2601CB66', n: 'Guguloth Shekar' },
  { r: '2601CB67', n: 'Kevlani Yash Manishbhai' },
  { r: '2603CB01', n: 'Pratheeksha B G' },
  { r: '2603CB02', n: 'Sriejan Das' },
  { r: '2603CB03', n: 'Bishu Bhaskar' },
  { r: '2603CB04', n: 'Sachin Kumar' },
];

for (const s of STUDENTS) {
  const rollNo = s.r.toUpperCase();
  try {
    await databases.createDocument(DATABASE_ID, VOTERS_COLLECTION_ID, rollNo, {
      rollNo,
      name: s.n,
    });
    console.log('added', rollNo, s.n);
  } catch (err) {
    console.error('FAILED', rollNo, err.message);
  }
}

console.log('Done. Remember to delete the temporary API key now.');
