import {AppState, ServiceLocator} from '../myApp.jsx';

import {EventManager} from '../../lib/EventManager.jsx';
import {WPComUtils} from '../../lib/wpComUtils.jsx';
import {WordPressPrivate} from '../../lib/wordPressPrivate.js';
import {WPTools} from '../../lib/models.jsx';

import {likeAnalyzer, commentAnalyzer} from './myAppStore-analyzers.js';

import {RequestExecutor, TimeConverter} from '../../lib/utils.jsx';


import Queue from 'promise-queue';

// wordpress.com
//import wpcomFactory from 'wpcom'
// wordpress.org
import WPAPI from 'wpapi'


import {PostListModel} from './postListModelStore.js';
import {observable, reaction, toJS} from 'mobx';



class MyApp {
	constructor() {
		this.serviceLocator = new ServiceLocator(this);
		this.appState = this.serviceLocator.getAppState();
		
		var postListModel = this.serviceLocator.getPostListModel(); 

		var blog = this.appState.getBlog();
		
		/*
		 * load data only if there is not a crawler. otherwise  
		 * show textual representation handled by react App
		 */
		var thereIsCrawler = WPComUtils.thereIsCrawler();
		if (blog != undefined) {
			if (thereIsCrawler == false) {
				this.loadData(blog);
			}
//			else {
//				window.location.href = blog+".html";	
//			}
		}
	}
	
	getServiceLocator() {
		return this.serviceLocator;
	}

	
	getAppState() {
		return this.appState;
	}
	
	debugPostCommented() {
		var postListModel = this.serviceLocator.getPostListModel();
		var userListModel = this.serviceLocator.getUserListModel();
		
		var posts = postListModel.getPosts();  
		
		for (var p in posts) {
			var post = posts[p];
			var isCommented = userListModel.isPostCommented(post.getId());
			// console.log("isPostCommented? ", post.getId(), isCommented);
		}
	}

