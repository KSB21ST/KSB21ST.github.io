$(document).ready(function() {

  // Variables
  var $codeSnippets = $('.code-example-body'),
      $nav = $('.navbar'),
      $body = $('body'),
      $window = $(window),
      $popoverLink = $('[data-popover]'),
      navOffsetTop = $nav.offset().top,
      $document = $(document),
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $('a[href^="#"]').on('click', smoothScroll)
    buildSnippets();
    buildToggles();
    expandSection(window.location.hash);   // deep link, e.g. /#services
  }

  // Collapsible sections: turn each <h4> inside these sections into a
  // toggle controlling the content that follows it, collapsed by default.
  var TOGGLE_SECTION_IDS = ['experiences', 'services', 'miscellaneous']

  function buildToggles() {
    $.each(TOGGLE_SECTION_IDS, function(_, id) {
      $('#' + id).children('h4').each(function() {
        var $header = $(this),
            $content = $header.nextUntil('h4')
        if (!$content.length) return
        $content.wrapAll('<div class="toggle-body"></div>')
        $header
          .css('margin-bottom', '')          // drop inline margin; CSS owns it now
          .addClass('toggle-header')
          .attr({ role: 'button', tabindex: 0, 'aria-expanded': 'false' })
          .prepend('<span class="toggle-arrow" aria-hidden="true"></span>')
      })
    })
    $('.toggle-body').hide()
    $('.toggle-header').on('click', function(e) {
      e.preventDefault()
      setSection($(this), !$(this).hasClass('open'), true)
    })
    $('.toggle-header').on('keydown', function(e) {
      if (e.which !== 13 && e.which !== 32) return   // Enter / Space
      e.preventDefault()
      setSection($(this), !$(this).hasClass('open'), true)
    })
  }

  function setSection($header, open, animate) {
    var $body = $header.next('.toggle-body')
    $header.toggleClass('open', open).attr('aria-expanded', open ? 'true' : 'false')
    if (animate) { $body.stop(true, true).slideToggle(180) }
    else { $body.toggle(open) }
  }

  // Expand every toggle inside a section so anchor links land on real content.
  function expandSection(hash) {
    if (!hash || hash === '#') return
    $(hash).find('.toggle-header').each(function() {
      if (!$(this).hasClass('open')) setSection($(this), true, false)
    })
  }

  function smoothScroll(e) {
    e.preventDefault();
    $(document).off("scroll");
    var target = this.hash,
        menu = target;
    $target = $(target);
    expandSection(target);          // expand first so the offset below is correct
    $('html, body').stop().animate({
        'scrollTop': $target.offset().top-40
    }, 0, 'swing', function () {
        window.location.hash = target;
        $(document).on("scroll", onScroll);
    });
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  $("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
});

  function resize() {
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() {
    if(navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function() {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })
  }


  init();

});