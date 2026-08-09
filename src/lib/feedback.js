import { deleteFeedback as deleteFeedbackRequest, putFeedback as putFeedbackRequest } from './api';

export function putFeedback(productId, { kind }, options = {}) {
  return putFeedbackRequest(productId, { kind }, options);
}

export function deleteFeedback(productId, options = {}) {
  return deleteFeedbackRequest(productId, options);
}
