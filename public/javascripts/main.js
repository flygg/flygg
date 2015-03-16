// To make images retina, add a class "2x" to the img element
// and add a <image-name>@2x.png image. Assumes jquery is loaded.
 
function isRetina() {
	var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
					  (min--moz-device-pixel-ratio: 1.5),\
					  (-o-min-device-pixel-ratio: 3/2),\
					  (min-resolution: 1.5dppx)";
 
	if (window.devicePixelRatio > 1)
		return true;
 
	if (window.matchMedia && window.matchMedia(mediaQuery).matches)
		return true;
 
	return false;
};
 
 
function retina() {
	
	if (!isRetina())
		return;
	
	$("img.2x").map(function(i, image) {
		
		var path = $(image).attr("src");
		
		path = path.replace(".png", "@2x.png");
		path = path.replace(".jpg", "@2x.jpg");
		
		$(image).attr("src", path);
	});
};
 
$(document).ready(retina);


// Search and go to results
$('input').keypress(function (e) {
  if (e.which == 13) {
      
     $( "#flygg" ).addClass( "searching" );
    
      $('html, body').animate({
            scrollTop: $("#results").offset().top
       }, 1500, 'easeOutQuint' );
      
      $( "#results .magic-box" ).delay(1000).fadeOut();
      $( ".results-advanced" ).delay(1790).fadeIn();
      $( ".result-menu" ).delay(1800).fadeIn();
      
  }
});

// Go home
$( ".step-go-home" ).click(function() {
  $( "#flygg" ).removeClass( "searching" );

    
  $('html, body').animate({
    
    scrollTop: $("#home").offset().top 
   }, 1000, 'easeOutQuint'  );
    
});

$(document).keypress(function(e) { 
    if (e.which == 27) {
    
        $('.step-go-home').click();
    
    } 
});

// Tables

$( "td" ).click(function() {
    $( "td" ).removeClass( "selected" );
    $( this ).addClass( "selected" );
    $( ".airport-board" ).show();
});




