const WebSocket = require('ws');

import tape from 'tape-catch';
import {XVIZServer} from '@xviz/server';

// Verify onConnection is called and message is received & matches
class TestSession {
  constructor(t, socket, msg, done) {
    this.t = t;
    this.socket = socket;
    this.msg = msg;
    this.done = done;
    this.connectCalled = false;

    this.socket.onmessage = msg => this.onMessage(msg);
  }

  onConnection() {
    this.connectCalled = true; 
  }

  onMessage(msg) {
    this.t.ok(this.connectCalled, 'connect was called');
    this.t.equal(msg.data, this.msg, 'message matches');
    this.done(); 
  };
};

// Accepts connection, validates path & params
// then returns a TestSession
class TestHandler {
  constructor(t, testCase, done) {
    this.t = t;
    this.testCase = testCase;
    this.done = done;
  }

  newSession(socket, req) {
    this.t.equal(req.path, this.testCase.path, 'expected path');
    this.t.deepEqual(req.params, this.testCase.params, 'expected params');

    return new TestSession(this.t, socket, this.testCase.msg, this.done);
  }
};

const TestCases = [
  {
    name: 'simple',
    path: '/foo',
    params: {bar: '1'},
    msg: 'OK'
  },
  {
    name: 'multipart path',
    path: '/foo/bar',
    params: {bar: '1'},
    msg: 'OK'
  }
];

tape('XVIZServer#basic functionality', t => {
  t.plan(TestCases.length * 4);

  for (let testCase of TestCases) {
    t.comment(`-- TestCase ${testCase.name}`);
    let wss = null;
    const done = () => wss.close();
    const handler = new TestHandler(t, testCase, done);

    wss = new XVIZServer([handler], {port: 0}, () => {
      const params = Object.entries(testCase.params).map(p => p.join('=')).join('&');
      const url = `ws://localhost:${wss.server.address().port}${testCase.path}?${params}`;
      const socket = new WebSocket(url);
      socket.onopen = () => {
        socket.send(testCase.msg);
      };
    });
  }
});
