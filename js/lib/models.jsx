import {EventManager} from '../lib/EventManager.jsx';
import {YoutubeUtils} from '../bmv/youtubeUtils.jsx';
import {WPComUtils} from '../lib/wpComUtils.jsx';
import {RequestExecutor} from '../lib/utils.jsx';
import {BLOG, UserComment} from '../lib/domain.jsx';

import { map, observable, action, computed } from 'mobx';

import md5 from 'md5';


//'use strict';

// Youtube video
class VideoModel {
	constructor(videoId, videoHREF, videoImgSrc) {
		this.href = videoHREF;
		this.img = videoImgSrc;
		this.id = videoId;
	}
	
	getHREF() {
		return this.href;
	}
	
	getImg() {
		return this.img;
	}
	
	getId() {
		return this.id;
	}
	
	getTitle() {
		var titleRequestURL = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+this.id+"&key=AIzaSyBEveph68ojDCL-J8B7Qljw7rTuoYHWKPM";
		return WPComUtils.getJSON(titleRequestURL).then(function(response) {
			return response.items[0].snippet.title;
			//console.log(response.items[0].snippet.title);
		});
	}
	
}


class PostModel {
    @observable commentCount = 0;
    
	constructor(id, title, content, URL) {
		this.setId(id);
		this.setTitle(title);
		this.setContent(content);
		this.setURL(URL);
		this.likeCount = undefined;
//		this.commentCount = 0;
		// creation date in ISO 8601 format
		this.creationDate = undefined;
		this.videos = undefined;
	}
	
	setId(id) {
		this.id = id;
	}	
	
	setContent(content) {
		this.content = content;
	}
	
	@action setCommentCount(count) {
		this.commentCount = count;
	}


	setTitle(title) {
		this.title = title;
	}	

	setURL(URL) {
		this.URL = URL;
	}	

	setLikeCount(count) {
		this.likeCount = count;
	}
	
	setCreationDate(date) {
		this.creationDate = date;
	}	
	

	/**
	 * @returns array of VideoModel
	 * TODO: se non ci sono video ogni volta viene rielaborato il contenuto
	 */
	getVideos() {
		if (this.videos == undefined) {
			
			/*
			 * Estrae link youtube dai post 
			 */
				//var expression = /"[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?"/gi;
			var expression = /"[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?"/i;
			var regex = new RegExp(expression);
			
			var parseUrl=function(url) {
			    var a = document.createElement('a');
			    a.href = url;
			    return a;
			};
			
			var youtubeLinks = YoutubeUtils.findYoutubeUrls(this.getContent());
			this.videos = youtubeLinks; 
		}
		return this.videos;
	}
	
	hasVideos() {
		return this.getVideos().length > 0;
	}
	
	getId() {
		return this.id;
	}	
	
	getContent() {
		return this.content;
	}
	
	getTitle() {
		return this.title;
	}
	
	getURL() {
		return this.URL;
	}
	
	getLikeCount() {
		return this.likeCount;
	}
	
	/**
	 * returns the creation date in iso8601 format 
	 */
	getCreationDate() {
		return this.creationDate;
	}
	
	getCommentCount(count) {
		return this.commentCount; 
	}

}




class PostListModel {
	constructor(app) {
		// int idPost -> PostModel post
		this._posts = {};
		/*this._posts = [
		               new PostModel(0, "title 0", "content 0"),
		               new PostModel(1, "title 1", "content 1")
		               ];
		*/
		
		// status = initialized | loading | loaded
		this.status = "initialized";
		
		var serviceLocator = app.getServiceLocator();
		this.userListModel = serviceLocator.getUserListModel();

		EventManager.install(this, [
		                                 "change",
		                                 "postOrderByChange",
		                                 "afterWhenChange"
		                                 ]);
		//this.postOrderBy = "likeNumber";
		this.afterWhen = "lastMonth";
	}
	
	
	reset() {
		this._posts = {};
		this.fire("change");
	}
	
	debug() {
		console.log("Post count:", Object.keys(this._posts).length);
	}
	
	/** 
	 * @param postarray array formato wordpress api
	 * @postChecker oggetto di cui richiamare checkPost su ogni post
	 */
	loadFromJSON(postArray, postChecker) {
		var that = this;
		
		// console.log("PostListModel::loadFromJSON Loading batch of:, ", postArray.length);
		//$("#log").append("Loading batch #"+batchLoad+"<br>");
		
		var count = 0;
		postArray.forEach(function(item) {
			// count++;
			// $("#log").append(item.ID + "<br>");
			let post = new PostModel(item.ID, item.title, item.content, item.URL);
			post.setLikeCount(item.like_count);
			post.setCreationDate(item.date);
			post.setCommentCount(item.discussion.comment_count);
			if (that._posts[item.ID] != undefined) {
				// TODO: indicare grave errore qui, post già caricato
				console.log("reloading a post", item.ID);
				//console.log("post reloaded:", that._posts[i.ID]);
			}
			that._posts[item.ID] = post;
			
			if (postChecker) {
			    postChecker.checkPost(post);
			}
		});
		// console.log("Post loaded:", count);
		
		this.fire("change");
	}
	
	
	getPosts() {
		return this._posts;
	}
	
