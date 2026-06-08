const activeCustomers = new Map();
const ACTIVE_TIMEOUT = 30000;
function getActiveCount() {
  const now = Date.now();
  let count = 0;
  for (const [id, lastSeen] of activeCustomers) {
    if (now - lastSeen <= ACTIVE_TIMEOUT) {
      count++;
    } else {
      activeCustomers.delete(id);
    }
  }
  return count;
}
function updateCustomer(sessionId) {
  if (sessionId) {
    activeCustomers.set(sessionId, Date.now());
  }
}
module.exports = {
  activeCustomers,
  ACTIVE_TIMEOUT,
  getActiveCount,
  updateCustomer
};