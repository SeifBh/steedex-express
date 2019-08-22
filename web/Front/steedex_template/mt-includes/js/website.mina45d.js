'use strict';
/* Source: src/mt-includes/js/src/core/analytics/GoogleAnalytics/init.js*/
angular.module('website.core.analytics.google', ['website.core.analytics']).provider('MotoGoogleAnalyticsService', [
    'MotoWebsiteAnalyticsProvider',
    function(MotoWebsiteAnalyticsProvider) {
        var AbstractClass = MotoWebsiteAnalyticsProvider.getAbstractTrackingService();
        var debug = false;

        this.$get = [
            '$q',
            function($q) {

                function getTracker() {
                    return window['ga'];
                }

                /**
                 * @extends AbstractTrackingServiceClass
                 * @constructor
                 */
                function GoogleAnalyticsService() {
                    AbstractClass.apply(this, arguments);
                }

                GoogleAnalyticsService.prototype = Object.create(AbstractClass.prototype);
                GoogleAnalyticsService.prototype.constructor = GoogleAnalyticsService;

                /** @inheritdoc */
                GoogleAnalyticsService.prototype.getName = function() {
                    return 'GoogleAnalytics';
                };

                /** @inheritdoc */
                GoogleAnalyticsService.prototype.fireEvent = function(name, params, force) {
                    var deferred = $q.defer();
                    var tracker = getTracker();
                    var data = {};

                    if (!tracker) {
                        debug && console.warn('Tracker not found');

                        return false;
                    }
                    if (!angular.isString(name) || name.length < 1) {
                        debug && console.warn('Bad name', name);

                        return false;
                    }
                    if (!angular.isObject(params)) {
                        debug && console.warn('Bad params', params);

                        return false;
                    }
                    if (angular.isUndefined(params['category']) || !angular.isString(params['category']) || params['category'].length < 1) {
                        debug && console.warn('Bad params.category', params['category']);

                        return false;
                    }
                    data.eventCategory = params['category'];

                    data.eventAction = name;
                    if (angular.isString(params['action']) && params['action'].length > 1) {
                        data.eventAction = params['action'];
                    }

                    if (angular.isString(params['label']) && params['label'].length > 0) {
                        data.eventLabel = params['label'];
                    }
                    if (angular.isNumber(params['value'])) {
                        data.eventValue = params['value'];
                    }

                    if (force) {
                        data.transport = 'beacon';
                    }
                    data.hitCallback = function() {
                        debug && console.log('data.hitCallback()');
                        deferred.resolve(true);
                    };
                    debug && console.log('Send event', angular.copy(data));
                    tracker('send', 'event', data);

                    return deferred.promise;
                };

                return new GoogleAnalyticsService();
            }
        ];

        return this;
    }
]);/* Source: src/mt-includes/js/src/core/analytics/init.js*/
/**
 * @example
 * MotoWebsiteAnalytics.fireEvent('testAction', {category: 'testCategory'}).then(function(response) {
 *     console.log('fireEvent done', response);
 * });
 */
angular.module('website.core.analytics', [
    'ng'
]).provider('MotoWebsiteAnalytics', [
    function() {
        var provider = this;
        var _options = {
            maxTimeout: 1500
        };
        var trackingServices = [];
        var debug = false;

        /**
         * @class AbstractTrackingServiceClass
         * @constructor
         */
        function AbstractTrackingServiceClass() {

        }

        AbstractTrackingServiceClass.prototype = {};

        /**
         * Return service name
         *
         * @returns {string}
         */
        AbstractTrackingServiceClass.prototype.getName = function() {
            console.warn('Method "getName" not implemented', this);

            return '';
        };

        /**
         * Fire event to tracking system
         *
         * @returns {Promise|*}
         */
        AbstractTrackingServiceClass.prototype.fireEvent = function() {
            console.warn('Method "fireEvent" not implemented', this);

            return null;
        };

        /**
         * Return abstract tracking service class
         *
         * @returns {AbstractTrackingServiceClass}
         */
        provider.getAbstractTrackingService = function() {
            return AbstractTrackingServiceClass;
        };

        /**
         * Register tracking system on 'config' level
         *
         * @param {string|array|function|object} service
         * @returns {boolean}
         */
        provider.registerTrackingService = function(service) {
            if (trackingServices.indexOf(service) > -1) {
                return false;
            }

            trackingServices.push(service);

            return true;
        };

        /**
         * Set option value without dot notation
         *
         * @param {string} name
         * @param {*} value
         * @returns {boolean}
         */
        provider.setOption = function(name, value) {
            if (!angular.isString(name)) {
                return false;
            }
            _options[name] = value;

            return true;
        };

        /**
         * Get option value without dot notation
         *
         * @param {string} name
         * @param {*} defaultValue
         * @returns {*}
         */
        provider.getOption = function(name, defaultValue) {
            if (angular.isUndefined(_options[name])) {
                return defaultValue || null;
            }

            return _options[name];
        };

        provider.$get = [
            '$injector',
            '$q',
            '$timeout',
            function($injector, $q, $timeout) {
                /**
                 * @type {WebsiteAnalyticsService}
                 */
                var websiteService;
                var i;
                var len;
                var service;
                var serviceInstance = null;

                /**
                 * @class WebsiteAnalyticsService
                 * @constructor
                 */
                function WebsiteAnalyticsService() {
                    this._services = {};
                }

                WebsiteAnalyticsService.prototype = {};

                /**
                 * Internal tracking system
                 *
                 * @type {object}
                 * @private
                 */
                WebsiteAnalyticsService.prototype._services = {};

                /**
                 * Add new tracker service
                 *
                 * @param {AbstractTrackingServiceClass} service
                 * @param {string} [name]
                 * @returns {boolean}
                 */
                WebsiteAnalyticsService.prototype.addTrackingService = function(service, name) {

                    if (!(serviceInstance instanceof AbstractTrackingServiceClass)) {
                        console.warn('Tracking service must be instance of AbstractTrackingServiceClass');
                        console.log('Service : ', service);
                        console.log('Name : ', name);

                        return false;
                    }

                    if (!angular.isString(name)) {
                        name = service.getName();
                    }
                    if (!angular.isString(name)) {
                        console.warn('Tracking service name must be a string');

                        return false;
                    }

                    name = name.trim();
                    if (name.length < 1) {
                        console.warn('Tracking service name is empty');

                        return false;
                    }

                    if (this.hasService(name)) {
                        console.warn('Tracking service "' + name + '" already registered');

                        return false;
                    }

                    this._services[name] = service;

                    return true;
                };

                /**
                 * Return tracking service by name
                 * @param {string} name
                 * @returns {AbstractTrackingServiceClass|null}
                 */
                WebsiteAnalyticsService.prototype.getService = function(name) {
                    return this._services[name] || null;
                };

                /**
                 * Check is tracking service already registered
                 *
                 * @param {string} name
                 * @returns {boolean}
                 */
                WebsiteAnalyticsService.prototype.hasService = function(name) {
                    return angular.isDefined(this._services[name]);
                };

                /**
                 * Fire event to tracking service
                 *
                 * @param {string|object} name
                 * @param {object} params
                 * @param {string} params.category
                 * @param {string} params.action
                 * @param {string} [params.label]
                 * @param {int} [params.value]
                 * @param {boolean} force Try to send by 'beacon' transport
                 * @returns {IPromise<T>}
                 */
                WebsiteAnalyticsService.prototype.fireEvent = function(name, params, force) {
                    var timer;
                    var serviceName;
                    var deferred = $q.defer();
                    var queue = {};
                    var resolved = false;
                    var now = new Date();

                    if (angular.isObject(name)) {
                        force = params;
                        params = name;
                        name = params.action;
                    }

                    for (serviceName in this._services) {
                        if (!this._services.hasOwnProperty(serviceName)) {
                            continue;
                        }
                        try {
                            queue[serviceName] = this._services[serviceName].fireEvent(name, angular.copy(params), force);
                        } catch (e) {
                            console.warn('Cant fire event by service', serviceName);
                            console.error(e);
                        }
                    }

                    function resolveQueue(response) {
                        debug && console.log('RESOLVED after', new Date() - now, response);
                        if (timer) {
                            $timeout.cancel(timer);
                        }
                        if (!resolved) {
                            resolved = true;
                            deferred.resolve(true);
                        }
                    }

                    $q.all(queue).then(
                        resolveQueue,
                        function() {
                            if (!resolved) {
                                resolved = true;
                                deferred.reject(false);
                            }
                        }
                    );

                    // create timer for force resolve promises queue
                    timer = $timeout(function() {
                        resolveQueue('TIMER');
                    }, provider.getOption('maxTimeout', 1000));

                    return deferred.promise;
                };

                // live up & register tracking services
                websiteService = new WebsiteAnalyticsService();
                for (i = 0, len = trackingServices.length; i < len; i++) {
                    serviceInstance = null;
                    service = trackingServices[i];
                    try {
                        // use string for autoload by .service or .factory
                        if (angular.isString(service)) {
                            if ($injector.has(service)) {
                                serviceInstance = $injector.get(service);
                                // for factory
                                if (angular.isFunction(serviceInstance)) {
                                    serviceInstance = new serviceInstance();
                                }
                            } else {
                                console.warn('Service or Factory "', service, '" not found');
                            }
                            // using array notation for injector
                        } else if (angular.isArray(service)) {
                            serviceInstance = $injector.invoke(service);
                        } else if (angular.isFunction(service)) {
                            serviceInstance = new service();
                        } else if (angular.isObject(service)) {
                            serviceInstance = service;
                        }
                    } catch (e) {
                        console.warn('Cant register tracking service by', service);
                        console.error(e);
                        continue;
                    }

                    websiteService.addTrackingService(serviceInstance);
                }

                return websiteService;
            }
        ];

        return provider;
    }
]);/* Source: src/mt-includes/js/src/core/animation/init.js*/
angular.module('website.core.animation', []);/* Source: src/mt-includes/js/src/core/entertainment/init.js*/
angular.module('website.core.entertainment', [
    'website.core.animation'
]);/* Source: src/mt-includes/js/src/core/form/init.js*/
angular.module('website.core.form', ['ng']);
/* Source: src/mt-includes/js/src/core/humanize_duration/init.js*/
angular.module('website.core.humanize_duration', []);
/* Source: src/mt-includes/js/src/core/init.js*/
angular.module('website.core.settings', ['ng']);
angular.module('website.core.dependency', [
    'website.core.settings',
    'website.core.utils',
    'website.LiveChat',
    'website.core.animation',
    'website.core.entertainment',
    'website.core.media',
    'website.core.widgets',
    'website.core.analytics'
]);
/* Source: src/mt-includes/js/src/core/media/init.js*/
angular.module('website.core.media', []);/* Source: src/mt-includes/js/src/core/utils/init.js*/
angular.module('website.core.utils', []).provider('MotoUtils', [
    function() {
        var provider = this;

        /**
         * Return value of target object using "dot" notation.
         *
         * @param {Object} target Target object
         * @param {String|Number} path Key path of a value
         * @param {*} defaultValue Default value if key not exists
         * @returns {*} Return value of defaultValue if key not exists
         * @private
         */
        provider.getValue = function(target, path, defaultValue) {
            var i;
            var value;
            var len;
            var keys;

            if (angular.isNumber(path)) {
                if (isNaN(path)) {
                    return defaultValue;
                }
                path += '';
            }

            if (!angular.isString(path) || path.length < 1) {
                return defaultValue;
            }

            // for source['a.b']
            if (angular.isDefined(target[path])) {
                return target[path];
            }

            keys = path.split('.');

            try {
                value = target;
                for (i = 0, len = keys.length; i < len; i++) {
                    if (angular.isDefined(value)) {
                        value = value[keys[i]];
                    }
                }
                if (angular.isDefined(value)) {
                    return value;
                }
            } catch (ignored) {
            }

            return defaultValue;
        };

        provider.$get = function() {
            return provider;
        };

        return provider;
    }
]);
/* Source: src/mt-includes/js/src/core/widgets/init.js*/
angular.module('website.core.widgets', [
    'website.core.animation',
    'website.core.entertainment'
]);/* Source: src/mt-includes/js/src/init.js*/
// frontend application module
angular.module('website', [
    'core.library.config',
    'core.library.jsonrpc',
    'website.core',
    'website.widgets',
    'website.plugins',
    'website.moto_link',
    'moto.validation',
    'ngStorage',
    'ipCookie'
])
.config([
    '$compileProvider',
    '$httpProvider',
    '$localStorageProvider',
    function($compileProvider, $httpProvider, $localStorageProvider) {
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.useApplyAsync(true);
        $localStorageProvider.setDeserializer(function(value) {
            try {
                if (angular.isString(value) && value.length && (value[0] === '{' || value[0] === '[')) {
                    return angular.fromJson(value);
                }

                return value;
            } catch (e) {
                return null;
            }
        });
        $localStorageProvider.setKeyPrefix('mf_');
    }
])
.value('currentFrontendSession', {})
.run([
    'jsonrpc',
    'website.MotoStorageService',
    'website.MotoPopupService',
    'currentFrontendSession',
    'MotoScrollbarWatcherService',
    function(jsonrpc, MotoStorageService, MotoPopupService, currentFrontendSession, MotoScrollbarWatcherService) {
        //@TODO: add website address
        if (window.websiteConfig && window.websiteConfig.apiUrl) {
            jsonrpc.setBasePath(websiteConfig.apiUrl);
        } else {
            jsonrpc.setBasePath('/api.php');
        }

        if (!MotoStorageService.getCookie('session-started')) {
            MotoStorageService.setCookie('session-started', Date.now());
            currentFrontendSession.isNew = true;
        }
        MotoPopupService.init();
        MotoScrollbarWatcherService.addWatcher(function() {
            // we must use original events here (not synthetic)
            var resizeEvent = window.document.createEvent('UIEvents');

            resizeEvent.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(resizeEvent);
        }, angular.element('html')[0]);
    }
]);

// frontend widgets logic
angular.module('website.widgets', [
    'website.widgets.templates',
    'website.widget.contact_form',
    'website.widget.mail_chimp',
    'website.widget.auth_form',
    'website.widget.slider',
    'website.widget.grid_gallery',
    'website.widget.carousel',
    'website.widget.disqus',
    'website.widget.facebook_page_plugin',
    'website.widget.twitter',
    'website.widget.pinterest',
    'website.widget.menu',
    'website.widget.audio_player',
    'website.widget.video_player',
    'website.widget.social_buttons',
    'website.widget.countdown',
    'website.widget.accordion',
    'website.widget.tabs',
    'website.widget.actions',
    'website.widget.instagram.post',
    'website.widget.google_map_pro',
    'website.widget.google_recaptcha',
    'website.widget.integrations',
    'website.widget.MotoCallback',
    'website.widget.content_slider',
    'website.widget.google_search',
    'website.widget.tile_gallery'
]);
try {
    angular.module('website.plugins');
} catch (e) {
    angular.module('website.plugins', []);
}
try {
    angular.module('website.widgets.templates');
} catch (e) {
    angular.module('website.widgets.templates', []);
}
angular.module('website.core', [
    'website.core.settings',
    'website.core.dependency',
    'website.core.analytics.google',
    'website.core.form',
    'website.core.humanize_duration'
]);

// init website settings
angular.module('website.core').config([
    'motoWebsiteSettingsServiceProvider',
    'MotoWebsiteAnalyticsProvider',
    function(WebsiteSettingsServiceProvider, MotoWebsiteAnalyticsProvider) {
        if (window.websiteConfig && angular.isObject(window.websiteConfig)) {
            WebsiteSettingsServiceProvider.set(window.websiteConfig);
        }
        MotoWebsiteAnalyticsProvider.registerTrackingService('MotoGoogleAnalyticsService');
    }
]);

// if not preview mode init WOW and stellar
if (!$('body').hasClass('moto-preview')) {
    $(document).ready(function() {
        // hopefully temporary solution for disabling parallax on mobile devices and tablets
        function isWindowSizeOkForParallax() {
            return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) >= 1040;
        }

        function initParallax() {
            $(window).stellar({
                horizontalScrolling: false,
                verticalScrolling: true,
                responsive: true
            });
        }

        function reInitParallax() {
            if (!isWindowSizeOkForParallax()) {
                $(window).stellar('destroy');
                $('.moto-parallax').css('background-position', '');

                return;
            }

            // Disable reinit in IE and Edge because of performance issues (we should fix the library)
            if (window.navigator.userAgent.indexOf('Trident/') === -1 && window.navigator.userAgent.indexOf('Edge/') === -1) {
                // call destroy only if user browser is not Edge or Internet Explorer
                $(window).stellar('destroy');
            }

            initParallax();
        }

        if (isWindowSizeOkForParallax()) {
            initParallax();
        }

        // hopefully temporary solution for fix parallax issue with image lazyloading
        $(document).on('lazybeforeunveil', '.lazyload', function(e) {
            $(e.target).one('load', reInitParallax);
        });

        $(window).on('resize', reInitParallax);

        // enable lazysizes preload after load functionality if lazy loading was disabled
        if (window.websiteConfig && window.websiteConfig.lazy_loading && !window.websiteConfig.lazy_loading.enabled) {
            window.lazySizesConfig.preloadAfterLoad = true;
        }
    });
}
/* Source: src/mt-includes/js/src/live_chat/init.js*/
angular.module('website.LiveChat', [
    'website.core.utils',
    'website.LiveChat.settings'
]);
/* Source: src/mt-includes/js/src/moto_link/init.js*/
angular.module('website.moto_link', ['website.backend.RenderService']);
/* Source: src/mt-includes/js/src/moto_validation/init.js*/
angular.module('moto.validation', []);
/* Source: src/mt-includes/js/src/rendering/init.js*/
angular.module('website.backend.RenderService', ['core.library.jsonrpc']);/* Source: src/mt-includes/js/src/back_to_top_button/BackToTopButtonDirective.js*/
/**
 * <moto-back-to-top-button></moto-back-to-top-button>
 */
angular.module('website')
    .directive('motoBackToTopButton', ['$window', function($window) {
        var settings = window.websiteConfig && window.websiteConfig.back_to_top_button || {};

        settings.enabled = settings.type !== 'none';
        settings.topOffset = parseInt(settings.topOffset) || 300;
        settings.animationTime = parseInt(settings.animationTime) || 500;
        settings.cssVisibleClass = 'moto-back-to-top-button_visible';
        settings.cssAnimationClass = 'animated';

        return {
            restrict: 'EA',
            link: function($scope, $element) {
                var _window = angular.element($window);
                var isVisible = null;
                var temp = null;

                // Go to page top
                $scope.toTop = function() {
                    try {
                        $('body,html').animate({
                            scrollTop: 0
                        }, settings.animationTime);
                    } catch (e) {}
                };

                // Callback handler for window scroll
                function onScroll() {
                    $element.removeAttr('style');
                    try {
                        temp = (_window.scrollTop() > settings.topOffset);
                        //ng-class is slowly => using temp var and css animation
                        if (temp !== isVisible) {
                            isVisible = temp;
                            if (isVisible) {
                                $element.addClass(settings.cssVisibleClass);
                                $element.addClass(settings.cssAnimationClass);
                            } else {
                                $element.removeClass(settings.cssVisibleClass);
                                $element.addClass(settings.cssAnimationClass);
                            }
                        }
                    } catch (e) {}
                }

                if (settings.enabled) {
                    _window.scroll(onScroll);
                }

            }
        };
    }]);
/* Source: src/mt-includes/js/src/before_viewport/directive.js*/
/**
 * Directive motoBeforeInViewport
 *
 * All elements with class 'moto-before-in-viewport' will be watched by directive.
 * As soon as they will be visible in viewport this class will be removed.
 *
 * Directive can work in several modes:
 *     'part' - (default) element is visible if at least one pixel in viewport
 *     'full' - element is visible if at all pixels in viewport. ATTENTION: in this mode element can be never visible if it`s very high or viewport is small
 * To set mode use attribute 'moto-before-in-viewport-mode'.
 *
 * @example
 *
 * <div class="moto-widget moto-widget-any moto-before-in-viewport"></div>
 * <div class="moto-widget moto-widget-any moto-before-in-viewport" moto-before-in-viewport-on-enter="openPopup()"></div>
 * <div class="moto-widget moto-widget-any moto-before-in-viewport" moto-before-in-viewport-watch-always="1" moto-before-in-viewport-on-leave="stop()" moto-before-in-viewport-on-enter="play()"></div>
 * <div class="moto-widget moto-widget-any moto-before-in-viewport" moto-before-in-viewport-watch-always="1"></div>
 * <div class="moto-widget moto-widget-any moto-before-in-viewport" moto-before-in-viewport-mode="full"></div>
 * <div class="moto-widget moto-widget-any moto-before-in-viewport" moto-before-in-viewport-mode="part"></div>
 */

angular.module('website')
    .directive('motoBeforeInViewport', [
        'motoBeforeInViewport',
        function(motoBeforeInViewport) {
            return {
                restrict: 'C',
                link: function($scope, $element, $attrs) {
                    var newItem = {};

                    newItem.element = $element;
                    newItem.$scope = $scope;
                    newItem.onEnter = $attrs.motoBeforeInViewportOnEnter;
                    newItem.onLeave = $attrs.motoBeforeInViewportOnLeave;
                    newItem.visibilityMode = $attrs.motoBeforeInViewportMode;
                    newItem.watchAlways = angular.isDefined($attrs.motoBeforeInViewportWatchAlways) ? $attrs.motoBeforeInViewportWatchAlways : $element.closest('.moto-widget_interactive').length > 0;

                    motoBeforeInViewport.startWatching(newItem);
                }
        };
    }]);
/* Source: src/mt-includes/js/src/before_viewport/service.js*/
/**
 * Service motoBeforeInViewport
 *
 * Features:
 *     - visibilityMode:
 *          'part' - (default) element is visible if at least one pixel in viewport
 *          'full' - element is visible if at all pixels in viewport. ATTENTION: in this mode element can be never visible if it`s very high or viewport is small
 *     - watchAlways - flag which tell that watcher shouldn't be removed when element got in viewport
 *     - onEnter/onLeave - angularjs expressions or functions, which will be executed when element leave/enter in viewport
 *
 */

angular.module('website')
    .service('motoBeforeInViewport', [
        function() {
            /**
             * @typedef {Object} WatchingItem
             * @property {jQuery} element - $element will be watched
             * @property {String} visibilityMode - mode which will be used to check if element is visible
             * @property {Boolean} watchAlways - flag which tell that watcher shouldn't be removed when element got in viewport
             * @property {Boolean} wasInViewport - flag which tell if was element visible in previous scroll tick
             * @property {Object} $scope - angular scope object
             * @property {String|Function} onEnter - angularjs expression or function, which will be executed when element get in viewport
             * @property {String|Function} onLeave - angularjs expression or function, which will be executed when element leave from viewport
             */
            /**
             * Array of object that hold information about all current watched elements
             * @type {WatchingItem[]}
             */
            var watchingItems = [];
            var $windowObject = $(window);
            var debug = false;
            var blockThrottle = false;
            var wasBlockedThrottle = false;
            var THROTTLE_DELAY = 100;
            var INVISIBLE_CONTENT_CLASS = 'moto-before-in-viewport_content-invisible';
            var WIDGET_LOADING_CLASS = 'moto-widget__state_loading';

            /**
             * Check if element is visible in viewport. Can work in several modes.
             *
             * @param  {WatchingItem} item - checking item
             * @returns {Boolean} - true if visible
             */
            function isElementInViewport(item) {
                var viewportTop = $windowObject.scrollTop();
                var viewportBottom = viewportTop + $windowObject.height();
                var elementTop = item.element.offset().top;
                var elementBottom = elementTop + item.element.outerHeight();

                if (item.element.closest('.' + INVISIBLE_CONTENT_CLASS + ', .' + WIDGET_LOADING_CLASS).length > 0) {
                    return false;
                }

                if (!item.element.filter(':visible').length) {
                    return false;
                }

                if (item.visibilityMode === 'part') {
                    return !((elementBottom < viewportTop) || (elementTop > viewportBottom));
                } else if (item.visibilityMode === 'full') {
                    return (elementTop >= viewportTop) && (elementBottom <= viewportBottom);
                }

                debug && console.error('motoBeforeInViewport : unexpected visibilityMode', item.visibilityMode);

                return true;
            }

            /**
             * Calls when item get in viewport
             *
             * @param {WatchingItem} item - item shown
             * @returns {Boolean} - return true if element was removed from watching list
             */
            function itemGotInViewport(item) {
                debug && console.log('motoBeforeInViewport: item get in viewport', item);

                item.element.removeClass('moto-before-in-viewport');
                item.element.addClass('moto-after-in-viewport');

                if (angular.isString(item.onEnter)) {
                    item.$scope.$eval(item.onEnter);
                } else if (angular.isFunction(item.onEnter)) {
                    item.onEnter();
                }

                if (!item.watchAlways) {
                    stopWatching(item);

                    return true;
                } else {
                    item.wasInViewport = true;

                    return false;
                }
            }

            /**
             * Calls for every scroll tick
             */
            function scrollHandler() {
                if (blockThrottle) {
                    wasBlockedThrottle = true;

                    return;
                }
                checkElements();
                blockThrottle = true;
                wasBlockedThrottle = false;
                setTimeout(function() {
                    blockThrottle = false;
                    if (wasBlockedThrottle) {
                        scrollHandler();
                    }
                }, THROTTLE_DELAY);
            }

            /**
             * Remove item from list and remove watcher if this was the last item
             *
             * @param {WatchingItem} item - item to remove
             */
            function stopWatching(item) {
                var itemIndex = watchingItems.indexOf(item);

                if (itemIndex === -1) {
                    return;
                }

                watchingItems.splice(itemIndex, 1);

                debug && console.log('motoBeforeInViewport: removed', watchingItems);

                if (watchingItems.length === 0) {
                    debug && console.info('motoBeforeInViewport: last element removed, unbind scroll handler');
                    $windowObject
                        .off('resize', scrollHandler)
                        .off('scroll', scrollHandler);
                }
            }

            /**
             * Calls when item leave viewport
             *
             * @param {WatchingItem} item - item leaved
             */
            function itemLeaveFromViewport(item) {
                debug && console.log('motoBeforeInViewport: item leave frome viewport', item);

                item.element.removeClass('moto-after-in-viewport');
                item.element.addClass('moto-before-in-viewport');
                item.wasInViewport = false;

                if (angular.isString(item.onLeave)) {
                    item.$scope.$eval(item.onLeave);
                } else if (angular.isFunction(item.onLeave)) {
                    item.onLeave();
                }
            }

            /**
             * Check all elements in watching list
             */
            function checkElements() {
                var i;

                for (i  = 0; i < watchingItems.length; i++) {
                    if (isElementInViewport(watchingItems[i])) {
                        if (!watchingItems[i].wasInViewport) {
                            if (itemGotInViewport(watchingItems[i])) {
                                i--;
                            }
                        }
                    } else {
                        if (watchingItems[i].wasInViewport) {
                            itemLeaveFromViewport(watchingItems[i]);
                        }
                    }
                }
            }

            /**
             * Add item in list and add watcher if this was the first item
             *
             * @param {WatchingItem} item - item to remove
             */
            function startWatching(item) {
                if (!angular.isObject(item.element)) {
                    return;
                }

                item.visibilityMode = item.visibilityMode || 'part';
                item.watchAlways = item.watchAlways || false;

                item.wasInViewport = isElementInViewport(item);
                if (item.wasInViewport) {
                    itemGotInViewport(item);

                    if (!item.watchAlways) {
                        return;
                    }
                }

                watchingItems.push(item);

                debug && console.log('motoBeforeInViewport: added', watchingItems);

                if (watchingItems.length === 1) {
                    debug && console.info('motoBeforeInViewport: first element added, bind scroll handler');
                    $windowObject
                        .on('resize', scrollHandler)
                        .on('scroll', scrollHandler);
                }
            }

            function elementIsVisible($element) {
                $element.removeClass(INVISIBLE_CONTENT_CLASS);
                scrollHandler();
            }

            function elementIsInvisible($element) {
                $element.addClass(INVISIBLE_CONTENT_CLASS);
                scrollHandler();
            }

            this.startWatching = startWatching;
            this.stopWatching = stopWatching;
            this.elementIsVisible = elementIsVisible;
            this.elementIsInvisible = elementIsInvisible;
        }]);
