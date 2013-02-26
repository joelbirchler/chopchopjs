(function(undefined) {
  
  //
  // ScriptEvaluator may be used in two ways. Either pass success and fail callback arguments or 
  // call .success() and .fail(error) on a ScriptEvaluator object.
  //
  var ScriptEvaluator = function(script, success, fail) {
    var error;
    
    var promiser = {
      success: function(func) {
        if (!error) { func(); }
        return promiser;
      },
      fail: function(func) {
        if (error) { func(error); }
        return promiser;
      }
    }
    
    var assert = function(x,y) {
      if (x==y) return;
      throw "Assert failed. '"+x+"' != '"+y+"'.";
    }

    try {
      eval("(function() {" + script + "assert(true, true); assert(false, false); assert(42,42); var iAmACheater = false; try { assert(true, false); iAmACheater = true; } catch(e) { iAmACheater = false; }; if (iAmACheater) { throw 'Do not cheat.'; } })();");
      success && success();
    } catch(e) {
      error = e;
      fail && fail(e);
    }
    
    return promiser;
  };
  
  (new ScriptEvaluator("assert(1, 1);"))
    .success(function() { 
      console.log('success');
    })
    .fail(function(e) { 
      console.log('fail', e);
    });

})();