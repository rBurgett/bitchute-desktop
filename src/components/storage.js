class SimpleStorage {

    getItem(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    setItem(key, value) {
        if(!key) throw new Error('You must pass in a key string to setItem()');
        if(value === undefined) {
            value = null;
        }
        localStorage.setItem(key, JSON.stringify(value));
    }

    removeItem(key) {
        if(!key) throw new Error('You must pass in a key string to removeItem()');
        localStorage.removeItem(key);
    }

    key(idx) {
        return localStorage.key(idx);
    }

    keys() {
        const keys = [];
        for(let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        return keys;
    }

    clear() {
        localStorage.clear();
    }

    length() {
        return localStorage.length;
    }

}

const storage = new SimpleStorage();

module.exports = storage;
