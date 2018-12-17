import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import {WPComUtils} from '../../lib/wpComUtils.jsx';
import {BlogLinks} from './blogLinks.jsx';

import { inject, observer } from 'mobx-react';
import {toJS, reaction} from 'mobx';
import md5 from 'md5';
import DevTools from 'mobx-react-devtools'

//var Button = ReactBootstrap.Button;
/*
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var Panel = ReactBootstrap.Panel;
*/


/**
 * @param props.handleSubmit
 */
@inject('myAppStore')
@observer
class BlogChooser extends React.Component {
 	constructor(props) {
	  	super(props);
	  	this.handleSubmit = this.handleSubmit.bind(this);
	  	this.afterWhenChangeHandler = this.afterWhenChangeHandler.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var blogURL = this.blogTextInput.value;
		this.props.myAppStore.handleBlogChange(blogURL);
	}

    afterWhenChangeHandler(afterWhen) {
        this.props.myAppStore.getServiceLocator().getPostListModel().setAfterWhen(afterWhen);
     }

	render() {
		return (
			<div id="blogChooser">
				<div id="rectangularBorder">
					<div>Choose a blog, then click Load</div>
					<form onSubmit={this.handleSubmit}>
						<input
							type="text"
							placeholder="https://ablog.wordpress.com"
							ref={(input) => this.blogTextInput = input}
						/>
		
						<input 
							type="submit"
							value="Load"
						/>
					</form>
                    <DateFilter
                        afterWhenChangeHandler={this.afterWhenChangeHandler}
	                    app={this.props.app}
                    />

				</div>
			</div>
		)
	}
}



/**
 * @param props.app
 */
class DateFilter extends React.Component {
    constructor(props) {
        super(props);
        //console.log("Filter props:", this.props);

        var afterWhen = this.props.app.getServiceLocator().getPostListModel().getAfterWhen();
        this.state = {"afterWhen": afterWhen};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        var value = e.target.value;
        this.setState({afterWhen: value});
        this.props.afterWhenChangeHandler(value);
    }

    
    render() {
        return (
            <div id="filter">
                <form>
                    Read posts since: 
                    <select value={this.state.afterWhen} onChange={this.handleChange}>
                        <option value="lastWeek">Last Week</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="lastSixMonths">Last Six Months</option>
                    </select>
                </form>
            </div>
        )
    }

}



/**
 * @param props.app
 */
class Filter extends React.Component {
 	constructor(props) {
	  	super(props);
		//console.log("Filter props:", this.props);

		var postOrderBy = this.props.app.getServiceLocator().getPostListModel().getSort();
		this.state = {"postOrderBy": postOrderBy};
		this.handleChange = this.handleChange.bind(this);
	}

    handleChange(e){
        var value = e.target.value;
		this.setState({postOrderBy: value});
		this.props.orderbyChangeHandler(value);
    }

	// http://stackoverflow.com/questions/13735912/anchor-jumping-by-using-javascript
	jumpTo(h) {
    	var top = window.document.getElementById(h).offsetTop; //Getting Y of target element
    	window.scrollTo(0, top);                        //Go there directly or some transition
	}
	
	
	
	render() {
	    const appState = this.props.app.getServiceLocator().getAppState();
	    
	    let options = [];
    	options.push(<option key="1" value="creationDate">Creation date</option>);
    	if (appState.isBlogOnWordPressCom()) {
    	    options.push(<option key="2" value="likeNumber">Number of likes</option>);
    	}
    	options.push(<option key="3" value="commentCount">Number of comments</option>);

    	return (
			<div id="filter">
				<form>
					Order posts by: 
					<select value={this.state.postOrderBy} onChange={this.handleChange}>
					    {options}
					</select>
				</form>
			</div>
		)
	}

}


//<option value="creationDate">Creation date</option>
//<option value="likeNumber">Number of likes</option>
//<option value="commentCount">Number of comments</option>


class LinkToPage extends React.Component {
	render() {
		var URL = this.props.app.getServiceLocator().getAppState().getViewURL();
		var pageMode = this.props.app.getServiceLocator().getAppState().getMode();
		return (	
			<div id="linkInstructions">
				You can link to this page using the following url.<br />
				<a href={URL}>{URL}</a><br />
				{pageMode != "view" && 
					<span>When loaded this way, the page won't show the Guestbook.</span>
				}
			</div>
		);
	}
}

//dangerouslySetInnerHTML={{__html: URL}}


@inject('userListModelStore')
@inject('myAppStore')
@observer
class UserList extends React.Component {
 	constructor(props) {
	  super(props);
	  
	  this.toggleaUser = this.toggleaUser.bind(this);
	  this.selectAUser = this.selectAUser.bind(this);
	}
 	

