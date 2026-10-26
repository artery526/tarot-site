const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateLifePathNumber, parseIsoDate } = require("../numerology-core.js");

test("calculates a regular date and retains each reduction step", () => {
  const result = calculateLifePathNumber("1990-05-12", "2026-10-26");
  assert.equal(result.valid, true);
  assert.equal(result.number, 9);
  assert.deepEqual(result.steps, ["1+9+9+0+0+5+1+2 = 27", "2+7 = 9"]);
  assert.equal(result.formattedDate, "1990/05/12");
});

test("accepts dates on both sides of a year boundary", () => {
  const beforeNewYear = calculateLifePathNumber("2024-12-31", "2025-01-02");
  const afterNewYear = calculateLifePathNumber("2025-01-01", "2025-01-02");
  assert.equal(beforeNewYear.number, 6);
  assert.equal(afterNewYear.number, 2);
});

test("accepts leap day in a leap year", () => {
  const result = calculateLifePathNumber("2000-02-29", "2026-10-26");
  assert.equal(result.valid, true);
  assert.equal(result.formattedDate, "2000/02/29");
});

test("rejects impossible dates and future dates", () => {
  assert.equal(parseIsoDate("2023-02-29"), null);
  assert.equal(parseIsoDate("2024-04-31"), null);
  assert.deepEqual(calculateLifePathNumber("2025-01-03", "2025-01-02"), {
    valid: false,
    error: "出生日期不能晚於今天喔。",
  });
});

test("reduces 11, 22, and 33 instead of keeping master numbers", () => {
  const eleven = calculateLifePathNumber("2000-01-08", "2026-10-26");
  const twentyTwo = calculateLifePathNumber("2000-09-29", "2026-10-26");
  const thirtyThree = calculateLifePathNumber("1999-01-04", "2026-10-26");

  assert.equal(eleven.number, 2);
  assert.equal(twentyTwo.number, 4);
  assert.equal(thirtyThree.number, 6);
});