	/**
	  * Returns postArray orderd by orderby
	  * orderby: likeNumber, creationDate
	  */
	static orderPosts(postArray, orderby) {
		var result = []; 
		if (orderby == "likeNumber") {
			result = postArray.sort((a, b) => b.getLikeCount() - a.getLikeCount() || b.getCommentCount() - a.getCommentCount());			
		} else if (orderby == "creationDate") {
			result = postArray.sort((a, b) => (b.getCreationDate() < a.getCreationDate()) ? -1 : (b.getCreationDate() > a.getCreationDate()) ? 1 : 0);
		} else if (orderby == "commentCount") {
			result = postArray.sort((a, b) => ((b.getCommentCount() - a.getCommentCount()) || b.getLikeCount() - a.getLikeCount()) );
		} else {
			// TODO: segnalae grave errore, sort non predeterminato
			result = postArray;
		}
		return result;
	}

	
/**
 * lastWeek
 * lastMonth
 * lastSixMonths
 * @param {any} after
 */
    setAfterWhen(after) {
        this.afterWhen  = after;
        // necessario? usato dalla view App, così quando 
        // cambia il when cambimo i link ai blog di esempio
        this.fire("afterWhenChange");
    }
    
    getAfterWhen() {
        return this.afterWhen; 
    }

    
	setSort(postOrderBy) {
		var lastOrderBy = this.postOrderBy; 
		this.postOrderBy = postOrderBy;
		if (this.postOrderBy != lastOrderBy) {
			this.fire("postOrderByChange");
			this.fire("change");
		}
	}
	
	getSort() {
		return this.postOrderBy;		
	}
	
	/**
	  * @param orderby creationDate, likeNumber
	  */
	getFilteredPosts(orderby) {
		//console.log("***getposts()");
		var result = [];
		var filter = this.userListModel.getFilter();
		var posts = this._posts;
		
		for (var p in this._posts) {
			var post = this._posts[p];	
			if (filter(post)) {
				result.push(post);
			}
		} 
				
		return PostListModel.orderPosts(result, orderby)
		//return result;
	}
	
	setStatus(status) {
//		console.log("setStatus", status)
		this.status = status;
		this.fire("change");
	}
	
	/**
	 * Return the current PostListModel status
	 */
	getStatus() {
		return this.status;
	}
}


/**
 * methods which load users calls fireChange because hey are called while loading many objects
 * select and toggle fire immediately change to have a responsive UI
 */
class UserListModel {
    @observable _users;
    @observable _usersSelected;
    // TODO: verify if this is an observable
//    @observable _userArraySortedByComments = undefined;
    // TODO: verify if this is an observable
    @observable _isPostCommented;
    @observable status;

    
    
	constructor(app) {
		// id -> BLOG.User
//		this._users = {};
		this._users = observable.map();

		this._usersSelected = {};
		EventManager.install(this, ["change"]);
		
		
		// status = initialized | pending | loading | loaded
		// pending = waiting to load users
        this.status = "initialized";
		
		// { post id -> true|false }  
		this._isPostCommented = {};
		// cache of users sorted by comment count
		this._userArraySortedByComments = undefined;
		// to have at most one change event per second
		this.requestExecutor = new RequestExecutor("userListModelExecutor", 1000);
	}

	
	@action setStatus(status) {
        this.status = status;
    }
	
	
	getStatus() {
        return this.status;
    }
	
	
	fireChange() {
	    var that = this;
	    /* accodo i change, che arrivano in gran quantità, solo
	     * se non ci sono change attivi. Altrimenti rimangono in coda 
	     */   

	    // TODO: this.tick++ qui fuori funziona, creare esempio, è un observable
	    
	    if (!this.requestExecutor.isWorking()) {
    	    this.requestExecutor.execute(action(function() {
    	        that.fire("change");
    	    }));
	    }
	}
	
	
	@action reset() {
//		this._users = {};
	    this._users = observable.map();
		this._usersSelected = {};
//		this.invalidateCacheOfUserSortedByComments();
		this.fireChange();
	}
	
	/**
	 * Add the user passed in users to the current users
	 * @param users id -> user
	 */
	@action load(users) {
		// TODO: vedere perché c'era resets users so we can update the interface
		// this.reset();
		// this.fire("change");
//	    console.log("userlistmodel loading users", users);
		for (var u in users) {
			let user = users[u];
//			this._users[user.getID()] = user;
			this._users.set(user.getID(), user);
		}
		//this._users = users;
//		this.invalidateCacheOfUserSortedByComments();
//		this.fireChange();
	}
	
