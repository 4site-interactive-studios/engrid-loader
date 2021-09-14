/*
 * HELPER FUNCTIONS
 */

// Fetches a query string parameter
// Returns string
function engridLoaderGetParameter(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


// Log message if the global engrid_loader_log is set to an expected value; currently only supports "console"
// Returns nothing
function engridLoaderLog(label, message, extra_data) {
	if(engrid_loader_log === 'console') {
		var formatted_message_top = ' *** ENGRID LOADER: ' + label + ' ';
		var formatted_message_center = '     ' + message;
		var formatted_message_bottom = (typeof extra_data !== 'undefined') ? '     [' + extra_data + ']' : '';
		var separator = '';

		if(String.prototype.padEnd) {
			formatted_message_top = formatted_message_top.padEnd(200, ' ');
			formatted_message_center = formatted_message_center.padEnd(200, ' ');
			formatted_message_bottom = formatted_message_bottom.padEnd(200, ' ');
			separator = separator.padEnd(199, ' ');
		}

		if(!!window.MSInputMethodContext && !!document.documentMode) {
			console.log(formatted_message_top + "\n" + formatted_message_center + "\n" + formatted_message_bottom + "\n" + separator);
		} else {
			console.log('%c ' + separator + "\n" + formatted_message_top + "\n" + formatted_message_center + "\n" +  formatted_message_bottom + "\n" + separator, engrid_loader_console_log_style);
		}
	}
}

// Fetch the engrid loader option from the window.engrid_loader object if present, otherwise use the data attribute on the script element
// Returns null if nothing is found in either location
function engridLoaderOption(option_key, default_value) {
	var option_value = default_value;
	var query_string_parameter = engridLoaderGetParameter('engrid-' + option_key);
	if(query_string_parameter) {
		option_value = query_string_parameter;
		engridLoaderLog('engridLoaderOption', 'Loaded ' + option_key + ' from query string.', option_value);
	} else if(window.engrid_loader && window.engrid_loader.hasOwnProperty(option_key)) {
		option_value = window.engrid_loader[option_key];
		engridLoaderLog('engridLoaderOption', 'Loaded ' + option_key + ' from configuration object.', option_value);
	} else {
		var engrid_loader_element = document.querySelector('script[data-engrid-loader-js]');
		if(engrid_loader_element && engrid_loader_element.hasAttribute('data-' + option_key)) {
			option_value = engrid_loader_element.getAttribute('data-' + option_key);
			engridLoaderLog('engridLoaderOption',  'Loaded ' + option_key + ' from data attribute.', option_value);
		} else {
			engridLoaderLog('engridLoaderOption', 'Loaded ' + option_key + ' from default.', option_value);
		}
	}
	return option_value;
}

// Keeping things nice & tidy in the MAIN LOGIC section below by moving the CSS && JS insertion code into their own functions

// Returns nothing
function engridLoaderInsertCSS(engrid_css_url) {
	if(engridLoaderValidateURL(engrid_css_url)) {
		var engrid_css_element = document.querySelector('link[data-engrid-css]');
		if(engrid_css_element) {
			engrid_css_element.disabled = true;
			engridLoaderLog('engridLoaderInsertCSS', 'Disabled existing engrid CSS.');
		}

		var head = document.getElementsByTagName('head')[0];
		var new_engrid_css_element = document.createElement('link');
		new_engrid_css_element.id = 'engrid-css-replacement';
		new_engrid_css_element.rel = 'stylesheet';
		new_engrid_css_element.type = 'text/css';
		new_engrid_css_element.href = engrid_css_url;
		new_engrid_css_element.media = 'all';
		head.appendChild(new_engrid_css_element);
		engridLoaderLog('engridLoaderInsertCSS', 'Appended CSS: ' + engrid_css_url);
	}
}

// Returns nothing
function engridLoaderInsertJS(engrid_js_url) {
	if(engridLoaderValidateURL(engrid_js_url)) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = engrid_js_url;
		script.async = true;
		document.querySelector('head').appendChild(script);	
		engridLoaderLog('engridLoaderInsertJS', 'Appended script: ' + engrid_js_url);
	}
}

