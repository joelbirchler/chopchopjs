$(function() {
  "use strict";
  
  var puzzleNames,
    $content = $('#content');
  
  //
  // ScriptEvaluator may be used in two ways. Either pass success and fail callback arguments or 
  // call .success() and .fail(error) on a ScriptEvaluator object.
  //
  // We prepend a few checks to make sure that the assert() function survives the user entered code.
  //
  var ScriptEvaluator = function(script, success, fail) {
    var error, 
      deferred = $.Deferred();
    
    var assert = function(x,y) {
      if (x==y) return;
      throw "Assert failed. '"+x+"' != '"+y+"'.";
    }

    try {
      eval("(function() {" + script + "assert(true, true); assert(false, false); assert(42, 42); var iAmACheater = false; try { assert(true, false); iAmACheater = true; } catch(e) { iAmACheater = false; }; if (iAmACheater) { throw 'Do not cheat.'; } })();");
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
    "<div class='results'></div>" +
    "</section>"
  );
  
  Puzzle.failTemplate = _.template("<hr><p><span class='error-message'>&#10007; <%= err %>.</span> <%= hint %></p>");
  
  Puzzle.successTemplate = _.template("<hr><p><span class='success-check'>&#10003;</span> <%= success %></p>");
  
  Puzzle.finalTemplate = _.template("<section class='final'>" +
    "<h1>Nice!</h1>" +
    "<p>You have completed all of the ChopChopJS puzzles. This project is open source. If you would like to " +
    "contribute by adding new puzzles or fixing bugs, please <a href='https://github.com/joelbirchler/chopchopjs'>" +
    "fork me on github</a>." +
    "</p>" +
    "</section>"
  );
  
  Puzzle.load = function(puzzleName) {
    $.getJSON('puzzles/' + puzzleName + '.json')
      .fail(function() {
        console.error("Error loading puzzle.", arguments);
      })
      .done(function(data) {
        data.code = data.code.join("\n");
        var puzzle = new Puzzle(_.extend({name: puzzleName}, data));
        puzzle.appendTo($content);
      });
  };
  
  Puzzle.showFinal = function() {
    $(Puzzle.finalTemplate())
      .hide()
      .fadeIn()
      .appendTo($content);
  };
  
  Puzzle.prototype.run = function() {
    var that = this;
    
    // grab the values from the text input (spans)
    var inputs = this.$el
      .find('span')
      .map(function(i, span) {
        return $(span).text(); 
      });

    // fill in the blanks
    var i = 0;
    var userCode = this.code.replace(
      /<span>.*<\/span>/ig, 
      function() {
        return inputs[i++];
      }
    );
    
    var showResults = function(template, options) {
      that.$el
        .find('.results')
        .html(template(options))
        .hide()
        .fadeIn();
    };
    
    (new ScriptEvaluator(userCode))
      .done(function() { 
        showResults(Puzzle.successTemplate, that);
        
        // scroll down to show it
        $('html, body').animate({
          scrollTop: that.$el.find('.results').offset().top
        })
        
        // move on to the next one
        var nextIndex = _.indexOf(puzzleNames, that.name) + 1;
        if (nextIndex < puzzleNames.length) {
          Puzzle.load(puzzleNames[nextIndex]);
        } else {
          Puzzle.showFinal();
        }
      })
      .fail(function(err) { 
        showResults(Puzzle.failTemplate, _.extend({err: err}, that));
      });      
  };
  
  Puzzle.prototype.html = function() {
    return Puzzle.template(this);
  };
  
  Puzzle.prototype.appendTo = function($parentEl) {
    var that = this;
    
    this.$el = $(this.html())
      .hide()
      .appendTo($parentEl)
      .fadeIn('slow');
      
    this.$el
      .find('span')
      .attr('contenteditable', 'true');
      
    this.$el
      .find('.run')
      .on('click', function() { 
        that.run.call(that);
      });
  };
  
  
  //
  // Load the puzzle index and get started.
  //    
  $.getJSON('puzzles/index.json')
    .done(function(data) {
      puzzleNames = data;
      Puzzle.load(puzzleNames[0]);
    })
    .fail(function(err) { 
      console.error('Error loading index.json.', err);
    });

});