/* Source: src/mt-includes/js/src/browser_tab_closing_confirmation/service.js*/
angular.module('website').service('website.BrowserTabClosingConfirmation', [
    function() {
        var usedByWidgets = [];

        function beforeUnloadHandler() {
            return '';
        }

        this.enable = function(item) {
            if (!angular.isString(item)) {
                return;
            }

            usedByWidgets.push(item);

            if (usedByWidgets.length === 1) {
                angular.element(window).on('beforeunload', beforeUnloadHandler);
            }
        };

        this.disable = function(item) {
            if (!angular.isString(item)) {
                return;
            }

            var itemIndex = usedByWidgets.indexOf(item);

            if (itemIndex === -1) {
                return;
            }

            usedByWidgets.splice(itemIndex, 1);

            if (usedByWidgets.length === 0) {
                angular.element(window).off('beforeunload', beforeUnloadHandler);
            }
        }
    }
]);
/* Source: src/mt-includes/js/src/core/animation/MotoAnimation.js*/
/* globals WOW */
/**
 * @TODO : force start animation if object not visible by view port
 * @TODO : clean 'this.all & this.boxes' for allow repeating animation
 *      or fill this.boxes by element
 */
angular.module('website.core.animation').provider('website.MotoAnimation', [
    function() {
        var provider = this;
        var instance;
        var debug = false;
        var isWOW130 = null;
        var _options = {
            disabledClass: 'moto-entertainment__animation_disabled',
            ignoreVisibilityClass: 'moto-entertainment__animation_ignore-visibility'
        };

        /**
         * Set options for Animation service
         *
         * @param {Object} options
         * @returns {boolean}
         */
        provider.setOptions = function(options) {
            if (angular.isObject(options)) {
                angular.extend(_options, options);

                return true;
            }

            return false;
        };

        /**
         * Find elements by selector with add self element if them has selector
         *
         * @param {jQuery} $element
         * @param {string} selector
         * @returns {jQuery}
         */
        function findElements($element, selector) {
            var elements;

            elements = $element.find('.' + selector);
            if ($element.hasClass(selector)) {
                elements.push($element.get(0));
            }

            return elements;
        }

        /**
         * @constructor
         * @extends WOW
         */
        function WOWExtended() {
            WOW.apply(this, arguments);
            isWOW130 = angular.isDefined(this.config['resetAnimation']);

            debug && console.info('MotoAnimation : WOW engine is : ', isWOW130 ? '1.3.0' : '1.1.2');
        }

        WOWExtended.prototype = Object.create(WOW.prototype);
        WOWExtended.prototype.constructor = WOWExtended;

        /**
         * Flag for WOW engine started
         *
         * @type {boolean}
         * @private
         */
        WOWExtended.prototype._inited = false;

        /**
         * Enable debug mode
         *
         * @TODO : remove
         * @param mode
         * @dev
         */
        WOWExtended.prototype.debugMode = function(mode) {
            debug = mode;
        };

        /**
         * Dump to console current list of founded elements
         *
         * @TODO : remove
         * @dev
         */
        WOWExtended.prototype.dump = function() {
            console.info('DUMP');
            console.log('   this.all', this.all.length, this.all);
            console.log('   this.boxes', this.boxes.length, this.boxes);
        };

        /**
         * Force checking is need start animation elements on next tick
         *
         * @TODO : rename
         */
        WOWExtended.prototype.pingPong = function() {
            debug && console.log('MotoAnimation : PingPong');
            this.scrollHandler();
        };

        /**
         * Found all elements with animation and force pushing them to list
         *
         * @TODO : rename
         * @param {jQuery} $element
         * @returns {boolean}
         */
        WOWExtended.prototype.forceSyncElements = function($element) {
            var elements;

            if (!this._inited) {
                debug && console.warn('MotoAnimation : WOW engine not started');

                return false;
            }

            elements = findElements($element, this.config.boxClass);
            debug && console.log('MotoAnimation : forceSync, found', elements.length);

            if (!elements.length) {
                return true;
            }
            elements.each(function(index, box) {
                if (this.boxes.indexOf(box) < 0) {
                    this.boxes.push(box);
                    this.applyStyle(box, true);
                }
            }.bind(this));

            return true;
        };

        /**
         * Find all animated elements and reset styles for stops current animation
         *
         * @param {jQuery} $element
         * @returns {boolean}
         * @constructor
         */
        WOWExtended.prototype.RENAMEResetStyle = function($element) {
            var elements;

            if (!this._inited) {
                debug && console.warn('MotoAnimation : WOW engine not started');

                return false;
            }

            elements = findElements($element, this.config.boxClass);
            debug && console.log('MotoAnimation : RENAMEResetStyle, found', elements.length);

            if (!elements.length) {
                return true;
            }

            elements.each(function(index, element) {
                this.applyStyle(element, true);
            }.bind(this));

            return true;
        };

        /**
         * Disable animation on element and children nodes
         *
         * @param element
         */
        WOWExtended.prototype.disableByElement = function(element) {
            debug && console.log('MotoAnimation : disableByElement', element);
            $(element).addClass(_options.disabledClass);
        };

        /**
         * Remove disabling animation on element and children nodes
         *
         * @param element
         */
        WOWExtended.prototype.enableByElement = function(element) {
            debug && console.log('MotoAnimation : enableByElement', element);
            $(element).removeClass(_options.disabledClass);
        };

        /**
         * Check is element are visible on browser
         *
         * @param {HTMLElement} element
         * @returns {boolean}
         */
        WOWExtended.prototype.isVisible = function(element) {
            var $element = $(element);

            try {
                if ($element.hasClass(_options.disabledClass) || $element.closest('.' + _options.disabledClass).length) {
                    return false;
                }
                if ($element.hasClass(_options.ignoreVisibilityClass) || $element.closest('.' + _options.ignoreVisibilityClass).length) {
                    return true;
                }
                if ($element.closest('.moto-popup_content').length) {
                    return true;
                }
            } catch (e) {
            }

            return WOW.prototype.isVisible.call(this, element);
        };

        /**
         * Init website animation
         *
         * @param {boolean} force
         * @returns {boolean}
         */
        WOWExtended.prototype.init = function(force) {
            var result;

            if (force) {
                debug && console.log('MotoAnimation : init WOW');

                result = WOW.prototype.init.call(this);
                this._inited = true;

                debug && console.log('MotoAnimation : WOW started');

                return result;
            }

            return false;
        };

        instance = new WOWExtended({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: true,
            live: true,
            callback: null
        });

        // same logic as was on init.js
        $(document).ready(function() {
            instance.init(true);
        });

        this.$get = [
            function() {
                return instance;
            }
        ];

        return provider;
    }
]);
/* Source: src/mt-includes/js/src/core/DependencyDirective.js*/
angular.module('website.core.dependency')
    .directive('motoDependencyRequire', ['motoDependencyService', function (DependencyService) {

        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var required = $attrs.motoDependencyRequire,
                    value = required;
                try {
                    value = $scope.$eval(value);
                    if (angular.isUndefined(value)) {
                        value = required;
                    }
                } catch (e) {
                    value = required;
                }
                if (angular.isFunction(value)) {
                    value = value();
                }

                DependencyService.require(value);

            }
        };

    }]);
/* Source: src/mt-includes/js/src/core/DependencyService.js*/
angular.module('website.core.dependency')
    .provider('motoDependencyService', ['motoWebsiteSettingsServiceProvider', function (WebsiteSettingsService) {
        var self = this,
            $rootScope = null,
            service = {},
            $head = angular.element('head').get(0),
            $body = angular.element('body').get(0),
            items = {};

        function createQueryParams(params) {
            var parts = [];
            for (var i in params) {
                if (params[i].length > 0) {
                    parts.push(i + '=' + params[i]);
                }
            }

            return parts.join('&');
        }

        function getHeadElement() {
            return $head;
        }

        function getBodyElement() {
            return $body;
        }

        items = {
            disqus: {
                name: 'disqus',
                urlTemplate: '//{{shortname}}.disqus.com/embed.js',
                params: {},
                setParams: function (values) {
                    for (var i in values) {
                        if (values.hasOwnProperty(i)) {
                            this.setParam(i, values[i]);
                        }
                    }

                    return this;
                },
                getParams: function () {
                    return this.params;
                },
                setParam: function (name, value) {
                    this.params[name] = value;
                    if (value != '') {
                        window['disqus_' + name] = value;
                    }

                    return this;
                },
                getParam: function (name, def) {
                    if (!angular.isUndefined(this.params[name])) {
                        return this.params[name];
                    }
                    if (!angular.isUndefined(window['disqus_' + name])) {
                        return window['disqus_' + name];
                    }

                    return def;
                },
                getUrl: function () {
                    return this.urlTemplate
                        .replace(/\{\{shortname\}\}/gi, this.getParam('shortname'));
                },
                preInject: angular.noop,
                postInject: angular.noop,
                require: function () {
                    service.require(this.name);

                    return this;
                }
            },
            facebook: {
                name: 'facebook',
                scriptId: 'facebook-jssdk',
                urlTemplate: '//connect.facebook.net/{{language}}/sdk.js#{{params}}',
                language: 'en_US',
                getLanguage: function () {
                    return this.language;
                },
                setLanguage: function (language) {
                    return this.language = language;
                },
                getUrl: function () {
                    return this.urlTemplate
                        .replace(/\{\{language\}\}/gi, this.getLanguage())
                        .replace(/\{\{params\}\}/gi, createQueryParams(this.getParams()));
                },
                params: {
                    version: 'v2.8',
                    xfbml: '1',
                    appId: ''
                },
                setParams: function (values) {
                    for (var i in values) {
                        if (values.hasOwnProperty(i)) {
                            this.setParam(i, values[i]);
                        }
                    }

                    return this;
                },
                getParams: function () {
                    return this.params;
                },
                setParam: function (name, value) {
                    this.params[name] = value;

                    return this;
                },
                getParam: function (name, def) {
                    if (!angular.isUndefined(this.params[name])) {
                        return this.params[name];
                    }

                    return def;
                },
                preInject: function (instance) {
                    var fbRoot = document.getElementById('fb-root');
                    if (!fbRoot) {
                        fbRoot = document.createElement('div');
                        fbRoot.id = 'fb-root';
                        getBodyElement().appendChild(fbRoot);
                    }
                },
                postInject: angular.noop,
                require: function () {
                    service.require(this.name);

                    return this;
                }
            },
            twitter: {
                name: 'twitter',
                scriptId: 'twitter-wjs',
                url: '//platform.twitter.com/widgets.js',
                getUrl: function () {
                    return this.url;
                },
                params: {},
                setParams: function (values) {
                    for (var i in values) {
                        if (values.hasOwnProperty(i)) {
                            this.setParam(i, values[i]);
                        }
                    }

                    return this;
                },
                getParams: function () {
                    return this.params;
                },
                setParam: function (name, value) {
                    this.params[name] = value;

                    return this;
                },
                getParam: function (name, def) {
                    if (!angular.isUndefined(this.params[name])) {
                        return this.params[name];
                    }

                    return def;
                },
                preInject: angular.noop,
                postInject: angular.noop,
                require: function () {
                    service.require(this.name);

                    return this;
                }
            },
            pinterest: {
                name: 'pinterest',
                scriptUrl: "//assets.pinterest.com/js/pinit.js",
                getUrl: function () {
                    return this.scriptUrl;
                },
                preInject: angular.noop,
                postInject: angular.noop,
                require: function () {
                    service.require(this.name);

                    return this;
                }
            },
            linkedin: {
                name: 'linkedin',
                scriptUrl: '//platform.linkedin.com/in.js',
                getUrl: function() {
                    return this.scriptUrl;
                },
                preInject: function(instance) {
                    var preferredLocale = WebsiteSettingsService.get('preferredLocale', 'en_US');
                    var innerText = instance.innerText;

                    window._DependencyServiceOnLinkedInLoad = function() {
                        if ($rootScope) {
                            $rootScope.$emit('motoDependencyService.linkedin.loaded');
                        }
                        window._DependencyServiceOnLinkedInLoad = function() {
                        };
                    };
                    innerText += ' onLoad: _DependencyServiceOnLinkedInLoad\n';
                    if (preferredLocale) {
                        innerText += ' lang: ' + preferredLocale;
                    }
                    instance.textContent = innerText;
                },
                postInject: angular.noop,
                require: function() {
                    service.require(this.name);

                    return this;
                }
            },
            'instagram_post': {
                name: 'instagram_post',
                scriptUrl: 'https://www.instagram.com/embed.js',
                getUrl: function() {
                    return this.scriptUrl;
                },
                preInject: angular.noop,
                postInject: angular.noop,
                require: function() {
                    service.require(this.name);

                    return this;
                }
            },
            'airbnb_embed': {
                name: 'airbnb_embed',
                scriptUrl: '//airbnb.com/embeddable/airbnb_jssdk',
                getUrl: function() {
                    return this.scriptUrl;
                },
                preInject: angular.noop,
                postInject: angular.noop,
                require: function() {
                    service.require(this.name);

                    return this;
                }
            }
        };

        function require(name) {
            if (angular.isArray(name)) {
                angular.forEach(name, function(value) {
                    require(value);
                });

                return;
            }

            try {
                if (!items[name]) {
                    return false;
                }
                var item = items[name],
                    id = item.scriptId || 'connector_' + name,
                    instance = document.getElementById(id);
                if (instance) {
                    return;
                }
                instance = document.createElement('script');
                //@TODO : add attributes
                instance.id = id;
                instance.src = item.getUrl();
                instance.type = 'text/javascript';
                item.preInject(instance);
                getHeadElement().appendChild(instance);
                item.postInject(instance);

            } catch (e) {
                return false;
            }

            return true;
        }

        function getItem(name) {
            return items[name];
        }

        this.require = require;
        service.require = require;

        this.get = getItem;
        service.get = getItem;

        this.$get = [
            '$rootScope',
            function(_rootScope) {
                $rootScope = _rootScope;

                return service;
            }];
    }]);
/* Source: src/mt-includes/js/src/core/entertainment/MotoEntertainment.js*/
angular.module('website.core.entertainment').provider('website.Entertainment', [
    'website.MotoAnimationProvider',
    function(MotoAnimationProvider) {
        var provider = this;
        var CSS_CLASSES = {
            animationDisabled: 'moto-entertainment__animation_disabled',
            animationIgnoring: 'moto-entertainment__animation_ignore-visibility',
            videoDisabled: 'moto-entertainment__video_disabled', //@deprecated?
            playingDisabled: 'moto-entertainment__playing_disabled'
        };
        var ENTERTAINMENT_LETS_DANCE_EVENT = 'LetsDance';
        var ENTERTAINMENT_LETS_REST_EVENT = 'LetsRest';
        var ENTERTAINMENT_LETS_STOP_EVENT = 'LetsStop';

        /**
         * Check is target are scope
         *
         * @param {Object} target
         * @returns {boolean}
         */
        function isScope(target) {
            return !!(target && target.$evalAsync && target.$watch);
        }

        /**
         * Check is widget
         *
         * @param {Object} target
         * @returns {boolean}
         */
        function isWidget(target) {
            return !!(target && angular.isDefined(target.id) && target.$scope && target.$element);
        }

        this.$get = [
            'website.MotoAnimation',
            function(MotoAnimation) {

                function EntertainmentService() {

                }

                /**
                 * Return css classes for marking element some feature
                 *
                 * @param {string|string[]}name
                 * @returns {string|null}
                 */
                EntertainmentService.prototype.getCssClass = function(name) {
                    var result = null;

                    if (angular.isString(name)) {
                        result = CSS_CLASSES[name] || result;
                    } else if (angular.isArray(name)) {
                        result = '';
                        angular.forEach(CSS_CLASSES, function(value, key) {
                            if (name.indexOf(key) > -1) {
                                result += value + ' ';
                            }
                        });

                        result = result.trim();
                    }

                    return result;
                };

                /**
                 * Check is disabled playing
                 *
                 * @param {jQuery} $element
                 * @returns {boolean}
                 */
                EntertainmentService.prototype.isDisabledPlaying = function($element) {
                    return !this.isEnabledPlaying($element);
                };

                /**
                 * Check is enabled playing
                 *
                 * @param {jQuery} $element
                 * @returns {boolean}
                 */
                EntertainmentService.prototype.isEnabledPlaying = function($element) {
                    return !($element.hasClass(CSS_CLASSES.playingDisabled) || $element.closest('.' + CSS_CLASSES.playingDisabled).length);
                };

                /**
                 * Enable playing on widget or element
                 *
                 * @param {ContentWidgetClass|jQuery} target
                 * @returns {boolean}
                 */
                EntertainmentService.prototype.enablePlaying = function(target) {
                    if (isWidget(target)) {
                        target = target.$element;
                    }
                    if (!target || !target.removeClass) {
                        return false;
                    }
                    target.removeClass(CSS_CLASSES.playingDisabled);

                    return true;
                };

                /**
                 * Disable playing on widget or element
                 *
                 * @param {ContentWidgetClass|jQuery} target
                 * @returns {boolean}
                 */
                EntertainmentService.prototype.disablePlaying = function(target) {
                    if (isWidget(target)) {
                        target = target.$element;
                    }
                    if (!target || !target.addClass) {
                        return false;
                    }
                    target.addClass(CSS_CLASSES.playingDisabled);

                    return true;
                };

                /**
                 * Allow start animation on widgets
                 *
                 * @param {ContentWidgetClass} target
                 */
                EntertainmentService.prototype.letsStartAnimation = function(target) {
                    MotoAnimation.forceSyncElements(target.$content);
                    MotoAnimation.enableByElement(target.$content);
                    MotoAnimation.pingPong();
                };

                /**
                 * Block starting animation on widgets
                 *
                 * @param {ContentWidgetClass} target
                 */
                EntertainmentService.prototype.letsBlockAnimation = function(target) {
                    MotoAnimation.disableByElement(target.$content);
                };

                /**
                 * Stops animation on widgets
                 *
                 * @param {ContentWidgetClass} target
                 */
                EntertainmentService.prototype.letsStopAnimation = function(target) {
                    this.letsBlockAnimation(target);
                    MotoAnimation.RENAMEResetStyle(target.$content);
                };

                /**
                 * Start playing video
                 *
                 * @param {ContentWidgetClass} target
                 */
                EntertainmentService.prototype.letsDance = function(target) {
                    this.enablePlaying(target);
                    if (isWidget(target)) {
                        target = target.$scope;
                    }
                    if (isScope(target)) {
                        target.$broadcast(ENTERTAINMENT_LETS_DANCE_EVENT);
                    }
                };

                /**
                 * Pause played video
                 *
                 * @param {ContentWidgetClass} target
                 */
                EntertainmentService.prototype.letsRestDancing = function(target) {
                    this.disablePlaying(target);
                    if (isWidget(target)) {
                        target = target.$scope;
                    }
                    if (isScope(target)) {
                        target.$broadcast(ENTERTAINMENT_LETS_REST_EVENT);
                    }
                };

                /**
                 * Stops played video
                 *
                 * @param {ContentWidgetClass} target
                 */
                EntertainmentService.prototype.letsStopDancing = function(target) {
                    this.disablePlaying(target);
                    if (isWidget(target)) {
                        target = target.$scope;
                    }
                    if (isScope(target)) {
                        target.$broadcast(ENTERTAINMENT_LETS_STOP_EVENT);
                    }
                };

                /**
                 * Bind target listening start video/audio event
                 *
                 * @param {Object} target
                 * @param {Object} target.$scope
                 * @param {jQuery} target.$element
                 * @param {function} callback
                 * @returns {function}
                 */
                EntertainmentService.prototype.$onLetsDanceEvent = function(target, callback) {
                    return target.$scope.$on(ENTERTAINMENT_LETS_DANCE_EVENT, callback);
                };

                /**
                 * Bind target listening pause video/audio event
                 *
                 * @param {Object} target
                 * @param {Object} target.$scope
                 * @param {jQuery} target.$element
                 * @param {function} callback
                 * @returns {function}
                 */
                EntertainmentService.prototype.$onLetsRestEvent = function(target, callback) {
                    return target.$scope.$on(ENTERTAINMENT_LETS_REST_EVENT, callback);
                };

                /**
                 * Bind target listening stop video/audio event
                 *
                 * @param {Object} target
                 * @param {Object} target.$scope
                 * @param {jQuery} target.$element
                 * @param {function} callback
                 * @returns {function}
                 */
                EntertainmentService.prototype.$onLetsStopEvent = function(target, callback) {
                    return target.$scope.$on(ENTERTAINMENT_LETS_STOP_EVENT, callback);
                };

                return new EntertainmentService();
            }
        ];

        return provider;
    }
]);
/* Source: src/mt-includes/js/src/core/humanize_duration/filters/HumanizeDuration.js*/
angular.module('website.core.humanize_duration')
    /**
     * @example
     * {{ "99" | humanizeDuration:"hours":"uk" }}
     */
    .filter('humanizeDuration', ['motoHumanizeDuration', function(motoHumanizeDuration) {
        return function(amount, unit, language) {
            return motoHumanizeDuration.humanize(amount, unit, language);
        };
    }]);
/* Source: src/mt-includes/js/src/core/humanize_duration/services/HumanizeDuration.js*/
angular.module('website.core.humanize_duration')
    .provider('motoHumanizeDuration', [function() {
        var self = this,
            unitMeasures = {
                y: 31557600000,
                mo: 2629800000,
                w: 604800000,
                d: 86400000,
                h: 3600000,
                m: 60000,
                s: 1000,
                ms: 1
            }, customUnits = {
                years: 'y',
                months: 'mo',
                weeks: 'w',
                days: 'd',
                hours: 'h',
                minutes: 'm',
                seconds: 's',
                milliseconds: 'ms'
            };

        /**
         * Convert amount of time units to humanized text
         *
         * @example
         * var ruMinutes = motoHumanizeDuration.humanize(1, 'minutes', 'ru'); // ruMinutes is equal to 'минута'
         *
         * @param amount
         * @param unit
         * @param language
         * @returns {string}
         */
        this.humanize = function(amount, unit, language) {
            var spacer = '>', humanizeString;

            if (!language || humanizeDuration.getSupportedLanguages().indexOf(language) < 0) {
                language = 'en';
            }
            if (customUnits[unit]) {
                unit = customUnits[unit];
            }
            humanizeString = humanizeDuration(amount * unitMeasures[unit], {spacer: spacer, language: language, units: [unit], round: true});
            return humanizeString.substr(humanizeString.indexOf(spacer) + spacer.length);
        };

        this.$get = [function() {
            return self;
        }];
    }]);
/* Source: src/mt-includes/js/src/core/media/MotoMedia.js*/
/**
 * Service for manipulation with media items (video|audio)
 */
 /**
 * @typedef {Object} MotoMediaItem
 * @property {jQuery} node - jQuery node of item
 * @property {Function} pause - method for pause media
 * @property {Function} play - method for start media
 * @property {Function} isPlaying - method for checking if media is playing
 * @property {boolean} ready = indicate that item is ready for playing
 * @property {boolean} isAllowedAutoplay = indicate that autoplay is allowed for widget
 * @property {Object} [scope] (not required) - angular scope of element (not required)
 * @property {autoplay} [autoplay] (not required) - autoplay settings of item, if not exist, media will not be played automatically
 */
/**
 * @typedef {{enabled: boolean, allowed: boolean, forced: boolean, startOn: string}} autoplay
 */

angular.module('website.core.media').service('website.MediaService', [
    'motoBeforeInViewport',
    function(motoBeforeInViewport) {
        var _items = [];
        var service = this;
        var autoplayFailed = false;

        function isScope(target) {
            return !!(target && target.$evalAsync && target.$watch);
        }
        function fallbackIsPlaying() {
            return false;
        }

        /**
         * Register new item in service
         *
         * @param {MotoMediaItem} item - item for registration
         * @returns {MotoMediaItem|{false}} - registered item
         */
        this.registerItem = function(item) {
            if (!angular.isObject(item)) {
                return false;
            }

            item.autoplay = angular.isObject(item.autoplay) ? item.autoplay : {enabled: false};
            item.autoplay.allowed = angular.isDefined(item.autoplay.allowed) ? item.autoplay.allowed : true;
            item.isPlaying = angular.isFunction(item.isPlaying) ? item.isPlaying : fallbackIsPlaying;
            item.pause = angular.isFunction(item.pause) ? item.pause : angular.noop;
            item.ready = !!item.ready;

            if (isScope(item.scope)) {
                item.scope.$on('$destroy', function() {
                    _items.splice(_items.indexOf(item), 1);
                });
            }

            _items.push(item);

            if (item.ready) {
                this.itemReady(item);
            }

            return item;
        };

        /**
         * Mark item as ready.
         * When all items will be ready, will be called runAutoplayProcedure.
         *
         * @param {MotoMediaItem} item - item for marking as ready
         */
        this.itemReady = function(item) {
            item.ready = true;
            if (this.areAllItemsReady()) {
                this.runAutoplayProcedure();
            }
        };

        /**
         * Check if all items are ready
         *
         * @returns {boolean} - result
         */
        this.areAllItemsReady = function() {
            return !_items.some(function(item) {
                return !item.ready;
            });
        };

        /**
         * Check if autoplay should be run and run if should.
         * Checking on forcing and startOn
         *
         * @param {MotoMediaItem} item - moto media item
         */
        this.checkAndAutoplayItem = function(item) {
            function autoplayItem() {
                if (!item.autoplay.allowed) {
                    return;
                }
                if (item.autoplay.forced) {
                    service.pauseAll();
                    item.play();
                } else if (!service.isAnyPlaying()) {
                    item.play();
                }
            }
            if (item.autoplay.enabled) {
                if (item.autoplay.startOn === 'onFirstVisible') {
                    motoBeforeInViewport.startWatching({
                        element: item.node,
                        onEnter: function() {
                            autoplayItem();
                        }
                    });
                } else {
                    autoplayItem();
                }
            }
        };

        /**
         * Return if any item is playing
         *
         * @returns {boolean} - true if playing
         */
        this.isAnyPlaying = function() {
            return _items.some(function(item) {
                return item.isPlaying();
            });
        };

        /**
         * Pause all items
         */
        this.pauseAll = function() {
            _items.forEach(function(item) {
                item.pause();
            });
        };

        /**
         * Bind event for body on click to restart autoplay.
         * Should be called when autoplay failed.
         */
        this.autoplayFailed = function() {
            if (autoplayFailed) {
                return;
            }

            function clickHandler() {
                if (service.areAllItemsReady()) {
                    autoplayFailed = false;
                    $('body').off('click', clickHandler);
                    service.runAutoplayProcedure();
                }
            }

            autoplayFailed = true;
            $('body').on('click', clickHandler);
        };

        /**
         * Run autoplay for all items with all rules
         */
        this.runAutoplayProcedure = function() {
            _items.forEach(function(item) {
                service.checkAndAutoplayItem(item);
            });
        };
    }
]);
/* Source: src/mt-includes/js/src/core/utils/ElementHeightWatcherClass.js*/
angular.module('website.core.utils').service('website.ElementHeightWatcherClass', [
    function() {

        /**
         * Simple class for auto change min height of elements by max height other elements
         *
         * @param {Object} params
         * @param {jQuery} params.$element
         * @param {string} params.watchSelector
         * @param {int} [params.delay]
         * @constructor
         */
        function ElementHeightWatcherClass(params) {
            if (!angular.isObject(params)) {
                throw new Error('Invalid params');
            }
            if (!angular.isElement(params.$element)) {
                throw new Error('$element is not Element');
            }
            if (!angular.isString(params.watchSelector) || params.watchSelector === '') {
                throw new Error('watchSelector is empty');
            }
            this._options = angular.copy(this._options);
            angular.extend(this._options, params);
            this.$element = $(params.$element);
            this._onResizeHandler = this.update.bind(this);
            $(window).on('resize', this._onResizeHandler);
            this._timer = setInterval(this.update.bind(this), this._options.delay);
        }

        ElementHeightWatcherClass.prototype._options = {
            delay: 250
        };
        ElementHeightWatcherClass.prototype.$element = null;
        ElementHeightWatcherClass.prototype._onResizeHandler = null;
        ElementHeightWatcherClass.prototype._timer = null;
        ElementHeightWatcherClass.prototype._visible = false;

        /**
         * Return max height of watching elements
         *
         * @param {string} selector
         * @returns {number}
         * @private
         */
        ElementHeightWatcherClass.prototype._getMaxHeight = function(selector) {
            var nodes;
            var maxHeight = 0;

            nodes = $(selector);
            angular.forEach(nodes, function(node) {
                maxHeight = Math.max($(node).outerHeight(), maxHeight);
            });

            return maxHeight;
        };

        /**
         * Update min height
         *
         * @returns {boolean}
         */
        ElementHeightWatcherClass.prototype.update = function() {
            if (this._visible) {
                this.$element.css('min-height', this._getMaxHeight(this._options.watchSelector) + 'px');

                return true;
            }

            return false;
        };

        /**
         * Show element
         */
        ElementHeightWatcherClass.prototype.show = function() {
            this.$element.show();
            this._visible = true;
            this.update();
        };

        /**
         * Hide element
         */
        ElementHeightWatcherClass.prototype.hide = function() {
            this.$element.hide();
            this._visible = false;
        };

        ElementHeightWatcherClass.prototype.disconnect = function() {
            this.$element = null;
            this.calcSizeFunction = angular.noop;
            $(window).off('resize', this._onResizeHandler);
            clearInterval(this._timer);
        };

        /**
         * Destroy element and disconnect watchers
         */
        ElementHeightWatcherClass.prototype.destroy = function() {
            this.$element.remove();
            this.disconnect();
        };

        return ElementHeightWatcherClass;
    }
]);
/* Source: src/mt-includes/js/src/core/WebsiteSettingsService.js*/
angular.module('website.core.settings')
    .provider('motoWebsiteSettingsService', [function (undefined) {
        var self = this,
            _options = {};

        this.get = function (key, def) {
            if (key === undefined) {
                return _options;
            }

            return (_options[key] !== undefined ? _options[key] : (def || null));
        };

        this.set = function (key, value) {

            if (angular.isObject(key)) {
                for (var i in key) {
                    if (key.hasOwnProperty(i)) {
                        self.set(i, key[i]);
                    }
                }
                return;
            }

            _options[key] = value;

            return self;
        };

        this.$get = [function () {
            return self;
        }];
    }])
