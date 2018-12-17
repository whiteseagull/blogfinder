/*
 * TODO: add link to gravatar profile for non wordpress.com if possible
 */


import {EventManager}   from '../lib/EventManager.jsx';
import {WPComUtils}     from '../lib/wpComUtils.jsx';
import {BLOG}           from '../lib/domain.jsx';
import {WPTools}        from '../lib/models.jsx';
import {RequestExecutor, TimeConverter} from '../lib/utils.jsx';
import wpcomFactory     from 'wpcom'

import PostListModel from './stores/postListModelStore';

import { observable, action, computed } from 'mobx';



// TODO: move to other place?
window.wpcom = wpcomFactory();


'use strict';



/**
 * Store the variables which define the current aspect and behaviour of 
 * the application. 
 * Updates the URL to reflect the state, through the url hash part.
 * 
 * Page parameters | how is set
 * blog | call setBlog|getBlog
 * postOrderBy | event listening to PostListModel - direct call to PostListModel
 */
class AppState {
    @observable blog;
    
	constructor(app) {
//	    console.log("myapp ctor");
		this.app=app;
		// url of the blog analyzed
		
		// TODO: verificare se evento necessario
		EventManager.install(this, ["blogChange"]);
		//JSTV.EventManager.install(this, ["blogChange"]);

		
//		var postOrderBy = WPComUtils.getParameterByName("postOrderBy");
		var blog = WPComUtils.getParameterByName("blog");
		
		// mode is only read from the url and never updated
		var mode = WPComUtils.getParameterByName("mode");
		if (mode == null) {
			mode = "normal";
		}
		this.mode = mode;
		
		this.showGuestBook();
		
//		app.getServiceLocator().getPostListModel().on
//			("postOrderByChange", this.updatePostOrderBy.bind(this));
		
//		this.postOrderBy = undefined;
//		if (postOrderBy == null) {
//			postOrderBy = "commentCount";
//		}
//		app.getServiceLocator().getPostListModel().setSort(postOrderBy);
		
		var afterWhen = WPComUtils.getParameterByName("afterWhen");
		if (afterWhen != null) {
    		this.app.getServiceLocator().getPostListModel().setAfterWhen(afterWhen);
		}
		
		this.setBlog(blog);
	}

	updatePostOrderBy() {
//		console.log("updatePostOrderBy");
		this.postOrderBy = this.app.getServiceLocator().getPostListModel().getSort();
		this.updateURLHash();
	}

	showGuestBook() {
		if (this.mode != "view") {
//			console.log("show gbook");
			// show guestbook if not in view mode
			$("#guestBook").css('display', 'block');
		}		
	}
	
	/**
	 * In origine aggiornava l'hash della url (index.html#blabla), adesso
	 * aggiorna la query string per maggiore compatibilità.
	 * Aggiorna anche il titolo della pagina
	 * TODO: rinominare in updateQueryStringAndTitle
	 */
	updateURLHash() {
//		var hash = "tool=postNavigator";
		var hash = "";
		var blog = "";
		if (this.getBlog() != undefined){
		    if (hash) {
		        hash += "&";
		    }
			hash += "blog=" + this.getBlog();
			blog = this.getBlog();
		}
		

        var afterWhen = this.app.getServiceLocator().getPostListModel().getAfterWhen();
        hash += "&afterWhen="+afterWhen;

		
//		hash += "&postOrderBy=" + this.postOrderBy;
//		window.location.hash = "#" + hash;
		/* change url only if the current one is not from google web cache */
		var locationHref = window.location.href;
		var fromWebCache = locationHref.indexOf("googleusercontent") != -1;
		var thereIsCrawler = WPComUtils.thereIsCrawler();
		if (!fromWebCache && !thereIsCrawler && history.pushState) {
		    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + hash;
		    window.history.pushState({path:newurl},'',newurl);
		}
		
		/*
		 * change title
		 */
		var FIXED_TITLE = "Blog finder - find people on WordPress blogs";
		var title;
		if (blog != "") {
			title = "Blog users for blog " + blog + " - " + FIXED_TITLE ;
		} else {
			title = FIXED_TITLE;
		}
		document.title = title;
	}
	
	@action setBlog(blog) {
	    var lastBlog = this.blog;
		if (blog == "") {
			// use undefined for uniformity with other parameters
			// blog can be set to "" when the value is taken from an empty form
			blog = undefined;
		}
		this.blog = blog;
		if (lastBlog != this.blog) {
			this.updateURLHash();
			this.fire("blogChange");
//			console.log("fire blogChange");
		}
	}

	
	getBlog() {
		return this.blog;
	}
	
	/**
	 * Returns the hostname from the full http/https address
	 */
	getBlogHostname() {
        var getLocation = function(href) {
            var l = document.createElement("a");
            l.href = href;
            return l;
        };
        
        let siteHref = getLocation(this.getBlog());
        let blogWithoutProtocol = siteHref.hostname;
        return blogWithoutProtocol;
	}
	
	
	isBlogOnWordPressCom() {
        return this.blog.toUpperCase().endsWith(".WORDPRESS.COM");
    }

	getMode() {
		return this.mode;
	}
	
	getViewURL() {
//		var result = window.location.href + "&mode=view";
//		return result;
		return window.location.href;
	}
}


/**
 * Retrieves the app components
 * see https://martinfowler.com/articles/injection.html
 */
class ServiceLocator {
	constructor(app) {
		this.app = app;
	}
		
	getPostListModel() {
		if (this._postList == null) {
			this._postList = new PostListModel(this.app);
		}
		return this._postList;
	}
	
	getUserListModel() {
		if (this._userListModel == null) {
			this._userListModel = new UserListModel(this.app);
		}
		return this._userListModel;
	}

	getAppState() {
		if (this._appState == null) {
			this._appState = new AppState(this.app);
		}
		return this._appState;
	}

}



export {AppState, ServiceLocator}
