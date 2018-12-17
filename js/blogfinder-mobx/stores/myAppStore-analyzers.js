import {BLOG} from '../../lib/domain.jsx';

import md5 from 'md5';


// executes operations on a like
var likeAnalyzer = {
    analyze(like, userlistModel) {
        /*
         * !!!! Please note, we use the md5 of avatar_URL 
         * as the ID because ids sometime are 0 
         */
//                    let userID = like.ID;
        let userID = md5(like.avatar_URL);


        let user;
        user = userListModel.getUser(userID);
        if (user != undefined) {
//                      ricaricamento non necessario ma così ho il change che mi server perché ll count è cambiato
            user.incrementLikeCount();
            userListModel.loadSingleUser(user);
        } else {
            let userNiceName = like.nice_name;
            let userFirstName = like.first_name || "";  
            let userURL = like.URL;
            let userProfileURL = like.profile_URL;
            let avatarURL = like.avatar_URL;
            user = new BLOG.User(
                    userID, 
                    userNiceName,
                    userFirstName,
                    userURL,
                    avatarURL,
                    userProfileURL);
            /*
             * FIXME: perché invertendo queste due chiamate i like pari a uno sono 0?
             * forse perché uso observable.map di mobx
             */
            user.incrementLikeCount();
            userListModel.loadSingleUser(user);
        };   
//                    console.log(like);
            }
    }
        


/**
 * Analyze a comment
 */
var commentAnalyzer = {
       analyze(comment, userListModel) {
 //                	console.log("analyzing", comment);
        let author = comment.author;
//                    let userID = author.ID;
        /*
         * !!!! Please note, we use the md5 of avatar_URL 
         * as the ID because ids sometimes are 0 
         */
        // non wordpress.com
        if (comment.author_avatar_urls) {
            var avatarURL = comment.author_avatar_urls["96"];                
        } else {
            var avatarURL = comment.author.avatar_URL;
        }
        
        if (comment.author_name) {
            var nicename = comment.author_name;
        } else {
            var nicename = comment.author.nice_name;
        }
        
//                    let userID = md5(author.avatar_URL);
        var userID = md5(nicename + avatarURL);

        
        /*
         * TODO: aggiungere sotto, se campo post commentato disponibile,
         * codice sotto o similare, vedi models::commentersmodel
         * 
         * var postCommentedID = item.post.ID;
         * var userComment = new UserComment(postCommentedID);
         * user.addComment(userComment);
         */
        
        let user;
        user = userListModel.getUser(userID);
        if (user != undefined) {
//                      ricaricamento non necessario ma così ho il change che mi server perché ll count è cambiato
            user.incrementCommentCount();
            userListModel.loadSingleUser(user);
        } else {
//                        let userNiceName = author.nice_name;
            let userNiceName = nicename;
            let userFirstName = author.first_name || "";  
            let userURL = author.URL || comment.author_url;
//                        let userProfileURL = author.profile_URL;
            let userProfileURL = author.profile_URL;
            user = new BLOG.User(
                    userID, 
                    userNiceName,
                    userFirstName,
                    userURL,
                    avatarURL,
                    userProfileURL);
            user.incrementCommentCount();
            userListModel.loadSingleUser(user);
        };   
    }
};


export {likeAnalyzer, commentAnalyzer};