;
/* Source: src/mt-includes/js/src/core/widgets/ContentWidgetClass.js*/
angular.module('website.core.widgets').service('website.ContentWidgetClass', [
    'website.MotoAnimation',
    'website.Entertainment',
    'website.WidgetCollectionClass',
    'motoBeforeInViewport',
    function(MotoAnimation, Entertainment, WidgetCollectionClass, motoBeforeInViewport) {

        /**
         * Check is target are scope
         *
         * @param target
         * @returns {boolean}
         */
        function isScope(target) {
            return !!(target && target.$evalAsync && target.$watch);
        }

        /**
         *
         * @TODO : add options for widget is need repeating animation
         *
         * @param {jQuery} source
         * @constructor
         */
        function ContentWidgetClass(source) {
            var $element;

            if (angular.isElement(source)) {
                $element = source;
            } else if (!angular.isElement(source) && angular.isObject(source)) {
                this.id = source.id;
                this.name = source.name;
                $element = source.$element;
                this.setScope(source.$scope);
            }

            if (angular.isElement($element)) {
                this.setElement($element);
            }
            this.children = new WidgetCollectionClass();
        }

        /**
         * @type {boolean}
         * @private
         */
        ContentWidgetClass.prototype._debug = false;

        /**
         * @type {string}
         */
        ContentWidgetClass.prototype.id = null;

        /**
         * @type {string}
         */
        ContentWidgetClass.prototype.name = null;

        /**
         * @type {jQuery}
         */
        ContentWidgetClass.prototype.$element = null;

        /**
         * @type {Object}
         */
        ContentWidgetClass.prototype.$scope = null;

        /**
         * @type {jQuery}
         */
        ContentWidgetClass.prototype.$content = null;

        /**
         * @type {WidgetCollectionClass}
         */
        ContentWidgetClass.prototype.children = null;

        /**
         * @type {ContentWidgetClass}
         * @private
         */
        ContentWidgetClass.prototype._parent = null;

        /**
         * Set parent widget to this widget
         *
         * @param {ContentWidgetClass} parent
         * @returns {boolean}
         */
        ContentWidgetClass.prototype.setParent = function(parent) {
            // widget parent can't be a changed
            if (this._parent) {
                return (this._parent === parent);
            }

            if (parent instanceof ContentWidgetClass) {
                this._parent = parent;

                return true;
            }

            return false;
        };

        /**
         * Return parent widget
         *
         * @returns {ContentWidgetClass}
         */
        ContentWidgetClass.prototype.getParent = function() {
            return this._parent;
        };

        /**
         * Add new child widget to collection
         *
         * @param {ContentWidgetClass} widget
         * @returns {boolean}
         */
        ContentWidgetClass.prototype.addChild = function(widget) {
            if (this.children.push(widget)) {
                widget.setParent(this);

                return true;
            }

            return false;
        };

        /**
         * Return child widget by id or index
         *
         * @param {string|int} uid
         * @returns {ContentWidgetClass|null}
         */
        ContentWidgetClass.prototype.getChild = function(uid) {
            return this.children.getById(uid) || this.children.getByIndex(uid);
        };

        /**
         * Connect DOM Node for widget
         *
         * @param {jQuery} $element
         * @returns {boolean}
         */
        ContentWidgetClass.prototype.setElement = function($element) {
            // widget dom element can't be a changed
            if (this.$element) {
                return (this.$element === $element);
            }

            if (!angular.isElement($element)) {
                return false;
            }

            this.$element = $element;
            this.id = $element.attr('id') || this.id;
            this.name = $element.attr('data-widget') || this.name;
            this.$content = $element.find('#' + this.id + '__content') || this.$element;

            return true;
        };

        /**
         * Connect Scope for widget
         *
         * @param $scope
         * @returns {boolean}
         */
        ContentWidgetClass.prototype.setScope = function($scope) {
            // widget scope can't be a changed
            if (this.$scope) {
                return (this.$scope === $scope);
            }

            if (!isScope($scope)) {
                return false;
            }

            this.$scope = $scope;

            return true;
        };

        /**
         * Return widget scope
         *
         * @returns {null|*}
         */
        ContentWidgetClass.prototype.getScope = function() {
            return this.$scope;
        };

        /**
         * Handler for widget already visible on start view page
         *
         * @param {Object} preferences
         */
        ContentWidgetClass.prototype.onVisibleImmediately = function(preferences) {
            this._debug && console.warn(this.name, 'onVisibleImmediately #', this.id, preferences);
            this.onArriving(preferences);
            this.onArrived(preferences);
        };

        /**
         * Handler calling when widget will be visible on page content, not view port
         *
         * @param {Object} preferences
         */
        ContentWidgetClass.prototype.onArriving = function(preferences) {
            this._debug && console.warn(this.name, 'onArriving #', this.id, preferences);
            if (preferences.startAnimation === 'onArriving') {
                Entertainment.letsStartAnimation(this);
            }
            Entertainment.letsDance(this);
            motoBeforeInViewport.elementIsVisible(this.$element);
        };

        /**
         * Handler calling when widget is visible on page content, not view port
         *
         * @param {Object} preferences
         */
        ContentWidgetClass.prototype.onArrived = function(preferences) {
            this._debug && console.warn(this.name, 'onArrived #', this.id, preferences);
            if (preferences.startAnimation === 'onArrived') {
                Entertainment.letsStartAnimation(this);
            }
        };

        /**
         * Handler calling when widget will be hide on page content
         *
         * @param {Object} preferences
         */
        ContentWidgetClass.prototype.onVanishing = function(preferences) {
            this._debug && console.warn(this.name, 'onVanishing #', this.id, preferences);
            Entertainment.letsStopAnimation(this);
            Entertainment.letsStopDancing(this);
            motoBeforeInViewport.elementIsInvisible(this.$element);
        };

        /**
         * Handler calling when widget is hidden on page content
         *
         * @param {Object} preferences
         */
        ContentWidgetClass.prototype.onVanished = function(preferences) {
            this._debug && console.warn(this.name, 'onVanished #', this.id, preferences);
        };

        /**
         * Handler
         *
         * @param {Object} preferences
         */
        ContentWidgetClass.prototype.onResizing = function(preferences) {
            this._debug && console.warn(this.name, 'onResizing #', this.id, preferences);
        };

        return ContentWidgetClass;
    }
]);
/* Source: src/mt-includes/js/src/core/widgets/WidgetCollectionClass.js*/
angular.module('website.core.widgets').service('website.WidgetCollectionClass', [
    function() {

        /**
         * Return sorted items by callback
         *
         * @param {Array} items
         * @param {Function} callback
         * @param {int} offset
         * @param {int} max
         * @returns {Array}
         */
        function getItems(items, callback, offset, max) {
            var i;
            var len = items.length;
            var result = [];

            for (i = offset; i < len; i++) {
                if (callback(items[i])) {
                    result.push(items[i]);
                }
                if (max > -1 && result.length === max) {
                    break;
                }
            }

            return result;
        }

        /**
         * Check is widget
         *
         * @param {Object} target
         * @returns {boolean}
         */
        function isWidget(target) {
            return !!(target && angular.isDefined(target.id) && angular.isDefined(target.$scope) && target.$element && angular.isFunction(target.setParent));
        }

        /**
         * @param {Array} items
         * @constructor
         */
        function WidgetCollectionClass(items) {
            this._items = [];
            this._index = {
                byId: {}
            };

            this.pushItems(items);
        }

        /**
         * Widgets list
         *
         * @type {ContentWidgetClass[]}
         * @private
         */
        WidgetCollectionClass.prototype._items = [];

        /**
         * List index
         *
         * @type {Object}
         * @private
         */
        WidgetCollectionClass.prototype._index = {};

        /**
         * Return all children widgets
         *
         * @returns {ContentWidgetClass[]}
         */
        WidgetCollectionClass.prototype.all = function() {
            return this._items;
        };

        /**
         * Push new child widget to collection
         *
         * @param {ContentWidgetClass} widget
         * @returns {boolean}
         */
        WidgetCollectionClass.prototype.push = function(widget) {
            if (!isWidget(widget)) {
                return false;
            }
            if (this.getById(widget.id)) {
                return false;
            }
            this._items.push(widget);
            this._index.byId[widget.id] = widget;

            return true;
        };

        /**
         * Push items to end of collection
         *
         * @param {Array|WidgetCollectionClass} items
         * @returns {boolean}
         */
        WidgetCollectionClass.prototype.pushItems = function(items) {
            if (items instanceof WidgetCollectionClass) {
                items = items.all();
            }
            if (!angular.isArray(items)) {
                return false;
            }
            angular.forEach(items, this.push.bind(this));

            return true;
        };

        /**
         * Get widget by id
         *
         * @param {string} id
         * @returns {ContentWidgetClass|null}
         */
        WidgetCollectionClass.prototype.getById = function(id) {
            return this._index.byId[id] || null;
        };

        /**
         * Get widget by index
         *
         * @param {int} index
         * @returns {ContentWidgetClass|null}
         */
        WidgetCollectionClass.prototype.getByIndex = function(index) {
            return this._items[index] || null;
        };

        /**
         * Check is collection are empty
         *
         * @returns {boolean}
         */
        WidgetCollectionClass.prototype.isEmpty = function() {
            return this._items.length < 1;
        };

        /**
         * Return count of children widgets
         *
         * @returns {int}
         */
        WidgetCollectionClass.prototype.count = function() {
            return this._items.length;
        };

        /**
         * Return first child widget
         *
         * @returns {ContentWidgetClass|null}
         */
        WidgetCollectionClass.prototype.first = function(callback, defaultValue) {
            var result;

            if (angular.isFunction(callback)) {
                result = getItems(this._items, callback, 0, 1)[0];
            } else {
                result = this.getByIndex(0);
            }

            if (angular.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            return result || defaultValue;
        };

        /**
         * Return last child widget
         *
         * @returns {ContentWidgetClass|null}
         */
        WidgetCollectionClass.prototype.last = function() {
            return this.getByIndex(this.count() - 1);
        };

        /**
         * Remove widget by id
         *
         * @param {string} id
         * @returns {boolean}
         */
        WidgetCollectionClass.prototype.removeById = function(id) {
            var widget;
            var index;

            if (this._index.byId[id]) {
                widget = this._index.byId[id];
                delete this._index.byId[id];
                index = this._items.indexOf(widget);
                if (index >= 0) {
                    this._items.splice(index, 1);
                }
            }

            return true;
        };

        /**
         * Return a new collection with filtered items by callback
         *
         * @param {Function} callback
         * @returns {WidgetCollectionClass|boolean}
         */
        WidgetCollectionClass.prototype.filter = function(callback) {
            if (!angular.isFunction(callback)) {
                return false;
            }

            return new WidgetCollectionClass(this._items.filter(callback));
        };

        /**
         * Return a new collection with filtered by some item property value
         *
         * @param {string} property
         * @param {string} value
         * @returns {WidgetCollectionClass|boolean}
         */
        WidgetCollectionClass.prototype.where = function(property, value) {
            return this.filter(function(item) {
                return (item[property] === value);
            });
        };

        /**
         * Return a first item from collection where property will equal to value
         *
         * @param {string} property
         * @param {*} value
         * @returns {ContentWidgetClass|null}
         */
        WidgetCollectionClass.prototype.firstWhere = function(property, value) {
            return getItems(this._items, function(item) {
                    return item[property] === value;
                }, 0, 1)[0] || null;
        };

        return WidgetCollectionClass;
    }
]);
/* Source: src/mt-includes/js/src/core/widgets/WidgetsRepository.service.js*/
angular.module('website.core.widgets').service('website.WidgetsRepository', [
    'website.ContentWidgetClass',
    'website.WidgetCollectionClass',
    function(ContentWidgetClass, WidgetCollectionClass) {
        var debug = false;
        var defaultParent;

        /**
         * Check is target are scope
         *
         * @param target
         * @returns {boolean}
         */
        function isScope(target) {
            return !!(target && target.$evalAsync && target.$watch);
        }

        /**
         * Check is widget
         *
         * @param {Object} target
         * @returns {boolean}
         */
        function isWidget(target) {
            return target instanceof ContentWidgetClass;
        }

        function WidgetsRepository() {
            this._collection = new WidgetCollectionClass();
        }

        /**
         * @type {WidgetCollectionClass}
         * @private
         */
        WidgetsRepository.prototype._collection = null;

        /**
         * Set default parent widget
         *
         * @param {ContentWidgetClass|null} target
         * @returns {boolean}
         */
        WidgetsRepository.prototype.setDefaultParent = function(target) {
            if (target && target instanceof ContentWidgetClass || target === null) {
                debug && console.log('WidgetsRepository : setDefaultParent as ', target);
                defaultParent = target;

                return true;
            }

            return false;
        };

        /**
         * Return default parent widget
         *
         * @returns {ContentWidgetClass|null}
         */
        WidgetsRepository.prototype.getDefaultParent = function() {
            return defaultParent;
        };

        /**
         * Forget about widget, removed from repository
         *
         * @param {ContentWidgetClass|string} target
         * @returns {boolean}
         */
        WidgetsRepository.prototype.forget = function(target) {
            /**
             * @type {ContentWidgetClass}
             */
            var widget;
            var children;

            if (target instanceof ContentWidgetClass) {
                widget = target;
            } else if (angular.isString(target)) {
                widget = this._collection.getById(target);
            }

            if (!widget) {
                return false;
            }

            children = widget.children.all();
            if (children.length) {
                children.forEach(this.forget.bind(this));
            }
            this._collection.removeById(widget.id);
        };

        /**
         * Register widget
         *
         * @param {ContentWidgetClass|Object} widget
         * @returns {ContentWidgetClass|boolean}
         */
        WidgetsRepository.prototype.registry = function(widget) {
            var parentId;
            var parent;

            if (!angular.isObject(widget)) {
                debug && console.warn('WidgetsRepository : Cant registry widget - is not object');

                return false;
            }
            if (!(widget instanceof ContentWidgetClass)) {
                widget = new ContentWidgetClass(widget);
            }

            if (!isWidget(widget)) {
                return false;
            }
            // POPUP!
            if (this.isExists(widget.id)) {
                debug && console.log('WidgetsRepository : Try to forget widget #' + widget.id);
                this.forget(widget.id);
            }
            if (this.isExists(widget.id)) {
                debug && console.warn('Widget with #' + widget.id + 'already registered', widget);

                return false;
            }

            if (!this._collection.push(widget)) {
                debug && console.warn('Cant push widget to collection', widget);

                return false;
            }
            parentId = widget.$element.attr('data-parent-id');

            parent = this._collection.getById(parentId);
            if (parent) {
                widget.setParent(parent);
            } else if (defaultParent) {
                widget.setParent(defaultParent);
            }

            parent = widget.getParent();
            if (parent) {
                parent.addChild(widget);
            }

            return widget;
        };

        /**
         * Check is exists widget on list
         *
         * @param {string} id
         * @returns {boolean}
         */
        WidgetsRepository.prototype.isExists = function(id) {
            return !!this._collection.getById(id);
        };

        /**
         * Return a new collection with filtered items by callback
         *
         * @param {Function} callback
         * @returns {WidgetCollectionClass|boolean}
         */
        WidgetsRepository.prototype.filter = function(callback) {
            return this._collection.filter(callback);
        };

        /**
         * Return a new collection with filtered by some item property value
         *
         * @param {string} property
         * @param {string} value
         * @returns {WidgetCollectionClass|boolean}
         */
        WidgetsRepository.prototype.where = function(property, value) {
            return this._collection.where(property, value);
        };

        /**
         * Return a first item from collection where property will equal to value
         *
         * @param {string} property
         * @param {*} value
         * @returns {ContentWidgetClass|null}
         */
        WidgetsRepository.prototype.firstWhere = function(property, value) {
            return this._collection.firstWhere(property, value);
        };

        return new WidgetsRepository();
    }
]);
/* Source: src/mt-includes/js/src/live_chat/provider.js*/
angular.module('website.LiveChat').provider('websiteLiveChat', [
    'website.LiveChat.settings',
    function(settings) {
        var provider;
        var APIProviders = {};
        var LiveChatApi;

        if (!angular.isObject(settings)) {
            settings = {
                provider: 'none'
            };
        }

        function AbstractConnectorClass(provider, options) {
            this._provider = provider;
            this._options = options;
        }

        AbstractConnectorClass.prototype = {};
        /**
         * @type {LiveChatProviderClass}
         * @private
         */
        AbstractConnectorClass.prototype._provider = null;
        AbstractConnectorClass.prototype._options = {};
        AbstractConnectorClass.prototype._booted = false;
        AbstractConnectorClass.prototype._booting = false;
        AbstractConnectorClass.prototype.boot = function() {
            console.warn('Method "boot" not implemented');

            return false;
        };
        AbstractConnectorClass.prototype.isReady = function() {
            return this._booted;
        };

        function LiveChatProviderClass() {

        }

        LiveChatProviderClass.prototype = {};

        /**
         * Boot Live Chat
         *
         * @returns {boolean}
         */
        LiveChatProviderClass.prototype.boot = function() {
            var constructor;

            if (!this.isEnabled()) {
                return false;
            }
            if (!this.isRegisteredProvider(this.getProviderName())) {
                return false;
            }
            if (LiveChatApi) {
                return false;
            }

            constructor = this.getApiProviderConstructor(this.getProviderName());
            if (!constructor) {
                return false;
            }
            LiveChatApi = new constructor(this, settings.options);
            LiveChatApi.boot();

            return true;
        };

        /**
         * Return current Live Chat system name
         * @returns {string}
         */
        LiveChatProviderClass.prototype.getProviderName = function() {
            return settings.provider;
        };

        /**
         * Check is enabled any Live Chat system
         *
         * @returns {boolean}
         */
        LiveChatProviderClass.prototype.isEnabled = function() {
            return (settings.provider !== 'none');
        };

        /**
         * Register Live Chat system
         *
         * @param {string} name
         * @param {Function} constructor
         * @returns {boolean}
         */
        LiveChatProviderClass.prototype.registerApiConnector = function(name, constructor) {
            if (!angular.isString(name) || (name.trim().length < 1)) {
                console.warn('LiveChatProvider : cant register provider, invalid name', name);

                return false;
            }

            if (!angular.isFunction(constructor)) {
                console.warn('LiveChatProvider : cant register provider constructor', constructor);

                return false;
            }

            if (!(constructor.prototype instanceof AbstractConnectorClass)) {
                console.warn('LiveChatProvider : invalid constructor', constructor);

                return false;
            }

            name = name.trim();

            APIProviders[name] = {
                name: name,
                constructor: constructor
            };

            return true;
        };

        /**
         * @param {string} name
         * @returns {boolean}
         */
        LiveChatProviderClass.prototype.isRegisteredProvider = function(name) {
            return !!APIProviders[name];
        };

        /**
         * @param {string} name
         * @returns {AbstractConnectorClass|null}
         */
        LiveChatProviderClass.prototype.getApiProviderConstructor = function(name) {
            if (!this.isRegisteredProvider(name)) {
                console.warn('LiveChatProvider : provider "', name, '" not exists');

                return null;
            }

            return APIProviders[name].constructor;
        };

        /**
         * @returns {AbstractConnectorClass|null}
         */
        LiveChatProviderClass.prototype.getApiProvider = function() {
            return LiveChatApi;
        };

        LiveChatProviderClass.prototype.$get = [
            function() {
                return provider;
            }];

        provider = new LiveChatProviderClass();

        function LiveChatIncConnectorClass() {
            AbstractConnectorClass.apply(this, arguments);
        }

        LiveChatIncConnectorClass.prototype = Object.create(AbstractConnectorClass.prototype);
        LiveChatIncConnectorClass.prototype.constructor = LiveChatIncConnectorClass;

        /**
         * {@inheritdoc}
         */
        LiveChatIncConnectorClass.prototype.boot = function() {
            if (this._booted || this._booting) {
                return false;
            }

            this._booting = true;
            window.__lc = window.__lc || {};
            window.LC_API = window.LC_API || {};
            // window.LC_API.on_before_load = this.onBeforeLoadHandler.bind(this);
            window.LC_API.on_after_load = this._onAfterLoadHandler.bind(this);

            // force hide live chat, need for remove blinking chat
            if (this.isShowOnlyAgentsAreAvailable()) {
                this._getTempStyleNode().html('#chat-widget-container {display:none !important}');
            }

            if (!window.__lc.license) {
                window.__lc.license = this._options.licenceNumber;
                if (window.__lc.license)
                    (function() {
                        var lc = document.createElement('script');
                        lc.type = 'text/javascript';
                        lc.async = true;
                        lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';
                        var s = document.getElementsByTagName('script')[0];
                        s.parentNode.insertBefore(lc, s);
                    })();
            }

            return true;
        };

        /**
         * Callback handler for 'on_before_load'
         * @private
         */
        LiveChatIncConnectorClass.prototype._onBeforeLoadHandler = function() {
            // window.LC_API.agents_are_available return not actuality information
        };

        /**
         * Callback handler for 'on_after_load'
         * @private
         */
        LiveChatIncConnectorClass.prototype._onAfterLoadHandler = function() {
            var API = window.LC_API;
            var styleNode = this._getTempStyleNode();

            if (!API) {
                console.error('LiveChatInc : cant retrieve access to API [LC_API]');

                return false;
            }
            try {
                this._booted = true;
                this._booting = false;

                if (this.isShowOnlyAgentsAreAvailable() && !API.agents_are_available()) {
                    API.hide_chat_window();
                }
            } catch (e) {
                console.error(e);
            }

            // LiveChat api working with setTimeout with 200ms
            setTimeout(function() {
                styleNode.remove();
            }, 250);

            this._bindAPIListeners();
        };

        /**
         * Bind API listeners
         *
         * @returns {boolean}
         * @private
         */
        LiveChatIncConnectorClass.prototype._bindAPIListeners = function() {
            var API = window.LC_API;
            var i;
            var len;
            var methods = [
                'on_chat_started',
                'on_chat_window_opened',
                'on_chat_window_minimized',
                'on_chat_window_hidden',
                'on_chat_state_changed',
                'on_chat_started',
                'on_chat_ended',
                'on_message',
                'on_ticket_created',
                'on_prechat_survey_submitted',
                'on_postchat_survey_submitted',
                'on_rating_submitted',
                'on_rating_comment_submitted'
            ];

            if (!API) {
                console.error('LiveChatInc : cant retrieve access to API [LC_API]');

                return false;
            }

            // connecting to API
            for (i = 0, len = methods.length; i < len; i++) {
                API[methods[i]] = this._createAPICallback(methods[i]);
            }

            return true;
        };

        /**
         * Return API callback wrapper function
         *
         * @param {string} name
         * @returns {Function}
         * @private
         */
        LiveChatIncConnectorClass.prototype._createAPICallback = function(name) {
            var self = this;

            return function() {
                self._onAPICallback(name, Array.prototype.slice.call(arguments));
            };
        };

        /**
         * Main API callback listener
         *
         * @param {string} event
         * @param {array} data
         * @private
         */
        LiveChatIncConnectorClass.prototype._onAPICallback = function(event, data) {

        };

        /**
         * Return temporary style node
         *
         * @returns {jQuery}
         * @private
         */
        LiveChatIncConnectorClass.prototype._getTempStyleNode = function() {
            var id = 'motoLiveChatTempStyle';
            var node = null;

            node = document.getElementById(id);
            if (!node) {
                node = document.createElement('style');
                node.setAttribute('id', id);
                document.body.appendChild(node);
            }

            return $('#' + id);
        };

        /**
         * Check is showing chat only is agents are available
         *
         * @returns {boolean}
         */
        LiveChatIncConnectorClass.prototype.isShowOnlyAgentsAreAvailable = function() {
            return angular.isDefined(this._options['showOnlyAgentsAreAvailable']) && this._options.showOnlyAgentsAreAvailable;
        };

        provider.registerApiConnector('LiveChatInc', LiveChatIncConnectorClass);

        provider.boot();

        return provider;
    }
]);/* Source: src/mt-includes/js/src/live_chat/settings.module.js*/
try {
    angular.module('website.LiveChat.settings');
} catch (e) {
    angular.module('website.LiveChat.settings', [])
        .constant('website.LiveChat.settings', null);
}
/* Source: src/mt-includes/js/src/moto_background_video/motoBackgroundVideoDirective.js*/
angular.module('website').directive('motoBackgroundVideo', [
    'website.Entertainment',
    function(Entertainment) {
        var debug = false;

        return {
            restrict: 'A',
            scope: true,
            link: function($scope, $element) {
                var videoElement = $element.find('video');
                var instance = videoElement.get(0);
                var env = {
                    $scope: $scope,
                    $element: $element
                };

                if (!instance) {
                    return;
                }

                $element.motoVideoBackground();
                videoElement.attr('playsinline', '');

                Entertainment.$onLetsDanceEvent(env, function($event) {
                    debug && console.log('bgVideo : event', $event.name, $event.defaultPrevented);
                    // update video view
                    $element.motoVideoBackground();
                    if (!instance.paused || Entertainment.isDisabledPlaying($element)) {
                        return;
                    }
                    try {
                        instance.play()
                            .then(
                                function() {
                                    debug && console.log('bgVideo : Playing');
                                },
                                function(error) {
                                    debug && console.warn('bgVideo : Ooops', error);
                                }
                            )
                            .catch(function(error) {
                                debug && console.warn('bgVideo : Playing error: ', error);
                            });
                    } catch (error) {
                        console.error(error);
                    }
                });

                Entertainment.$onLetsRestEvent(env, function($event) {
                    debug && console.log('bgVideo : event', $event.name, $event.defaultPrevented);
                    if (instance.paused) {
                        return;
                    }
                    instance.pause();
                });

                Entertainment.$onLetsStopEvent(env, function($event) {
                    debug && console.log('bgVideo : event', $event.name, $event.defaultPrevented);
                    if (instance.paused) {
                        return;
                    }
                    instance.pause();
                    instance.currentTime = 0;
                });
            }
        };
    }
]);
/* Source: src/mt-includes/js/src/moto_cookie_notification/MotoCookieNotification.js*/
angular.module('website')
    .directive('motoCookieNotification', [
        'website.MotoStorageService',
        function(MotoStorageService) {
            return {
                restrict: 'C',
                link: function($scope, $element) {
                    var contentHash = $element.attr('data-content-hash');

                    if (MotoStorageService.getCookie('cookie-notification-applied') !== contentHash) {
                        $element.addClass('moto-cookie-notification_visible');
                    }
                    $scope.closeNotification = function(daysToExpire) {
                        var options = (daysToExpire) ? {expires: daysToExpire} : null;

                        $element.fadeOut();
                        MotoStorageService.setCookie('cookie-notification-applied', contentHash, options);
                    };
                }
            };
        }
    ]);
/* Source: src/mt-includes/js/src/moto_interval/MotoIntervalService.js*/
angular.module('website').service('MotoIntervalService', [
    '$interval',
    function($interval) {
        var interval = null;
        var intervalTimer = 100;
        var callbacks = [];

        function processCallback(callback) {
            callback && callback();
        }

        function processCallbacks() {
            callbacks.forEach(processCallback);
        }

        this.registerCallback = function(callbackFn) {
            if (!angular.isFunction(callbackFn) || (callbacks.indexOf(callbackFn) > -1)) return angular.noop;

            callbacks.push(callbackFn);

            return function() {
                callbacks[callbacks.indexOf(callbackFn)] = null;
            };
        };

        this.start = function() {
            interval = $interval(processCallbacks, intervalTimer);
        };

        this.stop = function() {
            $interval.cancel(interval);
        };

        this.start();
    }
]);
/* Source: src/mt-includes/js/src/moto_link/initLightboxGalleryDirective.js*/
/**
 * Directive for automation initializing our lightbox gallery.
 *
 * For correct working with caption you have to mark two nodes:
 *     [data-moto-lightbox-item] - node that wrap every item in gallery
 *     [data-moto-lightbox-caption] - node that contain caption of item
 */

angular.module('website.moto_link')
    .directive('motoInitLightboxGallery', function() {
        var DEFAULT_PROPERTIES = {
            itemRootSelector: '[data-moto-lightbox-item]',
            itemLinkSelector: '[data-moto-lightbox-link]',
            itemCaptionSelector: '[data-moto-lightbox-caption]'
        };

        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                $element.magnificPopup({
                    delegate: 'a[data-action=lightbox]' + DEFAULT_PROPERTIES.itemLinkSelector,
                    type: 'image',
                    tClose: '',
                    tLoading: '',
                    mainClass: angular.isDefined($attrs.tileGalleryShowCounter) ? '' : 'moto-lightbox_hidden-counter',
                    gallery: {
                        enabled: true,
                        preload: [5, 10],
                        tPrev: '',
                        tNext: '',
                        tCounter: '%curr% / %total%'
                    },
                    image: {
                        titleSrc: function(item) {
                            return angular.element(item.el.context)
                                .closest(DEFAULT_PROPERTIES.itemRootSelector)
                                .find(DEFAULT_PROPERTIES.itemCaptionSelector)
                                .html() || '';
                        }
                    },
                    zoom: {
                        enabled: true,
                        duration: 400,
                        easing: 'ease-in-out'
                    }
                });
            }
        };
    });
