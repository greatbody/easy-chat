/**
 * Unit tests for template engine
 */

import { assertEquals } from "@std/assert";
import { escapeHtml } from "../src/template.ts";

Deno.test("Template - HTML Escaping", async (t) => {
  await t.step("should escape HTML special characters", () => {
    assertEquals(escapeHtml("Hello & World"), "Hello &amp; World");
    assertEquals(escapeHtml("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    assertEquals(escapeHtml('Hello "World"'), "Hello &quot;World&quot;");
    assertEquals(escapeHtml("Hello 'World'"), "Hello &#039;World&#039;");
    assertEquals(escapeHtml("Hello > World < Test"), "Hello &gt; World &lt; Test");
  });

  await t.step("should handle empty string", () => {
    assertEquals(escapeHtml(""), "");
  });

  await t.step("should handle string without special characters", () => {
    assertEquals(escapeHtml("Hello World"), "Hello World");
    assertEquals(escapeHtml("123456789"), "123456789");
    assertEquals(escapeHtml("你好世界"), "你好世界");
  });

  await t.step("should handle mixed content", () => {
    const input = "User said: <b>\"Hello & welcome!\"</b>";
    const expected = "User said: &lt;b&gt;&quot;Hello &amp; welcome!&quot;&lt;/b&gt;";
    assertEquals(escapeHtml(input), expected);
  });
});
