'use strict';

var chai = require('chai');
var should = chai.should();

var Mnemonic = require('..');
var errors = require('bitcore').errors;
var bip39_vectors = require('./data/fixtures.json');

describe('Mnemonic', function() {
  this.timeout(10000);

  it('should initialize the class', function() {
    should.exist(Mnemonic);
  });

  describe('# Mnemonic', function() {

    describe('Constructor', function() {
      it('does not require new keyword', function() {
        var mnemonic = Mnemonic(); // jshint ignore:line
        mnemonic.should.be.instanceof(Mnemonic);
      });

      it('should fail with invalid data', function() {
        (function() {
          return new Mnemonic({});
        }).should.throw(errors.InvalidArgument);
      });

      it('should fail with unknown word list', function() {
        (function() {
          return new Mnemonic('pilote foster august tomorrow kit daughter unknown awesome model town village master');
        }).should.throw(errors.Mnemonic.UnknownWordlist);
      });

      it('should fail with invalid mnemonic', function() {
        (function() {
          return new Mnemonic('monster foster august tomorrow kit daughter unknown awesome model town village pilot');
        }).should.throw(errors.Mnemonic.InvalidMnemonic);
      });

      it('should fail with invalid ENT', function() {
        (function() {
          return new Mnemonic(64);
        }).should.throw(errors.InvalidArgument);
      });

      it('constructor defaults to english worldlist', function() {
        var mnemonic = new Mnemonic();
        mnemonic.wordlist.should.equal(Mnemonic.Words.ENGLISH);
      });

      it('allow using different worldlists', function() {
        var mnemonic = new Mnemonic(Mnemonic.Words.SPANISH);
        mnemonic.wordlist.should.equal(Mnemonic.Words.SPANISH);
      });

      it('constructor honor both length and wordlist', function() {
        var mnemonic = new Mnemonic(32 * 7, Mnemonic.Words.SPANISH);
        mnemonic.phrase.split(' ').length.should.equal(21);
        mnemonic.wordlist.should.equal(Mnemonic.Words.SPANISH);
      });

      it('constructor should detect standard wordlist', function() {
        var mnemonic = new Mnemonic('afirmar diseño hielo fideo etapa ogro cambio fideo toalla pomelo número buscar');
        mnemonic.wordlist.should.equal(Mnemonic.Words.SPANISH);
      });

    });


    it('english wordlist is complete', function() {
      Mnemonic.Words.ENGLISH.length.should.equal(2048);
      Mnemonic.Words.ENGLISH[0].should.equal('abandon');
    });

    it('spanish wordlist is complete', function() {
      Mnemonic.Words.SPANISH.length.should.equal(2048);
      Mnemonic.Words.SPANISH[0].should.equal('ábaco');
    });

    it('japanese wordlist is complete', function() {
      Mnemonic.Words.JAPANESE.length.should.equal(2048);
      Mnemonic.Words.JAPANESE[0].should.equal('あいこくしん');
    });

    it('chinese wordlist is complete', function() {
      Mnemonic.Words.CHINESE.length.should.equal(2048);
      Mnemonic.Words.CHINESE[0].should.equal('的');
    });

    it('allows use different phrase lengths', function() {
      var mnemonic;

      mnemonic = new Mnemonic(32 * 4);
      mnemonic.phrase.split(' ').length.should.equal(12);

      mnemonic = new Mnemonic(32 * 5);
      mnemonic.phrase.split(' ').length.should.equal(15);

      mnemonic = new Mnemonic(32 * 6);
      mnemonic.phrase.split(' ').length.should.equal(18);

      mnemonic = new Mnemonic(32 * 7);
      mnemonic.phrase.split(' ').length.should.equal(21);

      mnemonic = new Mnemonic(32 * 8);
      mnemonic.phrase.split(' ').length.should.equal(24);
    });

    it('validates a phrase', function() {
      var valid = Mnemonic.isValid('afirmar diseño hielo fideo etapa ogro cambio fideo toalla pomelo número buscar');
      valid.should.equal(true);

      var invalid = Mnemonic.isValid('afirmar diseño hielo fideo etapa ogro cambio fideo hielo pomelo número buscar');
      invalid.should.equal(false);

      var invalid2 = Mnemonic.isValid('afirmar diseño hielo fideo etapa ogro cambio fideo hielo pomelo número oneInvalidWord');
      invalid2.should.equal(false);

      var invalid3 = Mnemonic.isValid('totally invalid phrase');
      invalid3.should.equal(false);
    });

    it('has a toString method', function() {
      var mnemonic = new Mnemonic();
      mnemonic.toString().should.equal(mnemonic.phrase);
    });

    it('has a toString method', function() {
      var mnemonic = new Mnemonic();
      mnemonic.inspect().should.have.string('<Mnemonic:');
    });

    it('derives a seed without a passphrase', function() {
      var mnemonic = new Mnemonic();
      var seed = mnemonic.toSeed();
      should.exist(seed);
    });

    it('derives a seed using a passphrase', function() {
      var mnemonic = new Mnemonic();
      var seed = mnemonic.toSeed('my passphrase');
      should.exist(seed);
    });

    it('derives an extended private key', function() {
      var mnemonic = new Mnemonic();
      var pk = mnemonic.toHDPrivateKey();
      should.exist(pk);
    });

    it('Mnemonic.fromSeed should fail with invalid wordlist', function() {
      (function() {
        return Mnemonic.fromSeed(new Buffer(1));
      }).should.throw(errors.InvalidArgument);
    });

    it('Mnemonic.fromSeed should fail with invalid seed', function() {
      (function() {
        return Mnemonic.fromSeed();
      }).should.throw(errors.InvalidArgument);
    });

    it('Constructor should fail with invalid seed', function() {
      (function() {
        return new Mnemonic(new Buffer(1));
      }).should.throw(errors.InvalidEntropy);
    });

    var vectors = bip39_vectors.english;
    var test_vector = function(v) {
      it('should pass test vector ' + v, function() {
        var wordlist = Mnemonic.Words.ENGLISH;
        var vector = vectors[v];
        var code = vector[0];
        var mnemonic = vector[1];
        var seed = vector[2];
        var mnemonic1 = Mnemonic.fromSeed(new Buffer(code, 'hex'), wordlist).phrase;
        mnemonic1.should.equal(mnemonic);

        var m = new Mnemonic(mnemonic);
        var seed1 = m.toSeed('TREZOR');
        seed1.toString('hex').should.equal(seed);

        Mnemonic.isValid(mnemonic, wordlist).should.equal(true);
      });
    };
    for (var v = 0; v < vectors.length; v++) {
      test_vector(v);
    }

  });

});