/* Source: src/mt-includes/js/src/moto_link/moto_link.js*/
angular.module('website.moto_link').run([
    '$timeout',
    function($timeout) {
        function openInLightBox(event) {
            var $element = $(event.currentTarget);

            if (!$element.closest('[data-moto-lightbox-caption]').length && $element.closest('[data-moto-init-lightbox-gallery]').length) {
                return;
            }

            event.preventDefault();

            // this is a 'hack' because popup handler will call next
            // maybe need create own handler processor with priority for any click action handlers
            $timeout(function() {
                $.magnificPopup.close();
                $.magnificPopup.open({
                    items: {
                        tClose: '',
                        tLoading: '',
                        src: $element.attr('href'),
                        title: $element.attr('title') || '',
                        type: 'image'
                    }
                });
            });
        }

        $('body').on('click', '.moto-link[data-action=lightbox]', openInLightBox);
    }]);
/* Source: src/mt-includes/js/src/moto_link/MotoLinkActionService.js*/
angular.module('website').service('website.MotoLinkActionService', [
    '$window',
    'website.MotoPopupService',
    function($window, MotoPopupService) {
        this.execute = function(actionLink) {
            if (!angular.isObject(actionLink)) {
                return;
            }
            switch (actionLink.action) {
                case 'popup':
                    if (angular.isNumber(actionLink.id)) {
                        MotoPopupService.openPopup(actionLink.id);
                    }
                    break;
                case 'lightbox':
                    if (angular.isString(actionLink.url)) {
                        $.magnificPopup.open({
                            items: {
                                tClose: '',
                                tLoading: '',
                                src: actionLink.url,
                                type: 'image'
                            }
                        });
                    }
                    break;
                default:
                    if (angular.isString(actionLink.url)) {
                        try {
                            $window.open(actionLink.url, actionLink.target);
                        } catch (err) {}
                    }
                    break;
            }
        };
    }
]);
/* Source: src/mt-includes/js/src/moto_link/open_in_popup.js*/
angular.module('website.moto_link').run([
    'website.MotoPopupService',
    function(MotoPopupService) {
        var $body = $('body');

        function openInPopup(event) {
            var $element = $(event.currentTarget);
            var id = $element.attr('data-popup-id');
            var action = $element.data('action');

            id = parseInt(id);
            if ((action === 'popup') && (!(id > 0))) {
                return false;
            }

            if (action !== 'popup') {
                return;
            }

            event.preventDefault();

            MotoPopupService.openPopup(id);
        }

        $body.on('click', '.moto-link', openInPopup);
    }]);
/* Source: src/mt-includes/js/src/moto_popup/MotoPopupService.js*/
angular.module('website').service('website.MotoPopupService', [
    '$rootScope',
    '$timeout',
    '$q',
    '$compile',
    'website.MotoStorageService',
    'Website.Backend.RenderService',
    'currentFrontendSession',
    'website.Entertainment',
    'MotoScrollbarWatcherService',
    function($rootScope, $timeout, $q, $compile, MotoStorageService, RenderService, currentFrontendSession, Entertainment, MotoScrollbarWatcherService) {
        var $scope;
        var queueCheckTimeout = 500;
        var popupQueue = [];

        // Update popup width
        function updatePopupWidth(width) {
            $('.mfp-content').css('width', width);
        }

        function addToQueue(popupId, openCallback) {
            popupQueue.push({id: popupId, callback: openCallback});
        }

        function getNextInQueue() {
            return popupQueue.shift();
        }

        function isAnyPopupOpened() {
            return angular.isObject($.magnificPopup.instance.currItem);
        }

        function openPopup(popupId, openCallback) {
            var ERROR_MESSAGE_CONTENT = window.websiteConfig && window.websiteConfig.popup_preferences && window.websiteConfig.popup_preferences.loading_error_message || '';
            var ERROR_MESSAGE_CLASS = 'moto-popup__content_error';
            var promise;
            var ignoreClosingPopup = false;
            var debug = false;
            var popupIsOpened = isAnyPopupOpened();

            openCallback = angular.isFunction(openCallback) ? openCallback : angular.noop;

            function popupIsClosed() {
                popupIsOpened = false;
                if ($scope) {
                    $scope.$destroy();
                }
                if (promise) {
                    promise = $q.reject(promise, 'rejecting');
                }
            }

            if (popupIsOpened) {
                $.magnificPopup.close();
                popupIsClosed();
            }

            popupIsOpened = true;
            $.magnificPopup.open({
                items: {
                    src: '<div id="moto-popup-content"></div>',
                    type: 'inline'
                },
                showCloseBtn: false,
                closeOnBgClick: false,
                mainClass: 'moto-popup',
                callbacks: {
                    open: function() {
                        $.magnificPopup.instance.updateStatus('loading');
                    },
                    close: function() {
                        // @ATTENTION : if we forcing
                        if (!ignoreClosingPopup) {
                            popupIsClosed();
                        }
                    }
                }
            });

            promise = RenderService.render({
                id: popupId
            }).then(
                function(response) {
                    var $content;
                    var scrollWatcher;

                    if (promise.$$state.status === 2) {
                        debug && console.log(popupId, ':   user reject opening popup');

                        return;
                    }

                    if (!popupIsOpened) {
                        debug && console.log(popupId, ':   Popup is closed => return');

                        return;
                    }

                    $content = $(response.content);

                    // @ATTENTION : need close previous magnificPopup, because next 'open()' not using new 'callbacks'
                    ignoreClosingPopup = true;
                    $.magnificPopup.close();
                    ignoreClosingPopup = false;

                    $.magnificPopup.open({
                        items: {
                            src: $content,
                            type: 'inline'
                        },
                        mainClass: 'moto-popup',
                        closeOnBgClick: false,
                        callbacks: {
                            open: function() {
                                updatePopupWidth(response.properties.width);
                                $scope = $rootScope.$new();
                                $content = $compile($content)($scope);
                                // @TODO : try to create 'widget' and set them as default widget, then forget them when popup is closing
                                Entertainment.letsDance({
                                    id: popupId,
                                    name: '@popup',
                                    $scope: $scope,
                                    $element: $content
                                });
                                scrollWatcher = MotoScrollbarWatcherService.addWatcher(function() {
                                    // we must use original events here (not synthetic)
                                    var resizeEvent = window.document.createEvent('UIEvents');

                                    resizeEvent.initUIEvent('resize', true, false, window, 0);
                                    window.dispatchEvent(resizeEvent);
                                }, $content[0]);
                                openCallback();
                            },
                            close: function() {
                                scrollWatcher();
                                popupIsClosed();
                            }
                        }
                    });

                    popupIsOpened = true;
                },
                function(error) {
                    debug && console.warn('Server return error', error);
                    if (!popupIsOpened) {
                        return;
                    }
                    popupIsOpened = true;
                    $.magnificPopup.instance.updateStatus('ready');
                    // 'error' not remove 'loading'
                    updatePopupWidth('1200px');
                    $('#moto-popup-content').addClass(ERROR_MESSAGE_CLASS).html(ERROR_MESSAGE_CONTENT);
                }
            );
        }

        function pleaseOpenPopup(popupId, openCallback) {
            isAnyPopupOpened()
                ? addToQueue(popupId, openCallback)
                : openPopup(popupId, openCallback);
        }

        function checkQueue() {
            var nextPopup;

            if (isAnyPopupOpened() || popupQueue.length === 0) {
                return;
            }
            nextPopup = getNextInQueue();
            openPopup(nextPopup.id, nextPopup.callback);
        }

        function updateDataInStorage(id, type) {
            var storageKeyName = 'popups-storage';
            var storageObject;

            if (type === 'session') {
                storageKeyName = 'popups-session';
            }

            storageObject = MotoStorageService.getLocalStorageItem(storageKeyName, {});
            if (storageObject[id]) {
                storageObject[id].shows++;
            } else {
                storageObject[id] = {
                    shows: 1
                };
            }
            storageObject[id].timestamp = Date.now();
            MotoStorageService.setLocalStorageItem(storageKeyName, storageObject);
        }

        function shouldPopupBeOpened(id, type, options) {
            var storageObject;

            if (type === 'always') {
                return true;
            }

            if (type === 'session') {
                storageObject = MotoStorageService.getLocalStorageItem('popups-session', {});
                if (storageObject[id]) {
                    return false;
                }

                return true;
            }

            storageObject = MotoStorageService.getLocalStorageItem('popups-storage', {});

            if (type === 'amount') {
                if (storageObject[id] && storageObject[id].shows >= options.shows) {
                    return false;
                }
            }

            if (type === 'overtime') {
                if (storageObject[id] && (Date.now() - storageObject[id].timestamp) < options.overtime * 1000) {
                    return false;
                }
            }

            return true;
        }

        function init() {
            var popupCloseFn = $.magnificPopup.proto._close;

            $.magnificPopup.proto._close = function() {
                var result = popupCloseFn.apply(this, arguments);

                $timeout(checkQueue, queueCheckTimeout);

                return result;
            };
            if (currentFrontendSession.isNew) {
                MotoStorageService.removeLocalStorageItem('popups-session');
            }
        }

        this.init = init;
        this.pleaseOpenPopup = pleaseOpenPopup;
        this.openPopup = openPopup;
        this.updateDataInStorage = updateDataInStorage;
        this.shouldPopupBeOpened = shouldPopupBeOpened;
    }
]);
/* Source: src/mt-includes/js/src/moto_scrollbar_watcher/MotoScrollbarWatcherService.js*/
angular.module('website').service('MotoScrollbarWatcherService', [
    'MotoIntervalService',
    function(MotoIntervalService) {
        var watcherInstance = angular.noop;
        var watchers = [];

        function processWatcher(item) {
            var currentScrollbarState;

            if (!angular.isObject(item)) {
                return false;
            }

            currentScrollbarState = item.node.clientHeight < item.node.scrollHeight;

            if (item.scrollbarState !== null && currentScrollbarState !== item.scrollbarState) {
                item.callbackFn();
            }

            item.scrollbarState = currentScrollbarState;

            return true;
        }

        function processWatchers() {
            watchers.forEach(processWatcher);
        }

        this.addWatcher = function(callbackFn, node) {
            var callbackObject;

            if (!angular.isFunction(callbackFn) || !(node instanceof Element)) return angular.noop;

            callbackObject = {
                callbackFn: callbackFn,
                node: node,
                scrollbarState: null
            };

            watchers.push(callbackObject);

            // start watching only if it is the first callbackFn
            if (watchers.length === 1) {
                this.startWatch();
            }

            return function() {
                watchers[watchers.indexOf(callbackObject)] = null;
            };
        };

        this.startWatch = function() {
            watcherInstance = MotoIntervalService.registerCallback(processWatchers);
        };

        this.stopWatch = watcherInstance;
    }
]);
/* Source: src/mt-includes/js/src/moto_sticky/moto_sticky.js*/
/**
 * @module website
 *
 * MotoSticky directive
 */

/**
 * Object with data about sticky element.
 *
 * @typedef {Object} StickyObject
 * @property {Object} $scope
 * @property {Object} $element
 * @property {Object} $attrs
 * @property {Object} $pseudoElement
 * @property {StickyObjectOptions} options
 * @property {Boolean} isAttached
 */

/**
 * Object with options of sticky element.
 *
 * @typedef {Object} StickyObjectOptions
 * @property {Boolean} hidden
 * @property {Number} offset
 * @property {String} mode
 * @property {String} direction
 */

angular.module('website').directive('motoSticky', [
    '$window',
    '$timeout',
    function($window, $timeout) {
        var _window = angular.element($window);
        var POPUP_TOP_MARGIN = 50;
        var settings = {
                interval: 32,
                attachedClass: 'moto-sticky__attached',
                bootstrappedClass: 'moto-sticky__bootstrapped',
                pseudoElementClass: 'moto-sticky-pseudo-element'
            };
        var defaultOptions = {
                hidden: false,
                offset: 0,
                mode: 'dynamic',
                direction: 'top'
            };
        var objects = [];
        var needCheck = true;
        var needCheckOnResize = true;
        var $timer;

        function isDebug() {
            return window.motoDebug || false;
        }

        /**
         * Check if element should be attached and return result.
         *
         * @param {StickyObject} object - sticky object.
         * @returns {Boolean} - true if element should be attached.
         */
        function isNeedAttache(object) {
            var elementTopMargin;
            var viewportHeight;
            var $element;
            var result;
            var offset;
            var rect;

            if (object.options.mode === 'static') {
                return true;
            }

            $element = (object.isAttached || object.options.hidden ? object.$pseudoElement : object.$element);
            rect = $element.get(0).getBoundingClientRect();
            result = false;
            offset = object.options.offset;
            elementTopMargin = parseInt($element.css('marginTop')) || 0;

            if (object.options.mode === 'smallHeight') {
                viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

                return ((rect.top + $element.outerHeight()) < viewportHeight);
            }

            if (0 && rect.top === rect.bottom && rect.bottom === 0 && object.$element.width() === 0 && object.$element.outerHeight() === 0) {
                console.log('ZEEEROOO.element', object.$element);
                console.log('ZEEEROOO.rect', rect);
                console.log('ZEEEROOO.width', object.$element.width());
                console.log('ZEEEROOO.height', object.$element.height());
            }

            if (object.options.direction === 'top') {
                result = (rect.top - elementTopMargin <= offset);
            }

            return result;
        }

        /**
         * Synchronize object and pseudo element dimensions.
         *
         * @param {StickyObject} object - object to Synchronize.
         */
        function syncPseudoElement(object) {
            var elementWidth = 0;

            try {
                object.$pseudoElement.show();
                if (!needCheckOnResize) {
                    object.$element.innerWidth(object.$pseudoElement.innerWidth());
                }
                if (!object.options.hidden) {
                    object.$pseudoElement.height(object.$element.outerHeight(true));
                }

                if (needCheckOnResize) {
                    object.$pseudoElement.hide();
                    object.$element
                        .removeClass(settings.attachedClass)
                        .removeClass(settings.attachedClass + '_' + object.options.direction)
                        .css('width', '')
                        .css('marginTop', '');

                    elementWidth = object.$element.innerWidth();
                    object.$element.innerWidth(elementWidth);
                    object.$pseudoElement.innerWidth(elementWidth);
                    object.$pseudoElement.show();

                    object.$element
                        .addClass(settings.attachedClass)
                        .addClass(settings.attachedClass + '_' + object.options.direction);
                }
            } catch (Error) {
                isDebug() && console.info('motoSticky : ERROR on syncPseudoElement', Error);
            }
        }

        /**
         * Attach object to top.
         *
         * @param {StickyObject} object - object to attach.
         * @returns {Boolean} - now always return true.
         */
        function attachObject(object) {
            if (!object.isAttached) {
                object.$element
                    .show()
                    .addClass(settings.attachedClass)
                    .addClass(settings.attachedClass + '_' + object.options.direction);
                object.isAttached = true;
            }
            syncPseudoElement(object);

            return true;
        }

        /**
         * UnAttach object from top.
         *
         * @param {StickyObject} object - object to UnAttach.
         * @returns {Boolean} - return true if object is not attached.
         */
        function unAttachObject(object) {
            object.$pseudoElement.width(object.$element.innerWidth());

            if (!object.isAttached) {
                return true;
            }

            object.$element.css('width', '');
            object.isAttached = false;
            object.$element
                .removeClass(settings.attachedClass)
                .removeClass(settings.attachedClass + '_' + object.options.direction);
            if (object.options.hidden) {
                object.$pseudoElement.height(0);
                object.$element.hide();
            } else {
                object.$pseudoElement.hide();
            }
        }

        /**
         * Check if object should be attached.
         * If should be, will be attached. In other case unattached.
         *
         * @param {StickyObject} object - object for checking.
         */
        function checkObject(object) {
            try {
                if (isNeedAttache(object)) {
                    attachObject(object);
                } else {
                    unAttachObject(object);
                }
            } catch (Error) {
                isDebug() && console.info('motoSticky : ERROR on checkObject', Error);
            }
        }

        /**
         * Check all objects.
         * Recursive function, always calling itself with $timeout.
         *
         * @param {Boolean} skipTimer - if passed true, new timeout would not be created.
         */
        function checkObjects(skipTimer) {
            var len;
            var i;

            try {
                if (!skipTimer) {
                    if ($timer) {
                        $timeout.cancel($timer);
                    }
                    $timer = $timeout(checkObjects, settings.interval);
                }

                if (!needCheck || objects.length < 1) {
                    return;
                }
                needCheck = false;

                for (i = 0, len = objects.length; i < len; i++) {
                    checkObject(objects[i]);
                }

                needCheckOnResize = false;
            } catch (Error) {
                isDebug() && console.info('motoSticky : ERROR on checkObjects', Error);
            }
        }

        /**
         * Create pseudo element for sticky element, if not yet created.
         *
         * @param {StickyObject} object - object to create.
         */
        function initPseudoElement(object) {
            if (object.$pseudoElement) {
                return;
            }
            object.$pseudoElement = angular.element('<div class="' + settings.pseudoElementClass + '"></div>');
            object.$pseudoElement.insertAfter(object.$element);
            if (object.options.hidden) {
                object.$pseudoElement.height(0);
            } else {
                object.$pseudoElement.hide();
                object.$pseudoElement.height(object.$element.outerHeight(true));
                object.$pseudoElement.width(object.$element.innerWidth());
            }
        }

        /**
         * Function adds 'load' event listeners to lazy load elements inside our sticky container.
         * because we should synchronize our pseudoElement after loading all the content.
         *
         * @param {StickyObject} object - Sticky object.
         */
        function addLazyElementsLoadListeners(object) {
            object.$element
                .find('.lazyload')
                    .each(function(i, lazyElement) {
                        $(lazyElement).one('load', function() {
                            checkObject(object);
                        });
                    });
        }

        /**
         * Handler on scroll/resize window events.
         *
         * @param {Object} event - jQuery event.
         */
        function onWindowChange(event) {
            if (event.type === 'resize') {
                needCheckOnResize = true;
            }
            needCheck = true;
        }

        /**
         * Handler on scroll popup event.
         */
        function onPopupChange() {
            needCheckOnResize = true;
            needCheck = true;
        }

        /**
         * Bind listeners on scroll and resize for popup content.
         * On scope destroying listeners will be unbounded.
         * If in popup more than one sticky element, redundant listeners will be prevented.
         *
         * @param {Object} $scope - Angular scope.
         * @param {Object} $popup - jQuery element popup content (.moto-popup_content)
         */
        function bindEventsForPopup($scope, $popup) {
            if (!$popup.hasClass('moto-sticky__handlers-attached')) {
                $popup
                    .addClass('moto-sticky__handlers-attached')
                    .on('scroll', onPopupChange)
                    .on('lazybeforeunveil', '.lazyload', function(event) {
                        $(event.target).one('load', onPopupChange);
                    });

                $scope.$on('$destroy', function() {
                    $popup.off('scroll');
                });
            }
        }

        /**
         * Create new object and add to global list of objects.
         * Entry point for directive.
         *
         * @param {Object} $scope - angular scope.
         * @param {Object} $element - jQuery element.
         * @param {Object} $attrs - angular $attrs object.
         * @returns {Undefined} - nothing useful.
         */
        function addObject($scope, $element, $attrs) {
            var $popup = $element.parents('.moto-popup_content');
            var inPopup = !!$popup.length;
            var object;
            var options;

            try {
                if ($element.parent().closest('.' + settings.bootstrappedClass).length > 0) {
                    return isDebug() && console.log('motoSticky : DETECTED PARENTS');
                }
                options = $scope.$eval($attrs.motoSticky);

                if (inPopup) {
                    options.offset = POPUP_TOP_MARGIN;
                    bindEventsForPopup($scope, $popup);
                }

                object = {
                    $scope: $scope,
                    $element: $element,
                    $attrs: $attrs,
                    options: angular.extend({}, defaultOptions, options),
                    isAttached: false
                };

                addLazyElementsLoadListeners(object);
                initPseudoElement(object);
                checkObject(object);

                objects.push(object);

            } catch (Error) {
                isDebug() && console.info('motoSticky : ERROR on addObject', Error);
            }
        }

        checkObjects();

        _window
            .scroll(onWindowChange)
            .resize(onWindowChange);

        return {
            restrict: 'A',
            compile: function($element) {
                $element.addClass(settings.bootstrappedClass);

                return addObject;
            }

        };
    }]);
/* Source: src/mt-includes/js/src/moto_storage/MotoStorageService.js*/
angular.module('website').service('website.MotoStorageService', [
    '$localStorage',
    'ipCookie',
    function($localStorage, ipCookie) {
        var prefix = window.websiteConfig.addressHash + '_';

        function getLocalStorageItem(key, defaultValue) {
            defaultValue = defaultValue || false;

            return $localStorage[prefix + key] || defaultValue;
        }

        function setLocalStorageItem(key, value) {
            return $localStorage[prefix + key] = value;
        }

        function removeLocalStorageItem(key) {
            delete $localStorage[prefix + key];
        }

        function getCookie(name) {
            return ipCookie(prefix + name);
        }

        function setCookie(name, value, params) {
            return ipCookie(prefix + name, value, params);
        }

        function removeCookie(name) {
            return ipCookie.remove(prefix + name);
        }

        this.getLocalStorageItem = getLocalStorageItem;
        this.setLocalStorageItem = setLocalStorageItem;
        this.removeLocalStorageItem = removeLocalStorageItem;

        this.getCookie = getCookie;
        this.setCookie = setCookie;
        this.removeCookie = removeCookie;
    }
]);
/* Source: src/mt-includes/js/src/moto_validation/MotoClearValidationOnChange.js*/
angular.module('moto.validation')
    .directive('motoClearValidationOnChange', function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function($scope, $element, $attrs, ngModel) {
                var rules, i, len;

                function setValidity(value) {
                    for (i = 0, len = rules.length; i < len; i++) {
                        ngModel.$setValidity(rules[i], true);
                    }
                    return value;
                }

                rules = $scope.$eval($attrs.motoClearValidationOnChange);
                if (!rules && $attrs.motoClearValidationOnChange) {
                    rules = $attrs.motoClearValidationOnChange;
                }
                if (rules && !angular.isArray(rules)) {
                    rules = [rules];
                }
                ngModel.$parsers.push(setValidity);
            }
        };
    });
/* Source: src/mt-includes/js/src/moto_website_directives/body.js*/
angular.module('website').directive('body', [
    '$rootScope',
    'website.Entertainment',
    'website.WidgetsRepository',
    function($rootScope, Entertainment, WidgetsRepository) {
        return {
            restrict: 'E',
            compile: function($element) {
                var thisWidget = WidgetsRepository.registry({
                    id: 'body',
                    name: '@body',
                    $scope: $rootScope,
                    $element: $element
                });

                // start dom compile and collect widgets
                WidgetsRepository.setDefaultParent(thisWidget);

                return {
                    post: function() {
                        // widgets collected
                        WidgetsRepository.setDefaultParent(null);
                        Entertainment.letsDance(thisWidget);
                    }
                };
            }
        };
    }
]);
/* Source: src/mt-includes/js/src/moto_website_directives/moto_truncate_string.js*/
angular.module('website')
    .filter('motoTruncateString', function() {
        return function(input, length, textEnd) {
            textEnd = textEnd || '...';
            if (isNaN(length) || length < (textEnd.length + 1)) {
                length = 10;
            }
            if (input.length > length) {
                input = input.substr(0, length - textEnd.length) + textEnd;
            }

            return input;
        };
    })
