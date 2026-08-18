import { doc, setDoc } from "firebase/firestore";
import { db } from "../src/services/firebase.js";

import { unit1Data } from "../src/data/unit1_data.js";
import { unit2Data } from "../src/data/unit2_data.js";
import { unit3Data } from "../src/data/unit3_data.js";
import { unit4Data } from "../src/data/unit4_data.js";
import { unit5Data } from "../src/data/unit5_data.js";

const courses = [unit1Data, unit2Data, unit3Data, unit4Data, unit5Data];

async function seed() {
  console.log("Starting database seeding...");
  let successCount = 0;
  
  for (const course of courses) {
    try {
      // Use the course.id as the document ID in the "courses" collection
      const docRef = doc(db, "courses", course.id);
      await setDoc(docRef, course);
      console.log(`✅ Uploaded: ${course.title}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to upload ${course.title}:`, error);
    }
  }

  console.log(`Seeding complete. Successfully uploaded ${successCount}/${courses.length} units.`);
  process.exit(0);
}

seed();
