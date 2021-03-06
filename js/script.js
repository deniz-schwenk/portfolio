$(window).on("load", function(){
  $(".loader .inner").fadeOut(500, function(){
    $(".loader").fadeOut(750);
  });
    $(".items").isotope({
      filter: '*',
      animationOptions:{
        duration: 100,
        easing: 'linear',
        queue: false
      }
  });
});

$(document).ready(function(){

  $('#slides').superslides({
    animation: 'fade',
    play: 50000,
    pagination: false
  });

  var typed = new Typed(".typed", {
    strings: ["I´m a Designer ...", "but not only ..."],
    typeSpeed: 80,
    loop: true,
    showCursor: false,
    startDelay: 1000
  });

  $('.owl-carousel').owlCarousel({
    center: true,
    autoplay:true,
    autoplayTimeout: 2000,
    loop:true,
    // dotsEach:true,
    nav:true,
    // margin:10,
    items: 4,
    responsive:{
        0:{
            items:1
        },
        480:{
            items:2
        },
        768:{
            items:3
        },
        938:{
            items:4
        }
    }
  });

//   $('.owl-carousel').owlCarousel({
//     autoplay: true,
//     autoplayTimeout: 2000,
//     loop:true,
//     nav: true,
//     items: 4,
//     responsive:{
//         0:{
//             items:1
//         },
//         480:{
//             items:2
//         },
//         768:{
//             items:3
//         },
//         938:{
//             items:4
//         }
//     }
// });


  var skillsTopOffset = $("#skills").offset().top;
  $(window).scroll(function(){
    if(window.pageYOffset > skillsTopOffset - $(window).height()+200){

      $('.chart').easyPieChart({

        easing: 'easeInOut',
        barColor: '#000000',
        trackColor: '#d2dae2',
        // trackColor: false,
        scaleColor: false,
        lineWidth: 8,
        size: 152,
        onStep: function(from, to, percent){
          $(this.el).find('.percent').text(Math.round(percent));
        }

      });
    }
  });

    $("[data-fancybox]").fancybox();


    $("#filters a").click(function(){

    $("#filters .current").removeClass("current");
    $(this).addClass("current");

    var selector = $(this).attr("data-filter");

    $(".items").isotope({
      filter: selector,
      animationOptions:{
        duration: 1000,
        easing: 'linear',
        queue: false
      }
    });

    return false;

  });

  $("#navigation li a").click(function(e){

    e.preventDefault();

    var targetElement = $(this).attr("href");
    var targetPosition = $(targetElement).offset().top;
    $("html, body").animate({scrollTop: targetPosition - 40}, "slow");

  });



  const nav = $("#navigation");
  const navTop = nav.offset().top;

  $(window).on("scroll", stickyNavigation);

  function stickyNavigation(){
    var body = $("body");

    if($(window).scrollTop() >= navTop) {
      body.css("padding-top", nav.outerHeight() + "px");
      body.addClass("fixedNav");
    }else{
      body.removeClass("fixedNav");
      body.css("padding-top", 0);
    }
  }
});