;
/* Source: src/mt-includes/js/src/rendering/render_service.js*/
angular.module('website.backend.RenderService').service('Website.Backend.RenderService', [
        'jsonrpc',
        function(jsonrpc) {
            var service = jsonrpc.newService('Website.RenderService');

            this.render = service.createMethod('render');
        }
    ]);/* Source: src/mt-includes/widgets/google_map_pro/src/common/google_map.jquery.plugin.js*/
(function($) {
    var GOOGLE_MAP_API_LOAD_STATUS = 'NOT_LOADED';
    var API_KEY = '';
    var _googleMapLoadedCallback = 'googleMapLoadedCallback_' + Date.now();
    var queue = [];

    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        GOOGLE_MAP_API_LOAD_STATUS = 'LOADED';
    }

    function resolveQueue(error) {
        var q;

        while (queue.length) {
            q = queue.shift();

            if (error) {
                q.deferred.reject(error);
            } else {
                q.deferred.resolve(q.instance());
            }
        }
    }

    window[_googleMapLoadedCallback] = function() {
        resolveQueue();
        delete window[_googleMapLoadedCallback];
        GOOGLE_MAP_API_LOAD_STATUS = 'LOADED';
    };

    function checkAndInjectGoogleMapSDK() {
        var $scriptElement;

        if (GOOGLE_MAP_API_LOAD_STATUS === 'LOADED') {
            return resolveQueue();
        }

        if (GOOGLE_MAP_API_LOAD_STATUS === 'LOADING') {
            return false;
        }

        GOOGLE_MAP_API_LOAD_STATUS = 'LOADING';
        $scriptElement = document.createElement('script');
        $scriptElement.type = 'text/javascript';
        $scriptElement.src = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&callback=' + _googleMapLoadedCallback;
        $scriptElement.defer = true;
        $scriptElement.onerror = function() {
            resolveQueue('Google Map SDK not loaded!');
        };

        document.body.appendChild($scriptElement);
    }

    /**
     * Update url for some resource
     *
     * @param {string} url
     * @param {string} [type]
     * @returns {string}
     */
    function resourceUrlResolveHandler(url) {
        return url;
    }

    function sanitizeMarker(marker) {
        if (!angular.isObject(marker)) {
            return marker;
        }

        if (marker.icon) {
            marker.icon = resourceUrlResolveHandler(marker.icon, 'marker.icon');
        }

        return marker;
    }

    $.fn.motoGoogleMap = function(options) {
        var deferred = $.Deferred();
        var mapDomElement = this[0];
        var _mapInstance;
        var MAP_STYLE_LIST = {
            'standard': [],
            'silver': [{'elementType': 'geometry', 'stylers': [{'color': '#f5f5f5'}]}, {'elementType': 'labels.icon', 'stylers': [{'visibility': 'off'}]}, {'elementType': 'labels.text.fill', 'stylers': [{'color': '#616161'}]}, {'elementType': 'labels.text.stroke', 'stylers': [{'color': '#f5f5f5'}]}, {'featureType': 'administrative.land_parcel', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#bdbdbd'}]}, {'featureType': 'poi', 'elementType': 'geometry', 'stylers': [{'color': '#eeeeee'}]}, {'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#757575'}]}, {'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [{'color': '#e5e5e5'}]}, {'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#9e9e9e'}]}, {'featureType': 'road', 'elementType': 'geometry', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'road.arterial', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#757575'}]}, {'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{'color': '#dadada'}]}, {'featureType': 'road.highway', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#616161'}]}, {'featureType': 'road.local', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#9e9e9e'}]}, {'featureType': 'transit.line', 'elementType': 'geometry', 'stylers': [{'color': '#e5e5e5'}]}, {'featureType': 'transit.station', 'elementType': 'geometry', 'stylers': [{'color': '#eeeeee'}]}, {'featureType': 'water', 'elementType': 'geometry', 'stylers': [{'color': '#c9c9c9'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#9e9e9e'}]}],
            'retro': [{'elementType': 'geometry', 'stylers': [{'color': '#ebe3cd'}]}, {'elementType': 'labels.text.fill', 'stylers': [{'color': '#523735'}]}, {'elementType': 'labels.text.stroke', 'stylers': [{'color': '#f5f1e6'}]}, {'featureType': 'administrative', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#c9b2a6'}]}, {'featureType': 'administrative.land_parcel', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#dcd2be'}]}, {'featureType': 'administrative.land_parcel', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#ae9e90'}]}, {'featureType': 'landscape.natural', 'elementType': 'geometry', 'stylers': [{'color': '#dfd2ae'}]}, {'featureType': 'poi', 'elementType': 'geometry', 'stylers': [{'color': '#dfd2ae'}]}, {'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#93817c'}]}, {'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{'color': '#a5b076'}]}, {'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#447530'}]}, {'featureType': 'road', 'elementType': 'geometry', 'stylers': [{'color': '#f5f1e6'}]}, {'featureType': 'road.arterial', 'elementType': 'geometry', 'stylers': [{'color': '#fdfcf8'}]}, {'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{'color': '#f8c967'}]}, {'featureType': 'road.highway', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#e9bc62'}]}, {'featureType': 'road.highway.controlled_access', 'elementType': 'geometry', 'stylers': [{'color': '#e98d58'}]}, {'featureType': 'road.highway.controlled_access', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#db8555'}]}, {'featureType': 'road.local', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#806b63'}]}, {'featureType': 'transit.line', 'elementType': 'geometry', 'stylers': [{'color': '#dfd2ae'}]}, {'featureType': 'transit.line', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#8f7d77'}]}, {'featureType': 'transit.line', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#ebe3cd'}]}, {'featureType': 'transit.station', 'elementType': 'geometry', 'stylers': [{'color': '#dfd2ae'}]}, {'featureType': 'water', 'elementType': 'geometry.fill', 'stylers': [{'color': '#b9d3c2'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#92998d'}]}],
            'dark': [{'elementType': 'geometry', 'stylers': [{'color': '#212121'}]}, {'elementType': 'labels.icon', 'stylers': [{'visibility': 'off'}]}, {'elementType': 'labels.text.fill', 'stylers': [{'color': '#757575'}]}, {'elementType': 'labels.text.stroke', 'stylers': [{'color': '#212121'}]}, {'featureType': 'administrative', 'elementType': 'geometry', 'stylers': [{'color': '#757575'}]}, {'featureType': 'administrative.country', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#9e9e9e'}]}, {'featureType': 'administrative.land_parcel', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'administrative.locality', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#bdbdbd'}]}, {'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#757575'}]}, {'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [{'color': '#181818'}]}, {'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#616161'}]}, {'featureType': 'poi.park', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#1b1b1b'}]}, {'featureType': 'road', 'elementType': 'geometry.fill', 'stylers': [{'color': '#2c2c2c'}]}, {'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#8a8a8a'}]}, {'featureType': 'road.arterial', 'elementType': 'geometry', 'stylers': [{'color': '#373737'}]}, {'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{'color': '#3c3c3c'}]}, {'featureType': 'road.highway.controlled_access', 'elementType': 'geometry', 'stylers': [{'color': '#4e4e4e'}]}, {'featureType': 'road.local', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#616161'}]}, {'featureType': 'transit', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#757575'}]}, {'featureType': 'water', 'elementType': 'geometry', 'stylers': [{'color': '#000000'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#3d3d3d'}]}],
            'night': [{'elementType': 'geometry', 'stylers': [{'color': '#242f3e'}]}, {'elementType': 'labels.text.stroke', 'stylers': [{'color': '#242f3e'}]}, {'elementType': 'labels.text.fill', 'stylers': [{'color': '#746855'}]}, {'featureType': 'administrative.locality', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#d59563'}]}, {'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#d59563'}]}, {'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [{'color': '#263c3f'}]}, {'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#6b9a76'}]}, {'featureType': 'road', 'elementType': 'geometry', 'stylers': [{'color': '#38414e'}]}, {'featureType': 'road', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#212a37'}]}, {'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#9ca5b3'}]}, {'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{'color': '#746855'}]}, {'featureType': 'road.highway', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#1f2835'}]}, {'featureType': 'road.highway', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#f3d19c'}]}, {'featureType': 'transit', 'elementType': 'geometry', 'stylers': [{'color': '#2f3948'}]}, {'featureType': 'transit.station', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#d59563'}]}, {'featureType': 'water', 'elementType': 'geometry', 'stylers': [{'color': '#17263c'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#515c6d'}]}, {'featureType': 'water', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#17263c'}]}],
            'aubergine': [{'elementType': 'geometry', 'stylers': [{'color': '#1d2c4d'}]}, {'elementType': 'labels.text.fill', 'stylers': [{'color': '#8ec3b9'}]}, {'elementType': 'labels.text.stroke', 'stylers': [{'color': '#1a3646'}]}, {'featureType': 'administrative.country', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#4b6878'}]}, {'featureType': 'administrative.land_parcel', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#64779e'}]}, {'featureType': 'administrative.province', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#4b6878'}]}, {'featureType': 'landscape.man_made', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#334e87'}]}, {'featureType': 'landscape.natural', 'elementType': 'geometry', 'stylers': [{'color': '#023e58'}]}, {'featureType': 'poi', 'elementType': 'geometry', 'stylers': [{'color': '#283d6a'}]}, {'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#6f9ba5'}]}, {'featureType': 'poi', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#1d2c4d'}]}, {'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{'color': '#023e58'}]}, {'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#3C7680'}]}, {'featureType': 'road', 'elementType': 'geometry', 'stylers': [{'color': '#304a7d'}]}, {'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#98a5be'}]}, {'featureType': 'road', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#1d2c4d'}]}, {'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{'color': '#2c6675'}]}, {'featureType': 'road.highway', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#255763'}]}, {'featureType': 'road.highway', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#b0d5ce'}]}, {'featureType': 'road.highway', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#023e58'}]}, {'featureType': 'transit', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#98a5be'}]}, {'featureType': 'transit', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#1d2c4d'}]}, {'featureType': 'transit.line', 'elementType': 'geometry.fill', 'stylers': [{'color': '#283d6a'}]}, {'featureType': 'transit.station', 'elementType': 'geometry', 'stylers': [{'color': '#3a4762'}]}, {'featureType': 'water', 'elementType': 'geometry', 'stylers': [{'color': '#0e1626'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#4e6d70'}]}]
        };

        function createInstance() {
            options.styles = MAP_STYLE_LIST[options.theme];
            _mapInstance = new google.maps.Map(mapDomElement, options);

            return {
                getMap: function() {
                    return _mapInstance;
                },
                setZoom: function(zoom) {
                    _mapInstance.setZoom(zoom);
                },
                getZoom: function() {
                    return _mapInstance.getZoom();
                },
                setCenter: function(center) {
                    return _mapInstance.setCenter(center);
                },
                getCenter: function() {
                    return {
                        lat: _mapInstance.getCenter().lat(),
                        lng: _mapInstance.getCenter().lng()
                    };
                },
                /**
                 * @type {MarkerCollection}
                 */
                _markers: new MarkerCollection(_mapInstance),
                addMarker: function(options) {
                    this._markers.add(options);
                },
                deleteMarker: function(marker) {
                    this._markers.delete(marker);
                },
                showOnlyMarker: function(marker) {
                    this._markers.showOnly(marker);
                },
                updateMarker: function(marker) {
                    this._markers.update(marker);
                },
                clearAllMarkers: function() {
                    this._markers.clearAll();
                }
            };
        }

        function MarkerCollection(map) {
             this.items = [];
             this.map = map;
             this.withInfowWindow = true;
        }

        MarkerCollection.prototype.add = function(marker) {
            var markerIndex;
            var markerData;

            if (Array.isArray(marker)) {
                angular.forEach(marker, this.add.bind(this));

                return this;
            }

            markerData = $.extend(true, {}, marker);

            if (!(marker instanceof google.maps.Marker)) {
                marker = new google.maps.Marker(marker);
            }
            sanitizeMarker(marker);
            marker.setMap(this.map);

            this.items.push(marker);
            if (this.withInfowWindow) {
                this.setInfoWindow(marker);
            } else {
                google.maps.event.addListener(marker, 'click', function() {
                    markerIndex = this.items.indexOf(marker);
                    $(document).trigger('motoGoogleMap:markerClick', [markerData, markerIndex]);
                }.bind(this));

                google.maps.event.addListener(marker, 'dragend', function() {
                    $(document).trigger('motoGoogleMap:markerDragend', marker.getPosition());
                }.bind(this));
            }

            return this;
        };

        MarkerCollection.prototype.update = function(data) {
            var name;
            var currentMarker = this.getByUid(data.uid);

            if (!angular.isObject(data)) {
                return false;
            }

            data = angular.copy(data);
            sanitizeMarker(data);

            for (name in data) {
                if (!data.hasOwnProperty(name)) {
                    continue;
                }
                if (name[0] === '_' || name[0] === '$' || typeof data[name] === 'function') {
                    continue;
                }
                try {
                    if (name === 'position') {
                        currentMarker.setPosition(data[name]);
                    } else {
                        currentMarker.set(name, data[name]);
                    }
                } catch (e) {
                    console.warn('UpdateMarker : error on set property value ', name, data[name]);
                }
            }

            return true;
        };

        MarkerCollection.prototype.delete = function(marker) {
            var index;

            marker = this.getByUid(marker.uid);
            if (!marker) {
                return;
            }
            marker.setMap(null);

            index = this.items.indexOf(marker);
            if (index > -1) {
                this.items.splice(index, 1);
            }
        };

        MarkerCollection.prototype.clearAll = function() {
            this.items.forEach(function(marker) {
                marker.setMap(null);
            });

            this.items = [];
        };

        MarkerCollection.prototype.getItems = function() {
            return this.items;
        };

        MarkerCollection.prototype.showOnly = function(marker) {
            var i;
            var len;

            for (i = 0, len = this.items.length; i < len; i ++) {
                if (this.items[i].get('uid') !== marker.uid) {
                    this.items[i].setVisible(false);
                } else {
                    this.items[i].setDraggable(true);
                }
            }
        };

        MarkerCollection.prototype.setInfoWindow = function(marker) {
            var infoWindow;

            if (marker.caption && marker.caption.length) {
                infoWindow = new google.maps.InfoWindow();
                infoWindow.setContent('<div class="moto-widget-text">' + marker.caption + '</div>');
                if (marker.showInfoByDefault) {
                    infoWindow.open(this.map, marker);
                }
                marker.addListener('click', function() {
                    infoWindow.open(this.map, marker);
                }.bind(this));
            }
        };

        MarkerCollection.prototype.getByUid = function(uid) {
            var i;
            var len;

            for (i = 0, len = this.items.length; i < len; i ++) {
                if (this.items[i].get('uid') === uid) {
                    return this.items[i];
                }
            }

            return null;
        };

        queue.push({
            deferred: deferred,
            instance: createInstance
        });

        checkAndInjectGoogleMapSDK();

        return deferred.promise();
    };

    /**
     * Set function for resolve resource url
     *
     * @param {function} handler
     * @returns {boolean}
     */
    $.fn.motoGoogleMap.setUrlResolveHandler = function(handler) {
        if (!angular.isFunction(handler)) {
            return false;
        }
        resourceUrlResolveHandler = handler;

        return true;
    };
    $.fn.motoGoogleMap.isSdkInjected = function() {
        return GOOGLE_MAP_API_LOAD_STATUS !== 'NOT_LOADED' && GOOGLE_MAP_API_LOAD_STATUS !== 'LOADING';
    };
    $.fn.motoGoogleMap.isSdkReady = function() {
        return GOOGLE_MAP_API_LOAD_STATUS === 'LOADED';
    };
    $.fn.motoGoogleMap.setApiKey = function(value) {
        if (typeof value !== 'string') {
            throw new Error('[motoGoogleMap.setApiKey] Bad argument: ApiKey must be a string, got ' + typeof value);
        }
        if ($.fn.motoGoogleMap.isSdkInjected()) {
            return false;
        }
        API_KEY = value;

        return true;
    };
}(jQuery));
/* Source: src/mt-includes/widgets/audio_player/frontend.js*/
angular.module('website.widget.audio_player', ['website.core']).directive('motoWidgetAudioPlayer', [
    'website.MediaService',
    '$q',
    'website.Entertainment',
    function(mediaService, $q, Entertainment) {
        return {
            restrict: 'AC',
            link: function($scope, $element, $attrs) {
                var buttons = $element.find('.moto-media-player-container').data('buttons');
                var canplayBound = false;
                var playPrevented = true;
                var entertainmentEnv = {
                    $scope: $scope,
                    $element: $element
                };
                var widgetAutoplayProperties = $scope.$eval($attrs.autoplaySettings);
                var autoplay;
                var motoMediaItem;
                var mediaElementInstance;
                var audioElement;
                var sourceElement;

                if (angular.isObject(widgetAutoplayProperties)) {
                    autoplay = {
                        enabled: true,
                        allowed: Entertainment.isEnabledPlaying($element),
                        forced: widgetAutoplayProperties.forced,
                        startOn: widgetAutoplayProperties.onlyWhenVisible ? 'onFirstVisible' : 'default'
                    };
                }

                audioElement = $element.find('audio');
                sourceElement = $element.find('source');

                motoMediaItem = mediaService.registerItem({
                    node: $element,
                    scope: $scope,
                    ready: false,
                    autoplay: autoplay,
                    pause: function() {
                        canplayBound = false;
                        audioElement.off('canplay');
                        playPrevented = true;
                        mediaElementInstance.pause();
                    },
                    play: function() {
                        playPrevented = false;

                        function play() {
                            $q.when(mediaElementInstance.domNode.play())
                                .then(function() {
                                    if (playPrevented) {
                                        mediaElementInstance.domNode.pause();
                                    } else {
                                        mediaElementInstance.domNode.play();
                                    }
                                })
                                .catch(function() {
                                    playPrevented = true;
                                    mediaService.autoplayFailed();
                                });
                        }

                        if (mediaElementInstance.readyState === 4) {
                            play();
                        } else {
                            canplayBound = true;
                            audioElement.one('canplay', function() {
                                canplayBound = false;
                                play();
                            });
                        }
                    },
                    isPlaying: function() {
                        return !mediaElementInstance.paused || (!playPrevented && canplayBound);
                    }
                });

                audioElement.mediaelementplayer({
                    classPrefix: 'mejs-',
                    setDimensions: false,
                    alwaysShowControls: true,
                    motoTrackName: sourceElement.attr('track-name') || '',
                    loop: audioElement.attr('loop'),
                    timeAndDurationSeparator: '<span>/</span>',
                    startVolume: 1,
                    playText: '',
                    pauseText: '',
                    stopText: '',
                    features: [
                        'playpause',
                        buttons.stop ? 'stop' : '',
                        'progress',
                        'current',
                        'duration',
                        'mototrackname',
                        'volume',
                        buttons.loop ? 'motoloop' : '',
                        'motoskin',
                        buttons.download ? 'motodownload' : ''
                    ],
                    plugins: [],
                    duration: sourceElement.attr('track-length'),
                    success: function(mediaElement, originalNode, instance) {
                        mediaElementInstance = instance;
                        mediaService.itemReady(motoMediaItem);
                    }
                });

                Entertainment.$onLetsDanceEvent(entertainmentEnv, function() {
                    motoMediaItem.autoplay.allowed = Entertainment.isEnabledPlaying($element);
                    mediaService.checkAndAutoplayItem(motoMediaItem);
                });
                Entertainment.$onLetsStopEvent(entertainmentEnv, function() {
                    motoMediaItem.autoplay.allowed = false;
                    motoMediaItem.pause();
                });
            }
        };
    }]);
/* Source: src/mt-includes/widgets/auth_form/frontend.js*/
angular.module('website.widget.auth_form', ['core.library.jsonrpc'])
    .service('widget.AuthForm.Service', [
        'jsonrpc',
        function(jsonrpc) {
            var service = jsonrpc.newService('AuthService');

            this.loginToPageByPassword = service.createMethod('loginToPageByPassword');
        }
    ])
    .directive('motoWidgetAuthForm', [
        'widget.AuthForm.Service',
        '$window',
        function(AuthFormService, $window) {
            return {
                restrict: 'C',
                scope: true,
                link: function($scope, $element, $attrs) {
                    $scope.request = {
                        password: '',
                        pageId: $attrs.destinationPageId
                    };
                    $scope.submit = function() {
                        if (!$scope.request.pageId) {
                            return;
                        }
                        $scope.authForm.password.$setTouched();
                        if ($scope.authForm.$valid) {
                            AuthFormService.loginToPageByPassword($scope.request)
                                .then(
                                    function() {
                                        $window.location.reload();
                                    },
                                    function(response) {
                                        if (response && response.code == '403') {
                                            $scope.authForm.password.$setValidity('passwordInvalid', false);
                                        } else {
                                            $scope.authForm.password.$setValidity('couldNotSend', false);
                                        }
                                    }
                                );
                        }
                    };
                }
            };
        }]);
/* Source: src/mt-includes/widgets/carousel/frontend.js*/
angular.module('website.widget.carousel', []).directive('motoCarouselOptions', [
    '$timeout',
    'website.Entertainment',
    function($timeout, Entertainment) {
        function getCarouselSettings(properties) {
            if (properties.itemsCount < 2) {
                properties.showPaginationDots = false;
            }

            return {
                mode: 'horizontal',
                auto: false,
                pause: properties.slideshowDelay * 1000,
                controls: properties.showNextPrev,
                pager: properties.showPaginationDots,
                slideWidth: properties.slideWidth,
                minSlides: properties.minSlides,
                maxSlides: properties.maxSlides,
                moveSlides: properties.moveSlides,
                slideMargin: properties.margins,
                stopAutoOnClick: true,
                shrinkItems: true
            };
        }

        /**
         * Patch toggle controls directions
         *
         * @param {jQuery} [$element]
         * @returns {boolean}
         */
        function toggleControls($element) {
            var $wrapper;
            var $controls;

            if (!angular.isElement($element)) {
                $element = this;
            }

            if (!angular.isElement($element)) {
                return false;
            }

            try {
                $wrapper = $element.parent().parent();
                $controls = $($wrapper.find('> .bx-controls')[0]);
                if ($controls.find('.bx-pager > .bx-pager-item').length > 1) {
                    $controls.find('.bx-controls-direction > a').removeClass('disabled');
                } else {
                    $controls.find('.bx-controls-direction > a').addClass('disabled');
                }
            } catch (e) {
            }

            return true;
        }

        return {
            restrict: 'A',
            priority: 450,
            link: function($scope, $element, $attrs) {
                var entertainmentEnv = {
                    $scope: $scope,
                    $element: $element
                };
                var properties = $scope.$eval($attrs.motoCarouselOptions);
                var settings = getCarouselSettings(properties);
                var instance;

                settings.onSliderLoad = function() {
                    $element.closest('.moto-widget-carousel').removeClass('moto-widget-carousel-loader');
                };
                if (settings.controls && settings.pager) {
                    settings.onSliderResize = toggleControls.bind($element);
                }

                instance = $element.bxSlider(settings);
                $scope.$on('$destroy', instance.destroySlider);

                Entertainment.$onLetsDanceEvent(entertainmentEnv, function() {
                    instance.reloadSlider(angular.extend({}, settings, {startSlide: instance.getCurrentSlide()}));
                    if (Entertainment.isDisabledPlaying($element)) {
                        return;
                    }
                    if (properties.slideshowEnabled) {
                        instance.startAuto();
                    }
                    $timeout(instance.redrawSlider);
                });
                Entertainment.$onLetsStopEvent(entertainmentEnv, function() {
                    instance.stopAuto();
                });
            }
        };
    }
]);
/* Source: src/mt-includes/widgets/contact_form/frontend.js*/
angular.module('website.widget.contact_form', ['core.library.jsonrpc', 'ngFileUpload'])
    .service('widget.ContactForm.Service', [
        'jsonrpc',
        function(jsonrpc) {
            var service = jsonrpc.newService('Widget.ContactForm');

            this.sendMessage = service.createMethod('sendMessage');
            this.getApiPath = jsonrpc.getBasePath;
        }
    ])
    // @ATTENTION : this directive will start on widgets 'contact_form', 'mail_chimp', 'auth_form'
    .directive('motoWidgetContactForm', [
        '$timeout',
        function($timeout) {
            return {
                restrict: 'C',
                scope: true,
                compile: function($element) {

                    return {
                        pre: function($scope) {

                            //prevent binding if parents not has specific css class
                            if ($element.closest('.moto-widget_interactive').length < 1) {
                                return;
                            }

                            function onInteraction() {
                                $scope.$emit('UserInteraction', 'StartInteraction');
                            }

                            // wrapper for IE on focus/blur window
                            function onInteractionTimeOuted() {
                                $timeout(onInteraction);
                            }

                            $element.on('click', onInteraction);
                            $element.on('focus', 'input, select, textarea, button, a', onInteractionTimeOuted);

                            $scope.$on('$destroy', function() {
                                $element.off('click', onInteraction);
                                $element.off('focus', onInteractionTimeOuted);
                            });
                        }
                    };
                }
            };
        }
    ])
    .controller('widget.ContactForm.Controller', [
        '$scope',
        '$element',
        'widget.ContactForm.Service',
        'Upload',
        'website.MotoLinkActionService',
        'website.BrowserTabClosingConfirmation',
        function($scope, $element, WidgetService, Upload, MotoLinkActionService, BrowserTabClosingConfirmation) {
            var inputs = $element.find('input, textarea');
            var emailExp = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z0-9-]+)$/;
            var widgetId;
            var input;
            var name;
            var requiredCheckbox;
            var i;
            var len;

            $scope.message = {};
            $scope.placeholder = {};
            $scope.hash = '';
            $scope.attachments = [];
            $scope.attachment = {};

            if (inputs.length) {
                for (i = 0, len = inputs.length; i < len; i++) {
                    input = angular.element(inputs[i]);
                    name = input.attr('name');

                    if (!name) {
                        continue;
                    }

                    $scope.message[name] = $scope.message[name] || '';
                    if (name === 'checkbox') {
                        $scope.placeholder[name] = $element.find('.moto-widget-contact_form-checkbox-text').text() || name;
                    } else {
                        $scope.placeholder[name] = input.attr('placeholder') || name;
                    }
                }
            }

            $scope.validateEmailOnBlur = function() {
                var valid;

                $scope.contactForm.email.$pristine = false;

                if ($scope.contactForm.email.$viewValue !== '') {
                    valid = emailExp.test($scope.contactForm.email.$viewValue);
                    if (valid) {
                        $scope.contactForm.email.emailInvalid = false;
                        $scope.contactForm.email.$setValidity('pattern', true);
                    } else {
                        $scope.contactForm.email.emailInvalid = true;
                        $scope.contactForm.email.$setValidity('pattern', false);
                    }
                } else {
                    $scope.contactForm.email.emailInvalid = false;
                }
            };

            $scope.validate = function(fieldName) {
                if (fieldName === 'email') {
                    $scope.validateEmailOnBlur();
                }
            };

            $scope.validateCheckbox = function() {
                if (!requiredCheckbox) {
                    return;
                }
                $scope.contactForm.checkbox.$pristine = false;
                if (!$scope.contactForm.checkbox.$viewValue) {
                    $scope.contactForm.checkbox.$invalid = true;
                    $scope.contactForm.checkbox.$setValidity('required', false);
                    $scope.contactForm.$valid = false;
                } else {
                    $scope.contactForm.checkbox.$invalid = false;
                    $scope.contactForm.checkbox.$setValidity('required', true);
                }
            };

            $scope.checkboxChanged = function() {
                $scope.contactForm.checkbox.$invalid && $scope.validateCheckbox();
            };

            $scope.requiredCheckbox = function() {
                requiredCheckbox = true;
            };

            $scope.errors = [];
            $scope.emailSent = false;
            $scope.showSuccessMessage = false;
            $scope.triedToSend = false;

            function onErrorCallback() {
                $scope.emailError = true;
                $scope.sending = false;

                BrowserTabClosingConfirmation.disable(widgetId);
            }

            function resetForm() {
                angular.forEach($scope.message, function(value, key) {
                    $scope.message[key] = '';
                });

                $scope.contactForm.$setPristine();
                $scope.contactForm.$setUntouched();
            }

            function onSuccessCallback(data) {
                if (data.error) {
                    return onErrorCallback(data.error);
                }
                $scope.emailSent = true;
                $scope.triedToSend = false;
                $scope.sending = false;

                if ($scope.resetAfterSubmission) {
                    resetForm();
                }

                BrowserTabClosingConfirmation.disable(widgetId);

                if (angular.isObject($scope.actionAfterSubmission) && $scope.actionAfterSubmission.action !== 'none' ) {
                    MotoLinkActionService.execute($scope.actionAfterSubmission);
                } else {
                    $scope.showSuccessMessage = true;
                }
            }

            $scope.submit = function() {
                if ($scope.sending) {
                    return;
                }
                $scope.emailSent = false;
                $scope.showSuccessMessage = false;
                $scope.triedToSend = true;
                $scope.errors = [];
                $scope.sending = true;
                $scope.emailError = false;

                if (typeof $scope.contactForm.$error.required === 'object') {
                    $scope.contactForm.$error.required.forEach(function(elem) {
                        elem.$dirty = true;
                        elem.$pristine = false;
                        elem.$setTouched();
                    });
                    $scope.contactForm.$valid = false;
                } else {
                    $scope.contactForm.$valid = true;
                }

                if ($scope.contactForm.email) {
                    $scope.validate('email');
                }
                if ($scope.contactForm.checkbox) {
                    $scope.validateCheckbox();
                }
                if ($scope.contactForm && $scope.contactForm.$valid) {
                    widgetId = 'widget.ContactForm_' + new Date().getTime();
                    BrowserTabClosingConfirmation.enable(widgetId);
                    if ($scope.attachment && $scope.attachment.name) {
                        $scope.message._attachments = $scope.attachment.name ? 1 : 0;
                        Upload
                            .upload({
                                method: 'POST',
                                url: WidgetService.getApiPath(),
                                file: $scope.attachment,
                                data: {
                                    jsonrpc: '2.0',
                                    id: 1,
                                    method: 'Widget.ContactForm.sendMessage',
                                    params: {message: $scope.message, placeholder: $scope.placeholder, hash: $scope.hash}
                                },
                                headers: {
                                    'X-Requested-With': 'XMLHttpRequest'
                                }
                            })
                            .success(onSuccessCallback)
                            .error(onErrorCallback);
                    } else {
                        WidgetService.sendMessage({message: $scope.message, placeholder: $scope.placeholder, hash: $scope.hash})
                            .success(onSuccessCallback)
                            .error(onErrorCallback);
                    }
                } else {
                    $scope.sending = false;
                }
            };
        }
    ]);
/* Source: src/mt-includes/widgets/countdown/frontend.js*/
angular.module('website.widget.countdown', ['timer', 'website.core.humanize_duration'])
    .directive('motoWidgetCountdown', ['$window', function($window) {

        function timeByTimezone(time, timezone) {
            var year;
            var month;
            var day;
            var hours;
            var minutes;
            var seconds;
            var milliseconds;
            var localDate;
            var dateByTimezone;
            var timeByTimezone;

            localDate = new Date();
            localDate.setTime(time);
            milliseconds = localDate.getMilliseconds();
            seconds = localDate.getSeconds();
            minutes = localDate.getMinutes();
            hours = localDate.getHours();
            day = localDate.getDate();
            month = localDate.getMonth();
            year = localDate.getFullYear();
            dateByTimezone = new Date();
            dateByTimezone.setUTCFullYear(year);
            dateByTimezone.setUTCDate(1);
            dateByTimezone.setUTCMonth(month || 0);
            dateByTimezone.setUTCDate(day || 1);
            dateByTimezone.setUTCHours(hours || 0);
            dateByTimezone.setUTCMinutes((minutes || 0) - (Math.abs(timezone) < 30 ? timezone * 60 : timezone));
            dateByTimezone.setUTCSeconds(seconds || 0);
            dateByTimezone.setUTCMilliseconds(milliseconds || 0);
            timeByTimezone = dateByTimezone.getTime();

            return timeByTimezone;
        }

        return {
            restrict: 'C',
            scope: true,
            compile: function($element, $attrs) {
                var timerElement = $element.children('timer');
                var amountElements = $element.find('.countdown-item-amount');
                var amountElement;
                var amountElementNgBindAttr;
                var time = parseFloat($attrs.time);
                var nowTime = new Date().getTime();
                var i;

                function onExpiryHandler() {
                    if ($attrs.onExpiry === 'hide') {
                        $element.slideUp();
                    } else if ($attrs.onExpiry === 'redirect' && $attrs.redirectUrl) {
                        $window.location.href = $attrs.redirectUrl;
                    }
                }

                for (i = 0; i < amountElements.length; i++) {
                    amountElement = angular.element(amountElements[i]);
                    amountElementNgBindAttr = amountElement.attr('data-ng-bind');
                    if (i === 0) {
                        timerElement.attr('max-time-unit', '\'' + amountElementNgBindAttr.slice(0, -1) + '\'');
                    }
                    if (['hours', 'minutes', 'seconds'].indexOf(amountElementNgBindAttr) >= 0) {
                        amountElement.attr('data-ng-bind', amountElementNgBindAttr[0] + amountElementNgBindAttr);
                    }
                }

                return {
                    pre: function($scope) {
                        if ($attrs.type === 'event') {
                            $scope.countdownTime = (timeByTimezone(time, parseFloat($attrs.timezone)) - nowTime) / 1000;
                        } else {
                            $scope.countdownTime = time / 1000;
                        }
                        if (!$scope.countdownTime || isNaN($scope.countdownTime) || $scope.countdownTime < 0) {
                            $scope.countdownTime = 0;
                        }
                        $attrs.onExpiry && $attrs.onExpiry !== 'stop' && $scope.$on('timer-stopped', onExpiryHandler);
                    }
                };
            }
        };
    }]);
/* Source: src/mt-includes/widgets/disqus/frontend.js*/
angular.module('website.widget.disqus', ['website.core'])
    .directive('motoWidgetDisqus', ['motoDependencyService', function(DependencyService) {
        var exists = false;

        return {
            restrict: 'AC',
            link: function($scope, $element, $attrs) {
                var params;

                try {
                    // remove element if already exists - disqus can not work with multiple widgets
                    if (exists) {
                        return $element.remove();
                    }
                    exists = true;
                    params = $attrs.params || {};
                    if (angular.isString(params)) {
                        params = angular.fromJson(params);
                    }
                    params.url = $attrs.url;
                    window['disqus_config'] = function() {
                        this.language = params.language;
                    };
                    if (params.use_identifier) {
                        delete params.url;
                    } else {
                        delete params.identifier;
                    }
                    delete params.use_identifier;
                    if (params && params.shortname && params.shortname != '') {
                        DependencyService.get('disqus')
                            // before injecting SDK we need to set params object
                            .setParams(params)
                            // after configuration we inject SDK
                            .require();
                    }
                } catch (ignored) {}
            }
        };
    }]);
/* Source: src/mt-includes/widgets/facebook/frontend.js*/
/**
 * @TODO : create module website.widget.facebook and angular.module('website.widget.facebook_page_plugin', ['website.widget.facebook'])
 */

angular.module('website.widget.facebook_page_plugin', ['website.core'])
    .config([
        'motoWebsiteSettingsServiceProvider',
        'motoDependencyServiceProvider',
        function(WebsiteSettingsServiceProvider, DependencyServiceProvider) {
            var dependency;

            try {
                dependency = DependencyServiceProvider.get('facebook');
                dependency.setLanguage(WebsiteSettingsServiceProvider.get('preferredLocale', 'en_US'));
            } catch (e) {
            }
        }])
    .directive('motoWidgetFacebookPagePlugin', [
        'motoDependencyService',
        function(DependencyService) {
            return {
                restrict: 'AC',
                link: function() {
                    try {
                        DependencyService.require('facebook');
                    } catch (e) {
                    }
                }
            };
        }]);
/* Source: src/mt-includes/widgets/google_map_pro/src/frontend/frontend.js*/
angular.module('website.widget.google_map_pro', []).directive('motoWidgetGoogleMapProWrapper', [
    function() {
        return {
            restrict: 'C',
            link: function($scope, $element, $attrs) {
                $element.motoGoogleMap(JSON.parse($attrs.mapProperties)).then(
                    function(instance) {
                        instance.addMarker(JSON.parse($attrs.mapMarkers));
                    }
                );
            }
        };
    }]);
/* Source: src/mt-includes/widgets/grid_gallery/frontend.js*/
angular.module('website.widget.grid_gallery', [])
    .directive('motoGridGalleryOptions', function() {
        return {
            restrict: 'A',
            priority: 450,
            link: function($scope, $element, $attrs) {
                var options = $scope.$eval($attrs.motoGridGalleryOptions);

                $element.justifiedGallery({
                    rowHeight: options.rowHeight,
                    maxRowHeight: (options.fixedHeight) ? options.rowHeight : 0,
                    margins: options.margins,
                    lastRow: options.lastRow,
                    captions: options.showCaptions,
                    cssAnimation: true
                });

                if (options.enableLightbox) {
                    $element.magnificPopup({
                        delegate: 'a',
                        type: 'image',
                        tClose: '',
                        tLoading: '',
                        mainClass: options.showCounter ? '' : 'moto-lightbox_hidden-counter',
                        gallery: {
                            enabled: true,
                            preload: [5, 10],
                            tPrev: '',
                            tNext: '',
                            tCounter: '%curr% / %total%'
                        },
                        image: {
                            titleSrc: function(item) {
                                return angular.element('.caption', item.el.context).html() || '';
                            }
                        },
                        zoom: {
                            enabled: true,
                            duration: 400,
                            easing: 'ease-in-out'
                        }
                    });
                }
            }
        };
    });
/* Source: src/mt-includes/widgets/instagram/frontend.js*/
angular.module('website.widget.instagram.post', ['website.core']).directive('motoWidgetInstagramPost', [
    'motoDependencyService',
    function(DependencyService) {
        return {
            restrict: 'C',
            link: function() {
                try {
                    DependencyService.require('instagram_post');
                } catch (e) {
                }
            }
        };
    }]);
/* Source: src/mt-includes/widgets/mail_chimp/frontend.js*/
angular.module('website.widget.mail_chimp', ['core.library.jsonrpc'])
    .service('website.widget.MailChimpService', [
        'jsonrpc',
        function(jsonrpc) {
            var service = jsonrpc.newService('Widget.MailChimp');

            this.subscribe = service.createMethod('subscribe');
        }
    ])
    .controller('widget.MailChimp.Controller', [
        '$scope',
        '$element',
        'website.widget.MailChimpService',
        'website.MotoLinkActionService',
        'website.BrowserTabClosingConfirmation',
        function($scope, $element, WidgetService, MotoLinkActionService, BrowserTabClosingConfirmation) {
            var inputs = $element.find('input');
            var emailExp = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z0-9-]+)$/;
            var widgetId;
            var len = inputs.length;
            var input;
            var name;
            var i;
            var requiredCheckbox;

            $scope.listId = '';
            $scope.message = {};
            $scope.emailSent = false;
            $scope.showSuccessMessage = false;
            $scope.triedToSend = false;
            $scope.emailError = false;
            $scope.isSubscribed = false;

            if (len) {
                for (i = 0; i < len; i++) {
                    input = angular.element(inputs[i]);
                    name = input.attr('name');

                    if (!name) {
                        continue;
                    }

                    $scope.message[name] = $scope.message[name] || input.attr('value') || '';
                }
            }

            $scope.validateEmailOnBlur = function() {
                var valid;

                $scope.subscribeForm.email.$pristine = false;

                if ($scope.subscribeForm.email.$viewValue != '') {
                    valid = emailExp.test($scope.subscribeForm.email.$viewValue);
                    if (valid) {
                        $scope.subscribeForm.email.emailInvalid = false;
                        $scope.subscribeForm.email.$setValidity('pattern', true);
                    } else {
                        $scope.subscribeForm.email.emailInvalid = true;
                        $scope.subscribeForm.email.$setValidity('pattern', false);
                    }
                } else {
                    $scope.subscribeForm.email.emailInvalid = false;
                }
            };

            $scope.validateRequiredOnBlur = function(fieldName) {
                $scope.subscribeForm[fieldName].$pristine = false;
                if ($scope.subscribeForm[fieldName].$viewValue == '') {
                    $scope.subscribeForm[fieldName].$invalid = true;
                    $scope.subscribeForm.$valid = false;
                } else {
                    $scope.subscribeForm[fieldName].$invalid = false;
                }
            };

            $scope.validate = function(fieldName) {
                if (fieldName == 'email') {
                    $scope.validateEmailOnBlur();
                    $scope.validateRequiredOnBlur(fieldName);
                } else {
                    $scope.validateRequiredOnBlur(fieldName);
                }
            };

            $scope.validateCheckbox = function() {
                if (!requiredCheckbox) {
                    return;
                }
                $scope.subscribeForm.checkbox.$pristine = false;
                if (!$scope.subscribeForm.checkbox.$viewValue) {
                    $scope.subscribeForm.checkbox.$invalid = true;
                    $scope.subscribeForm.checkbox.$setValidity('required', false);
                    $scope.subscribeForm.$valid = false;
                } else {
                    $scope.subscribeForm.checkbox.$invalid = false;
                    $scope.subscribeForm.checkbox.$setValidity('required', true);
                }
            };

            $scope.checkboxChanged = function() {
                $scope.subscribeForm.checkbox.$invalid && $scope.validateCheckbox();
            };

            $scope.requiredCheckbox = function() {
                requiredCheckbox = true;
            };

            function resetForm() {
                angular.forEach($scope.message, function(value, key) {
                    $scope.message[key] = '';
                });

                $scope.subscribeForm.$setPristine();
                $scope.subscribeForm.$setUntouched();
            }

            function onSuccessCallback() {
                $scope.emailSent = true;
                $scope.triedToSend = false;
                $scope.sending = false;

                if ($scope.resetAfterSubmission) {
                    resetForm();
                }

                BrowserTabClosingConfirmation.disable(widgetId);

                if (angular.isObject($scope.actionAfterSubmission) && $scope.actionAfterSubmission.action !== 'none' ) {
                    MotoLinkActionService.execute($scope.actionAfterSubmission);
                } else {
                    $scope.showSuccessMessage = true;
                }
            }

            function onErrorCallback(error) {
                $scope.emailError = true;
                $scope.sending = false;

                BrowserTabClosingConfirmation.disable(widgetId);

                //TODO: bad way of checking subscribing
                if (error.data && error.data.errors && error.data.errors.detail) {
                    $scope.isSubscribed = error.data.errors.detail.match(/is already a list member/g);
                }
            }

            $scope.submit = function() {
                if ($scope.sending) {
                    return;
                }
                $scope.emailSent = false;
                $scope.showSuccessMessage = false;
                $scope.triedToSend = true;
                $scope.sending = true;
                $scope.emailError = false;
                $scope.isSubscribed = false;

                if (typeof $scope.subscribeForm.$error.required == 'object') {
                    $scope.subscribeForm.$error.required.forEach(function(elem) {
                        elem.$dirty = true;
                        elem.$pristine = false;
                        elem.$setTouched();
                    });
                    $scope.subscribeForm.$valid = false;
                } else {
                    $scope.subscribeForm.$valid = true;
                }

                $scope.validate('email');
                $scope.validateCheckbox();
                if ($scope.subscribeForm && $scope.subscribeForm.$valid && !$scope.subscribeForm.emailInvalid) {
                    widgetId = 'widget.MailChimp_' + new Date().getTime();

                    BrowserTabClosingConfirmation.enable(widgetId);
                    $scope.message.list_id = $scope.listId || '';
                    WidgetService.subscribe({request: $scope.message})
                        .success(onSuccessCallback)
                        .error(onErrorCallback);
                } else {
                    $scope.sending = false;
                }
            };

        }
    ]);
/* Source: src/mt-includes/widgets/menu/frontend.js*/
angular.module('website.widget.menu', [])
    .directive('motoWidgetMenu', function() {
        var $window = $(window);
        var menus = [];
        var previousCheckingWindowSize;

        function _isWindowBig() {
            return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) >= 768;
        }

        previousCheckingWindowSize = _isWindowBig();

        /**
         * Reset menu to default state
         *
         * @BugFix : MOTOCMS-5286
         *
         * @param {Object} menu Wigdet menu helper
         * @param {jQuery} menu.$element Menu element
         * @param {jQuery} menu.$toggleButton Hamburger element of menu
         * @private
         */
        function _resetMenu(menu) {
            // reset sub menus status
            menu.$element.find('.moto-widget-menu-item-has-submenu_opened').removeClass('moto-widget-menu-item-has-submenu_opened');
            // reset display to 'unset', need because $().toggle() force style
            menu.$element.find('.moto-widget-menu-sublist').css('display', '');
            // reset hamburger button status
            // check this on template with only hamb
            menu.$element.removeClass('moto-widget-menu-mobile-open');
        }

        function _onResizeWindow() {
            var i;
            var len;
            var isWindowBig = _isWindowBig();

            if (previousCheckingWindowSize === isWindowBig) {
                // breakpoint not changed
                return;
            }

            previousCheckingWindowSize = isWindowBig;
            if (!isWindowBig) {
                return;
            }

            for (i = 0, len = menus.length; i < len; i++) {
                try {
                    _resetMenu(menus[i]);
                } catch (e) {

                }
            }
        }

        $window.on('resize', _onResizeWindow);

        return {
            restrict: 'C',
            priority: 450,
            link: function($scope, $element) {
                var toggleButton = $element.find('.moto-widget-menu-toggle-btn');
                var itemsWithSubmenus = $element.find('.moto-widget-menu-item-has-submenu');
                var submenus = itemsWithSubmenus.find('.moto-widget-menu-sublist');
                var submenuArrows = $element.find('.moto-widget-menu-link-arrow');

                menus.push({$element: $element, $toggleButton: toggleButton});

                // toggle menu button functionality for mobile version
                toggleButton.on('click', function(e) {
                    e.preventDefault();
                    $element.toggleClass('moto-widget-menu-mobile-open');
                    if ($element.hasClass('moto-widget-menu-mobile-open')) {
                        if (submenuArrows.is(':visible')) {
                            submenus.hide();
                        }
                    }
                });

                // handle submenu arrows click events for mobile version
                if (itemsWithSubmenus.length) {
                    submenuArrows.on('click', function(e) {
                        if (toggleButton.is(':hidden')) {
                            return;
                        }
                        e.preventDefault();
                        $(this).closest('.moto-widget-menu-item-has-submenu').toggleClass('moto-widget-menu-item-has-submenu_opened').find('> .moto-widget-menu-sublist').toggle();
                    });
                }
            }
        };
    });
/* Source: src/mt-includes/widgets/moto_callback/src/frontend/frontend.js*/
angular.module('website.widget.MotoCallback', []).directive('motoWidgetCallback', [
    function() {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $element.motoCallback();
            }
        };
    }
]);
/* Source: src/mt-includes/widgets/pinterest/frontend.js*/
angular.module('website.widget.pinterest', ['website.core'])
    .directive('motoWidgetPinterest', ['motoDependencyService', function(DependencyService) {
        return {
            restrict: 'AC',
            link: function() {
                try {
                    DependencyService.get('pinterest')
                        .require();
                } catch (e) {
                }
            }
        };
    }]);
/* Source: src/mt-includes/widgets/slider/frontend.js*/
angular.module('website.widget.slider', []).directive('motoSliderOptions', [
    '$timeout',
    'website.Entertainment',
    function($timeout, Entertainment) {
        function getSliderSettings(properties) {
            if (properties.itemsCount < 2) {
                properties.showPaginationDots = false;
            }

            return {
                mode: properties.slideshowAnimationType,
                auto: false,
                pause: properties.slideshowDelay * 1000,
                controls: properties.showNextPrev,
                pager: properties.showPaginationDots,
                captions: properties.showSlideCaptions,
                stopAutoOnClick: true
            };
        }

        return {
            restrict: 'A',
            priority: 450,
            link: function($scope, $element, $attrs) {
                var entertainmentEnv = {
                    $scope: $scope,
                    $element: $element
                };
                var properties = $scope.$eval($attrs.motoSliderOptions);
                var settings = getSliderSettings(properties);
                var instance;
                var captionElements;

                settings.onSliderLoad = function() {
                    $element.closest('.moto-widget-slider').removeClass('moto-widget-slider-loader');
                };
                instance = $element.bxSlider(settings);
                $scope.$on('$destroy', instance.destroySlider);

                Entertainment.$onLetsDanceEvent(entertainmentEnv, function() {
                    // save elements with bx-caption class, because bxSlider remove them in reloadSlider fn
                    captionElements = instance.find('.bx-caption');
                    captionElements.removeClass('bx-caption');
                    captionElements.css('display', 'none');
                    instance.reloadSlider(angular.extend({}, settings, {startSlide: instance.getCurrentSlide()}));
                    captionElements.addClass('bx-caption');
                    captionElements.css('display', '');

                    if (Entertainment.isDisabledPlaying($element)) {
                        return;
                    }
                    if (properties.slideshowEnabled) {
                        instance.startAuto();
                    }
                    $timeout(instance.redrawSlider);
                });
                Entertainment.$onLetsStopEvent(entertainmentEnv, function() {
                    instance.stopAuto();
                });

            }
        };
    }
]);
/* Source: src/mt-includes/widgets/social_buttons/frontend.js*/
angular.module('website.widget.social_buttons', ['website.core'])
    .directive('motoWidgetSocialButtons', [
        '$rootScope',
        function($rootScope) {
            return {
                restrict: 'AC',
                link: function($scope, $element) {
                    // @TODO : optimize on multiply widget
                    function onLinkedInLoaded() {
                        var $li;

                        try {
                            $li = $element.find('li.social-button[data-name="linkedIn_share"]');
                            // @TODO : find all li with data-provider="linkedin" end recreate widgets
                            if ($li.length) {
                                $li = angular.element($li.get(0));
                                // @TODO : need get attributes, remove 'src' if exists & not get content
                                $li.html($li.html().replace('<span', '<script').replace('</span>', '</script>'));
                                IN.parse();
                            }
                        } catch (e) {
                        }
                    }

                    // @TODO : scan widgets & subscribe if only widget has linkedin widgets
                    if (window.IN && angular.isFunction(window.IN.parse)) {
                        onLinkedInLoaded();
                    } else {
                        $rootScope.$on('motoDependencyService.linkedin.loaded', onLinkedInLoaded);
                    }
                }
            };
        }]);
/* Source: src/mt-includes/widgets/tile_gallery/src/frontend/frontend.js*/
angular.module('website.widget.tile_gallery', []).directive('motoWidgetTileGalleryItemsWrapper', [
    function() {
        return {
            restrict: 'C',
            link: function($scope, $element) {
                $element.tileGallery();
            }
        };
    }]);
/* Source: src/mt-includes/widgets/twitter/frontend.js*/
angular.module('website.widget.twitter', ['website.core', 'website.widget.twitter.time_line']);
angular.module('website.widget.twitter.time_line', ['ng'])
    .directive('motoWidgetTwitterTimeLine', ['motoDependencyService', function(DependencyService) {
        return {
            restrict: 'AC',
            link: function() {
                try {
                    DependencyService.require('twitter');
                } catch (e) {
                }
            }
        };
    }]);
/* Source: src/mt-includes/widgets/video_player/frontend.js*/
angular.module('website.widget.video_player', ['website.core', 'website.core.media'])

// @ATTENTION : this directive will start on widgets 'video_player', 'audio_player'
.directive('motoMediaPlayer', [
    function() {
        return {
            restrict: 'AC',
            scope: true,
            compile: function($element) {
                return {
                    pre: function($scope) {
                        //prevent binding if parents not has specific css class
                        if ($element.closest('.moto-widget_interactive').length < 1) {
                            return;
                        }

                        function onInteraction() {
                            $scope.$emit('UserInteraction', 'StartInteraction');
                        }

                        $element.on('click', onInteraction);
                        $scope.$on('$destroy', function() {
                            $element.off('click', onInteraction);
                        });
                    }
                };
            }
        };
    }
])

.directive('motoWidgetVideoPlayer', [
    'website.MediaService',
    '$q',
    'website.Entertainment',
    function(mediaService, $q, Entertainment) {
        return {
            restrict: 'AC',
            link: function($scope, $element, $attrs) {
                var canplayBound = false;
                var playPrevented = true;
                var entertainmentEnv = {
                    $scope: $scope,
                    $element: $element
                };
                var widgetAutoplayProperties = $scope.$eval($attrs.autoplaySettings);
                var autoplay;
                var motoMediaItem;
                var videoElement;
                var mediaElementInstance;
                var buttons = $element.find('.moto-media-player-container').data('buttons');

                if (angular.isObject(widgetAutoplayProperties)) {
                    autoplay = {
                        enabled: true,
                        allowed: Entertainment.isEnabledPlaying($element),
                        forced: widgetAutoplayProperties.forced,
                        startOn: widgetAutoplayProperties.onlyWhenVisible ? 'onFirstVisible' : 'default'
                    };
                }

                videoElement = $element.find('video');
                videoElement.on('loadeddata', function() {
                    mediaElementInstance.options.alwaysShowControls = false;
                });

                motoMediaItem = mediaService.registerItem({
                    node: $element,
                    scope: $scope,
                    ready: false,
                    autoplay: autoplay,
                    pause: function() {
                        canplayBound = false;
                        videoElement.off('canplay');
                        playPrevented = true;
                        mediaElementInstance.pause();
                    },
                    play: function() {
                        playPrevented = false;

                        function play() {
                            $q.when(mediaElementInstance.domNode.play())
                                .then(function() {
                                    if (playPrevented) {
                                        mediaElementInstance.domNode.pause();
                                    } else {
                                        mediaElementInstance.domNode.play();
                                    }
                                })
                                .catch(function() {
                                    playPrevented = true;
                                    mediaService.autoplayFailed();
                                });
                        }

                        if (mediaElementInstance.readyState === 4) {
                            play();
                        } else {
                            canplayBound = true;
                            videoElement.one('canplay', function() {

                                canplayBound = false;
                                play();
                            });
                        }
                    },
                    isPlaying: function() {
                        return !mediaElementInstance.paused || (!playPrevented && canplayBound);
                    }
                });

                videoElement.mediaelementplayer({
                    classPrefix: 'mejs-',
                    motoTrackName: videoElement.attr('title') || '',
                    timeAndDurationSeparator: '<span>/</span>',
                    startVolume: 1,
                    playText: '',
                    pauseText: '',
                    alwaysShowControls: true,
                    fullscreenText: '',
                    allyVolumeControlText: '',
                    videoVolume: 'horizontal',
                    features: [
                        'playpause',
                        'progress',
                        'current',
                        'duration',
                        'mototrackname',
                        'volume',
                        'fullscreen',
                        buttons.download ? 'motodownload' : '',
                        'motoskin'
                    ],
                    plugins: [],
                    duration: videoElement.attr('duration'),
                    success: function(mediaElement, originalNode, instance) {
                        mediaElementInstance = instance;
                        mediaService.itemReady(motoMediaItem);
                    }
                });
                Entertainment.$onLetsDanceEvent(entertainmentEnv, function() {
                    if (mediaElementInstance) {
                        mediaElementInstance.globalResizeCallback();
                    }
                    motoMediaItem.autoplay.allowed = Entertainment.isEnabledPlaying($element);
                    mediaService.checkAndAutoplayItem(motoMediaItem);
                });
                Entertainment.$onLetsStopEvent(entertainmentEnv, function() {
                    motoMediaItem.autoplay.allowed = false;
                    motoMediaItem.pause();
                });
            }
        };
    }]);
/* Source: src/mt-includes/widgets/accordion/src/frontend/init.js*/
angular.module('website.widget.accordion', []);
/* Source: src/mt-includes/widgets/content_slider/src/frontend/init.js*/
angular.module('website.widget.content_slider', [
    'website.core.utils',
    'website.core.widgets'
]);
/* Source: src/mt-includes/widgets/google_search/src/frontend/init.js*/
angular.module('website.widget.google_search', [
    'ngSanitize',
    'website.widget.google_search.directive',
    'website.widget.google_search.service'

]);
/* Source: src/mt-includes/widgets/tabs/src/frontend/init.js*/
angular.module('website.widget.tabs', []);
/* Source: src/mt-includes/widgets/accordion/src/frontend/accordion_item.frontend.js*/
angular.module('website.widget.accordion').directive('motoWidgetAccordionItem', [
    'website.WidgetsRepository',
    function(WidgetsRepository) {
        return {
            restrict: 'C',
            scope: true,
            compile: function($element) {
                var thisWidget = WidgetsRepository.registry($element);

                return {
                    pre: function($scope) {
                        thisWidget.setScope($scope);
                    }
                };
            }
        };
}]);
/* Source: src/mt-includes/widgets/accordion/src/frontend/accordion.frontend.js*/
angular.module('website.widget.accordion').directive('motoWidgetAccordion', [
    'website.WidgetsRepository',
    'website.Entertainment',
    function(WidgetsRepository, Entertainment) {
        return {
            restrict: 'C',
            scope: true,
            compile: function($element) {
                var thisWidget = WidgetsRepository.registry($element);

                return {
                    pre: function($scope) {
                        thisWidget.setScope($scope);
                    },
                    post: function() {
                        $element.motoAccordion({
                            onOpening: function(item) {
                                Entertainment.letsStartAnimation(thisWidget.getChild(item.id));
                            },
                            onOpened: function(item) {
                                Entertainment.letsDance(thisWidget.getChild(item.id));
                            },
                            onClosing: function(item) {
                                Entertainment.letsStopDancing(thisWidget.getChild(item.id));
                            },
                            onClosed: function(item) {
                                Entertainment.letsStopAnimation(thisWidget.getChild(item.id));
                            }
                        });
                    }
                };
            }
        };
    }]);
/* Source: src/mt-includes/widgets/accordion/src/frontend/moto_accordion.jquery.plugin.js*/
(function($) {
    var ITEM_OPENED_CLASS = 'moto-widget-accordion__item_open';
    var ITEM_COLLAPSING_CLASS = 'moto-widget-accordion__item_collapsing';
    var ITEM_COLLAPSING_TIME = 400;
    var _$window = $(window);

    /**
     * @typedef {Object} AccordionItem
     * @property {jQuery} $node - accordion item node (.moto-widget-accordion__item)
     * @property {ContentWidgetClass} widget - accordion website widget instance
     * @property {Boolean} opened - item opened status
     * @property {jQuery} $wrapperNode - accordion wrapper node (.moto-widget-accordion__content-wrapper)
     */

    /**
     * Close one item.
     *
     * @param {AccordionItem} item - item for closing
     * @param {function} [closingCallback] - function to call before closing an item
     * @param {function} [closedCallback] - function to call when item will be closed
     */
    function closeItem(item, closingCallback, closedCallback) {
        item.opened = false;
        item.$wrapperNode
            .slideUp({
                duration: ITEM_COLLAPSING_TIME,
                start: function() {
                    item.$node
                        .addClass(ITEM_COLLAPSING_CLASS)
                        .removeClass(ITEM_OPENED_CLASS);
                    closingCallback && closingCallback(item);
                },
                complete: function() {
                    item.$node.removeClass(ITEM_COLLAPSING_CLASS);
                    closedCallback && closedCallback(item);
                }
            });
    }

    /**
     * Scroll to the item if it is out of the browser window.
     *
     * @param {AccordionItem} item - item for scrolling to
     */
    function scrollToItem(item) {
        var element = item.$node;

        if (element.offset().top < $(document).scrollTop()) {
            $('html, body').animate({
                scrollTop: element.offset().top
            }, ITEM_COLLAPSING_TIME);
        }
    }

    /**
     * Open one item.
     *
     * @param {AccordionItem} item - item for opening
     * @param {function} [openingCallback] - function to call before opening an item
     * @param {function} [openedCallback] - function to call when item will be opened
     */
    function openItem(item, openingCallback, openedCallback) {
        item.opened = true;
        item.$wrapperNode
            .slideDown({
                duration: ITEM_COLLAPSING_TIME,
                start: function() {
                    item.$node
                        .addClass(ITEM_COLLAPSING_CLASS)
                        .addClass(ITEM_OPENED_CLASS);
                        openingCallback && openingCallback(item);
                },
                complete: function() {
                    item.$node.removeClass(ITEM_COLLAPSING_CLASS);
                    scrollToItem(item);
                    openedCallback && openedCallback(item);
                }
            });
    }

    /**
     * Toggle item state.
     *
     * @param {AccordionItem} item - item for toggling
     * @param {function} [openingCallback] - function to call before opening an item
     * @param {function} [openedCallback] - function to call when item will be opened
     * @param {function} [closingCallback] - function to call before closing an item
     * @param {function} [closedCallback] - function to call when item will be closed
     */
    function toggleItem(item, openingCallback, openedCallback, closingCallback, closedCallback) {
        item.opened ? closeItem(item, closingCallback, closedCallback) : openItem(item, openingCallback, openedCallback);
    }

    /**
     * Close all opened items
     *
     * @param {Object} items - object with items
     * @param {function} [closingCallback] - function to call before closing an item
     * @param {function} [closedCallback] - function to call when item will be closed
     */
    function closeOpenedItems(items, closingCallback, closedCallback) {
        var id;

        for (id in items) {
            if (!items.hasOwnProperty(id)) {
                continue;
            }
            if (items[id].opened) {
                closeItem(items[id], closingCallback, closedCallback);
            }
        }
    }

    function getVirtualStructure(childrenElements, options) {
        var result = {};
        var currentId;
        var $currentElement;
        var i;

        // create items object for current accordion
        for (i = 0; i < childrenElements.length; i++) {
            $currentElement = $(childrenElements[i]);
            currentId = $currentElement.attr('id') || $currentElement.attr('data-widget-id');
            result[currentId] = {
                id: currentId,
                $node: $currentElement,
                opened: $currentElement.hasClass(ITEM_OPENED_CLASS),
                $wrapperNode: $currentElement.children('.moto-widget-accordion__content-wrapper')
            };
            if (result[currentId].opened) {
                options.onOpened && options.onOpened(result[currentId]);
            } else {
                options.onClosed && options.onClosed(result[currentId]);
            }
        }

        return result;
    }

    $.fn.motoAccordion = function(options) {
        var $element = this;
        var closeOthers = typeof $element.attr('data-close-others') !== 'undefined';
        var items;

        if (typeof options !== 'object') {
            options = {};
        }

        items = getVirtualStructure($element.find('>.moto-widget-accordion__wrapper>.moto-widget-accordion__item'), options);

        $element.off('click', '>.moto-widget-accordion__wrapper>.moto-widget-accordion__item>.moto-widget-accordion__header');
        $element.on('click', '>.moto-widget-accordion__wrapper>.moto-widget-accordion__item>.moto-widget-accordion__header', function(event) {
            var itemId = $(event.currentTarget).attr('data-widget-id');
            var item = items[itemId];

            if (item.opened || !closeOthers) {
                toggleItem(item, options.onOpening, options.onOpened, options.onClosing, options.onClosed);
            } else {
                closeOpenedItems(items, options.onClosing, options.onClosed);
                openItem(item, options.onOpening, options.onOpened);
            }
            _$window.resize();
        });
    };
})(jQuery);
/* Source: src/mt-includes/widgets/actions/src/frontend/init.frontend.js*/
angular.module('website.widget.actions', [
    'website.widget.actions.open_popup',
    'website.widget.actions.scroll_to'
]);
/* Source: src/mt-includes/widgets/actions/src/frontend/open_popup.frontend.js*/
angular.module('website.widget.actions.open_popup', []).directive('motoWidgetActionsOpenPopup', [
    '$timeout',
    'website.MotoPopupService',
    'motoBeforeInViewport',
    function($timeout, MotoPopupService, motoBeforeInViewport) {
        return {
            restrict: 'C',
            scope: true,
            link: function($scope, $element, $attrs) {
                var widgetProperties = $scope.$eval($attrs.actionsOpenPopupOptions);
                var popupCallback;

                if (!widgetProperties.popupId || !MotoPopupService.shouldPopupBeOpened(widgetProperties.actionId, widgetProperties.recurrenceCondition, widgetProperties.recurrenceOptions)) {
                    return;
                }

                function recurrenceOpenPopupCallback() {
                    MotoPopupService.updateDataInStorage(widgetProperties.actionId, widgetProperties.recurrenceCondition);
                }

                function openPopup() {
                    MotoPopupService.pleaseOpenPopup(widgetProperties.popupId, popupCallback);
                }

                if (widgetProperties.recurrenceCondition !== 'always') {
                    popupCallback = recurrenceOpenPopupCallback;
                }

                if (widgetProperties.triggerType === 'timer') {
                    $timeout(openPopup, widgetProperties.delayTime);
                } else if (widgetProperties.triggerType === 'placement') {
                    motoBeforeInViewport.startWatching({
                        element: $element,
                        onEnter: openPopup
                    });
                }
            }
        };
    }]);
/* Source: src/mt-includes/widgets/actions/src/frontend/scroll_to_anchor.frontend.js*/
angular.module('website.widget.actions.scroll_to', []).directive('motoWidgetActionsScrollTo', [
    function() {
        return {
            restrict: 'C',
            scope: true,
            link: function($scope, $element, $attrs) {
                var anchor = $attrs.anchor;
                var time = parseFloat($attrs.time) * 1000;

                if (angular.isDefined(anchor)) {
                    $element.on('click', function() {
                        var $anchor = $('a[name=' + anchor + ']');

                        if ($anchor.length) {
                            $('html, body').animate({
                                scrollTop: $anchor.offset().top
                            }, time);
                        }
                    });
                }
            }
        };
    }]);
/* Source: src/mt-includes/widgets/content_slider/src/frontend/slider_item.frontend.js*/
angular.module('website.widget.content_slider').directive('motoWidgetContentSliderItem', [
    'website.ContentWidgetClass',
    'website.WidgetsRepository',
    function(ContentWidgetClass, WidgetsRepository) {
        var debug = false;

        return {
            restrict: 'C',
            scope: true,
            compile: function($element) {
                var thisWidget = new ContentWidgetClass($element);

                WidgetsRepository.registry(thisWidget);
                debug && console.log('SLIDER.ITEM : COMPILE()');

                return {
                    pre: function($scope) {
                        debug && console.log('SLIDER.ITEM : PRE()');
                        thisWidget.setScope($scope);
                    }
                };
            }
        };
    }
]);
/* Source: src/mt-includes/widgets/content_slider/src/frontend/slider.frontend.js*/
angular.module('website.widget.content_slider').directive('motoContentSlider', [
    'website.ContentWidgetClass',
    'website.ElementHeightWatcherClass',
    'website.WidgetsRepository',
    'MotoIntervalService',
    function(ContentWidgetClass, ElementHeightWatcherClass, WidgetsRepository, MotoIntervalService) {
        var debug = false;
        var resizeEvent = window.document.createEvent('Event');

        resizeEvent.initEvent('resize', true, false);

        function updateWindow() {
            setTimeout(window.dispatchEvent.bind(null, resizeEvent), 50);
        }

        // @TODO : add allowing set custom handlers

        return {
            restrict: 'A',
            scope: true,
            compile: function($element) {
                /**
                 * @type {ContentWidgetClass}
                 */
                var thisWidget = new ContentWidgetClass($element);
                /**
                 * @type {ElementHeightWatcherClass}
                 */
                var HeightWatcher = new ElementHeightWatcherClass({
                    $element: $element.find('#' + thisWidget.id + '__loader'),
                    watchSelector: '#' + thisWidget.id + '__content > .moto-widget'
                });
                var slides = $element.find('.moto-widget-content_slider__item');
                var heightWatcherInstance;
                var heightWatcherThrottleCounter = 0;

                HeightWatcher.show();
                WidgetsRepository.registry(thisWidget);

                function checkSliderItemsHeight() {
                    var widgetHeight;
                    var currentSlideHeight;

                    if (heightWatcherThrottleCounter < 5) {
                        heightWatcherThrottleCounter++;

                        return;
                    }

                    heightWatcherThrottleCounter = 0;
                    widgetHeight = $element.innerHeight();
                    currentSlideHeight = slides.eq(this.getCurrentSlide()).find('.moto-widget__content-wrapper>.moto-widget__content>.moto-cell').innerHeight();

                    if (currentSlideHeight !== widgetHeight) {
                        this.redrawSlider();
                    }
                }

                /// context for 'this' equal on compile(), pre(), post()
                debug && console.log('SLIDER : COMPILE()');

                return {
                    pre: function($scope) {
                        debug && console.log('SLIDER : PRE()');

                        thisWidget.setScope($scope);
                    },
                    post: function($scope, $element, $attrs) {
                        var instance;
                        var SliderPreferences;
                        var SliderOptions;
                        var defaultPreferences = {
                            startAnimation: 'onArriving'
                        };
                        var defaultOptions = {
                            auto: false,
                            pause: 10000,
                            controls: false,
                            pager: false,
                            stopAutoOnClick: true,
                            preloadImages: 'all'
                        };
                        var handlers = {
                            /**
                             * @context bxSlider instance
                             * @param index
                             */
                            onSliderLoad: function(index) {
                                var slide = thisWidget.getChild(index);

                                if (HeightWatcher) {
                                    HeightWatcher.destroy();
                                    HeightWatcher = null;
                                }
                                debug && console.warn('onSliderLoad()', index);

                                thisWidget.$element.removeClass('moto-widget__state_loading');
                                this.redrawSlider();

                                heightWatcherInstance = MotoIntervalService.registerCallback(checkSliderItemsHeight.bind(this));

                                if (!slide) {
                                    debug && console.warn('SLIDER : cant find slide by index', index);

                                    return;
                                }
                                slide.onVisibleImmediately(SliderPreferences);
                                updateWindow();
                            },
                            onSliderResize: function(index) {
                                var slider = thisWidget.getChild(index);

                                debug && console.warn('onSliderResize()', index);

                                if (slider) {
                                    slider.onResizing();
                                }
                            },
                            onSlideBefore: function(element, oldIndex, newIndex) {
                                var prevSlide = thisWidget.getChild(oldIndex);
                                var newSlide = thisWidget.getChild(newIndex);

                                debug && console.warn('onSlideBefore()', oldIndex, newIndex, element.attr('id'));

                                if (prevSlide) {
                                    debug && console.log('SLIDER : old slide : onVanishing()');
                                    prevSlide.onVanishing();
                                } else {
                                    debug && console.warn('SLIDER : cant find slide', oldIndex);
                                }

                                if (newSlide) {
                                    debug && console.log('SLIDER : new slide : onArriving()');
                                    newSlide.onArriving(SliderPreferences);
                                } else {
                                    debug && console.warn('SLIDER : cant find slide', newIndex);
                                }
                                updateWindow();
                            },
                            onSlideAfter: function(element, oldIndex, newIndex) {
                                var prevSlide = thisWidget.getChild(oldIndex);
                                var newSlide = thisWidget.getChild(newIndex);

                                debug && console.warn('onSlideAfter()', oldIndex, newIndex, element.attr('id'));

                                if (prevSlide) {
                                    debug && console.log('SLIDER : old slide : onVanished()');
                                    prevSlide.onVanished();
                                } else {
                                    debug && console.warn('SLIDER : cant find slide', oldIndex);
                                }

                                if (newSlide) {
                                    debug && console.log('SLIDER : new slide : onArrived()');
                                    newSlide.onArrived(SliderPreferences);
                                } else {
                                    debug && console.warn('SLIDER : cant find slide', newIndex);
                                }
                            },
                            onSlideNext: function(element, oldIndex, newIndex) {
                                debug && console.warn('onSlideNext()', oldIndex, newIndex);
                            },
                            onSlidePrev: function(element, oldIndex, newIndex) {
                                debug && console.warn('onSlidePrev()', oldIndex, newIndex);
                            }
                        };

                        debug && console.log('SLIDER : POST()');

                        $scope.params = $scope.$eval($attrs.motoContentSlider);

                        if (!angular.isObject($scope.params)) {
                            $scope.params = {};
                        }
                        if (!angular.isObject($scope.params.options)) {
                            $scope.params.options = {};
                        }
                        if (!angular.isObject($scope.params.preferences)) {
                            $scope.params.preferences = {};
                        }

                        SliderPreferences = angular.copy(defaultPreferences);
                        angular.extend(SliderPreferences, $scope.params.preferences);
                        SliderOptions = angular.copy(defaultOptions);
                        angular.extend(SliderOptions, $scope.params.options);
                        // hide controls and pager when there is just one (or zero) slide
                        if (thisWidget.$content.find('>.moto-widget-content_slider__item').length <= 1) {
                            SliderOptions.controls = false;
                            SliderOptions.pager = false;
                        }
                        angular.extend(SliderOptions, handlers);

                        debug && console.log('SLIDER : Preferences', SliderPreferences);

                        $scope.$on('UserInteraction', function(event, action) {
                            debug && console.log('SLIDER [UserInteraction] : ', action);
                            if (action === 'StartInteraction') {
                                if (instance) {
                                    debug && console.log('   => stop SlideShow');
                                    instance.stopAuto();
                                } else {
                                    debug && console.log('  => update options');
                                    SliderOptions.auto = false;
                                }
                            }
                        });

                        debug && console.log('SLIDER : Start bxSlider with options ', SliderOptions);
                        instance = thisWidget.$content.bxSlider(SliderOptions);

                        $scope.$on('$destroy', function() {
                            if (instance) {
                                instance.destroySlider();
                            }
                            if (HeightWatcher) {
                                HeightWatcher.destroy();
                                HeightWatcher = null;
                            }
                            heightWatcherInstance();
                            WidgetsRepository.forget(thisWidget);
                        });
                    }
                };
            }
        };
    }
]);
/* Source: src/mt-includes/widgets/form_elements/src/frontend/directiveMotoFormAttachmentButton.js*/
angular.module('website.core.form').directive('motoFormAttachmentButton', [
    '$timeout',
    function($timeout) {

        /**
         * Update model validation value
         *
         * @param {Object} model
         * @param {Function} model.$setValidity
         * @param {Array|Object|string} errors
         * @param {boolean} state
         * @returns {boolean}
         */
        function updateModelValidity(model, errors, state) {
            var i;
            var len;

            if (angular.isUndefined(errors) || angular.isUndefined(state)) {
                return false;
            }

            state = !!state;

            //collect error names
            if (angular.isObject(errors)) {
                errors = Object.keys(errors);
            }
            if (!angular.isArray(errors)) {
                errors = [errors];
            }

            for (i = 0, len = errors.length; i < len; i++) {
                model.$setValidity(errors[i], state);
            }

            return true;
        }

        /**
         * Update model validation, transform error by each file to model error
         *
         * @param {Object} model
         * @param {Array} model.$modelValue
         * @param {Object|string} model.$error
         * @param {Function} model.$setValidity
         * @returns {boolean}
         */
        function checkModelValidations(model) {
            var i;
            var len;
            var files = model.$modelValue;

            if (files instanceof File) {
                files = [files];
            }
            if (!angular.isArray(files) || files.length < 1) {
                return false;
            }

            for (i = 0, len = files.length; i < len; i++) {
                updateModelValidity(model, files[i].$error, false);
            }

            return true;
        }

        /**
         * Check model for 'required' validation
         *
         * @param {Object} model
         * @param {null|File|File[]} model.$modelValue
         * @param {Function} model.$setValidity
         */
        function checkRequired(model) {
            if (!model.$modelValue || angular.isArray(model.$modelValue) && model.$modelValue.length < 1) {
                model.$setValidity('required', false);
            }
        }

        /**
         * Parser function to convert 'null' to undefined
         * Fix for repeat select file and cancel them, backend not understand 'null' value for file
         * On sending request to server undefined values will ignoring
         *
         * @param {*} value
         * @returns {*}
         */
        function updateValueFromNullToUndefined(value) {
            if (value === null) {
                value = undefined;
            }

            return value;
        }

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function($scope, $element, $attrs, ngModel) {

                /**
                 * Validate model
                 */
                function checkValidations() {
                    updateModelValidity(ngModel, ngModel.$error, true);
                    checkModelValidations(ngModel);
                    if ($attrs.required) {
                        checkRequired(ngModel);
                    }
                    // fix for FF
                    ngModel.$setTouched();
                }

                /**
                 * Call 'checkValidations' function no next apply
                 *
                 * @param {*} value
                 * @returns {*}
                 */
                function checkValidationsWrapper(value) {
                    // timeout is need because value is array and angular validator remove error required for empty array
                    $timeout(checkValidations);

                    return value;
                }

                /**
                 * Handler for remove attached file
                 *
                 * @param {Object} $event
                 * @param {File} file
                 */
                function onRemoveAttachedFile($event, file) {
                    var index;

                    // ngModel.$modelValue and $attrs.$$ngfPrevValidFiles it is same array

                    if (!(file instanceof File)) {
                        return false;
                    }

                    // remove file for single mode
                    if (ngModel.$modelValue === file) {
                        ngModel.$setViewValue(undefined);
                    }

                    if (angular.isArray($attrs.$$ngfPrevValidFiles)) {
                        index = $attrs.$$ngfPrevValidFiles.indexOf(file);
                        if (index > -1) {
                            $attrs.$$ngfPrevValidFiles.splice(index, 1);
                        }
                    }
                    if (angular.isArray($attrs.$$ngfPrevInvalidFiles)) {
                        index = $attrs.$$ngfPrevInvalidFiles.indexOf(file);
                        if (index > -1) {
                            $attrs.$$ngfPrevInvalidFiles.splice(index, 1);
                        }
                    }

                    checkValidationsWrapper();
                }

                $scope.$on('MotoForm::removeAttachedFile', onRemoveAttachedFile);

                ngModel.$parsers.push(checkValidationsWrapper);
                ngModel.$parsers.push(updateValueFromNullToUndefined);
            }
        };
    }
]);/* Source: src/mt-includes/widgets/form_elements/src/frontend/directiveMotoFormAttachmentField.js*/
angular.module('website.core.form').directive('motoFormAttachmentField', [
    function() {
        return {
            restrict: 'A',
            scope: true,
            link: function($scope) {
                $scope.removeAttachedFile = function(file) {
                    $scope.$broadcast('MotoForm::removeAttachedFile', file);
                };
            }
        };
    }
]);/* Source: src/mt-includes/widgets/form_elements/src/frontend/directiveMotoFormErrors.js*/
angular.module('website.core.form').directive('motoFormErrors', [
    function() {
        var DEFAULT_MESSAGES = {
            minlength: 'The field lengths should be more than [[ MIN_LENGTH ]] characters',
            maxlength: 'The field lengths should not exceed [[ MAX_LENGTH ]] characters',
            min: 'The value should be more than [[ MIN_VALUE ]]',
            max: 'The value should not exceed [[ MAX_VALUE ]]',
            email: 'Please enter a valid email',
            url: 'Please enter a valid URL',
            number: 'Please enter a valid number',
            tel: 'Please enter a valid phone number', //ng: unknown validator
            pattern: 'Please enter a valid [[ PATTERN ]]',
            required: 'The field is required',
            date: 'Please enter a valid date in format YYYY-MM-DD',
            maxFileSize: 'The file size should not exceed [[ MAX_SIZE ]]',
            fileExtension: 'This file extension is not supported'
        };
        var associationMap = {
            minlength: 'MIN_LENGTH',
            maxlength: 'MAX_LENGTH',
            min: 'MIN_VALUE',
            max: 'MAX_VALUE',
            maxFileSize: 'MAX_SIZE'
        };

        return {
            restrict: 'A',
            templateUrl: '@websiteWidgets/form_elements/moto_form_errors.ng.html',
            scope: {
                $FORM: '=form',
                fieldName: '@',
                fieldType: '@',
                // @TODO : try to get rules values from input
                rules: '='
            },
            link: function($scope) {
                var messages = null;
                var name;

                if (!$scope.$FORM) {
                    return false;
                }

                if (angular.isFunction($scope.$FORM.getValidationMessages)) {
                    messages = angular.copy($scope.$FORM.getValidationMessages());
                }

                if (angular.isObject(messages) && !angular.isArray(messages)) {
                    for (name in DEFAULT_MESSAGES) {
                        if (!DEFAULT_MESSAGES.hasOwnProperty(name)) {
                            continue;
                        }
                        if (angular.isString(messages[name]))  {
                            messages[name] = messages[name].trim();
                            if (messages[name].length > 0) {
                                continue;
                            }
                        }
                        messages[name] = DEFAULT_MESSAGES[name];
                    }
                } else {
                    messages = angular.copy(DEFAULT_MESSAGES);
                }

                if (angular.isObject($scope.rules) && !angular.isArray($scope.rules)) {
                    for (name in $scope.rules) {
                        if (!$scope.rules.hasOwnProperty(name) || !associationMap[name] || !messages[name]) {
                            continue;
                        }

                        messages[name] = messages[name].replace('[[ ' + associationMap[name] + ' ]]', $scope.rules[name]);
                    }
                }

                $scope.messages = messages;
            }
        };
    }
]);
/* Source: src/mt-includes/widgets/form_elements/src/frontend/directiveMotoGoogleRecaptcha.js*/
angular.module('website.widget.google_recaptcha', ['vcRecaptcha'])
    .directive('motoWidgetFormElementsRecaptcha', [
        'vcRecaptchaService',
        function(vcRecaptchaService) {
            return {
                restrict: 'C',
                scope: true,
                link: function($scope, $element, $attrs) {
                    $scope.setWidgetId = function(widgetId) {
                        $scope.widgetId = widgetId;
                    };
                    $scope.$on('MotoForm::submitSuccess', function() {
                        vcRecaptchaService.reload($scope.widgetId);
                        $scope.$FORM[$attrs.fieldName].$invalid = false;
                        $scope.$FORM[$attrs.fieldName].$touched = false;
                    });
                }
            };
        }]);
/* Source: src/mt-includes/widgets/google_search/src/frontend/directive.js*/
angular.module('website.widget.google_search.directive', []).directive('motoWidgetGoogleSearchResultContent', [
    'widget.GoogleSearch.Service',
    'website.library.PaginatorClass',
    function(service, PaginatorClass) {
        return {
            restrict: 'C',
            scope: true,
            controller: ['$scope', '$attrs', function($scope, $attrs) {
                try {
                    $scope.settings = JSON.parse($attrs.settings);
                } catch (e) {
                }

                $scope.error = !$attrs.token || !$scope.settings || !$scope.settings.searchQuery;

                if ($scope.error) {
                    return;
                }

                $scope.Loading = false;

                function onError(error) {
                    $scope.error = true;
                    $scope.Paginator.reset();
                    $scope.resultItems = null;
                }

                $scope.doSearch = function(token) {
                    $scope.Loading = true;
                    service.doSearch({token: token})
                        .then(
                            function(response) {
                                $scope.resultItems = response.results.items;
                                //@TODO : review
                                if ($scope.Paginator.isDataExists()) {
                                    $scope.Paginator.setCurrentPageNumber(response.results.pagination.current);
                                } else {
                                    $scope.Paginator.setData(response.results.pagination);
                                }
                            },
                            onError
                        )
                        .catch(onError)
                        .finally(function() {
                            $scope.Loading = false;
                        });
                };

                /**
                 * @type {PaginatorClass}
                 */
                $scope.Paginator = new PaginatorClass();

                $scope.Paginator.$on('selected', function(event, page) {
                    $scope.doSearch(page.token);
                });

                $scope.doSearch($attrs.token);
            }]
        };
    }
]);
/* Source: src/mt-includes/widgets/google_search/src/frontend/service.js*/
angular.module('website.widget.google_search.service', [])
    .service('widget.GoogleSearch.Service', [
        'jsonrpc',
        function(jsonrpc) {
            var service = jsonrpc.newService('Widget.GoogleSearch');

            this.doSearch = service.createMethod('doSearch');
            this.getApiPath = jsonrpc.getBasePath;
        }
    ]);
/* Source: src/mt-includes/widgets/integrations/src/frontend/acuity_scheduling.frontend.js*/
angular.module('website.widget.integrations.acuity_scheduling', []).directive('motoAcuitySchedulingButton', [
    function() {
        return {
            restrict: 'A',
            scope: true,
            link: function ($scope) {
                $scope.openAcuitySchedulingPopup = function(url) {
                    var content =
                        '<div class="moto-popup_content" style="background: white;">' +
                            '<iframe src="' + url + '" width="100%" height="800" frameBorder="0"></iframe>' +
                            '<script src="https://d3gxy7nm8y4yjr.cloudfront.net/js/embed.js" type="text/javascript"></script>' +
                        '</div>';

                    $.magnificPopup.close();
                    $.magnificPopup.open({
                        items: {
                            src: $(content),
                            type: 'inline'
                        },
                        mainClass: 'moto-popup',
                        closeOnBgClick: false,
                        callbacks: {
                            open: function() {
                                $('.mfp-content').css('width', '900px');
                            }
                        }
                    });
                };
            }
        };
    }]);
/* Source: src/mt-includes/widgets/integrations/src/frontend/airbnb.frontend.js*/
/**
 * Directive motoWidgetIntegrationsAirbnb
 */

angular.module('website.widget.integrations.airbnb', []).directive('motoWidgetIntegrationsAirbnb', [
    'motoDependencyService',
    function(DependencyService) {
        return {
            restrict: 'AC',
            link: function() {
                try {
                    window.AirbnbAPI.bootstrap();
                } catch (e) {
                    DependencyService.require('airbnb_embed');
                }
            }
        };
    }]);
/* Source: src/mt-includes/widgets/integrations/src/frontend/init.frontend.js*/
angular.module('website.widget.integrations', [
    'website.widget.integrations.acuity_scheduling',
    'website.widget.integrations.airbnb',
    'website.widget.integrations.opentable'
]);
/* Source: src/mt-includes/widgets/integrations/src/frontend/opentable.frontend.js*/
/**
 * Directive motoWidgetIntegrationsOpentableLoader
 *
 * Created for loading Opentable scripts in series, not parallel.
 */

angular.module('website.widget.integrations.opentable', []).directive('motoWidgetIntegrationsOpentableLoader', [
    function() {
        var _order = [];
        var loading = false;

        function resolveNext() {
            var currentItem;
            var scriptNode;

            if (!_order.length || loading) {
                return;
            }

            loading = true;
            currentItem = _order.shift();
            scriptNode = document.createElement('script');
            scriptNode.src = currentItem.src;
            scriptNode.addEventListener('load', loaded);
            currentItem.$element[0].appendChild(scriptNode);
        }

        function loaded() {
            loading = false;
            resolveNext();
        }

        return {
            restrict: 'C',
            scope: true,
            link: function($scope, $element, $attrs) {
                _order.push({
                    src: $attrs.src,
                    $element: $element
                });

                resolveNext();
            }
        };
    }]);
/* Source: src/mt-includes/widgets/moto_callback/src/frontend/moto_callback.jquery.plugin.js*/
(function($) {
    $.fn.motoCallback = function() {
        var $element = this;
        var $openButton = $element.find('.moto-widget-callback__open-button');
        var $closeButton = $element.find('.moto-widget-callback__close-button');
        var $moreDetailsButton = $element.find('.moto-widget-callback__more-details-button');
        var $moreDetails = $element.find('.moto-widget-callback__more-details-wrapper');
        var $callbackBody = $element.find('.moto-widget-callback__body');
        var ANIMATION_DURATION = 400;

        function openCallback() {
            if ($element.hasClass('moto-widget-callback_opened') || $element.hasClass('moto-widget-callback_opening') || $element.hasClass('moto-widget-callback_closing')) {
                return;
            }

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
                $moreDetails.slideUp(ANIMATION_DURATION);
                $callbackBody.removeClass('moto-widget-callback__body_more-details-opened');
            } else {
                $moreDetails.slideDown(ANIMATION_DURATION);
                $callbackBody.addClass('moto-widget-callback__body_more-details-opened');
            }
        }

        $openButton.on('click', openCallback);
        $closeButton.on('click', closeCallback);
        $moreDetailsButton.on('click', toggleModeDetails);
    };
}(jQuery));
/* Source: src/mt-includes/widgets/pagination/src/frontend/directive.js*/
angular.module('website.widgets').directive('motoWebsitePagination', [
    'website.library.PaginatorClass',
    function(PaginatorClass) {

    return {
        restrict: 'A',
        replace: true,
        templateUrl: function($element, $attrs) {
            if (angular.isString($attrs.templateUrl) && $attrs.templateUrl.length > 5) {
                return $attrs.templateUrl;
            }

            return '@websiteWidgets/pagination/template.ng.html';
        },
        //@TODO : add mode 'pagination' as array with ngModel
        //require: '?ngModel',
        scope: {
//            Pagination: '=pagination',
            Paginator: '=paginator'
        },
        link: function($scope, $element, $attrs) {
            var unWatch = angular.noop;

            if (!$scope.Paginator) {
                return false;
                /**
                 * @type {PaginatorClass}
                 */
                $scope.Paginator = new PaginatorClass();
                unWatch = $scope.$watch('Pagination', function(newValue, oldValue) {
                    $scope.Paginator.setData(newValue);
                });
            }
            if (!($scope.Paginator instanceof PaginatorClass)) {
                //@TODO : maybe need trow error
                $scope.Paginator = null;

                return false;
            }

            $scope.$on('$destroy', function() {
                if (unWatch) {
                    unWatch();
                    unWatch = null;
                }
            });
        }
    };
}]);
/* Source: src/mt-includes/widgets/pagination/src/frontend/PaginatorClass.js*/
angular.module('website.widgets').service('website.library.PaginatorClass', [
    function() {

        function PageItemClass(value) {
            this.value = value;
            this.number = null;

            if (angular.isObject(value) && angular.isDefined(value['number'])) {
                this.number = value.number;
            }
        }

        PageItemClass.prototype = {
            value: null,
            number: null,
            getLink: function() {
                return this.value && this.value.link;
            }
        };

        /**
         * @param {*} item
         * @returns {PageItemClass}
         */
        function transformItem(item) {
            if (item instanceof PageItemClass) {
                return item;
            }

            return new PageItemClass(item);
        }

        /**
         * @param {Array} items
         * @returns {PageItemClass[]}
         */
        function transformItems(items) {
            var result = [];
            var i;
            var len;

            for (i = 0, len = items.length; i < len; i++) {
                result.push(transformItem(items[i]));
            }

            return result;
        }

        function PaginatorClass() {
            this._events = {};
            this.reset();
        }

        PaginatorClass.prototype = {
            pageRange: 5,
            pageCount: 0,
            currentNumber: 1,
            firstNumber: null,
            previousNumber: null,
            nextNumber: null,
            lastNumber: null,
            /**
             * @type {PageItemClass[]}
             */
            pages: [],
            pagesInRange: [],

            _events: {},

            /**
             * @param {string} name
             * @param {Function} callback
             * @returns {boolean}
             */
            $on: function(name, callback) {
                if (!angular.isString(name) || !angular.isFunction(callback)) {
                    return false;
                }

                this._events[name] = this._events[name] || [];
                this._events[name].push(callback);

                return true;
            },

            $trigger: function(name, data) {
                var i;
                var len;
                var event = {
                    name: name
                };

                if (!this._events[name]) {
                    return false;
                }
                for (i = 0, len = this._events[name].length; i < len; i++) {
                    this._events[name][i](event, data);
                }
            },

            /**
             * Reset paginator data
             */
            reset: function() {
                this.pageRange = 5;
                this.pageCount = 0;
                this.first = null;
                this.firstNumber = 0;
                this.previous = null;
                this.previousNumber = null;
                this.current = null;
                this.currentNumber = 0;
                this.next = null;
                this.nextNumber = null;
                this.last = null;
                this.lastNumber = null;
                this.pages = [];
                this.pagesInRange = [];
            },

            /**
             * @param {int} range
             */
            setPageRange: function(range) {
                range = parseInt(range);

                if (isNaN(range) || range < 1) {
                    return false;
                }

                this.pageRange = range;
                this.updatePagesInRange();

                return true;
            },

            updatePagesInRange: function() {
                var i;
                var maxIndex = Math.min(this.pageCount, this.pages.length);
                var firstIndex = Math.round(this.currentNumber - this.pageRange / 2) - 1;

                if (maxIndex - firstIndex < this.pageRange) {
                    firstIndex = firstIndex - (this.pageRange - (maxIndex - firstIndex));
                }

                if (firstIndex < 0) {
                    firstIndex = 0;
                }

                this.pagesInRange.length = 0;

                for (i = firstIndex; i < maxIndex; i++) {
                    this.pagesInRange.push(this.pages[i]);
                    if (this.pagesInRange.length >= this.pageRange) {
                        break;
                    }
                }

            },

            /**
             * @returns {boolean}
             */
            isDataExists: function() {
                return !!this.pages.length;
            },

            /**
             * @TODO : rename method
             *
             * @param {Object} data
             * @param {int} data.current
             * @param {Array} data.pages
             */
            setData: function(data) {
                this.reset();
                if (angular.isArray(data) || !angular.isObject(data)) {
                    return false;
                }
                this.pages = transformItems(data.pages);
                this.pageCount = data.pages.length;

                this.firstNumber = 1;
                this.first = this.getFirstPage() || new PageItemClass();
                this.last = this.getLastPage() || new PageItemClass();
                this.lastNumber = this.last.number;

                this.setCurrentPageNumber(data.current);

                return true;
            },

            /**
             * Return page by number
             *
             * @param {int} number
             * @returns {PageItemClass|null}
             */
            getPageByNumber: function(number) {
                return this.pages[number - 1];
            },

            /**
             * @returns {PageItemClass|undefined}
             */
            getFirstPage: function() {
                return this.pages[0];
            },

            /**
             * @returns {PageItemClass|undefined}
             */
            getPreviousPage: function() {
                return this.getPageByNumber(this.currentNumber - 1);
            },

            /**
             * @returns {PageItemClass|undefined}
             */
            getCurrentPage: function() {
                return this.getPageByNumber(this.currentNumber);
            },

            /**
             * @returns {PageItemClass|undefined}
             */
            getNextPage: function() {
                return this.getPageByNumber(this.currentNumber + 1);
            },

            /**
             * @returns {PageItemClass|undefined}
             */
            getLastPage: function() {
                return this.pages[this.pages.length - 1];
            },

            setCurrentPageNumber: function(number) {
                number = parseInt(number);

                if (isNaN(number)) {
                    return false;
                }

                this.currentNumber = number;
                if (number > 1) {
                    this.previousNumber = number - 1;
                }
                if (number < this.pages.length) {
                    this.nextNumber = number + 1;
                }

                this.previous = this.getPreviousPage() || new PageItemClass();
                this.current = this.getCurrentPage() || new PageItemClass();
                this.next = this.getNextPage() || new PageItemClass();
                this.updatePagesInRange();

                return true;
            },

            selectPage: function(page) {

                if (angular.isNumber(page)) {
                    page = this.getPageByNumber(page);
                }

                if (page instanceof PageItemClass) {
                    this.$trigger('selected', page.value);
                }
            }
        };

        return PaginatorClass;
    }
]);
/* Source: src/mt-includes/widgets/tabs/src/frontend/moto_tabs.jquery.plugin.js*/
(function($) {
    var ITEMS_SELECTOR = '>.moto-widget-tabs__wrapper>.moto-widget-tabs__items-wrapper>.moto-widget-tabs__item';
    var ITEMS_DESKTOP_HEADER_SELECTOR = '>.moto-widget-tabs__wrapper>.moto-widget-tabs__headers-wrapper>.moto-widget-tabs__header';
    var ITEMS_MOBILE_HEADER_SELECTOR = ITEMS_SELECTOR + '>.moto-widget-tabs__header';
    var ITEMS_HEADERS_SELECTOR = ITEMS_DESKTOP_HEADER_SELECTOR + ',' + ITEMS_MOBILE_HEADER_SELECTOR;
    var HEADER_OPENED_CLASS = 'moto-widget-tabs__header_opened';
    var ITEMS_DESKTOP_OPENED_HEADER_SELECTOR = ITEMS_DESKTOP_HEADER_SELECTOR + '.' + HEADER_OPENED_CLASS;
    var _$window = $(window);

    function isMobileDevice() {
        return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < 1040;
    }

    /**
     * @typedef {Object} ItemData - Data about tab.
     * @property {String} id - Tabs's widget id.
     * @property {jQuery} $root - Root node (.moto-widget) of the tab.
     * @property {jQuery} $desktopHeader - Header's for desktop node of the tab.
     * @property {jQuery} $mobileHeader - Header's for mobile node of the tab.
     * @property {jQuery} $contentWrapper - Content wrapper node of the tab.
     */

    /**
     * Get itemData by item's id.
     *
     * @param {String} id - Item's id for getting data.
     * @param {jQuery} $element - Tabs widget's root (.moto-widget) node.
     * @returns {ItemData} - Data about tab.
     */
    function getItemDataById(id, $element) {
        var tabData = {};

        tabData.id = id;
        tabData.$root = $element.find('#' + id);
        tabData.$desktopHeader = $element.find(ITEMS_DESKTOP_HEADER_SELECTOR + '[data-tab="' + id + '"]');
        tabData.$mobileHeader = tabData.$root.find('>.moto-widget-tabs__header');
        tabData.$contentWrapper = tabData.$root.find('>.moto-widget-tabs__content-wrapper');

        return tabData;
    }

    /**
     * Find in tabs widget's root (.moto-widget) node opened item and return it's id.
     *
     * @param {jQuery} $element - Tabs widget's root (.moto-widget) node.
     * @returns {String} - Opened item's id.
     */
    function getOpenedItemId($element) {
        return $element.find(ITEMS_DESKTOP_OPENED_HEADER_SELECTOR).data('tab');
    }

    /**
     * Add opened classes for item's headers and show item's content.
     *
     * @param {ItemData} itemData - Item to open.
     * @param {function} [callback] - function to call when item will be opened
     */
    function openItem(itemData, callback) {
        itemData.$contentWrapper.show();
        itemData.$desktopHeader.addClass(HEADER_OPENED_CLASS);
        itemData.$mobileHeader.addClass(HEADER_OPENED_CLASS);
        if (isMobileDevice()) {
            $('html, body').animate({
                scrollTop: itemData.$mobileHeader.offset().top
            }, 400);
        }
        callback && callback(itemData);
    }

    /**
     * Remove opened classes for item's headers and hide item's content.
     *
     * @param {ItemData} itemData - Item to close.
     * @param {function} [callback] - function to call when item will be closed
     */
    function closeItem(itemData, callback) {
        itemData.$contentWrapper.hide();
        itemData.$desktopHeader.removeClass(HEADER_OPENED_CLASS);
        itemData.$mobileHeader.removeClass(HEADER_OPENED_CLASS);
        callback && callback(itemData);
    }

    $.fn.motoTabs = function(options) {
        var $element = this;
        var openedItemId = getOpenedItemId($element);

        if (typeof options !== 'object') {
            options = {};
        }

        $element.find(ITEMS_SELECTOR + ':not(#' + openedItemId + ')').each(function() {
            options.onClosed && options.onClosed({id: $(this).attr('id')});
        });
        options.onOpened && options.onOpened({id: openedItemId});

        $element.off('click', ITEMS_HEADERS_SELECTOR);
        $element.on('click', ITEMS_HEADERS_SELECTOR, function(event) {
            var $target = $(event.currentTarget);
            var clickedItemId = $target.data('tab');
            var openedItem;

            if (clickedItemId === openedItemId) {
                return;
            }

            openedItem = getItemDataById(openedItemId, $element);
            closeItem(openedItem, options.onClosed);

            openedItemId = clickedItemId;

            // now we have new opened item
            openedItem = getItemDataById(openedItemId, $element);
            openItem(openedItem, options.onOpened);
            _$window.resize();
        });
    };
})(jQuery);

