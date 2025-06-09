import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Firebase configuration (same as in lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDykdPiJ6LacR6DRYflz4Mz8Euclobh8HE",
  authDomain: "weddingsite-48f69.firebaseapp.com",
  projectId: "weddingsite-48f69",
  storageBucket: "weddingsite-48f69.firebasestorage.app",
  messagingSenderId: "495104582788",
  appId: "1:495104582788:web:d654eb2adcda8d9c880ed1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Invitation codes from your CSV
const invitationCodes = [
  "7XP2GA", "Q4M1ZR", "LA9F0Y", "G6T8VK", "2NZJQ8", "T0K4E9", "S1D5UY", "P3W2HX", 
  "R7C0JB", "8MFL2S", "V5QA6N", "D4X9GU", "6E1RBZ", "K2S8MT", "YJ0N5P", "3W7CQL", 
  "B8R2FV", "U0Z3NK", "H5G9YA", "4Q6PWX", "A2E7ZT", "N8J0KS", "L1X9HR", "Z3B6MP", 
  "G5T7QW", "V9Y2CN", "Q1J5LR", "S6A8FX", "K0M4UD", "2E7GZP", "W4B3YR", "R6N0VA", 
  "D8X1QP", "H2J7KS", "F9C5LT", "P3S6WU", "X7A0NM", "T1G9KV", "Z5L4PQ", "6B2RDY", 
  "J9E8SC", "Y1X7KF", "G0Q5MA", "N6P2WB", "S3D8ZR", "L4M9TX", "W0V6AP", "7K1FJB", 
  "A5H2QN", "U8C3YG", "P7E0WL", "B2N5XQ", "Z6T3KA", "Q9J1RG", "D0S8MF", "X5C2LU", 
  "H3V9PW", "M7L4TN", "S1Q8BX", "R5A6JD", "K8W2PF", "T3E7NZ", "V0M9KA", "6Y1XRC", 
  "G4B7UJ", "N2J8SL", "F5P0QD", "W7T6AZ", "L9V1MK", "X3H5CG", "D8R2SB", "Q6N7JW", 
  "J0L4XE", "A3S9TP", "U1G5KQ", "Z8F2MN", "K7B6RA", "V4X1JW", "S9Q3LP", "0M5DFH", 
  "B6N8KE", "T2W7ZQ", "Y1A9GP", "P4C0XS", "H7L5VM", "R2J3NK", "L8Q6TP", "W0G9BA", 
  "F3S7DU", "X5M1CR", "Q7N4KL", "S8E0JX", "D1V9WP", "N5A3HZ", "U2B6FM", "J9T8PW", 
  "M1K0VS", "G7X5LR", "A4Q2JN", "T6C3DZ", "Y2P7MA", "H5F9NB", "Z0L8QW", "P3M6RS", 
  "K1S4GX", "N9V2LT", "S7J0PC", "W5A8HF", "X2B1QG", "L4D3VU", "F9M6XT", "Q1R5JN", 
  "J7K8SB", "T2W0GC", "U6E3NP", "R4L7AV", "S0P9BZ", "A5X1MQ", "V3C6FT", "K8H2JD", 
  "L1N4XU", "G6Q7BP", "P8D2RA", "D3S5VM", "Z9W0KT", "J2A8GH", "N5M7CX", "T4F3QP", 
  "U1L9VS", "S6B0DW", "Q3H8NL", "R7K2PF", "X0M5VA", "W6J1SD", "Y9E4QB", "F2T8KC", 
  "B5S7XA", "L0D9QW", "K3M1UV", "Z7G6HP", "G2N4SJ", "A8B5TD", "S1C7KV", "Q6L0MF", 
  "J3P9WA", "H8R2LX", "T5V6QN", "U0W4BG", "W2F1DS", "N7X3KP", "V4M9TC", "K1J8PR", 
  "R5G2HF", "Y7S6QA", "B3L0WN", "F8N1XZ", "S4A7MJ", "D0B9QV", "X6T2KP", "M9C5GA", 
  "J1W8NR", "Q2D3SL", "T7F6PA", "U5X1JC", "P0V4MG", "S8K3QA", "G4L7BN", "W1S0VH", 
  "Z5N2RC", "A7M9KT", "K6J1GF", "N4P8SW", "Y0D3QB", "V9L5XA", "T2F7MJ", "S1C6HK", 
  "M8W0PV", "Q3N9DR", "L5B2GT", "H4A7QN", "K9T6XJ", "S8P1LF", "W7V0MA", "Z3J4QG", 
  "X6F9NB", "R2M8DK", "U0S3LV", "G1W5PA", "T8N2HC", "J6K9BR", "Y3D0QT", "B5G7LA", 
  "V2X1CW", "N8A4JP", "S9M6TU", "F1J2RP", "L7P0DK", "X3W9BA", "Q5N8SL", "A6C4TG"
];

// Interface matching the InviteDoc structure from InviteValidator
interface InviteDoc {
  isUsed: boolean;
  primaryGuest: {
    name: string;
    phone: string;
  };
  additionalGuests: string[];
  createdAt: Timestamp;
  modifiedAt: Timestamp;
}

async function createInvitations() {
  console.log(`Starting to create ${invitationCodes.length} invitation documents...`);
  
  const currentTime = Timestamp.now();
  let successCount = 0;
  let errorCount = 0;

  for (const code of invitationCodes) {
    try {
      // Convert to uppercase (matching the validation logic)
      const upperCode = code.toUpperCase();
      
      // Create the invite document with initial structure
      const inviteDoc: InviteDoc = {
        isUsed: false,
        primaryGuest: {
          name: "",
          phone: ""
        },
        additionalGuests: [],
        createdAt: currentTime,
        modifiedAt: currentTime
      };

      // Create document in 'invites' collection with code as document ID
      const inviteRef = doc(db, 'invites', upperCode);
      await setDoc(inviteRef, inviteDoc);
      
      successCount++;
      console.log(`✅ Created invite: ${upperCode}`);
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to create invite ${code}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully created: ${successCount} invitations`);
  console.log(`❌ Failed: ${errorCount} invitations`);
  console.log(`📝 Total processed: ${invitationCodes.length} codes`);
}

// Run the script
createInvitations()
  .then(() => {
    console.log("\n🎉 Script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  }); 