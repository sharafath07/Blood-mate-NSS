const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const test = require('node:test');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

const database = process.env.BLOOD_MATE_TEST_DATABASE_URL;
assert.ok(database && new URL(database).pathname.endsWith('_test'), 'Set BLOOD_MATE_TEST_DATABASE_URL to a dedicated migrated *_test database');
process.env.DATABASE_URL = database;
process.env.JWT_SECRET = 'integration-test-only-session-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';

const app = require('../dist/app.js').default;
const prisma = require('../dist/config/database.js').default;

test('authenticated coordinator workflow, import, contact, and completion', async (t) => {
    const email = `coordinator-${randomUUID()}@example.test`;
    const password = 'test-coordinator-123';
    const passwordHash = await bcrypt.hash(password, 4);
    await prisma.user.create({ data: { email, name: 'Test Coordinator', passwordHash, role: 'ADMIN' } });

    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    t.after(async () => {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
        await prisma.$disconnect();
    });

    const root = `http://127.0.0.1:${server.address().port}/api`;
    let token;
    async function call(path, { method = 'GET', body, status = 200 } = {}) {
        const multipart = body instanceof FormData;
        const response = await fetch(root + path, {
            method,
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(body && !multipart && { 'Content-Type': 'application/json' }),
            },
            body: multipart ? body : body ? JSON.stringify(body) : undefined,
        });
        const json = await response.json();
        assert.equal(response.status, status, JSON.stringify({ path, status, message: json.message }));
        return json;
    }

    await call('/health');
    await call('/students', { status: 401 });
    const preflight = await fetch(root + '/students/example', {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'PATCH' },
    });
    assert.match(preflight.headers.get('access-control-allow-methods'), /PATCH/);
    const rejectedOrigin = await fetch(root + '/students/example', {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.invalid', 'Access-Control-Request-Method': 'PATCH' },
    });
    assert.equal(rejectedOrigin.headers.get('access-control-allow-origin'), null);

    const login = await call('/auth/login', { method: 'POST', body: { email, password } });
    assert.equal(login.data.user.role, 'ADMIN');
    token = login.token;
    const volunteerEmail = `volunteer-${randomUUID()}@example.test`;
    await prisma.user.create({ data: { email: volunteerEmail, name: 'Test Volunteer', passwordHash, role: 'VOLUNTEER' } });
    const volunteerToken = (await call('/auth/login', { method: 'POST', body: { email: volunteerEmail, password } })).token;

    const name = `Donor ${randomUUID()}`;
    const student = (await call('/students', { method: 'POST', status: 201, body: {
        name, phone: '9876500011', bloodGroup: 'O_POSITIVE', semester: 2, gender: 'FEMALE', willingToDonate: true,
    } })).data;
    assert.equal(student.semester, 2);
    assert.equal(student.isDonor, true);
    const updated = (await call(`/students/${student.id}`, { method: 'PATCH', body: { semester: 3 } })).data;
    assert.equal(updated.semester, 3);
    assert.equal((await call(`/students?search=${encodeURIComponent(name)}&semester=3`)).data.students[0].id, student.id);
    await call('/students', { method: 'POST', status: 400, body: { name: '', semester: 99 } });

    const workbook = XLSX.utils.book_new();
    const randomPhone = '8' + String(BigInt('0x' + randomUUID().replaceAll('-', '').slice(0, 8)) % 1000000000n).padStart(9, '0');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{
        'Full Name': 'Workbook Donor', 'Blood Group': 'A+', 'WhatsApp Number': randomPhone, Semester: 5,
    }, {
        'Full Name': 'Duplicate Workbook Donor', 'Blood Group': 'A+', 'Contact Number': randomPhone, Semester: 5,
    }]), 'Students');
    const workbookBytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    function upload() {
        const form = new FormData();
        form.set('file', new Blob([workbookBytes]), 'students.xlsx');
        return form;
    }
    assert.equal((await call('/import/students/preview', { method: 'POST', body: upload() })).data.rowCount, 2);
    assert.equal((await call('/import/students/validate', { method: 'POST', body: upload() })).data.readyToImport, 1);
    token = volunteerToken;
    await call('/import/students', { method: 'POST', body: upload(), status: 403 });
    token = login.token;
    const imports = await Promise.all([
        call('/import/students', { method: 'POST', body: upload() }),
        call('/import/students', { method: 'POST', body: upload() }),
    ]);
    assert.deepEqual(imports.map(({ data }) => data.imported).sort(), [0, 1]);

    const request = (await call('/blood-requests', { method: 'POST', status: 201, body: {
        patientName: 'Test Patient', bystanderName: 'Test Contact', bystanderPhone: '9876500099',
        bloodGroup: 'O_POSITIVE', units: 2, urgency: 'CRITICAL', hospital: 'Test Hospital', notes: 'Review',
    } })).data.request;
    assert.ok(request.matchedDonors.some(({ id }) => id === student.id));
    const requestUrl = `/blood-requests/${request.id}`;
    const list = (await call('/blood-requests?summary=true')).data.find(({ id }) => id === request.id);
    assert.ok(list.matchedDonorCount >= 1);
    assert.deepEqual(list.matchedDonors, []);
    assert.ok((await call('/blood-requests?urgency=CRITICAL&bloodGroup=O_POSITIVE&search=Test')).data.some(({ id }) => id === request.id));
    assert.equal((await call(requestUrl, { method: 'PATCH', body: { notes: 'Updated' } })).data.notes, 'Updated');
    assert.ok((await call(`/donor-matching/${request.id}`)).data.donors.some(({ id }) => id === student.id));
    assert.match((await call(`/whatsapp/${request.id}/${student.id}`)).data.whatsappUrl, /^https:\/\/wa\.me\//);
    assert.deepEqual((await call(`/whatsapp/${request.id}/${student.id}?format=contact`)).data, { phone: '919876500011' });

    const response = { requestId: request.id, donorId: student.id, status: 'ACCEPTED' };
    await call('/donor-responses', { method: 'POST', status: 409, body: response });
    const contact = { requestId: request.id, donorId: student.id, message: 'Test message never transmitted externally.' };
    const first = await call('/notifications', { method: 'POST', status: 201, body: contact });
    const repeated = await call('/notifications', { method: 'POST', status: 201, body: contact });
    assert.equal(first.data.id, repeated.data.id);
    await call('/donor-responses', { method: 'POST', body: response });
    assert.equal((await call(requestUrl)).data.status, 'MATCHING');
    await call('/donor-responses', { method: 'POST', body: { ...response, donatedUnits: 1 } });
    assert.equal((await call(requestUrl)).data.status, 'MATCHING');
    await call('/donor-responses', { method: 'POST', status: 409, body: { ...response, donatedUnits: 3 } });
    await call('/donor-responses', { method: 'POST', body: { ...response, donatedUnits: 2 } });
    const fulfilled = (await call(requestUrl)).data;
    assert.equal(fulfilled.status, 'FULFILLED');
    assert.equal(fulfilled.donatedUnits, 2);
    assert.equal(fulfilled.contactedDonors, 1);
    assert.equal(await prisma.donorResponse.count({ where: { requestId: request.id, recordedBy: login.data.user.id } }), 1);
    assert.equal((await call('/notifications')).data.find(({ id }) => id === first.data.id).responseStatus, 'ACCEPTED');
    await call(`/whatsapp/${request.id}/${student.id}`, { status: 409 });
    await call(`/whatsapp/${request.id}/${student.id}?format=contact`, { status: 409 });
    await call(requestUrl, { method: 'DELETE', status: 409 });

    const stats = (await call('/dashboard/stats')).data;
    assert.ok(stats.donors.available > 0);
    assert.ok(stats.donorDistribution.every(({ percentage }) => Number.isFinite(percentage)));
});
