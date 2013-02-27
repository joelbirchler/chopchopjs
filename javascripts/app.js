(function() {
  "use strict";
  
  //
  // ScriptEvaluator may be used in two ways. Either pass success and fail callback arguments or 
  // call .success() and .fail(error) on a ScriptEvaluator object.
  //
  var ScriptEvaluator = function(script, success, fail) {
    var error, 
      deferred = $.Deferred();
    
    var assert = function(x,y) {
      if (x==y) return;
      throw "Assert failed. '"+x+"' != '"+y+"'.";
    }

    try {
      eval("(function() {" + script + "assert(true, true); assert(false, false); assert(42,42); var iAmACheater = false; try { assert(true, false); iAmACheater = true; } catch(e) { iAmACheater = false; }; if (iAmACheater) { throw 'Do not cheat.'; } })();");
      deferred.resolve();
    } catch(err) {
      deferred.reject(err);
    }
    
    return deferred.promise();
  };
  
  (new ScriptEvaluator("assert(1, 1);"))
    .done(function() { 
      console.log('done');
    })
    .fail(function(e) { 
      console.log('fail', e);
    });
    
  //
  // Puzzle
  //
  var Puzzle = function(options) {
    _.extend(this, options);
    
    this.run = function() {
      
    };
  };
  
  Puzzle.load = function(puzzleName) {
    var deferred = $.Deferred();
    
    var loadPromise = $.ajax({
      url: 'puzzles/' + puzzleName + '.json',
      dataType: 'json'
    });
    
    loadPromise.fail(function() {
      console.error("Error loading puzzle.", arguments);
    });
    
    loadPromise.done(function(data) {
      data.code = data.code.join("\n");
      var puzzle = new Puzzle(data);
      
      deferred.resolve(puzzle);
    });
    
    return deferred.promise();
  }
  
  Puzzle.load('gilbert')
    .done(function(puzzle) {
      console.log("loaded!", puzzle);
    });

})();