	toggleaUser(user) {
		// console.log("Toggle user ");
		this.props.myAppStore.getServiceLocator().getUserListModel().
		    toggle(user.getID());
	}

    selectAUser(user) {
        this.props.myAppStore.getServiceLocator().getUserListModel().
            select(user.getID());
    }

	
    render() {
		//console.log("Userlist render");
		var usersHTML = [];
		const userListModel = this.props.userListModelStore;
		var users = userListModel.usersSortedByComments;
//		console.log("rendering users", users);

		const postListModel = this.props.myAppStore.getServiceLocator().getPostListModel();
        var userListStatus = userListModel.getStatus();

		var that = this;

		users.forEach(function(currentUser) {
			// var currentUser = users[u];
			var isSelected = userListModel.isUserSelected(currentUser.getID());

			usersHTML.push(<User 
        			key = {currentUser.getID()}
					selected = {isSelected} 
					user = {currentUser}
					handleToggle = {that.toggleaUser} 
			        handleSelect = {that.selectAUser}
			        />
			 );
 		});

      const appState = this.props.myAppStore.getServiceLocator().getAppState();

	  if (users.length > 0) {
	      let loading = "";
          if (userListStatus == "loading") {
              loading = <div id="loaderImage">
                          <img src="img/ajax-loader.gif" />
                         </div>;
          }

          return (
                <div id="userList">
                    <h3>{appState.isBlogOnWordPressCom() ? 
                        "Users that made a comment or liked a post" :
                        "Users that made a comment"}</h3> 
        			<ul>
                        {loading}
        				{usersHTML}
        			</ul>
    			</div>
          	)
       } else {
           if (userListStatus == "loaded") {
               return (<div id="userList">No commenters</div>); 
           } else if (userListStatus == "pending") {
               return (<div id="userList">
                       Waiting to load commenters
                       <div id="loaderImage">
                           <img src="img/ajax-loader.gif" />
                       </div>
                    </div>);
           } else if (userListStatus == "error") {
                   return (<div id="userList">Error fetching commenters</div>);
           } else {
               return (
                       <div id="userList">
                           Loading commenters
                           <div id="loaderImage">
                               <img src="img/ajax-loader.gif" />
                           </div>
                        </div>);
           }
       }
	}
}



/**
 * @param props: user, selected
 */
class User extends React.Component {
  	constructor(props) {
	  super(props);
	}

    render() {
	  var className = "user unselectable";

	  var isSelected = this.props.selected; 

	  if (isSelected) {
		className += " userSelected"
	  }
	
      return (
			<li onClick={() => this.props.handleToggle(this.props.user)}>
			    <div className={className} >
			        <div className="userImage">
			            <a target="_blank" 
			                href={this.props.user.getProfileURL()}
			                onClick={() => this.props.handleSelect(this.props.user)}
			            >
			                <img src={this.props.user.getAvatarURL()}></img>
			            </a>
			        </div>
			
			        <div className="userInfos">
			            <p className="niceName">{this.props.user.getNiceName()}</p>
			            <div>
			                {this.props.user.getCommentCount()} comments
			            </div>
			            <div>
			                {this.props.user.getLikeCount() > 0 ? 
			                        this.props.user.getLikeCount() + " likes": ""}
			            </div>
			            <div>
			                <a target="_blank" href={this.props.user.getURL()}
			                    onClick={() => this.props.handleSelect(this.props.user)}
			                >
			                    {this.props.user.getURL()}
			                </a>
                        </div>
			        </div>
				</div>
			</li>
      	)
	}
  }; 
  
  
  
/**
 * props: id, content 
 */
class Post extends React.Component {
  	constructor(props) {
	  //console.log("**** Post constructor", props);
	  super(props);
	}

    render() {
      return (
			<div className="post">
				<div className="mainInfos">
					<h3>
						<a target="_blank" href={this.props.post.getURL()}>
							<span dangerouslySetInnerHTML={{__html: this.props.post.getTitle()}} />
						</a>
					</h3>
				</div>
				<div className="postDetails">
					<span>{this.props.post.getLikeCount() ? 
					        "[" + this.props.post.getLikeCount() + " like(s)]":
					            ""}</span>
					<span>[{this.props.post.getCommentCount()} comment(s)]</span>
				</div>
			</div>
      	)
	}
	//}: {this.props.post.getContent()}
// <p>{this.props.post.getId()}</p> 
}; 