/* Source: src/mt-includes/widgets/tabs/src/frontend/tabs_item.frontend.js*/
angular.module('website.widget.tabs').directive('motoWidgetTabsItem', [
    'website.WidgetsRepository',
    function(WidgetsRepository) {
        return {
            restrict: 'C',
            scope: true,
            compile: function($element) {
                var thisWidget = WidgetsRepository.registry($element);

                return {
                    pre: function($scope) {
                        thisWidget.setScope($scope);
                    }
                };
            }
        };
}]);
/* Source: src/mt-includes/widgets/tabs/src/frontend/tabs.frontend.js*/
angular.module('website.widget.tabs').directive('motoWidgetTabs', [
    'website.WidgetsRepository',
    'website.Entertainment',
    function(WidgetsRepository, Entertainment) {
        return {
            restrict: 'C',
            scope: true,
            compile: function($element) {
                var thisWidget = WidgetsRepository.registry($element);

                return {
                    pre: function($scope) {
                        thisWidget.setScope($scope);
                    },
                    post: function() {
                        $element.motoTabs({
                            onOpened: function(item) {
                                var widget = thisWidget.getChild(item.id);

                                Entertainment.letsDance(widget);
                                Entertainment.letsStartAnimation(widget);
                            },
                            onClosed: function(item) {
                                Entertainment.letsStopDancing(thisWidget.getChild(item.id));
                            }
                        });
                    }
                };
            }
        };
    }]);
