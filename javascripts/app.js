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
  
      
  //
  // Puzzle
  //
  var Puzzle = function(options) {
    _.extend(this, options);    
  };
  
  Puzzle.template = _.template("<section>" +
    "<h1><%= title %></h1>" +
    "<p><%= intro %></p>" +
    "<pre><%= code %></pre>" +
    "<a class='run' href='javascript:void(0)'>Run</a>" +
    "</section>"
  );
  
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
  };
  
  Puzzle.prototype.run = function() {
    // grab the values from the text inputs
    var inputs = this.$el
      .find('input')
      .map(function(i, input) {
        return $(input).val(); 
      });

    // fill in the blanks
    var i = 0;
    var userCode = this.code.replace(
      /<input.*>/ig, 
      function() {
        return inputs[i++] + ";";
      }
    );
    
    (new ScriptEvaluator(userCode))
      .done(function() { 
        console.log('success!');
      })
      .fail(function(e) { 
        console.log('fail', e);
      });
  };
  
  Puzzle.prototype.html = function() {
    return Puzzle.template(this);
  };
  
  Puzzle.prototype.prependTo = function($parentEl) {
    var that = this;
    
    this.$el = $(this.html())
      .hide()
      .prependTo($parentEl)
      .fadeIn('slow');
      
    this.$el
      .find('.run')
      .on('click', function() { 
        that.run.call(that);
      });
  };
  
  
  //
  // Load the first puzzle and get moving
  //
  $(function() {
    var $content = $('#content');

    Puzzle.load('gilbert')
      .done(function(puzzle) {
        puzzle.prependTo($content);
      });
  })

})();