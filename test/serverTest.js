/* eslint-env mocha */

const assert = require('assert');
const request = require('supertest');

const fakeConfig = {
    mock: './FAKE_MOCK_DIR/',
    server: {
        port: 8080,
    },
    proxies: [{
        contextPath: '/api',
    }],
};

describe('loading express', function () {
    let server, proxy;
    beforeEach(function () {
        proxy = {
            web: function (req, res) {
                res.send(200, 'REVERSE RESPONSE SUCCESS');
            },
        };
        server = require('../src/server')(proxy, fakeConfig, console);
    });
    afterEach(function () {
        server.close();
        proxy = null;
    });

    it('responds to reverse proxy', function testSlash() {
        return request(server)
            .get('/api/abb-cc')
            .send('aaa')
            .expect(200)
            .then(response => {
                assert.equal(response.text, 'REVERSE RESPONSE SUCCESS');
            });
    });
    it('response fallback', function () {
        return request(server)
            .get('/api/dddd/dwa22/fwwss')
            .send('QQfsfsfesfs')
            .expect(200)
            .then(response => {
                // assert.equal(response.text, 'bbbb');
            });
    });
});