/* Source: src/mt-includes/widgets/tile_gallery/src/frontend/tile_gallery.jquery.plugin.js*/
(function($) {
    $.fn.tileGallery = function() {
        var THROTTLE_DELAY = 250;
        var gallery = {
            columns: [],
            margins: 0
        };
        var $element = this;
        var $items = $element.children('.moto-widget-tile-gallery__item-wrapper');
        var notLoadedImages = 0;
        var blockThrottle = false;
        var wasBlockedThrottle = false;
        var justifyHeight = angular.isDefined($element.data('tileGalleryJustifyHeight'));

        /**
         * @typedef {Object} GalleryInstance
         * @property {number} margins
         * @property {object[]} columns
             * @property {jQuery[]} columns.items
             * @property {number} columns.heightWithPadding
             * @property {number} columns.height
         */

        /**
         * Get height of highest column
         *
         * @returns {number} - height
         */
        function getMaxHeight() {
            return gallery.columns.reduce(function(currentMax, column) {
                return (column.heightWithPadding > currentMax) ? column.heightWithPadding : currentMax;
            }, 0);
        }

        function resetItemHandler(item) {
            item.css('margin-bottom', '')
                .find('.moto-widget-tile-gallery__item-image').css('width', '');
        }
        /**
         * Reset all changes for gallery elements before new building
         */
        function resetChanges() {
            $element.parent().css('height', '');
            gallery.columns.forEach(function(column) {
                column.items.forEach(resetItemHandler);
            });
        }

        /**
         * Get height without borders
         *
         * @param {jQuery} item - element
         * @returns {number} - height
         */
        function getItemInnerHeight(item) {
            return item.children().innerHeight();
        }

        function addNewColumn(item) {
            gallery.columns.push({
                items: [item],
                heightWithPadding: item.innerHeight(),
                height: getItemInnerHeight(item)
            });
        }
        function addItemInLastColumn(item) {
            gallery.columns[gallery.columns.length - 1].items.push(item);
            gallery.columns[gallery.columns.length - 1].heightWithPadding += item.innerHeight();
            gallery.columns[gallery.columns.length - 1].height += getItemInnerHeight(item);
        }

        /**
         * Create virtual structure of gallery
         */
        function updateVirtualStructure() {
            var $prevItem = $($items[0]);
            var $currentItem;
            var i;

            gallery.margins = parseInt($prevItem.css('padding-bottom'));
            gallery.columns = [{
                items: [$prevItem],
                heightWithPadding: $prevItem.innerHeight(),
                height: getItemInnerHeight($prevItem)
            }];

            for (i = 1; i < $items.length; i++) {
                $currentItem = $($items[i]);
                // left offset of current item is grater then previous => new column
                if ($currentItem.position().left > $prevItem.position().left) {
                    addNewColumn($currentItem);
                } else {
                    addItemInLastColumn($currentItem);
                }
                $prevItem = $currentItem;
            }
        }

        function fixOuterHeight() {
            $element.parent().css('height', getMaxHeight() - gallery.margins + 'px');
        }

        function resizeItemHandler(item) {
            item.find('.moto-widget-tile-gallery__item-image').css('width', this.newWidth + '%');
        }

        /**
         * Justify all columns by height
         */
        function makeFlatFooter() {
            var maxHeight = getMaxHeight();
            var newHeight;
            var newWidth;

            gallery.columns.forEach(function(column) {
                newHeight = maxHeight - (column.heightWithPadding - column.height);
                newWidth = ((newHeight / column.height) * 100).toFixed(1);
                column.items.forEach(resizeItemHandler, {newWidth: newWidth});
            });
        }

        /**
         * Main entry point of gallery
         */
        function fixGallery() {
            resetChanges();
            updateVirtualStructure();
            if (justifyHeight) {
                makeFlatFooter();
                updateVirtualStructure();
            }
            fixOuterHeight();
        }

        /**
         * Calls for every resize tick
         */
        function throttledFixGallery() {
            if (blockThrottle) {
                wasBlockedThrottle = true;

                return;
            }
            fixGallery();
            blockThrottle = true;
            wasBlockedThrottle = false;
            setTimeout(function() {
                blockThrottle = false;
                if (wasBlockedThrottle) {
                    throttledFixGallery();
                }
            }, THROTTLE_DELAY);
        }

        // bootstrap gallery
        function imageLoaded() {
            if (!--notLoadedImages) {
                throttledFixGallery();
            }
        }
        $element.find('.moto-widget-tile-gallery__item-image').each(function(index, element) {
            if (!element.complete || element.naturalHeight === 0) {
                notLoadedImages++;
                $(element).on('load', imageLoaded);
            }
        });
        if (!notLoadedImages) {
            throttledFixGallery();
        }

        // bind only on website, on preview updated by widget
        if (!$('body').hasClass('moto-preview-mode_content') || $('body').hasClass('moto-preview-mode_design')) {
            $(window).on('resize', throttledFixGallery);
        }
    };
}(jQuery));
/* Source: temp/website/widgets-templates.js*/
angular.module("website.widgets.templates", ["@websiteWidgets/form_elements/moto_form_errors.ng.html", "@websiteWidgets/pagination/template.ng.html"]);

