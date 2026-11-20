const test = require('node:test');
const assert = require('node:assert');
const dataService = require('../services/dataService');

test('dataService operations and seeds', async (t) => {
  const docs = await dataService.listDocuments({ workspaceId: 'ws_default' });
  assert.ok(docs.length >= 4, `Expected at least 4 documents, got ${docs.length}`);

  const welcomeDoc = await dataService.findDocumentById('doc_getting_started');
  assert.ok(welcomeDoc, 'Welcome document should exist');
  assert.strictEqual(welcomeDoc.title, 'Welcome to Docora: Intelligent Document Workspace');

  const folders = await dataService.listFolders('ws_default');
  assert.ok(folders.length >= 4, `Expected at least 4 folders, got ${folders.length}`);

  const workspace = await dataService.getWorkspace('ws_default');
  assert.ok(workspace, 'Default workspace should exist');
  assert.strictEqual(workspace.members.length, 4);

  const comments = await dataService.listComments('doc_getting_started');
  assert.ok(comments.length >= 2, `Expected at least 2 comments, got ${comments.length}`);

  const versions = await dataService.listVersions('doc_getting_started');
  assert.ok(versions.length >= 2, `Expected at least 2 versions, got ${versions.length}`);

  const user = await dataService.findUserById('usr_admin');
  assert.ok(user, 'Admin user should exist');
  assert.strictEqual(user.name, 'Alex Vance');
});

test('Document CRUD and lifecycle in dataService', async (t) => {
  const testDocId = `test_doc_${Date.now()}`;
  const created = await dataService.findOrCreateDocument(testDocId, 'Test body');
  assert.strictEqual(created._id, testDocId);

  const updated = await dataService.updateDocument(testDocId, {
    title: 'Test Document Renamed',
    isStarred: true,
  });
  assert.strictEqual(updated.title, 'Test Document Renamed');
  assert.strictEqual(updated.isStarred, true);

  // Soft delete
  await dataService.deleteDocument(testDocId, false);
  const trashed = await dataService.findDocumentById(testDocId);
  assert.strictEqual(trashed.isDeleted, true);

  // Restore
  await dataService.updateDocument(testDocId, { isDeleted: false });
  const restored = await dataService.findDocumentById(testDocId);
  assert.strictEqual(restored.isDeleted, false);

  // Permanent delete
  await dataService.deleteDocument(testDocId, true);
  const deleted = await dataService.findDocumentById(testDocId);
  assert.strictEqual(deleted, null);
});
