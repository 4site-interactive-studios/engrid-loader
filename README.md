# engrid-loader

## Overview

Loads the ENGrid script & stylesheet (optional) dynamically.  Rebuild the minified file via "npm run build"


## Available loader parameters

* log-style : provides console log styling; defaults to: "background: #381D2A; color: #ffffff; font-weight: 400; font-size: 14px; padding: 1px; font-family: monospace;"
* log : if set, the script logs its activity; currently only supports "console"
* repo-name : used in generating URLs to the github CDN if "assets" is provided
* repo-owner : used in generating URLs to the github CDN if "assets" is provided
* assets : used in controlling what JS/CSS is loaded; can be "local", "flush", or any github branch for the repo
* en-assets-url : URL to the Engaging Networks CDN for the account


## Loader parameters can be provided via any of the following methods
* query string key in the format: engrid-*=value
* loader script-tag data attribute in the format: data-*=value
* window.engrid_loader object properties in the format: *: value


## Misc configuration
* Loader also supports special query string key/value of &debug=true which is an alternative way to enable console logging; implemented to mirror current capabilities of engrid-scripts

  
## Some example configurations of loader by URL

* https://some-engaging-networks-domain.com/page/12345/donate/1?mode=DEMO&engrid-log=console&engrid-assets=some-branch
* https://some-engaging-networks-domain.com/page/12345/donate/1?mode=DEMO&engrid-log=console&engrid-repo-name=some-repo&engrid-repo-owner=some-authorized-repo-owner&engrid-assets=main

## CSS requirement

If you include the CSS <link> in the default template, add id="engrid-css" so that the loader can find it to disable it if it needs to.

```html
<!-- Load ENGrid's CSS here so that it always comes after Engaging Networks CSS which gets injected into <head> -->
<link href="https://xxxxxxxxxxx.ssl.cf5.rackcdn.com/xxxx/engrid.css" rel="stylesheet" type="text/css" data-engrid-css>
```

## Loader <script> tag requirements

It is required that the <script> tag possess the engrid-loader-js data attribute
It is recommended that the <script> tag be provided with defaults in the form of data attributes: repo-owner, repo-name, en-assets-url. 

```html
<!-- Load ENGrid's Javascript -->
<script src="https://some-domain.com/path/to/loader.js" data-repo-owner="4site-interactive-studios" data-repo-name="engrid-xxxx" data-en-assets-url="https://xxxxxxxxxxx.ssl.cf5.rackcdn.com/xxxx/" data-engrid-loader-js></script>
```


## Authorized Domains
Note that there is an authorized_domains array that whitelists which domains can be set.  This is to prevent abuse by non-authorized persons passing along EN pages with malicious script loads.
