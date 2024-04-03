import './App.css';

// access the pre-bundled global API functions
const { invoke } = window.__TAURI__.tauri

function App() {
  // now we can call our Command!
  // Right-click the application background and open the developer tools.
  // You will see "Hello, World!" printed in the console!
  invoke('greet', { name: 'World' })
  // `invoke` returns a Promise
  .then((response) => console.log(response))

  return (
    // -- snip --
  )
}