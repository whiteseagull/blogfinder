# Blog Finder

Blog Finder is live at http://www.justthink.it/wordpressTools/blogfinder.html

![blogFinder in action](https://raw.githubusercontent.com/whiteseagull/blogfinder/master/assets/blogFinder.png)

## A tool to find people on blogs
When reading a blog, you find comments and also, on WordPress.com, likes, i.e. someone is telling she/he likes the post.

Usually you see one post at a time, but maybe you are interested in seeing all  the users that commented or put a like. 
Blog Finder solves this problem: it scans all the posts in the time period specified and shows a list of users that commented or liked a post. 

You can select last week, last month or last six months as periods of time.

## Blog Finder finds other blogs too
Blog Finder lets you find other blogs too because when listing the users that commented a blog, it shows also the **user URL** which is usually the user's site or **blog**, and often the user's blog for users that leave comments on blog sites like WordPress.com

## How Blog Finder works
Blog Finder is fully written in JavaScript and uses the **WordPress REST API** and the **WordPress.com  REST API** to fetch data about blogs, comments and likes (they are quite similar, but not equal)

## What blogs Blog Finder works with
Currently Blog Finder works with WordPress.com blogs and with **every** WordPress privately owned blog, and there are millions of these blogs out there! :) 

If I see interest in the product I may extend Blog Finder data fetching to [Blogger](https://www.blogger.com/) too.

## How Blog Finder works
Blog Finder uses the **[WordPress REST API](https://v2.wp-api.org/)** and the **[WordPress.com  REST API](https://developer.wordpress.com/docs/api/)** to fetch data about blogs, comments and likes (they are quite similar, but not equal).

### The WordPress REST API
The WordPress REST API lets a developer query a WordPress site just by issuing some REST calls like 

``asite.com/wp-json/wp/v2/posts?=search[keyword]``

which searches for posts containing a specific keyword.

This way you don't have to interact with WordPress using PHP or querying the database, you can also use pure JavaScript only.

The WordPress REST API was introduced into WordPress in the 4.7 release. 

To use the WordPress REST API, you can issue direct "low level" HTTP calls, but you can also use the [Node WP API](https://github.com/WP-API/node-wpapi) (it is called Node WP API but works even without [Node](https://nodejs.org/)). 

The same is true with the WordPress.com REST API: there is a JavaScript client, [WP COM JS](http://wpcomjs.com/)


## Blog Finder autodetect
Some blogs show a private domain name (I mean not a WordPress.com subdomain name), but are actually hosted on WordPress.com, so one should access them using the WordPress.com REST API.
Blog Finder tries first using the right call analyzing the domain name, but if it gets an error, it tries then to check if the blog is hosted on WordPress.com. In this way the app is able to work both with WordPress.com blogs ending in .wordpress.com, and with privately held blogs and with blogs with an own domain name but hosted on WordPress.com

## Tools used
- [React](https://reactjs.org/) is used to build the user interface
- [MobX](https://mobx.js.org/) is used to maintain the app state
- [Webpack](https://webpack.js.org/) is used to bundle modules

- Blog finder uses the [promise queue](https://www.npmjs.com/package/promise-queue) package to be polite and make only two request at a time when fetching data.


## Other apps
In the source code you find also [Blog Media Viewer](http://www.justthink.it/wordpressTools/bmv.html), another project meant to show media items listed on a blog. It can be useful to detect missing images but as of now you there isn't a "webchecker" feature and you can detect missing images seeing a blank image is shown. 

Blog Media Viewer will probably be moved to another repository soon.