// Ensure only whitelisted domains and repo owners are permitted
// Returns boolean
function engridLoaderValidateURL(url) {
	var matches = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
	var domain = matches && matches[1];

	// Special validation for the repo domain
	if(domain.match(/^cdn\.jsdelivr\.net$/i)) {
		var repo_owner_start_idx = url.indexOf('/gh/')+4;
		var repo_owner_end_idx = url.indexOf('/', repo_owner_start_idx);
		var repo_owner = url.substr(repo_owner_start_idx, repo_owner_end_idx - repo_owner_start_idx);
		var authorized_repo_owners = ['4site-interactive-studios'];

		if(authorized_repo_owners.indexOf(repo_owner) === -1) {
			engridLoaderLog('engridLoaderValidateDomain', 'Repo owner validation failed: ' + url, repo_owner);
			return false;
		}
		return true;
	}

	// General validation for non-repo domains
	var is_authorized = false;
	var authorized_domains = [
		/^apps\.4sitestudios\.com$/i,
		/.*\.ssl\.cf5\.rackcdn\.com$/i,
		/.*\.test$/i
	];

	for(var i = 0; i < authorized_domains.length; i++) {
		matches = domain.match(authorized_domains[i]);
		if(matches) {
			is_authorized = true;
			break;
		}
	}

	if(!is_authorized) {
		engridLoaderLog('engridLoaderValidateDomain', 'Domain validation failed: ' + url, domain);
	}
	return is_authorized;
}



/*
 * MAIN LOGIC
 */

// Currently only a log setting of "console" is supported; otherwise, nothing is reported
var engrid_loader_console_log_style = engridLoaderOption('log-style', 'background: #381D2A; color: #ffffff; font-weight: 400; font-size: 14px; padding: 1px; font-family: monospace;');
// ENGrid makes use of "debug=true" to enable debug; add that shortcut to engrid-loader, as well
var engrid_loader_log = (engridLoaderGetParameter('debug') == 'true') ? 'console' : engridLoaderOption('log');

// Fetch the desired repo, assets location, and override JS/CSS 
var engrid_repo = engridLoaderOption('repo-name');
var engrid_repo_owner = engridLoaderOption('repo-owner');
var engrid_assets = engridLoaderOption('assets');
var engrid_js_url = '';
var engrid_css_url = '';
var engrid_en_assets_url = engridLoaderOption('en-assets-url');


// Trim off the trailing forward slash from the engrid_en_assets_url if it exists
if(engrid_en_assets_url.charAt(engrid_en_assets_url.length-1) === '/') {
	engrid_en_assets_url = engrid_en_assets_url.slice(0,-1);
}

// Determine if we are to use a repo
if(engrid_assets === 'local') {

	engrid_js_url = 'https://' + engrid_repo + '.test/dist/engrid.js';
	engrid_css_url = 'https://' + engrid_repo + '.test/dist/engrid.css';

} else if(engrid_assets === 'flush' && engrid_en_assets_url) {

	var timestamp = Date.now();
	engrid_js_url = engrid_en_assets_url + '/engrid.min.js?flush=' + timestamp;
	engrid_css_url = engrid_en_assets_url + '/engrid.min.css?flush=' + timestamp;

} else if(engrid_assets && engrid_assets !== 'flush') {

	engrid_js_url = 'https://cdn.jsdelivr.net/gh/' + engrid_repo_owner + '/' + engrid_repo + '@' + engrid_assets + '/dist/engrid.js';
	engrid_css_url = 'https://cdn.jsdelivr.net/gh/' + engrid_repo_owner + '/' + engrid_repo + '@' + engrid_assets + '/dist/engrid.css';

} else {

	if(!engrid_js_url) {
		engrid_js_url = (engrid_en_assets_url) ? engrid_en_assets_url + '/engrid.min.js' : 'https://cdn.jsdelivr.net/gh/' + engrid_repo_owner + '/' + engrid_repo + '@main/dist/engrid.js';
	}

	if(!engrid_css_url && !document.querySelector('link[data-engrid-css]')) {
		engrid_css_url = (engrid_en_assets_url) ? engrid_en_assets_url + '/engrid.min.css' : 'https://cdn.jsdelivr.net/gh/' + engrid_repo_owner + '/' + engrid_repo + '@main/dist/engrid.css';
	}

}


// Load the JS
engridLoaderInsertJS(engrid_js_url);

// Load the CSS
if(engrid_css_url) {
	engridLoaderInsertCSS(engrid_css_url);
}
