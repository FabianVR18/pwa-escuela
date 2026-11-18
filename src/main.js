import { createApp } from 'vue'
import App from './App.vue'
import { serviceworker } from 'globals'

if('serviceWorker' in navigator){
  window.addEventListener('load', async ()=>{
    try{
      const registro = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}sw.js`
      )
      console.log('Service Worker registrado:', registro.scope)
    } catch(error){
      console.error('Error al registrar el Service Worker:', error)
    }
  })
}

createApp(App).mount('#app')