@inject('postListModelStore')
@inject('myAppStore')
@observer
class PostList extends React.Component {
 	constructor(props) {
	  //console.log("*****Postlist ctor");
	  super(props);

	  
      var postListModel = this.props.postListModelStore;
     
////  TODO: vedi mobx deep observability
////  https://github.com/mobxjs/mobx/issues/1207
//                                  
////  postListModel observable non basta a reagire agli aggiornamenti
//      di valori interni ai post di _posts, così occorre questo che 
//      naviga tutta la struttura. Chiedere e indagare se è l'approccio 
//      corretto. 
//      Vedi https://stackoverflow.com/questions/52011224/mobx-and-deep-observability
       
      // update when posts change, also internally
       reaction(
            () => toJS(postListModel.getPosts()),
            () => this.forceUpdate()
        );
	}


    render() {
		var postListModel = this.props.postListModelStore;
		var orderBy = postListModel.getSort();
//		console.log("orderby:", orderBy);
		var posts = postListModel.getFilteredPosts(orderBy);
		var status = postListModel.getStatus();
//		var blogURL = app.getServiceLocator().getAppState().getBlog();
		var blogURL = this.props.myAppStore.getServiceLocator().getAppState().getBlog();
		
		
		
		var postsXML = [];
		// console.log("Postlist, status:", status);
		// console.log("PostList orderby: ",orderby);
		
		// TODO: inserire nel caso di link diretto da esterno
		postsXML.push(
				<div key="1" id="postListHeader">
					<h4>{blogURL}</h4>
				</div>
		);
		//  ordered by {orderBy}
		
		if (status == "loading") {
			postsXML.push(
				<div id="loaderImage">
					<img src="img/ajax-loader.gif" />
				</div>
			)
		} else {
		    if (status == "loaded" && posts.length == 0) {
    		    postsXML.push("No post available");    
		    }
		}
		
		if (posts.length > 0) {
			posts.forEach(function(currentPost) {
//                postsXML.push(<Post id="postList" key={currentPost.getId()} post={currentPost} />);
				postsXML.push(<Post key={currentPost.getId()} post={currentPost} />);
			});
		} else if (status == "loading"){
				postsXML.push("Post list loading");
        } else if (status == "error"){
            postsXML.push("Error loading posts");
        }

		
      return (
			<div id="postList">
				{postsXML}
			</div>
      	)
	}
}


@inject('appStateStore')
@inject('postListModelStore')
@observer
class App extends React.Component {
	constructor(props) {
		super(props);

		// this.state = {postOrderBy: "likeNumber"};

		// this.handleSubmit = this.handleSubmit.bind(this);
		this.postOrderbyChangeHandler = this.postOrderbyChangeHandler.bind(this);
	}

	// BlogChooser form
	handleSubmit(e) {
		e.preventDefault();
		alert(this.blogTextInput.value);
	}


	postOrderbyChangeHandler(orderby) {
		this.props.app.getServiceLocator().getPostListModel().setSort(orderby);
		//this.setState({postOrderBy: orderby});
	}
	

    render() {
       	var toolMode = this.props.app.getServiceLocator().getAppState().getMode();
    
    	console.log("App render");
    	console.log("window href", window.location.href);
	 	var blog = this.props.app.getServiceLocator().getAppState().getBlog();
	 	//var blog = WPComUtils.getParameterByName("blog");
    	//if (blog != null) {
 		if (blog != undefined) {
 			var thereIsCrawler = WPComUtils.thereIsCrawler();
 			var postList;
 			//thereIsCrawler = true;
 			if (thereIsCrawler == false) {
 				postList = <PostList />
 			} else {
 				postList = <div>
 								{blog}
 								<iframe id="iframeStaticContent" src={blog + ".html"} />
 							</div>
 			}
 			var userList = <UserList />

			return (
				<div id="app">
			        {process.env.NODE_ENV === 'development' ? <DevTools /> : null}
					<BlogChooser app={this.props.app} />
     			    <div className="clearInline"></div>
			        {userList}
                    <Filter
                        orderbyChangeHandler={this.postOrderbyChangeHandler}
                        app={this.props.app}    
			        />
					{postList}
				</div>
			)
		} else {
		    var afterWhen = this.props.app.getServiceLocator().getPostListModel().getAfterWhen();
		    
			return (
				<div id="app">
					<BlogChooser app={this.props.app} />
					<BlogLinks exeFile={"blogfinder.html"} extraParams={"&afterWhen="+afterWhen}/>
				</div>
			)
		}
			
	}
}


	
	
export {App, BlogChooser, Filter, LinkToPage, Post, PostList, User, UserList}
