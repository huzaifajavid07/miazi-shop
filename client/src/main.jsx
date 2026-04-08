import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store.js'
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = "707542141006-2jdf5u4986bb32jki5ee0ekunav3lvug.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <App />
    </Provider>
  </GoogleOAuthProvider>,
)
