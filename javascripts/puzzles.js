$(function() {
  window.puzzles.add(
    "function cat() {\n\t#\n\tthis.meow = \"no\";\n\t(function() {\n\t\t#this.meow = \"yes\"\n\t})();\n}\ngilbert = new cat();\nassert(gilbert.meow, 'yes');",
    "var foo = 2 + chicken();\n#var chicken = function() {return 2;}\nassert(foo, 4);",
    "var foo = [8,1,5,3,1];\ntheMin = Math.min.#\nassert(theMin, 1);",
    "var meow = function() {\n\tvar answer = undefined;\n\tvar args = #arguments;\n\treturn args.pop();\n}\n\nvar answer = Math.random();\nvar cats = meow(answer);\nassert(cats, answer);",
    "var bear = 0, fish = {}, river = [];\nfor (var i = 0; i < 10; i++) {\n\triver[i] = Math.random();\n}\nvar flow = function(obj, iterator, context) {\n\tfor (var j = 0, l = obj.length; j < l; j++) {\n\t\tif (iterator.call(context, obj[j], j) === fish) return;\n\t}\n}\nflow(river, function(w,t) {\n\tvar river = undefined\n\tbear += w;\n\t#\n}, this);\nassert(bear, river[0] + river[1] + river[2]);"
  );

  Backbone.history.start();
});