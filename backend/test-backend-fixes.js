#!/usr/bin/env node

/**
 * Test script to verify backend fixes for homework and notices endpoints
 * Tests the previously failing POST /homework and POST /notices endpoints
 */

const API_BASE_URL = 'http://localhost:3001/api';

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[0;32m',
    red: '\x1b[0;31m',
    yellow: '\x1b[1;33m',
    blue: '\x1b[0;34m',
};

let accessToken = '';
let schoolId = '';
let teacherId = '';
let adminId = '';

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    tests: [],
};

async function makeRequest(method, endpoint, data = null, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const responseData = await response.json();

        return {
            status: response.status,
            ok: response.ok,
            data: responseData,
        };
    } catch (error) {
        return {
            status: 0,
            ok: false,
            error: error.message,
        };
    }
}

function logTest(name, passed, details = '') {
    const symbol = passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${symbol} ${name}`);
    if (details) {
        console.log(`  ${details}`);
    }

    results.tests.push({ name, passed, details });
    if (passed) {
        results.passed++;
    } else {
        results.failed++;
    }
}

async function testLogin() {
    console.log(`\n${colors.blue}=== AUTHENTICATION ===${colors.reset}`);

    // Login as teacher
    const teacherLogin = await makeRequest('POST', '/auth/login', {
        email: 'teacher@demo.com',
        password: 'teacher123',
        role: 'TEACHER',
    });

    if (teacherLogin.ok) {
        accessToken = teacherLogin.data.accessToken;
        teacherId = teacherLogin.data.user.id;
        schoolId = teacherLogin.data.user.schoolId;
        logTest('Teacher login', true, `Teacher ID: ${teacherId}`);
    } else {
        logTest('Teacher login', false, JSON.stringify(teacherLogin.data));
        return false;
    }

    // Login as admin for notices test
    const adminLogin = await makeRequest('POST', '/auth/login', {
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'ADMIN',
    });

    if (adminLogin.ok) {
        adminId = adminLogin.data.user.id;
        logTest('Admin login', true, `Admin ID: ${adminId}`);
    } else {
        logTest('Admin login', false, JSON.stringify(adminLogin.data));
    }

    return true;
}

async function testHomeworkCreation() {
    console.log(`\n${colors.blue}=== HOMEWORK ENDPOINTS ===${colors.reset}`);

    // Test 1: Create homework with all required fields (JSON)
    const homeworkData = {
        class: '10',
        section: 'A',
        subject: 'Mathematics',
        description: 'Complete exercises 1-10 from Chapter 5',
    };

    const createResponse = await makeRequest('POST', '/homework', homeworkData, accessToken);

    if (createResponse.ok) {
        logTest('POST /homework (JSON)', true, `Homework ID: ${createResponse.data.id}`);

        // Test 2: Verify homework can be retrieved by class
        const getByClass = await makeRequest('GET', `/homework/class/${homeworkData.class}/${homeworkData.section}`, null, accessToken);

        if (getByClass.ok && Array.isArray(getByClass.data) && getByClass.data.length > 0) {
            logTest('GET /homework/class/:class/:section', true, `Found ${getByClass.data.length} homework(s)`);
        } else {
            logTest('GET /homework/class/:class/:section', false, 'No homework found or invalid response');
        }
    } else {
        logTest('POST /homework (JSON)', false, JSON.stringify(createResponse.data));
        logTest('GET /homework/class/:class/:section', false, 'Skipped - POST failed');
    }

    // Test 3: Create homework with missing fields (should fail validation)
    const invalidHomework = {
        class: '10',
        section: 'A',
        // Missing subject and description
    };

    const invalidResponse = await makeRequest('POST', '/homework', invalidHomework, accessToken);

    if (!invalidResponse.ok && invalidResponse.status === 400) {
        logTest('POST /homework (validation)', true, 'Correctly rejected invalid data');
    } else {
        logTest('POST /homework (validation)', false, 'Should have rejected invalid data');
    }
}

async function testNoticesCreation() {
    console.log(`\n${colors.blue}=== NOTICES ENDPOINTS ===${colors.reset}`);

    // Get admin token
    const adminLogin = await makeRequest('POST', '/auth/login', {
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'ADMIN',
    });

    const adminToken = adminLogin.data?.accessToken;

    if (!adminToken) {
        logTest('POST /notices', false, 'Could not get admin token');
        logTest('GET /notices/:id', false, 'Skipped - no admin token');
        return;
    }

    // Test 1: Create notice with all required fields
    const noticeData = {
        title: 'School Holiday Announcement',
        description: 'The school will remain closed on December 25th for Christmas.',
    };

    const createResponse = await makeRequest('POST', '/notices', noticeData, adminToken);

    if (createResponse.ok) {
        logTest('POST /notices', true, `Notice ID: ${createResponse.data.id}`);

        // Test 2: Verify notice can be retrieved by ID
        const getById = await makeRequest('GET', `/notices/${createResponse.data.id}`, null, adminToken);

        if (getById.ok && getById.data.id === createResponse.data.id) {
            logTest('GET /notices/:id', true, `Title: ${getById.data.title}`);
        } else {
            logTest('GET /notices/:id', false, 'Could not retrieve created notice');
        }
    } else {
        logTest('POST /notices', false, JSON.stringify(createResponse.data));
        logTest('GET /notices/:id', false, 'Skipped - POST failed');
    }

    // Test 3: Create notice with missing fields (should fail validation)
    const invalidNotice = {
        title: 'Test Notice',
        // Missing description
    };

    const invalidResponse = await makeRequest('POST', '/notices', invalidNotice, adminToken);

    if (!invalidResponse.ok && invalidResponse.status === 400) {
        logTest('POST /notices (validation)', true, 'Correctly rejected invalid data');
    } else {
        logTest('POST /notices (validation)', false, 'Should have rejected invalid data');
    }
}

async function testNotificationsList() {
    console.log(`\n${colors.blue}=== NOTIFICATIONS ENDPOINTS ===${colors.reset}`);

    // Test getting notifications list
    const notificationsResponse = await makeRequest('GET', '/notifications', null, accessToken);

    if (notificationsResponse.ok) {
        logTest('GET /notifications', true, `Found ${notificationsResponse.data.data?.length || 0} notification(s)`);
    } else {
        logTest('GET /notifications', false, JSON.stringify(notificationsResponse.data));
    }

    // Test getting unread count
    const unreadResponse = await makeRequest('GET', '/notifications/unread-count', null, accessToken);

    if (unreadResponse.ok) {
        logTest('GET /notifications/unread-count', true, `Unread: ${unreadResponse.data.count}`);
    } else {
        logTest('GET /notifications/unread-count', false, JSON.stringify(unreadResponse.data));
    }
}

async function printSummary() {
    console.log(`\n${colors.blue}=========================================`);
    console.log('TEST SUMMARY');
    console.log(`=========================================${colors.reset}`);
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

    const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    console.log(`\nSuccess Rate: ${successRate}%`);

    if (results.failed > 0) {
        console.log(`\n${colors.yellow}⚠ Some tests failed. Review output above.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
        process.exit(0);
    }
}

async function main() {
    console.log(`${colors.blue}=========================================`);
    console.log('BACKEND FIXES VERIFICATION TEST');
    console.log('Testing Homework & Notices Endpoints');
    console.log(`=========================================${colors.reset}\n`);

    console.log(`API Base URL: ${API_BASE_URL}\n`);

    try {
        const loginSuccess = await testLogin();
        if (!loginSuccess) {
            console.log(`\n${colors.red}✗ Login failed. Cannot proceed with tests.${colors.reset}`);
            process.exit(1);
        }

        await testHomeworkCreation();
        await testNoticesCreation();
        await testNotificationsList();

        await printSummary();
    } catch (error) {
        console.error(`\n${colors.red}✗ Test execution failed:${colors.reset}`, error);
        process.exit(1);
    }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.error(`${colors.red}✗ This script requires Node.js 18 or higher (for native fetch support)${colors.reset}`);
    console.log('Please upgrade Node.js or install node-fetch package.');
    process.exit(1);
}

main();
