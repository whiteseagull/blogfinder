import React from 'react';
import ReactDOM from 'react-dom';
import myApp from './stores/myAppStore';
import {App} from './react/reactViews';

import { useStrict, configure } from 'mobx';
import { Provider } from 'mobx-react';

import myAppStore from './stores/myAppStore';


Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth-1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});


const appStateStore = myAppStore.getServiceLocator().getAppState();
const userListModelStore = myAppStore.getServiceLocator().getUserListModel();
const postListModelStore = myAppStore.getServiceLocator().getPostListModel();


configure({ enforceActions: 'always' });


const stores = {
		myAppStore,
		postListModelStore,
		userListModelStore,
		appStateStore
}


ReactDOM.render(
  <Provider {...stores}>
    <App app={myAppStore} />
  </Provider>,
  document.getElementById('reactRoot')
)

