import assert from "node:assert/strict";
import test from "node:test";
import { youtubePosterUrl, youtubeVideoId } from "./youtube.ts";

test("a short, a watch page, and a missing address", () => {
  assert.equal(youtubeVideoId("https://www.youtube.com/shorts/cHmaUx2QCaI"), "cHmaUx2QCaI");
  assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=FnlVkxRi0PY&t=3"), "FnlVkxRi0PY");
  assert.equal(youtubeVideoId("https://youtu.be/FnlVkxRi0PY"), "FnlVkxRi0PY");
  assert.equal(youtubeVideoId("https://www.tiktok.com/@ada/video/1"), null);
  assert.equal(youtubeVideoId(null), null);
  assert.equal(youtubePosterUrl("cHmaUx2QCaI"), "https://img.youtube.com/vi/cHmaUx2QCaI/hqdefault.jpg");
});
