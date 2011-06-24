// $Id: media_youtube.js,v 1.1.2.4 2011/01/04 19:50:41 aaron Exp $

/**
 * @file media_youtube/js/media_youtube.js
 */

(function ($) {

Drupal.media_youtube = {};
Drupal.behaviors.media_youtube = {
  attach: function (context, settings) {
    // Check the browser to see if it supports html5 video.
    var video = document.createElement('video');
    var html5 = video.canPlayType ? true : false;

    // If it has video, does it support the correct codecs?
    if (html5) {
      html5 = false;
      if (video.canPlayType( 'video/webm; codecs="vp8, vorbis"' ) || video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
        html5 = true;
      }
    }

    // Put a prompt in the video wrappers to let users know they need flash
    if (!FlashDetect.installed && !html5){
      $('.media-youtube-preview-wrapper').each(Drupal.media_youtube.needFlash);
    }
  }
};

Drupal.media_youtube.needFlash = function () {
  var id = $(this).attr('id');
  var wrapper = $(this);
  var hw = Drupal.settings.media_youtube[id].height / Drupal.settings.media_youtube[id].width;
  wrapper.html('<div class="js-fallback">' + Drupal.t('You need Flash to watch this video. <a href="@flash">Get Flash</a>', {'@flash':'http://get.adobe.com/flashplayer'}) + '</div>');
  wrapper.height(wrapper.width() * hw);
};

Drupal.media_youtube.insertEmbed = function (embed_id) {
  var videoWrapper = $('#' + embed_id + '.media-youtube-preview-wrapper');
  var settings = Drupal.settings.media_youtube[embed_id];

  // Calculate the ratio of the dimensions of the embed.
  settings.hw = settings.height / settings.width;

  // Replace the object embed with YouTube's iframe. This isn't done by the
  // theme function because YouTube doesn't have a no-JS or no-Flash fallback.
  var video = $('<iframe class="youtube-player" type="text/html" frameborder="0"></iframe>');
  var src = 'http://www.youtube.com/embed/' + settings.video_id;

  // Allow other modules to modify the video settings.
  settings.options = {wmode : 'opaque'};
  $(window).trigger('media_youtube_load', settings);

  // Merge YouTube options (such as autoplay) into the source URL.
  var query = $.param(settings.options);
  if (query) {
    src += '?' + query;
  }

  // Set up the iframe with its contents and add it to the page.
  video
    .attr('id', settings.id)
    .attr('width', settings.width)
    .attr('height', settings.height)
    .attr('src', src);
  videoWrapper.html(video);

  // Bind a resize event to handle fluid layouts.
  $(window).bind('resize', Drupal.media_youtube.resizeEmbeds);

  // For some reason Chrome does not properly size the container around the
  // embed and it will just render the embed at full size unless we set this
  // timeout.
  if (!$('.lightbox-stack').length) {
    setTimeout(Drupal.media_youtube.resizeEmbeds, 1);
  }
};

Drupal.media_youtube.resizeEmbeds = function () {
  for(var embed in Drupal.settings.media_youtube) {
    Drupal.media_youtube.resizeEmbed(Drupal.settings.media_youtube[embed]);
  }
};

Drupal.media_youtube.resizeEmbed = function (embed) {
  var video = $('#' + embed.id);
  var wrapper = video.closest('.media-youtube-outer-wrapper');
  var context = wrapper.parent();
  // Change the height of the wrapper that was given a fixed height by the
  // YouTube theming function.
  wrapper
    .height(context.width() * embed.hw + 15)
    .width(context.width());

  // Change the attributes on the embed to match the new size.
  video
    .height(context.width() * embed.hw + 15)
    .width(context.width());
};

})(jQuery);