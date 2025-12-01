// Simple in-memory storage
let emailStore = {
  workerEmail: "mehtaballi67890@gmail.com" // Default
};

// Get latest workerEmail
export function getWorkerEmail() {
  console.log('📧 Getting saved workerEmail:', emailStore.workerEmail);
  return emailStore.workerEmail;
}

// Update workerEmail
export function setWorkerEmail(email) {
  if (email && email.includes('@')) {
    emailStore.workerEmail = email;
    console.log('💾 Saved new workerEmail:', email);
    return true;
  }
  console.log('⚠️ Invalid email, keeping:', emailStore.workerEmail);
  return false;
}

// Get current store (for debugging)
export function getStore() {
  return { ...emailStore };
}
