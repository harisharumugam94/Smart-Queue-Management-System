// Pulled out as a pure function so it can be unit tested without
// rendering the full React component.
export function getNowServing(queue) {
  if (!Array.isArray(queue)) return undefined;
  return queue.find((ticket) => ticket.status === 'serving');
}
