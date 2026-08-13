#!/usr/bin/env node

import assert from "node:assert/strict";
import { getEmailSenderDomain } from "../lib/email-domain.ts";

assert.equal(getEmailSenderDomain("ArcFort Weld <rfq@arcfortweld.com>"), "arcfortweld.com");
assert.equal(getEmailSenderDomain("RFQ@ARCFORTWELD.COM"), "arcfortweld.com");
assert.equal(getEmailSenderDomain("ArcFort Weld <rfq@send.arcfortweld.com>"), "send.arcfortweld.com");
assert.equal(getEmailSenderDomain("ArcFort Weld"), undefined);
assert.equal(getEmailSenderDomain("rfq@localhost"), undefined);
assert.equal(getEmailSenderDomain("rfq@arcfortweld.com\r\nBcc: buyer@example.com"), undefined);
assert.equal(getEmailSenderDomain(undefined), undefined);

console.log("Email sender-domain tests passed.");
