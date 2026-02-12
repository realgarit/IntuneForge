// Mock ResizeObserver which is needed by Radix Dialog
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock PointerCapture methods which might be missing in JSDOM
if (typeof Element !== 'undefined') {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
}

// Mock localStorage if needed globally (though templates test mocks it specifically)
// But let's provide a default implementation
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: function (key: string) {
            return store[key] || null;
        },
        setItem: function (key: string, value: string) {
            store[key] = value.toString();
        },
        clear: function () {
            store = {};
        },
        removeItem: function (key: string) {
            delete store[key];
        },
        key: function (index: number) {
            return Object.keys(store)[index] || null;
        },
        length: 0
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});
