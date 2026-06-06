import readline from 'readline';
import { execSync } from 'child_process';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log("\n==================================================");
  console.log("             VendorBridge Seed Prompt             ");
  console.log("==================================================\n");

  const wantSeed = await askQuestion("Do you want to seed dummy data? (y/N): ");
  
  if (wantSeed.toLowerCase() === 'y' || wantSeed.toLowerCase() === 'yes') {
    console.log("\nSelect seeding options:");
    console.log("  1) Seed Authentication / Users (auth_dummy_seed.ts)");
    console.log("  2) Seed System Dummy Data (dummy_seed.ts)");
    console.log("  3) Seed BOTH (auth_dummy_seed + dummy_seed)");
    
    const choice = await askQuestion("\nEnter option (1/2/3) or press Enter to skip: ");

    try {
      if (choice === '1') {
        console.log("\nRunning auth_dummy_seed.ts...");
        execSync("npx tsx prisma/auth_dummy_seed.ts", { stdio: 'inherit' });
      } else if (choice === '2') {
        console.log("\nRunning dummy_seed.ts...");
        execSync("npx tsx prisma/dummy_seed.ts", { stdio: 'inherit' });
      } else if (choice === '3') {
        console.log("\nRunning auth_dummy_seed.ts...");
        execSync("npx tsx prisma/auth_dummy_seed.ts", { stdio: 'inherit' });
        console.log("\nRunning dummy_seed.ts...");
        execSync("npx tsx prisma/dummy_seed.ts", { stdio: 'inherit' });
      } else {
        console.log("Skipping seeding.");
      }
    } catch (err) {
      console.error("Error executing seed script:", err);
    }
  } else {
    console.log("Skipping seeding.");
  }

  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
