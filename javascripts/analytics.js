var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25658819-1']);
_gaq.push(['_setDomainName', 'js.joelbirchler.com']);

(function() {
  var ga = document.createElement('script'); 
  ga.type = 'text/javascript'; 
  ga.async = true;
  ga.src = 'http://www.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; 
  s.parentNode.insertBefore(ga, s);
})();

var track = function(page) {
  console.log("track: " + page);
  _gaq.push(['_trackPageview', page]);
};

