var
  should = require('should'),
  request = require('supertest'),
  app = require('../app');

describe('Endpoints', function () {
  describe('Root redirect', function () {
    it('should return 302 status and redirect unauthenticated user to "/login"', function (done) {
      request(app)
      .get('/')
      .expect(302)
      .end(function (err, res) {
        res.text.should.containEql('Redirecting to /login');
        done(err);
      })
    })
  });
  describe('Login', function () {
    it('should return 200 status', function (done) {
      request(app)
      .get('/login')
      .expect(200)
      .end(function (err, res) {
        done(err);
      })
    })
  });
  describe('Plans', function () {
    it('should return 302 status and redirect unauthenticated users to "/login"', function (done) {
      request(app)
      .get('/plans')
      .expect(302)
      .end(function (err, res) {
        res.text.should.containEql('Redirecting to /login');
        done(err);
      })
    })
  });
  describe('FAQ', function () {
    it('should return 302 status and redirect unauthenticated users to "/login"', function (done) {
      request(app)
      .get('/faq')
      .expect(302)
      .end(function (err, res) {
        res.text.should.containEql('Redirecting to /login');
        done(err);
      })
    })
  });
  describe('Logout', function () {
    it('should return 302 status and redirect to root', function (done) {
      request(app)
      .get('/logout')
      .expect(302)
      .end(function (err, res) {
        res.text.should.containEql('Redirecting to /');
        done(err);
      })
    })
  });
})
