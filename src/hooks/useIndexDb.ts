// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function saveModelToIndexDb(modelName: string, modelData: any) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("model", 1);
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = (event: any) => {
      const db = event.target?.result;
      const transaction = db.transaction(["model"], "readwrite");
      const objectStore = transaction.objectStore("model");
      const data = { name: modelName, model: modelData };
      const request = objectStore.put(data);
      request.onsuccess = (event: any) => {
        resolve(event);
      };
      request.onerror = (event: any) => {
        reject(event);
      };
    };
    request.onupgradeneeded = (event: any) => {
      const db = event.target?.result;
      if (!db.objectStoreNames.contains("model")) {
        db.createObjectStore("model", { keyPath: "name" });
      }
    };
  });
}

function getModelFromIndexDb(modelName: string) {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject("你的浏览器不支持IndexedDB");
    }
    const request = window.indexedDB.open("model", 1);

    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = (event: any) => {
      const db = event.target?.result;
      const transaction = db.transaction(["model"], "readwrite");
      const objectStore = transaction.objectStore("model");
      const request = objectStore.get(modelName);
      request.onsuccess = (event: any) => {
        const modelData = event.target.result?.model;
        // const loader = new GLTFLoader();
        if (modelData?.raw) {
          const url = window.URL.createObjectURL(modelData?.raw);
          // loader.load(url, (gltf: any) => {
            resolve(url);
          // });
        }
      };
      request.onerror = (event: any) => {
        reject(event);
      };
    };
    request.onupgradeneeded = (event: any) => {
      const db = event.target?.result;
      if (!db.objectStoreNames.contains("model")) {
        db.createObjectStore("model", { keyPath: "name" });
      }
    };
  });
}

export default function useIndexDb() {
  return {
    saveModelToIndexDb,
    getModelFromIndexDb,
  };
}
