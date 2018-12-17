'use strict';

var BLOG = BLOG || {};

BLOG.Post = function(url) {
	this.url = url;
};

BLOG.Post.prototype = {
	
	getUrl: function() {
		return this.url;
	}

};


/*
 * Un utente di wordpress, che può avere o meno un blog
 * @param ID Wordpress id
 * @praram niceNime nick name
 */
BLOG.User = function(ID, niceName, firstName, userURL, avatarURL, profileURL) {
	this.firstName = firstName;
	this.niceName = niceName;
	this.URL = userURL;
	this.ID = ID;
	this.avatarURL = avatarURL;
	this.profileURL = profileURL;
	// [] user comment - array of user's comments on a blog
	this.comments = [];
	// commentCount can be different from zero even if comments are == []
	this.commentCount=0;
	this.likeCount = 0;
};

BLOG.User.prototype = {
	getID: function() {
		return this.ID;
	},
	
	getFirstName: function() {
		return this.firstName;
	},	
		
	getNiceName: function() {
		return this.niceName;
	},

	getProfileURL: function() {
		return this.profileURL;
	},	
	
	getURL: function() {
		return this.URL;
	},
	
	getAvatarURL: function() {
		return this.avatarURL;
	},
	
	/**
	 * param UserComment comment
	 */
	addComment: function(comment) {
		this.comments.push(comment);
		this.commentCount = this.comments.length;
	},
	
    incrementLikeCount: function() {
        this.likeCount++;
    },
    
    incrementCommentCount: function() {
        this.commentCount++;
    },
	
	getComments: function() {
		return this.comments;
	},
	
	getCommentCount: function() {
		return this.commentCount;
	},

    getLikeCount: function() {
        return this.likeCount;
    }
	    
};




class UserComment {
	constructor(postCommentedId) {
		this.postCommentedId = postCommentedId;
	}
	
	getPostCommentedId() {
		return this.postCommentedId;
	}
}

export {BLOG, UserComment}


