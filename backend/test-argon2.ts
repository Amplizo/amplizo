import * as argon2 from "argon2";

async function main() {
  const password = "ChangeMeAgent2024!";
  const hash = await argon2.hash(password);
  console.log("New hash:", hash);
  
  // Now verify it
  const isValid = await argon2.verify(hash, password);
  console.log("New hash valid:", isValid);
  
  // Check the existing hash from DB
  const existingHash = "$argon2id$v=19$m=65536,t=3,p=4$ODNAatRQkE3lpJYtz1kUlQ$0gAgG1SWEw8B8Jx1qRqJUh5/6zT6OeqkH9GhJ5XvQhY";
  const isValidExisting = await argon2.verify(existingHash, password);
  console.log("Existing hash valid:", isValidExisting);
}

main().catch((e) => { console.error(e); process.exit(1); });