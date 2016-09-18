var fs_safeSearch = "1";
var fs_perPage = "10";
var fs_apiKey = ""; // insert your api key here
var fs_searchTag = "";
var fs_urlFlickr = "";
var fs_encoded = "";

$(document).ready(function() {
	fs_calcOffset();
	$(this).find('input[type=text]').val("");
	
	$('#addInput').on('click', function() {
		$('<p><input type="text" class="search-field" name="input-tag" value="" placeholder="another tag" /><span class="btn remove-input">–</span></p>').appendTo($('#inputs'));
		return false; //preventDefault()
	});
	
	$('#lefty').on('click', fs_toTheRight);
	$('#righty').on('click', fs_toTheLeft);
	$('#search').on('click', fs_search);
});

$(window).resize(fs_calcOffset);

$(document).on('click', '.remove-input', function() {
	$(this).parent('p').remove();
	return false;
});

$(document).keydown(function(event) {
	if (event.which == 37) {
		event.preventDefault();
		fs_toTheRight();
	}
	if (event.which == 39) {
		event.preventDefault();
		fs_toTheLeft();
	}
	if (event.which == 13) {
		event.preventDefault();
		fs_search();
	}
});

function fs_calcOffset() {
	if ($('#inner-slide').children().length > 0) {
		var imgMid = $('.active').width() / 2;
		var imgLeftToEdge = $('.active').offset().left - $('#inner-slide').offset().left;
		var outerMid = $('#outer-slide').width() / 2;
		var innerOffset = outerMid - imgLeftToEdge;
		var leftPos = innerOffset - imgMid;
		$('#inner-slide').css('left', leftPos + "px");
	}
}

function fs_toTheLeft() {
	if ($('.active').next('img').length > 0) {
	$('#large-frame').addClass('loading big-loader');
		var midPrev = ($('.active').width() / 2) + 40;
		$('.active').removeClass('active').next().addClass('active');
		var midCurrent = $('.active').width() / 2;
		var moveLeft = midPrev + midCurrent;
		$('#inner-slide').animate({left:"-=" + moveLeft + "px"}, 1000);
		fs_superSize();
	}
}

function fs_toTheRight() {
	if ($('.active').prev('img').length > 0) {
		$('#large-frame').addClass('loading big-loader');
		var midPrev = ($('.active').width() / 2) + 40;
		$('.active').removeClass('active').prev().addClass('active');
		var midCurrent = $('.active').width() / 2;
		var moveRight = midPrev + midCurrent;
		$('#inner-slide').animate({left:"+=" + moveRight + "px"}, 1000);
		fs_superSize();
	}
}

function fs_superSize() {
	var smallSrc = $('.active').attr('src');
	var sizeChar = smallSrc.lastIndexOf("m");
	var largeSrc = smallSrc.substring(0, sizeChar) + "b" + smallSrc.substring(sizeChar + 1);
	var createImg = $('<img/>').attr('src', largeSrc).addClass('large-img');
	if ($('#large-frame').children().length == 0) {
		createImg.appendTo('#large-frame');
	}
	else {
		$('#large-frame img:first').replaceWith(createImg);
	}
	var largeImg = $('#large-frame img');
	largeImg.hide();
	largeImg.load(function() {
		largeImg.show();
		$("#large-frame").removeClass('loading big-loader');
		if (largeImg.width() > largeImg.height()) {
			largeImg.addClass('large-wider');
		}
		else {
			largeImg.addClass('large-taller');
		}
	});
}

function fs_search() {
	if(!$('#inputs :input').val()) {
		alert("Please enter at least one tag to search.");
		return false;
	}
	$('#search').addClass('loading');
	$('#large-frame').addClass('loading big-loader');
	$('#inputs :input').each(function() {
		if ($(this).val().length > 0) {
			fs_searchTag += $(this).val() + "+";
		}
	});
	fs_searchTag = fs_searchTag.slice(0, -1);
	fs_urlFlickr += "https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&safe_search=" + fs_safeSearch + "&per_page=" + fs_perPage + "&api_key=" + fs_apiKey + "&tags=" + fs_searchTag + "&jsoncallback=?";
	fs_encoded += encodeURI(fs_urlFlickr);
	fs_getImages();
	fs_searchTag = "";
}

function fs_getImages() {
	var request = $.getJSON(fs_encoded, function(imgData) {
		if (imgData != null && imgData.photos.photo != 0) {
			$("#inner-slide").hide();
			fs_clearSlides();
			$.each(imgData.photos.photo, function(i, thisImg) {
				var imgSrc = "http://farm" + thisImg.farm + ".static.flickr.com/" + thisImg.server + "/" + thisImg.id + "_" + thisImg.secret + "_m.jpg";
				$('<img/>').attr('src', imgSrc).addClass('slides').appendTo('#inner-slide');
				if (i == fs_perPage) return false;
			});
			fs_loadThumbs()
		}
		else {
			fs_clearSlides();
			fs_noResults();
		}
	});
	return request;
}

function fs_clearSlides() {
	$('#inner-slide img').each(function() {
		$(this).removeAttr('class'); //style attributes must be explicitly removed - some effects can linger otherwise
	});
	$('#inner-slide').empty();
}

function fs_loadThumbs() {
	var thumbnails = $('#inner-slide img');
	var loadedThumbs = 0;
	thumbnails.load(function() {
		loadedThumbs++;
		if (loadedThumbs == thumbnails.length) {
			$("#inner-slide").show();
			$('#inner-slide img:first').addClass('active');
			fs_calcOffset();
			fs_superSize();
		}
	});
	$("#search").removeClass('loading');
}

function fs_noResults() {
	$('#large-frame').hide();
	var errorImg = '<img alt="error-img" class="large-img" src="img/oops-dark.png" />';
	if ($('#large-frame').children().length == 0) {
		$('#large-frame').prepend(errorImg);
	}
	else {
		$('#large-frame img:first').replaceWith(errorImg);
	}
	$('#large-frame').show();
	$("#large-frame").removeClass('loading big-loader');
	$("#search").removeClass('loading');
}
