 import axios from 'axios';
 
 'use strict';

//https://blog.codaxy.com/debugging-googlebot-crawl-errors-for-javascript-applications-5d9134c06ee7
//window.onerror = function (message, url, lineNo, colNo, error) {
//
//	   console.log(arguments);
//
//	   let container = document.createElement('div');
//
//	   container.style.color = 'red';
//	   container.style.position = 'fixed';
//	   container.style.background = '#eee';
//	   container.style.padding = '2em';
//	   container.style.top = '1em';
//	   container.style.left = '1em';
//
//	   let msg = document.createElement('pre');
//	   msg.innerText = [
//	      'Message: ' + message,
//	      'URL: ' + url,
//	      'Line: ' + lineNo,
//	      'Column: ' + colNo,
//	      'Stack: ' + (error && error.stack)
//	   ].join('\n');
//
//	   container.appendChild(msg);
//
//	   document.body.appendChild(container);
//	};




var WPComUtils = WPComUtils || {};

/*
 * Utilities Wordpress.com related
 */



//string for requesting different groups of items
WPComUtils.queryStringPageDiscriminator = "page";

// total items per page
WPComUtils.itemsPerPage = 99;

// maximum number of batch queries per request 
// length & speed considerations led to buildBatchRequests 
WPComUtils.MAX_BATCH_QUERIES_PER_REQUEST = 10;



/*
 * Returns a promise that requests an URL 
 */
WPComUtils.getJSON = function(URL) {
    return new Promise(function(resolve, reject) {
        return axios.get(URL)
        .then(function (response) {
//            console.log("Sent: ", URL);
//            console.log("Got:", response);
            resolve(response);
        })
        .catch(function (error) {
            console.log(error);
            reject(error);
        });
    });
    
};


/*
 * Carica i like di un post
 * Esegue la funzione di analisi specificata sui like
 * @param siteURL
 * @param postId
 * @param likeAnalyzer dotato di metodo analyze(like) eseguito su ogni like
 */
//WPComUtils.loadLikeForPost = function(siteURL, postId, likeAnalyzer) {
//    var API_URL;
//    API_URL = "https://public-api.wordpress.com/rest/v1";
//    var request = API_URL + "/sites/" + siteURL;
//    request += "/posts/" + postId + "/likes"; 
////    console.log("Loading like for post " + postId);
//    WPComUtils.getJSON(request).then(function(data) {
//        for (var l in data.likes) {
//            var like = data.likes[l];
////            console.log(like.name); 
//            likeAnalyzer.analyze(like);
//        }
//    });
//}


WPComUtils.loadLikeForPost = function(siteURL, postId) {
    var API_URL;
    API_URL = "https://public-api.wordpress.com/rest/v1";
    var request = API_URL + "/sites/" + siteURL;
    request += "/posts/" + postId + "/likes"; 
//    console.log("Loading like for post " + postId);
    return WPComUtils.getJSON(request);
}



/*
 * Loads all the object of the type requested found in the blog.
 * type = comments | posts
 * Issues a first request to know the total,
 * then builds the queries needed to fetch all the items
 * and then sends them 
 * 
 * @param siteURL an url like ablog.wordpress.com
 * @param fields the fields to fetch
 * @param useBatch use batch request instead of single requests
 * @param afterWhen from when we want posts, may be undefined if no time constraint
 * @param forceSiteIsWordPressCom force that site is hosted on WordPress.com
 */
WPComUtils.loadAll = function(siteURL, itemType, fields, useBatch, afterWhen, forceSiteIsWordPressCom) {
    
    console.log("loadall");
    
	var API_URL;
	var query;
	
    /**
     * Sometimes blogs hosted on wordpress.com don't end their name with .wordpress.com
     */
	const siteIsWordPressCom = forceSiteIsWordPressCom || siteURL.toUpperCase().endsWith(".WORDPRESS.COM");

	if (siteIsWordPressCom) {
		API_URL = "https://public-api.wordpress.com/rest/v1.1";
		// select site
		var SITE = "/sites/"+ siteURL;
		var query = API_URL + SITE;
	} else {
		API_URL = "https://" + siteURL +  "/wp-json/wp/v2";
		query = API_URL;
	}
	
	var now = Date.now();
	var sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
	var sixMonthsAgo = new Date(now - sixMonths);
	var after = sixMonthsAgo.toISOString(); 
	
//	alert("loading from " + afterWhen);
	query +=  "/" + itemType + "?";
	if (afterWhen != undefined) {
	    query +=  "after="+afterWhen+"&";
	}
	
	query += "number=1&fields=id";
		

	return WPComUtils.getJSON(query).then(function(response) {
	    if (response.data.found != undefined) {
           var totalItems = response.data.found;
	    } else {
	        totalItems = response.headers["x-wp-total"];
//	        console.log("response:", response);
	    }
       /*
        * FIXME: controllare
        */
       var baseQuery;
       if (siteIsWordPressCom) {
           baseQuery = "/sites/"+siteURL; 
       } else {
           baseQuery = "";
       }
       
       var escapeQueryString = false;
       if (useBatch) {
           escapeQueryString = true;
       }
       // the single requests
       var queries = WPComUtils.buildQueries(baseQuery, itemType, fields, totalItems, afterWhen, escapeQueryString, siteIsWordPressCom);
       // console.log("singleQueries", singleQueries);
       
       // the batch requests
       if (useBatch) {
           queries = WPComUtils.buildBatchRequests(queries);
       }
       
       // console.log("batch Queries", batchQueries);
       // build the promises which will fetch the content
       var fetchers = WPComUtils.buildFetchers(API_URL, queries, useBatch);
      
       
       return Promise.all(fetchers);
   });

	   
};


