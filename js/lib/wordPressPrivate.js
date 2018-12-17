'use strict';


/**
 * Methods for privately held WordPress sites
 */
class WordPressPrivate {
	
	/**
	 * Gets all pages for a request to the WP API,
	 * e.g. getAll(wpapi.posts().after(afterWhenISO))
	 * 
	 * Uses multiple workers (promises) that works simultaneously
	 * (maxWorkingWorkers parameter) 
	 * 
	 * @return a promise resolving to the resources found
	 */
	static getAll(request) {
		
		// max number of pages to fetch
		const maxPages = 9999999;
		
		// max workers to create at once
		let maxWorkersToCreate = 6;
		// max page queued to fetch
		let maxPageQueued = 1;
		// max working workers at once
		let maxWorkingWorkers = 2;
		// working workers
		let workingWorkers = 0;

		function getAllRecursive(request, page) {
		  workingWorkers++;

//		  console.log(page +"executing@ ", new Date(), request);
		  return request.page(maxPageQueued).then(function( response ) {
		    workingWorkers--;

//		if (workingWorkers > maxWorkingWorkers) {
////	console.log("workingWorkers, maxWorkingWorkers -> rescheduling", workingWorkers, maxWorkingWorkers);
//		workingWorkers--;
//		return new Promise(function(resolve) {
//			setTimeout(function() {
//				console.log(page+": resolving rescheduled req");
//				resolve(getAllRecursive(request, page));
//			}, 1000); 
//		});
//	  }
		    
		    let requests = [];
//		    console.log("response", response);
		    if (response._paging) {
		    	while (maxPageQueued < response._paging.totalPages && 
		    			requests.length < maxWorkersToCreate &&
		    			maxPageQueued < maxPages &&
		    			workingWorkers < maxWorkingWorkers) {
//		    	console.log("maxPageQueued, response._paging.totalPages", maxPageQueued, response._paging.totalPages);
//		  		requests.push(wpapi.posts().perPage(2).page(++maxPageQueued).get(), maxPageQueued));
//		    	console.log("dowork", maxPageQueued+1);
//		    	requests.push(doWork(++maxPageQueued));
		    		maxPageQueued++;
		    		requests.push(getAllRecursive(request, maxPageQueued));
		    	}
//		    console.log(page + ":*** requests", requests);
		    }
		    
		    return Promise.all([
		      response,
		      requests
		    ].flat()).then(function( responses ) {
		      return responses.flat();
		    });
		  });
		}

		return getAllRecursive(request);
	} /// getAll END

	
}


export {WordPressPrivate};