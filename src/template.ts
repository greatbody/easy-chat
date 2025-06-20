/**
 * Simple template engine for SSR
 */

import { join } from "@std/path";

interface TemplateData {
  [key: string]: string | number | boolean;
}

export async function renderTemplate(templateName: string, data: TemplateData = {}): Promise<string> {
  const templatePath = join("templates", `${templateName}.html`);

  try {
    const template = await Deno.readTextFile(templatePath);
    return interpolateTemplate(template, data);
  } catch (error) {
    console.error(`Error reading template ${templateName}:`, error);
    return `<html><body><h1>Template Error</h1><p>Could not load template: ${templateName}</p></body></html>`;
  }
}

function interpolateTemplate(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key]?.toString() || match;
  });
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}