angular.module("@websiteWidgets/form_elements/moto_form_errors.ng.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("@websiteWidgets/form_elements/moto_form_errors.ng.html",
    "<div class=\"moto-form__errors-items\" data-ng-cloak ng-if=\"($FORM.$submitted || $FORM[fieldName].$touched) && $FORM[fieldName].$invalid\">\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_required\" ng-if=\"$FORM[fieldName].$error.required\">{{ ::messages.required }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_minlength\" ng-if=\"$FORM[fieldName].$error.minlength\">{{ ::messages.minlength }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_maxlength\" ng-if=\"$FORM[fieldName].$error.maxlength\">{{ ::messages.maxlength }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_email\" ng-if=\"$FORM[fieldName].$error.email\">{{ ::messages.email }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_number\" ng-if=\"$FORM[fieldName].$error.number\">{{ ::messages.number }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_min\" ng-if=\"$FORM[fieldName].$error.min\">{{ ::messages.min }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_max\" ng-if=\"$FORM[fieldName].$error.max\">{{ ::messages.max }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_url\" ng-if=\"$FORM[fieldName].$error.url\">{{ ::messages.url }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_max-file-size\" ng-if=\"$FORM[fieldName].$error.maxSize\">{{ ::messages.maxFileSize }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_file-extension\" ng-if=\"fieldType === 'file' && $FORM[fieldName].$error.pattern\">{{ ::messages.fileExtension }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_date\" ng-if=\"fieldType === 'date' && $FORM[fieldName].$error.date\">{{ ::messages.date }}</div>\n" +
    "\n" +
    "    <!-- @TODO : need add tel validator, because user can enter pattern -->\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_tel\" ng-if=\"fieldType === 'tel' && $FORM[fieldName].$error.pattern\">{{ ::messages.tel }}</div>\n" +
    "    <div class=\"moto-form__error-item moto-form__error-item_pattern\" ng-if=\"fieldType === 'text' && $FORM[fieldName].$error.pattern\">{{ ::messages.pattern }}</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("@websiteWidgets/pagination/template.ng.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("@websiteWidgets/pagination/template.ng.html",
    "<div ng-if=\"Paginator\" class=\"moto-widget moto-widget-pagination moto-preset-default clearfix\" data-widget=\"pagination\" data-preset=\"default\">\n" +
    "\n" +
    "    <ul ng-if=\"Paginator.currentNumber > Paginator.firstNumber\" class=\"moto-pagination-group moto-pagination-group-controls moto-pagination-group_left\">\n" +
    "        <li class=\"moto-pagination-item moto-pagination-item-control moto-pagination-item-control_first\">\n" +
    "            <a ng-href=\"{{ Paginator.first.getLink() }}\" ng-click=\"Paginator.selectPage(Paginator.first);\" class=\"moto-pagination-link\"><i class=\"moto-pagination-link-icon moto-pagination-link-text fa fa-angle-double-left\"></i></a>\n" +
    "        </li>\n" +
    "        <li class=\"moto-pagination-item moto-pagination-item-control moto-pagination-item-control_previous\">\n" +
    "            <a ng-href=\"{{ Paginator.previous.getLink() }}\" ng-click=\"Paginator.selectPage(Paginator.previous);\" class=\"moto-pagination-link\"><i class=\"moto-pagination-link-icon moto-pagination-link-text fa fa-angle-left\"></i></a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"moto-pagination-group moto-pagination-group_pages\">\n" +
    "        <li class=\"moto-pagination-item moto-pagination-item-page\" ng-repeat=\"Page in Paginator.pagesInRange\">\n" +
    "            <span ng-if=\"Page.number === Paginator.currentNumber\"\n" +
    "                  class=\"moto-pagination-link moto-pagination-link_active\"><span class=\"moto-pagination-link-text\">{{ Page.number }}</span></span>\n" +
    "            <a ng-if=\"Page.number !== Paginator.currentNumber\" ng-href=\"{{ ::Page.getLink() }}\" ng-click=\"Paginator.selectPage(Page);\" class=\"moto-pagination-link\"><span class=\"moto-pagination-link-text\">{{ Page.number }}</span></a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul ng-if=\"Paginator.currentNumber < Paginator.lastNumber\" class=\"moto-pagination-group moto-pagination-group-controls moto-pagination-group_right\">\n" +
    "        <li class=\"moto-pagination-item moto-pagination-item-control moto-pagination-item-control_next\">\n" +
    "            <a ng-href=\"{{ Paginator.next.getLink() }}\" ng-click=\"Paginator.selectPage(Paginator.next);\" class=\"moto-pagination-link\"><i class=\"moto-pagination-link-icon moto-pagination-link-text fa fa-angle-right\"></i></a>\n" +
    "        </li>\n" +
    "        <li class=\"moto-pagination-item moto-pagination-item-control moto-pagination-item-control_last\">\n" +
    "            <a ng-href=\"{{ Paginator.last.getLink() }}\" ng-click=\"Paginator.selectPage(Paginator.last);\" class=\"moto-pagination-link\"><i class=\"moto-pagination-link-icon moto-pagination-link-text fa fa-angle-double-right\"></i></a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

//# sourceMappingURL=website.min.js.map