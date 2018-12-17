import {PostModel} from '../../lib/models.jsx';

import { observable, action, computed } from 'mobx';


/**
 * Model for PostList
 */
class PostListModel {
	@observable postOrderBy;
	@observable afterWhen;
	@observable _posts;
	@observable status;

	
	constructor(app) {
		// int idPost -> PostModel post
		this._posts = {};
		/*this._posts = [
		               new PostModel(0, "title 0", "content 0", link),
		               new PostModel(1, "title 1", "content 1", link)
		               ];
		*/
		
		// status = initialized | loading | loaded
		this.status = "initialized";
		
		var serviceLocator = app.getServiceLocator();
		this.userListModel = serviceLocator.getUserListModel();

		this.postOrderBy = "creationDate";
		this.afterWhen = "lastMonth";
	}
	
	
	@action reset() {
		this._posts = {};
	}
	
	debug() {
		console.log("Post count:", Object.keys(this._posts).length);
	}
	
	/** 
	 * @param postarray array formato wordpress api
	 * @postChecker oggetto di cui richiamare checkPost su ogni post
	 */
	@action loadFromJSON(postArray) {
//	@action loadFromJSON(postArray, postChecker) {
		var that = this;
//		console.log("loadFromJSON");
		// console.log("PostListModel::loadFromJSON Loading batch of:, ", postArray.length);
		//$("#log").append("Loading batch #"+batchLoad+"<br>");
		
		// posts loaded in this session
		let loadedPosts = [];
		
		var count = 0;
		postArray.forEach(function(item) {
			// count++;
			// $("#log").append(item.ID + "<br>");
//			console.log("*****loadFromJSON:", item);
			let title;
			// for non wordpress.com sites
			if (item.title.rendered) {
				title = item.title.rendered;
			} else {
				title = item.title;
			}
			
			let link;
			// for non wordpress.com sites
			if (item.link) {
				link = item.link;
			} else {
				link = item.URL;
			}

			let id;
			// non wordpress.com sites
			if (item.id) {
				id = item.id;
			} else {
				id = item.ID;
			}

			
			let post = new PostModel(id, title, item.content, link);
			post.setLikeCount(item.like_count);
			post.setCreationDate(item.date);
			// seems it's not set on non wordpress.com sites
			// TODO: recheck is necessary for post building
			if (item.discussion) {
				post.setCommentCount(item.discussion.comment_count);
			}
			if (that._posts[id] != undefined) {
				// TODO: indicare grave errore qui, post già caricato
				console.log("reloading a post", item.ID);
				//console.log("post reloaded:", that._posts[i.ID]);
			}
			that._posts[id] = post;

			loadedPosts[id] = post;
			
//			if (postChecker) {
//			    postChecker.checkPost(post);
//			}
		});

		return loadedPosts;
		
		// console.log("Post loaded:", count);
	}
	
	
	getPosts() {
		return this._posts;
	}
	
	
	@action setCommentCountForPost(id, count) {
//		console.log("????????????????? ", id, count);
		this._posts[id].setCommentCount(count);
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
    @action setAfterWhen(after) {
        this.afterWhen  = after;
    }
    
    getAfterWhen() {
        return this.afterWhen; 
    }

    
	@action setSort(postOrderBy) {
		var lastOrderBy = this.postOrderBy; 
		this.postOrderBy = postOrderBy;
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
	
	@action setStatus(status) {
		this.status = status;
	}
	
	/**
	 * Return the current PostListModel status
	 */
	getStatus() {
		return this.status;
	}
	
	debug() {
		var posts = this.getFilteredPosts("creationDate");
		console.log("postlistModel debug:", posts);
	}
	
}

export default PostListModel;