	@action loadSingleUser(user) {
//       console.log("l single user");
	   //FIXME: controllare se userid = 0 e ottimizzare fire
//	   this._users = {};
       const id = user.getID();
//       console.log("id:", id);
//	   this._users[id] = user;
//       console.log("user:", user);
	   this._users.set(id, user);
//	   this.invalidateCacheOfUserSortedByComments();
//	   this.fireChange();
    }
	 
    /**
     * Returns the user with the specified userId or undefined 
     * if not found
     * @param userId
     */
    getUser(userId) {
//        return this._users[userId];
        return this._users.get(userId);
    }
    
    
	debug() {
		var userCount = Object.keys(this._users).length;
		console.log("User count:", userCount);
		console.log(this._users);
		//alert(userCount);
	}
	 
	/*
	 * per ogni utente selezionato trova i post
	 * commentati e costruisce un oggetto idPost -> true
	 * relativo a questi commenti.
	 * Questi sono quindi i post commentati dagli utenti seleionati
	 * 
	 * A post is commented if there is at least one selected user which commented on it
	 */
	updateisPostCommented() {
		this._isPostCommented = {};
		for (var u in this._users) {
			var user = this._users[u];
			
			if (this.isUserSelected(user.getID())) {
				var comments = user.getComments();
				var that = this;
				comments.forEach(function(comment) {
					var postCommentedId = comment.getPostCommentedId()
					that._isPostCommented[postCommentedId] = true;
				});
			}
		}	
	}
	 
	isPostCommented(postId) {
		return (this._isPostCommented[postId] == true);
	}
	
	@computed get usersSortedByComments() {
        var userArray = this._getUsersAsArray();
        var result = userArray.sort((a, b) => b.getCommentCount() - a.getCommentCount());
        return result;	    
	}
	
//	@action calculateCacheOfUserSortedByComments() {
//        var userArray = this._getUsersAsArray();
//        var result = userArray.sort((a, b) => b.getCommentCount() - a.getCommentCount());
//        this._userArraySortedByComments = result;
//	}
//	    
//
//	@action invalidateCacheOfUserSortedByComments() {
//	    this._userArraySortedByComments = undefined;
//	    
//	    // FIXME: non dovrebbe essere chiamato qui ma solo da getUsersSortedByComments,
//	    // ma se lo tolgo c'è il warning del forceupdate
//	    this.calculateCacheOfUserSortedByComments();
//	}
	
	getUsersSortedByComments() {
	    //	    var result;
//	    if (this._userArraySortedByComments != undefined) {
//	        result = this._userArraySortedByComments;
//	    } else {
//    		var userArray = this._getUsersAsArray();
//    		result = userArray.sort((a, b) => b.getCommentCount() - a.getCommentCount());
//    		this._userArraySortedByComments = result;
//	    }
//		return result;

      if (this._userArraySortedByComments == undefined) {
          this.calculateCacheOfUserSortedByComments();
      }
      return this._userArraySortedByComments;
	}
	
	_getUsersAsArray() {
//		var userArray = [];
//		// build an array of users
//		for (var u in this._users) {
//			userArray.push(this._users[u]);
//		}
//		return userArray;

	    // mobx observable map
	    var userArray = [];
        for (var value of this._users.values()) {
            userArray.push(value);
        }
        return userArray;

	}
	
	/**
	 * Returns an array of users 
	 */
	getUsers() {
		return this._users;
	}

	@action select(id, isSelected) {
		// console.log("UserListModel select ",id, isSelected);
		this._usersSelected[id] = isSelected;
		this.fire("change");
	}
	
	@action toggle(id) {
		if (this._usersSelected[id] == undefined) {
			this._usersSelected[id] = false;
		}
		this._usersSelected[id] = !this._usersSelected[id];
		this.fire("change");
	}

	
	selectAll() {
		for (var u in this._users) {
			var user = this._users[u];
			this.select(user.getID(), true);			
		}
	}

	isUserSelected(id) {
		if (this._usersSelected[id] !== undefined) {
			return this._usersSelected[id];
		} else {
			return false;
		}
	}
	
	getFilter() {
		var that=this;
		return function(post) {
			return true;
			
			that.updateisPostCommented();
			
			/* post ok seid post corrispondente a id commentaore */
			var postId = post.getId();
			
			/**
			 *  select a post if there is at least one user which commented on it
			 */
			return that.isPostCommented(postId);
		}
	}
	
}


var WPTools = WPTools || {};



window.VideoModel = VideoModel;
//window.PostListModel = PostListModel;
window.UserListModel = UserListModel;


export {PostListModel, PostModel, WPTools};

//export {PostListMode, UserLisModel, VideoModel}