/**
 * Builds an array of promises which sends HTTP gets
 * Each promise returns data returned from the query 
 * @param api_url the base URL of the API (like worpdress.com/.../v1.1/)
 * @param useBatch use batch requests
 */
WPComUtils.buildFetchers = function(api_url, batchQueries, useBatch) {
//    console.log("buildFetchers");
    
	// array of Promises
	var result = [];
	// queries contain WPComUtils.MAX_BATCH_QUERIES_PER_REQUEST items as defined in 
	// WPComUtils.buildGroupsOfQueries
	batchQueries.forEach(function(queryToSend) {
		var query = api_url;
		if (useBatch) {
			query += "/batch?";
		};
		query = query + queryToSend;
		//console.log("groupOfQueries:", query);
		
		var p = new Promise(function(resolve, reject) {
		    axios.get(query)
		    .then(function (response) {
                console.log("Sent: ", query);
                console.log("Got:", response.data);
                resolve(response.data);
		    })
		    .catch(function (error) {
		        console.log(error);
		        reject(error);
		    });
		});
		
		result.push(p);
	});
	return result;
};


/**
 * returns an array of batch queries, each one handling 
 * a batch request consisting of at most MAX_QUERIES items
 * @param queries an array of simple (single=not batch) queries (like /posts, /comments)
 */
WPComUtils.buildBatchRequests = function(queries) {
	var result = [];
	
	var currentQueries = [];
	var currentCounter = 1;
	for (var i = 0; i < queries.length; i++) {
		var query = queries[i];
		currentQueries.push(query);
		currentCounter++;
		if (currentCounter > WPComUtils.MAX_BATCH_QUERIES_PER_REQUEST || i == queries.length-1) {
			var groupOfQueries = WPComUtils.buildBatchQueryString(currentQueries);
			currentQueries = [];
			result.push(groupOfQueries);
			currentCounter = 1;
		}
	};
	return result;
}  


/**
 * Creates a batch query string from single queries,
 * passing them as parameters for the urls array
 * e.g. /site/SITE/post and /site/SITE/comments
 * give url[]=/site/SITE/post&url[]=/site/SITE/comments
 */
WPComUtils.buildBatchQueryString = function(queries) {
	var result = "";
	for(var i = 0; i < queries.length; i++) {
		if (result != "") {
			result += "&";
		} 
		result = result + "urls\[\]=" + queries[i];
	}
	return result;
};


/**
 * Build as much query as to read all the totalItems requested
 * @param site the url of the site we are interested in 
 * @param queryType type of the query ("posts", "comments", ...)
 * @param aftwerWhne from when we want items, may be undefined if want all post
 * @param escape escape the resulting query string
 */
WPComUtils.buildQueries = function(site, queryType, fields, totalItems, afterWhen, escape, siteIsWordPressCom) {
	var result = [];
	var prefix = site+"/"+queryType+"?";
	if (escape) {
		var ampersand = "%26";
	} else {
		var ampersand = "&";
	} 
	
//	const siteIsWordPressCom = site.toUpperCase().endsWith(".WORDPRESS.COM");
		
	var currentPage = 1;
	while (totalItems > 0) {
		var currentQuery = "";
		// blank if there are at least WPComUtils.itemsPerPage to fetch
		var itemsPerPage = 0;
			
		if (totalItems < WPComUtils.itemsPerPage) {
			itemsPerPage = totalItems;
		} else {
			itemsPerPage = WPComUtils.itemsPerPage;
		}
		
		totalItems = totalItems - WPComUtils.itemsPerPage;
		

		// FIXME: offset doesn't work with normal wordpress, see page instead
		
		//currentQuery = prefix + "page=" + currentPage;
		currentQuery = prefix + "offset=" + (currentPage-1) * WPComUtils.itemsPerPage;
		
       if (afterWhen != undefined) {
            currentQuery = currentQuery + ampersand + "after=" + afterWhen;
        }	
       
        if (siteIsWordPressCom) {
    		if (itemsPerPage != 0) {
    			currentQuery = currentQuery + ampersand + "number=" + itemsPerPage;
    		}
        } else {
            currentQuery = currentQuery + ampersand + "per_page=" + itemsPerPage;
        }
        
		if (fields != "") {
			currentQuery = currentQuery + ampersand + "fields="+fields;
		}		
		result.push(currentQuery);
		currentPage++;
	}
	return result;		
};


// http://stackoverflow.com/questions/11920697/how-to-get-hash-value-in-a-url-in-js
WPComUtils.getHashValue = function(key) {
	  var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
	  return matches ? matches[1] : undefined;
};

/**
 * Returns a query string parameter
 */
//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
WPComUtils.getParameterByName = function(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};


WPComUtils.thereIsCrawler = function() {
	var re = new RegExp("(bot|googlebot|crawler|spider|robot|crawling)", 'i');
	var userAgent = navigator.userAgent;
	if (re.test(userAgent)) {
		return true;
	}else{
		return false;
	}
};



//window.WPComUtils = WPComUtils;
export {WPComUtils};