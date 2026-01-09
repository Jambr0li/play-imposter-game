import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Messages Table Schema', () => {

  test('messages table exists with required fields and index', async () => {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'convex', 'schema.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    // Verify messages table exists
    expect(schemaContent).toContain('messages: defineTable(');

    // Verify required fields
    expect(schemaContent).toContain('gameCode: v.string()');
    expect(schemaContent).toContain('playerId: v.string()');
    expect(schemaContent).toContain('playerName: v.string()');
    expect(schemaContent).toContain('avatar: v.string()');
    expect(schemaContent).toContain('message: v.string()');
    expect(schemaContent).toContain('sentAt: v.number()');

    // Verify index on gameCode for efficient querying
    // The messages table should have .index("by_game", ["gameCode"])
    const messagesTableMatch = schemaContent.match(/messages:\s*defineTable\(\{[\s\S]*?\}\)\.index\("by_game",\s*\["gameCode"\]\)/);
    expect(messagesTableMatch).not.toBeNull();
  });

});
