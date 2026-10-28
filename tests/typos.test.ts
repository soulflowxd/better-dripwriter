import assert from "node:assert/strict";
import { test } from "node:test";
import { getNearbyTypo, makeSpellingSlip } from "../src/lib/typos.ts";

test("letter typos stay on nearby letter keys", () => {
  for (const key of "abcdefghijklmnopqrstuvwxyz") {
    for (const random of [0, 0.5, 0.999]) {
      const typo = getNearbyTypo(key, () => random);
      assert.match(typo ?? "", /^[a-z]$/);
      assert.notEqual(typo, key);
    }
  }
  assert.equal(getNearbyTypo("1"), null);
  assert.equal(getNearbyTypo(","), null);
  assert.match(getNearbyTypo("Q", () => 0) ?? "", /^[A-Z]$/);
});

test("spelling slips change the current word without inserting another word", () => {
  for (const random of [0, 0.3, 0.7, 0.999]) {
    const slip = makeSpellingSlip("spelling", () => random);
    assert.match(slip ?? "", /^[A-Za-z]+$/);
    assert.notEqual(slip, "spelling");
  }
  assert.equal(makeSpellingSlip("a"), null);
  assert.equal(makeSpellingSlip("two words"), null);
});
