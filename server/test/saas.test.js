const test = require('node:test');
const assert = require('node:assert');
const dataService = require('../services/dataService');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

test('SaaS Authentication & JWT verification', async (t) => {
  const admin = await dataService.findUserById('usr_admin');
  assert.ok(admin, 'Admin user must exist');

  const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, JWT_SECRET);
  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.id, 'usr_admin');
  assert.strictEqual(decoded.email, 'alex.vance@docora.internal');
});

test('Workspace & Team Member Management', async (t) => {
  const ws = await dataService.getWorkspace('ws_default');
  assert.ok(ws, 'Workspace must exist');
  assert.strictEqual(ws.plan, 'pro');

  // Add new member
  const newMember = {
    userId: 'usr_test_collab',
    name: 'Test Collaborator',
    email: 'collab@test.com',
    role: 'editor',
    joinedAt: new Date(),
  };
  ws.members.push(newMember);
  await dataService.updateWorkspace('ws_default', { members: ws.members });

  const updatedWs = await dataService.getWorkspace('ws_default');
  const found = updatedWs.members.find((m) => m.userId === 'usr_test_collab');
  assert.ok(found, 'New member must be present in workspace');
  assert.strictEqual(found.role, 'editor');

  // Clean up
  const filtered = updatedWs.members.filter((m) => m.userId !== 'usr_test_collab');
  await dataService.updateWorkspace('ws_default', { members: filtered });
});

test('Document Version Control & Restoration', async (t) => {
  const testDocId = `doc_ver_test_${Date.now()}`;
  const initialContent = { ops: [{ insert: 'Version 1 Content\n' }] };
  await dataService.findOrCreateDocument(testDocId, initialContent);

  // Snapshot 1
  await dataService.createVersion({
    _id: `ver_t1_${Date.now()}`,
    documentId: testDocId,
    versionNumber: 1,
    name: 'V1 Initial',
    data: initialContent,
    authorId: 'usr_admin',
    authorName: 'Alex Vance',
    createdAt: new Date(),
  });

  // Modify doc content
  const v2Content = { ops: [{ insert: 'Version 2 Updated\n' }] };
  await dataService.updateDocument(testDocId, { data: v2Content });

  // Snapshot 2
  const v2Record = await dataService.createVersion({
    _id: `ver_t2_${Date.now()}`,
    documentId: testDocId,
    versionNumber: 2,
    name: 'V2 Updated',
    data: v2Content,
    authorId: 'usr_admin',
    authorName: 'Alex Vance',
    createdAt: new Date(),
  });

  const versions = await dataService.listVersions(testDocId);
  assert.strictEqual(versions.length, 2);

  // Restore V1
  const v1 = versions.find((v) => v.versionNumber === 1);
  await dataService.updateDocument(testDocId, { data: v1.data });
  const docAfterRestore = await dataService.findDocumentById(testDocId);
  assert.deepStrictEqual(docAfterRestore.data, initialContent);

  // Cleanup
  await dataService.deleteDocument(testDocId, true);
});

test('Comments & Threaded Replies', async (t) => {
  const docId = 'doc_getting_started';
  const newComment = {
    _id: `cmt_test_${Date.now()}`,
    documentId: docId,
    userId: 'usr_admin',
    userName: 'Alex Vance',
    content: 'Reviewing real-time collaboration responsiveness',
    highlightedText: 'Real-time multi-user editing',
    position: { index: 0, length: 25 },
    resolved: false,
    replies: [],
    createdAt: new Date(),
  };

  await dataService.createComment(newComment);
  let comments = await dataService.listComments(docId);
  const found = comments.find((c) => c._id === newComment._id);
  assert.ok(found, 'Created comment should be found');

  // Add reply
  found.replies.push({
    _id: `rpl_test_${Date.now()}`,
    userId: 'usr_sarah',
    userName: 'Sarah Connor',
    content: 'Looks ultra crisp and responsive!',
    createdAt: new Date(),
  });
  await dataService.updateComment(found._id, { replies: found.replies });

  // Verify resolve
  await dataService.updateComment(found._id, { resolved: true, resolvedBy: 'Alex Vance' });
  const afterResolve = (await dataService.listComments(docId)).find((c) => c._id === found._id);
  assert.strictEqual(afterResolve.resolved, true);

  // Cleanup
  await dataService.deleteComment(found._id);
});
