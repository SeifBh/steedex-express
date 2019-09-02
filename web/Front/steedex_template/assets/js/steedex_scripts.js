var num = 150; //number of pixels before modifying styles

$(window).bind('scroll', function () {
    if ($(window).scrollTop() > num) {
        $('.menu').addClass('fixed');
    } else {
        $('.menu').removeClass('fixed');
    }
});






$(document).ready(function(){


    var $element = $("#call1");
    var $openButton = $("#call1").find('.moto-widget-callback__open-button');
    var $closeButton = $("#call1").find('.moto-widget-callback__close-button');
    var $moreDetailsButton = $("#call1").find('.moto-widget-callback__more-details-button');
    var $moreDetails = $("#call1").find('.moto-widget-callback__more-details-wrapper');
    var $callbackBody = $("#call1").find('.moto-widget-callback__body');
    var ANIMATION_DURATION = 100;

    function openCallback() {
        if ($element.hasClass('moto-widget-callback_opened') || $element.hasClass('moto-widget-callback_opening') || $element.hasClass('moto-widget-callback_closing')) {
            console.lgo('inside if');
            return;
        }
        console.log("outside if");
        $element.removeClass('moto-widget-callback_closed');
        $element.addClass('moto-widget-callback_opening');

        // firstly we have to set normal width and only then show content and hide button
        $callbackBody.animate({ width: 280 }, ANIMATION_DURATION / 2, function() {
            $openButton.slideUp(ANIMATION_DURATION / 2);
            $callbackBody.slideDown(ANIMATION_DURATION / 2, function() {
                $element.removeClass('moto-widget-callback_opening');
                $element.addClass('moto-widget-callback_opened');
            });
        });
    }

    function closeCallback() {
        if ($element.hasClass('moto-widget-callback_closed') || $element.hasClass('moto-widget-callback_opening') || $element.hasClass('moto-widget-callback_closing')) {
            return;
        }

        $element.removeClass('moto-widget-callback_opened');
        $element.addClass('moto-widget-callback_closing');
        $openButton.slideDown(ANIMATION_DURATION);
        $callbackBody.slideUp(ANIMATION_DURATION, function() {
            $element.removeClass('moto-widget-callback_closing');
            $element.addClass('moto-widget-callback_closed');
        });
    }

    function toggleModeDetails() {
        if ($callbackBody.hasClass('moto-widget-callback__body_more-details-opened')) {
            $moreDetails.slideUp();
            $callbackBody.removeClass('moto-widget-callback__body_more-details-opened');
        } else {
            $moreDetails.slideDown();
            $callbackBody.addClass('moto-widget-callback__body_more-details-opened');
        }
    }


    $openButton.click(function() {
        openCallback();
    });


    $closeButton.click(function() {
        closeCallback();
    });

    $moreDetailsButton.click(function() {
        toggleModeDetails();
    });






    $('.customer-logos').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        arrows: false,
        dots: false,
        pauseOnHover: false,
        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 4
            }
        }, {
            breakpoint: 520,
            settings: {
                slidesToShow: 3
            }
        }]
    });
});




$(".moto-widget-menu-toggle-btn").click(function(){
    var $this = $(this);
    if($this.data('clicked')) {
        $this.data('clicked', false);
        $("#wid_1529048814_11lc8jp4u" ).removeClass("moto-spacing-left-auto moto-widget-menu-mobile-open");

    }
    else {
        $this.data('clicked', true);
        $("#wid_1529048814_11lc8jp4u" ).addClass("moto-spacing-left-auto moto-widget-menu-mobile-open");
    }
});