	// url blog changed
	handleBlogChange(blogURL) {
		console.log("handle blog change");
		this.loadData(blogURL);	
	}
	
	
	loadData(siteURL) {
		const appState = this.getServiceLocator().getAppState();
		appState.setBlog(siteURL);
		
		let siteIsWordPressCom = appState.isBlogOnWordPressCom();
		let siteHostname = appState.getBlogHostname();
		
		var that = this;
		var requestExecutor = new RequestExecutor("commentLikeExecutor", 25);
		
	    var userListModel = that.getServiceLocator().getUserListModel();
	    userListModel.reset();
	    
	    
	    
		let afterWhen = this.getServiceLocator().getPostListModel().getAfterWhen();
		var afterWhenMillis = TimeConverter.convert(afterWhen);
		var afterWhenISO = TimeConverter.millisToISO(afterWhenMillis);

	    

		/*
		 * LOAD POSTS 
		 */
/*		queries = WPComUtils.buildQueries(SITE, "posts", 100);
		var batchURL = baseURL + WPComUtils.buildBatchQueryString(queries);
*/
		let postListModel = this.getServiceLocator().getPostListModel();
		postListModel.reset();

        const maxConcurrent = 2;
        const maxQueue = Infinity;
        var queue = new Queue(maxConcurrent, maxQueue);
        
        // total number of fetchers currentyl fetching
        let fetchers = 0;

        // there has been an error fetching comments
        let commentError = false;
        
		// ** eseguito su ogni post, carica like e commenti **
		var postChecker = {
		        checkPost(post) {
		        	/*
		        	 * FIXME: Promises returns immediately, it should wait enclosed functions
		        	 * ho fatto usando la var fetchers, si può in caso togliere la promise sotto
		        	 * e la chiamata relativa.
		        	 * A volte si vede un messaggio intermittente tra loading users e no users, 
		        	 * con la promise di sotto funzionante dovrebbe andare a posto
		        	 * 
		        	 */
//		        	return new Promise(function(resolve, reject) {
//		        	 console.log("analyzing post:", post);
		        	
		            // loads likes
		            if (post.getLikeCount() > 0 ) {
//    		            console.log(post.getId() + ":" + post.getLikeCount() + " likes");
		            	// con la reqexecutor si verifica una messaggio intermittente, vedere se serve davvero
		            	// e vedere se ora che l'ho tolto si possono togliere i setTimeout sotto
//		                requestExecutor.execute(function() {
		                	queue.add(function() {
		                			fetchers++;
            		            	userListModel.setStatus("loading");
		                			
		                			return WPComUtils.loadLikeForPost(siteHostname, post.getId()).
	                				then(function(response) {
//	                					console.log("+++++++++++++ Rec data", response.data);
	                		            for (var l in response.data.likes) {
	                		                var like = response.data.likes[l];
	                		                likeAnalyzer.analyze(like, userListModel);
	                		            }
	                		            
	                		            if (--fetchers == 0) {
	                		            	setTimeout(function() {
	                		            		userListModel.setStatus("loaded");
	                		            	}, 500);
	                		            }
	                				}).catch(function(errors) {
	                		            if (--fetchers == 0) {
	                		            	setTimeout(function() {
	                		            		userListModel.setStatus("loaded");
	                		            	}, 500);
	                		            }
	                				});
		                	});
//		                });  // END requestExecutor.execute

		            }
		            
		            // loads comments, even if comment count is zero
		            // because non wordpress.com sites don't have a comment count in the post
                    if ((siteIsWordPressCom && post.getCommentCount() > 0)  || !siteIsWordPressCom) {
//                        requestExecutor.execute(function() {
//                            console.log("Loading comment for post " + post.getId());
                        	
                        	if (siteIsWordPressCom) {
                        		queue.add(function() {
                        			fetchers++;
            		            	userListModel.setStatus("loading");

                        			return new Promise(function(resolve) {
                        				wpcom
                        				.site(siteHostname)
                        				.post(post.getId())
                        				.comment()
                        				.replies(function(err, data) {
                        					if (err) throw err;
                        					resolve(data);
                        				})
                        			}).then(function(data) {
                    					data.comments.forEach(function(comment, i) {
                    						// console.log("comment", comment);
                    						commentAnalyzer.analyze(comment, userListModel);
                    					});
                    					
	                		            if (--fetchers == 0) {
	                		            	setTimeout(function() {
	                		            		userListModel.setStatus("loaded");
	                		            	}, 500);
	                		            }

                        			});
                        		});

                        	} else { // private site
                        		queue.add(function() {
			                			// go ahead only if not previous errors were registered
			                			if (commentError) {
			                				return;
			                			}
			                			
			                			fetchers++;
	            		            	userListModel.setStatus("loading");
                        			
                        				return WordPressPrivate.getAll(wpapi.comments().forPost(post.getId()).perPage(99)).
                        				then(function(allComments) {
                        					
                        					post.setCommentCount(allComments.length);
                        					
                        					allComments.forEach(function(comment, i) {
                        						commentAnalyzer.analyze(comment);
                        					});
                        					
    	                		            if (--fetchers == 0) {
    	                		            	setTimeout(function() {
    	                		            		userListModel.setStatus("loaded");
    	                		            	}, 500);
    	                		            }
    	                		            	
                        				}).catch(function(error) {
                        					// immediate error signaling
	                		            	commentError = true;
	                		            	userListModel.setStatus("error");
//                        					console.log(error);
                        				});
                        		}); // END queue.add
                        	}
                            
//                        }); END req executor
                    }
                    	
//                    resolve();

//		        	}); // END new Promise

		        } // END checkpost
		};
		
		// NOTES: use one of the following loader
		userListModel.setStatus("pending");
		var postLoaderFromSingleRequests = function(data) {
//			console.log("******************** postLoaderFromSingleRequests");
			let postArray;
			if (data.posts != undefined) {
				postArray = data.posts;
			} else {
				postArray = data;
			}
			
			
			let loadedPosts = postListModel.loadFromJSON(postArray);
			Object.keys(loadedPosts).map(id => {
//				console.log(id);
				postChecker.checkPost(loadedPosts[id]);
//				.then(function() {
////					userListModel.setStatus("loaded");
//				}).catch(function(error) {
//					console.log(error);
//				});
			});
		}
		
		var postLoaderFromBatchRequests = function(data) {
			for (var d in data) {
				var curObj = data[d];
				var postArray = curObj.posts;
				postListModel.loadFromJSON(postArray);
//				postListModel.debug();
			}
		}
		
		
		if (siteIsWordPressCom) {
			var fields = "ID,date,discussion,title,like_count,URL";
		} else {
			var fields = "";
		}
		//WPComUtils.loadAll(siteURL, "posts", fields, true, postLoaderFromBatchRequests);

		
		function loadWPComSite(forceSiteIsWordPressCom) {
			return new Promise(function(resolve, reject) {
				WPComUtils.loadAll(siteHostname, "posts", fields, false, afterWhenISO, forceSiteIsWordPressCom).
				then(function(result) {
//				postListModel.debug();
					if (forceSiteIsWordPressCom) {
						// some functions invoked from postLoaderFromSingleRequests
						// use siteIsWordPressCom
						siteIsWordPressCom = true;
					}
					
					result.map(item => postLoaderFromSingleRequests(item));
					
					postListModel.setStatus("loaded");
					
					let posts = postListModel.getPosts();
					// no post loaded -> no commenters
//				console.log(toJS(posts));
					if ((Object.keys(posts)).length == 0) {
						userListModel.setStatus("loaded");
					}
					resolve();
				}).catch(function(error) {
					console.log(error);
					reject(error);
				});
			});
		}
			
			
		
		if (siteIsWordPressCom) {
			let forceWPCom = false;
			loadWPComSite(forceWPCom);
		}

		
		/*
		 * WP API node
		 */
		const wpapi = new WPAPI({
			  endpoint: siteURL+"/wp-json", 
		});
		
		
		
		// load posts
		if (!siteIsWordPressCom) {
			console.log("loading privately held site " + siteURL);
			postListModel.setStatus("loading");
			WordPressPrivate.getAll(wpapi.posts().after(afterWhenISO)).
			then(function( allPosts ) {
//					console.log("****++++++++++++++++*", allPosts);
				postLoaderFromSingleRequests(allPosts);
				postListModel.setStatus("loaded");
				if (allPosts.length == 0) {
					// no function will be called and will set userListModel status to loaded
					// wait a moment to switch the message
					setTimeout(function() {
						userListModel.setStatus("loaded");
					}, 1000);
				}
			}).catch(function(error) {
				// try to see if site is on wordpress.com
				loadWPComSite(true).
				then(function() {
					// site is on wordpress com and correctly loaded 
				}).catch(function() {
					// site not on wordpress com or not correctly loaded 
					postListModel.setStatus("error");
					userListModel.setStatus("error");
				});
				
			});
		}
			
		
	}
		
};

export default new MyApp;