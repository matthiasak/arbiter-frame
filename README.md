### Arbiter

The live-editing tool for prototyping and education.

Supports:

- Babel, react, flow types (ES6 and 7, flow types, React)
- provides a special `require().then()` that auto-installs any package to localstorage:
    
  ```js
  // example
  const app = () => log('libs imported')
  
  require('lodash', 'react', 'react-dom').then(app)
  ```
  
- immediately evaluates, logs, and propagates errors
- offline / service worker support allows you to keep coding on the airplane or on spotty wifi
- CMD+S (WIN+S / CTRL+S) allows you to get a Google-shortened URL for your current code so you can share it easily

---

> Made with <3 by @matthiasak

