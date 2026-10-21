import { forwardInquiry } from "../../_lib/inquiry.js";

export function onRequest(context) {
  return forwardInquiry(context.request, context.env, "verify");
}
