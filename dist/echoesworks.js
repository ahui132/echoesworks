(function(root, undefined) {

  "use strict";

var EchoesWorks = function() {
	return true;
};

EchoesWorks.VERSION = '0.0.0';

root.EchoesWorks = EchoesWorks;
root.EW = EchoesWorks;

var api = {
	prev: function (){
		console.log("prev");
		return "prev";
	},
	next: function (){
		console.log("next");
		return "next";
	}
};

EchoesWorks.API = api;

EchoesWorks.get = function (url, callback) {
    EchoesWorks.send(url, 'GET', callback);
};

EchoesWorks.load = function (url, callback) {
    EchoesWorks.send(url, 'GET', callback);
};

EchoesWorks.post = function (url, data, callback) {
    EchoesWorks.send(url, 'POST', callback, data);
};

EchoesWorks.send = function (url, method, callback, data) {
    data = data || null;
    var request = new XMLHttpRequest();
    if (callback instanceof Function) {
        request.onreadystatechange = function () {
            if (request.readyState === 4 && (request.status === 200 || request.status === 0)) {
                callback(request.responseText);
            }
        };
    }
    request.open(method, url, true);
    if (data instanceof Object) {
        data = JSON.stringify(data);
        request.setRequestHeader('Content-Type', 'application/json');
    }
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.send(data);
};


/*
 * micro-markdown.js
 * markdown in under 5kb
 *
 * Copyright 2014, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://simon.waldherr.eu/license/mit/
 *
 * Github:  https://github.com/simonwaldherr/micromarkdown.js/
 * Version: 0.3.0
 */

var micromarkdown = {
	regexobject: {
		headline: /^(\#{1,6})([^\#\n]+)$/m,
		code: /\s\`\`\`\n?([^`]+)\`\`\`/g,
		hr: /^(?:([\*\-_] ?)+)\1\1$/gm,
		lists: /^((\s*((\*|\-)|\d(\.|\))) [^\n]+)\n)+/gm,
		bolditalic: /(?:([\*_~]{1,3}))([^\*_~\n]+[^\*_~\s])\1/g,
		links: /!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g,
		reflinks: /\[([^\]]+)\]\[([^\]]+)\]/g,
		smlinks: /\@([a-z0-9]{3,})\@(t|gh|fb|gp|adn)/gi,
		mail: /<(([a-z0-9_\-\.])+\@([a-z0-9_\-\.])+\.([a-z]{2,7}))>/gmi,
		tables: /\n(([^|\n]+ *\| *)+([^|\n]+\n))((:?\-+:?\|)+(:?\-+:?)*\n)((([^|\n]+ *\| *)+([^|\n]+)\n)+)/g,
		include: /[\[<]include (\S+) from (https?:\/\/[a-z0-9\.\-]+\.[a-z]{2,9}[a-z0-9\.\-\?\&\/]+)[\]>]/gi,
		url: /<([a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[\-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?)>/g
	},
	parse: function (str, strict) {
		var line, nstatus = 0,
			status, cel, calign, indent, helper, helper1, helper2, count, repstr, stra, trashgc = [],
			casca = 0,
			i = 0,
			j = 0;
		str = '\n' + str + '\n';

		if (strict !== true) {
			micromarkdown.regexobject.lists = /^((\s*(\*|\d\.) [^\n]+)\n)+/gm;
		}

		/* code */
		while ((stra = micromarkdown.regexobject.code.exec(str)) !== null) {
			str = str.replace(stra[0], '<code>\n' + micromarkdown.htmlEncode(stra[1]).replace(/\n/gm, '<br/>').replace(/\ /gm, '&nbsp;') + '</code>\n');
		}

		/* headlines */
		while ((stra = micromarkdown.regexobject.headline.exec(str)) !== null) {
			count = stra[1].length;
			str = str.replace(stra[0], '<h' + count + '>' + stra[2] + '</h' + count + '>' + '\n');
		}

		/* lists */
		while ((stra = micromarkdown.regexobject.lists.exec(str)) !== null) {
			casca = 0;
			if ((stra[0].trim().substr(0, 1) === '*') || (stra[0].trim().substr(0, 1) === '-')) {
				repstr = '<ul>';
			} else {
				repstr = '<ol>';
			}
			helper = stra[0].split('\n');
			helper1 = [];
			status = 0;
			indent = false;
			for (i = 0; i < helper.length; i++) {
				if ((line = /^((\s*)((\*|\-)|\d(\.|\))) ([^\n]+))/.exec(helper[i])) !== null) {
					if ((line[2] === undefined) || (line[2].length === 0)) {
						nstatus = 0;
					} else {
						if (indent === false) {
							indent = line[2].replace(/\t/, '    ').length;
						}
						nstatus = Math.round(line[2].replace(/\t/, '    ').length / indent);
					}
					while (status > nstatus) {
						repstr += helper1.pop();
						status--;
						casca--;
					}
					while (status < nstatus) {
						if ((line[0].trim().substr(0, 1) === '*') || (line[0].trim().substr(0, 1) === '-')) {
							repstr += '<ul>';
							helper1.push('</ul>');
						} else {
							repstr += '<ol>';
							helper1.push('</ol>');
						}
						status++;
						casca++;
					}
					repstr += '<li>' + line[6] + '</li>' + '\n';
				}
			}
			while (casca > 0) {
				repstr += '</ul>';
				casca--;
			}
			if ((stra[0].trim().substr(0, 1) === '*') || (stra[0].trim().substr(0, 1) === '-')) {
				repstr += '</ul>';
			} else {
				repstr += '</ol>';
			}
			str = str.replace(stra[0], repstr + '\n');
		}

		/* tables */
		while ((stra = micromarkdown.regexobject.tables.exec(str)) !== null) {
			repstr = '<table><tr>';
			helper = stra[1].split('|');
			calign = stra[4].split('|');
			for (i = 0; i < helper.length; i++) {
				if (calign.length <= i) {
					calign.push(0);
				} else if ((calign[i].trimRight().slice(-1) === ':') && (strict !== true)) {
					if (calign[i][0] === ':') {
						calign[i] = 3;
					} else {
						calign[i] = 2;
					}
				} else if (strict !== true) {
					if (calign[i][0] === ':') {
						calign[i] = 1;
					} else {
						calign[i] = 0;
					}
				} else {
					calign[i] = 0;
				}
			}
			cel = ['<th>', '<th align="left">', '<th align="right">', '<th align="center">'];
			for (i = 0; i < helper.length; i++) {
				repstr += cel[calign[i]] + helper[i].trim() + '</th>';
			}
			repstr += '</tr>';
			cel = ['<td>', '<td align="left">', '<td align="right">', '<td align="center">'];
			helper1 = stra[7].split('\n');
			for (i = 0; i < helper1.length; i++) {
				helper2 = helper1[i].split('|');
				if (helper2[0].length !== 0) {
					while (calign.length < helper2.length) {
						calign.push(0);
					}
					repstr += '<tr>';
					for (j = 0; j < helper2.length; j++) {
						repstr += cel[calign[j]] + helper2[j].trim() + '</td>';
					}
					repstr += '</tr>' + '\n';
				}
			}
			repstr += '</table>';
			str = str.replace(stra[0], repstr);
		}

		/* bold and italic */
		for (i = 0; i < 3; i++) {
			while ((stra = micromarkdown.regexobject.bolditalic.exec(str)) !== null) {
				repstr = [];
				if (stra[1] === '~~') {
					str = str.replace(stra[0], '<del>' + stra[2] + '</del>');
				} else {
					switch (stra[1].length) {
						case 1:
							repstr = ['<i>', '</i>'];
							break;
						case 2:
							repstr = ['<b>', '</b>'];
							break;
						case 3:
							repstr = ['<i><b>', '</b></i>'];
							break;
					}
					str = str.replace(stra[0], repstr[0] + stra[2] + repstr[1]);
				}
			}
		}

		/* links */
		while ((stra = micromarkdown.regexobject.links.exec(str)) !== null) {
			if (stra[0].substr(0, 1) === '!') {
				str = str.replace(stra[0], '<img src="' + stra[2] + '" alt="' + stra[1] + '" title="' + stra[1] + '" />\n');
			} else {
				str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(stra[2], strict) + 'href="' + stra[2] + '">' + stra[1] + '</a>\n');
			}
		}
		while ((stra = micromarkdown.regexobject.mail.exec(str)) !== null) {
			str = str.replace(stra[0], '<a href="mailto:' + stra[1] + '">' + stra[1] + '</a>');
		}
		while ((stra = micromarkdown.regexobject.url.exec(str)) !== null) {
			repstr = stra[1];
			if (repstr.indexOf('://') === -1) {
				repstr = 'http://' + repstr;
			}
			str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(repstr, strict) + 'href="' + repstr + '">' + repstr.replace(/(https:\/\/|http:\/\/|mailto:|ftp:\/\/)/gmi, '') + '</a>');
		}
		while ((stra = micromarkdown.regexobject.reflinks.exec(str)) !== null) {
			helper1 = new RegExp('\\[' + stra[2] + '\\]: ?([^ \n]+)', "gi");
			if ((helper = helper1.exec(str)) !== null) {
				str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(helper[1], strict) + 'href="' + helper[1] + '">' + stra[1] + '</a>');
				trashgc.push(helper[0]);
			}
		}
		for (i = 0; i < trashgc.length; i++) {
			str = str.replace(trashgc[i], '');
		}
		while ((stra = micromarkdown.regexobject.smlinks.exec(str)) !== null) {
			switch (stra[2]) {
				case 't':
					repstr = 'https://twitter.com/' + stra[1];
					break;
				case 'gh':
					repstr = 'https://github.com/' + stra[1];
					break;
				case 'fb':
					repstr = 'https://www.facebook.com/' + stra[1];
					break;
				case 'gp':
					repstr = 'https://plus.google.com/+' + stra[1];
					break;
			}
			str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(repstr, strict) + 'href="' + repstr + '">' + stra[1] + '</a>');
		}

		/* horizontal line */
		while ((stra = micromarkdown.regexobject.hr.exec(str)) !== null) {
			str = str.replace(stra[0], '\n<hr/>\n');
		}

		str = str.replace(/ {2,}[\n]{1,}/gmi, '<br/><br/>');
		return str;
	},
	htmlEncode: function (str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		str = div.innerHTML;
		div = undefined;
		return str;
	},
	mmdCSSclass: function (str, strict) {
		var urlTemp;
		if ((str.indexOf('/') !== -1) && (strict !== true)) {
			urlTemp = str.split('/');
			if (urlTemp[1].length === 0) {
				urlTemp = urlTemp[2].split('.');
			} else {
				urlTemp = urlTemp[0].split('.');
			}
			return 'class="mmd_' + urlTemp[urlTemp.length - 2].replace(/[^\w\d]/g, '') + urlTemp[urlTemp.length - 1] + '" ';
		}
		return '';
	}
};

EchoesWorks.md = micromarkdown;


document.addEventListener("keydown", function ( event ) {
	if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
		event.preventDefault();
	}
}, false);

document.addEventListener("keyup", function ( event ) {
	if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
		switch( event.keyCode ) {
			case 33: // pg up
			case 37: // left
			case 38: // up
				api.prev();
				break;
			case 9:  // tab
			case 32: // space
			case 34: // pg down
			case 39: // right
			case 40: // down
				api.next();
				break;
		}

		event.preventDefault();
	}
}, false);

}(this));
