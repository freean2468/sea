// BDD Style

// Synchronous testing
describe('Array', function() {
	describe('#indexOf()', function() {
		it('should return -1 when the value is not present', function() {
			[1,2,3].indexOf(5).should.eql(-1);
			[1,2,3].indexOf(0).should.eql(-1);
		});
	});
});

// Pending tests
describe('Array', function() {
	describe('#indexOf()', function() {
		it('should return -1 when the value is not presnt')
	});
});

// Exclusive tests
//describe('Array', function() {
//	describe.only('#indexOf()', function() {
//		it.only('should return -1 unless present', function() {
//			[].indexOf(1).should.eql(-1);
//		});
//
//		it('should return the index when present', function() {
//			[1].indexOf(1).should.not.eql(-1);
//		});
//	});
//});

// Hooks
describe('Hooks', function() {
	var Before = function () {
		// properties
		this.value = 0;

		// method
		this.setup = function(val) {
			this.value = val;
			return this.value;
		};
	};

	var obj = new Before();

	beforeEach(function() {
		obj.setup(10);
	});

	describe('#setup()', function() {
		it('should be 10', function() {
			obj.value.should.eql(10);
		});
	});
});

// Inclusive tests
describe('Array', function() {
	describe.skip('#indexOf()', function() {

	});
});
