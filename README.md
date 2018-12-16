
# Blog Finder
## A tool to find people on blogs

Blog Finder is live at http://www.justthink.it/wordpressTools/blogfinder.html


# Blog Finder
## A tool to find people on blogs

Blog Finder is live at http://www.justthink.it/wordpressTools/blogfinder.html

## A tool to find people on blogs
When reading a blog, you find comments and also, on WordPress.com, likes, i.e. someone is telling she/he likes the post.

Usually you see one post at a time, but maybe you are interested in seeing all  the users that commented or put a like. 
Blog Finder solves this problem: it scans all the posts in the time period specified and shows a list of users that commented or liked a post. 

## Blog Finder finds other blogs too
Blog Finder lets you find other blogs too because when listing the users that commented a blog, it shows also the user URL which is usually the user's site or blog, and ofter the user's blog for users that leave comments on blog sites like WordPress.com

## How Blog Finder works
Blog Finder uses the **WordPress REST API** and the **WordPress.com  REST API** to fetch data about blogs, comments and likes (they are quite similar, but not equal)

![blogFinder in action](https://raw.githubusercontent.com/whiteseagull/blogfinder/master/assets/blogFinder.png)
## A tool to find people on blogs
When reading a blog, you find comments and also, on WordPress.com, likes, i.e. someone is telling she/he likes the post.

Usually you see one post at a time, but maybe you are interested in seeing all  the users that commented or put a like. 
Blog Finder solves this problem: it scans all the posts in the time period specified and shows a list of users that commented or liked a post. 

## Blog Finder finds other blogs too
Blog Finder lets you find other blogs too because when listing the users that commented a blog, it shows also the user URL which is usually the user's site or blog, and ofter the user's blog for users that leave comments on blog sites like WordPress.com

## What blogs Blog Finder works with
Currently Blog Finder works with WordPress.com blogs and with every WordPress privately owned blog, and there are millions of this blogs out there! :) 

If I see interest in the product I may extend Blog Finder data fetching to [Blogger](https://www.blogger.com/) too.

## How Blog Finder works
Blog Finder uses the **[WordPress REST API](https://v2.wp-api.org/)** and the **[WordPress.com  REST API](https://developer.wordpress.com/docs/api/)** to fetch data about blogs, comments and likes (they are quite similar, but not equal).

## Blog Finder autodetect
Some blogs show a private domain name (I mean not a WordPress.com subdomain name), but are actually hosted on WordPress.com, so one should access them using the WordPress.com REST API.
 Blog Finder tries first using the right call analyzing the domain name, but if it gets an error, it tries then to check if the blog is a WordPress.com one. In this way the app is able to work with WordPress.com blogs ening in .wordpress.com, with privately held blogs and with blogs with an own domain name but hosted on WordPress.com

## Tools used
- [React](https://webpack.js.org/) is used to build the user interface
- [MobX](https://mobx.js.org/) is used to maintain the app state
- [Webpack](https://webpack.js.org/) is used to bundle modules

- Blog finder uses the [promise queue](https://www.npmjs.com/package/promise-queue) package to be polite and make only two request at a time when fetching data.


## Other apps
In the source code you find also [Blog Media Viewer](http://www.justthink.it/wordpressTools/bmv.html), another project meant to show media items listed on a blog. It can be useful to detect missing images but as of now you there isn't a "webchecker" feature and you can detect missing images seeing a blank image is shown. 

Blog Media Viewer will probably be moved to another repository soon.




                        

