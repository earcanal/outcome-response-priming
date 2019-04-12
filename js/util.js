// FIXME: This should be in a more general repo

/**
 * Parse Query String (QS) and provide access to parameters.
 * Example of accessing QS parameter:
 *  http://some.url/?p=some_value
 *  var p = $.QueryString.p;
 *  
 */
(function($) {
    $.QueryString = (function(paramsArray) {
        let params = {};
        for (let i = 0; i < paramsArray.length; ++i)
        {
            let param = paramsArray[i]
                .split('=', 2);
            if (param.length !== 2)
                continue;
            params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
        }
        return params;
    })(window.location.search.substr(1).split('&'))
})(jQuery);