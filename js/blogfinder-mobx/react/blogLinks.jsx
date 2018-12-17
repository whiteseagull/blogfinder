import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Some blog as an example
 */
class BlogLinks extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="blogLinks">
                Or try one of the following blogs!
                <ul>
                    <li><a href={this.props.exeFile + "?blog=https://ma.tt" + this.props.extraParams}>
                    Mutt Mullenweg | Unlucky in Cards</a>
                    </li>
                    
                    <li><a href={this.props.exeFile + "?blog=https://bikecolleenbrown.wordpress.com" + this.props.extraParams}>
                    The Chatter Blog</a>
                    </li>
                    
                    <li><a href={this.props.exeFile + "?blog=https://thevioletcity.wordpress.com" + this.props.extraParams}>
                    The Violet City</a>
                    </li>
                    
                    <li><a href={this.props.exeFile + "?blog=https://verseherder.wordpress.com" + this.props.extraParams}>
                    VERSEHERDER</a>
                    </li>
                    
                    <li><a href={this.props.exeFile + "?blog=https://ossitocine.wordpress.com" + this.props.extraParams}>
                    ossitocine.wordpress.com</a>
                    </li>
                    
                    <li><a href={this.props.exeFile + "?blog=https://adcochrane.wordpress.com" + this.props.extraParams}>
                    adcochrane.wordpress.com</a>
                    </li>
                    
                    
                </ul>               
            </div>
        )
    }
}

export {BlogLinks};