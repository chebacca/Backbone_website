// WebOnly=True Configuration
// This file ensures the app runs in web-only mode with no local storage dependencies

window.WEBONLY_MODE = true;
window.DISABLE_LOCAL_STORAGE = true;

// Override localStorage methods to prevent usage
const originalLocalStorage = window.localStorage;
Object.defineProperty(window, 'localStorage', {
    get: function() {
        console.warn('localStorage is disabled in WebOnly mode. Use Firebase instead.');
        return {
            getItem: () => null,
            setItem: () => console.warn('localStorage.setItem is disabled in WebOnly mode'),
            removeItem: () => console.warn('localStorage.removeItem is disabled in WebOnly mode'),
            clear: () => console.warn('localStorage.clear is disabled in WebOnly mode'),
            key: () => null,
            length: 0
        };
    },
    set: function() {
        console.warn('localStorage cannot be overridden in WebOnly mode');
    },
    configurable: false
});

// Override sessionStorage methods
const originalSessionStorage = window.sessionStorage;
Object.defineProperty(window, 'sessionStorage', {
    get: function() {
        console.warn('sessionStorage is disabled in WebOnly mode. Use Firebase instead.');
        return {
            getItem: () => null,
            setItem: () => console.warn('sessionStorage.setItem is disabled in WebOnly mode'),
            removeItem: () => console.warn('sessionStorage.removeItem is disabled in WebOnly mode'),
            clear: () => console.warn('sessionStorage.clear is disabled in WebOnly mode'),
            key: () => null,
            length: 0
        };
    },
    set: function() {
        console.warn('sessionStorage cannot be overridden in WebOnly mode');
    },
    configurable: false
});

console.log('✅ WebOnly mode enabled - localStorage and sessionStorage disabled');
