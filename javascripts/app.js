$(function() {
  
  //
  // Script Evaluator
  //
  var ScriptEvaluator = function(script, success, fail) {
    var assert = function(x,y) {
      if (x==y) return;
      throw "Assert failed. '"+x+"' != '"+y+"'.";
    }
  
    try {
      eval("(function() {" + script + "assert(true, true); assert(false, false); assert(42,42); var iAmACheater = false; try { assert(true, false); iAmACheater = true; } catch(e) { iAmACheater = false; }; if (iAmACheater) { throw 'Do not cheat.'; } })();");
      success();
    } catch(e) {
      fail(e);
    }
  };
  
  
  //
  // Puzzles
  //
  var Puzzles = function() {
    this.index = 0;
    this.list = [];
  }
  
  Puzzles.prototype.add = function() {
    return this.list = this.list.concat(Array.prototype.slice.call(arguments));
  }
  
  Puzzles.prototype.current = function() {
    return this.list[this.index];
  }
  
  Puzzles.prototype.last = function() {
    return this.list[this.list.length - 1];
  }
  
  var puzzles = window.puzzles = new Puzzles();


  //
  // App View
  //
  var AppView = Backbone.View.extend({
    el: $("#app"),
    onLastPuzzle: false,
    events: {
      "click #run-code": "runCode",
      "keyup #puzzle input": "puzzleInputChange",
      "change #puzzle input": "puzzleInputChange"
    },

    initialize: function() {
      _.bindAll(this, "runCode");
    },
  
    updateStatus: function(message, stayGlow) {
      $('#status .glow, #status .slow').hide().text(message);
      $('#status .glow').fadeIn('fast', function() { 
        if (!stayGlow) {
          $('#status .slow').fadeIn('fast', function() { $('#status .glow').fadeOut('fast') });
        }
      }); 
    },
    
    showPuzzle: function(puzzle, isLast) {
      var that = this;
      
      window.track('/'+ puzzles.index);
      this.onLastPuzzle = isLast;
      
      var lines = puzzle.replace(/#(.*)/g, "<input type='text' value='$1'/>").replace(/\t/g,"&nbsp;&nbsp;").split("\n");
      var html = _.map( lines, function(line) { return "<li>"+line+"</li>" } ).join("");
    
      $('#load-next, #done').hide();
      $('#run-code').show();
      $('#puzzle input').attr("disabled", "");
      
      $('#puzzle')
        .hide()
        .removeClass('stopped')
        .html(html)
        .fadeIn('slow', 
          function() { 
            $('#puzzle-options').fadeIn(600); 
          });
      $.each( $('#puzzle input'), function(i,el) {
        $(el).attr({id: "puzzle-input-" + i});
        $('#puzzle-input-shadows').append($("<div class='input-shadow-value' id='input-shadow-"+i+"'>"+$(el).val()+"</div>"));
        that.sizeInput(el); 
      });
    },
  
    buildCode: function(include_pound_indicators) {
      var script = _.reduce( $('#puzzle').children(), function(memo, line) {
        var possible_input = $(line).children(":first");
        var text = possible_input.length ? ( include_pound_indicators ? "#" : "" ) + $(line).text() + $(possible_input[0]).attr("value") : $(line).text();
        return memo + text + "\n";
      }, "" );
    
      return script;
    },
  
    runCode: function() {
      var that = this;
      that.updateStatus("");
    
      new ScriptEvaluator(
        that.buildCode(), 
        function() { 
          $('#puzzle input').attr("disabled", "disabled");
          $('#puzzle').addClass('stopped');
          $('#run-code').hide();
          
          if (that.onLastPuzzle) {
            $('#done').fadeIn('slow');
          } else {
            $('#load-next').fadeIn('slow');
          }
          
          window.track('/'+ puzzles.index +'/win');
        }, 
        function(e) { 
          that.updateStatus("Fail! " + e + "."); 
          window.track('/'+ puzzles.index +'/fail');
        }
      );
    },
  
    sizeInput: function(target) {
      var $target = $(target);
      var $shadow = $("#input-shadow-" + $target.attr("id").split("-")[2]);
      $shadow.html($target.val() + "m");
      $target.width( Math.max($shadow.width(), 150) );
    },
  
    puzzleInputChange: function(e) {
      this.sizeInput(e.target);
    }  
  });

  var appView = new AppView();
  
  //
  // Router
  //
  var AppRoutes = Backbone.Router.extend({
    routes: {
      "next": "nextPuzzle",
      ":state": "loadState"
    },
    
    getStateFragment: function(optionalPuzzleIndex) {
      return $.base64.encode( $.toJSON({puzzle: arguments.length ? optionalPuzzleIndex : puzzles.index}) );
    },
    
    nextPuzzle: function() {
      this.navigate(this.getStateFragment(puzzles.index + 1), true);
    },
    
    loadState: function(state) {
      if (state) {
        try {
          var json = $.evalJSON($.base64.decode(state));
          puzzles.index = json.puzzle;
        } catch (e) {
          console.log("Invalid puzzle state.")
        }
      }
      
      appView.showPuzzle(puzzles.current(), puzzles.current() == puzzles.last());
    }
  });
  
  var appRoutes = new AppRoutes();
  
});
