/* Es el responsable de administrar los recursos almacenados en el cache */
const CACHE_NAME = 'mi-pwa-v1.0'
const APP_SHELL = './'

/*
Necesitamos 3 eventos:
*install -> prepara el cache.
*activate -> eliminar versiones antiguas.
*fetch -> interceptar los solicitudes y permitira recuperar los recursos almacenados.
*/

/* instalacion -> install */

self.addEventListener('install', (event) => {
  event.eventUntil(
  caches.open(CACHE_NAME).then((cache) => {
    return cache.addAll([APP_SHELL])
  }),
  );
});

/* activacion -> activate */

self.addEventListener('activate', (event) => {
  event.waitUntil(async () => {
      const nombres = await caches.keys()
      await Promise.all(
        nombres
        .filter((nombre) => {
        return nombre.startsWith('mi-pwa-') && nombre !== CACHE_NAME
    })
    .map((nombre) => caches.delete(nombre)),
  )
    await self.clients.claim()
  })
})

/* interceptor -> fetch */

self.addEventListener('fetch', (event) =>{
  if(event.request.method !== 'GET' ||
    new URL(event.request.url).origin !== self.location.origin) return
  event.respondWith(
    fetch(event.request).then((response) => {
      if(response.ok) {
        const copia = response.clone()
        caches.open(CACHE_NAME).then((cache) =>{
          return cache.put(event.request, copia)
        }).catch(console.error)
      }
      return response
    }).catch(async()=>{
      const respuesta = await caches.match(event.request)
      if(respuesta) return respuesta
      return Response.error()
    })
  )
})

/* Necesito trabajar lo de la musica */
