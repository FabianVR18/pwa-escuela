<script setup>
defineProps({
  titulo: String,
})

import { ref, computed, watch } from 'vue'
const CLAVE_TAREAS = 'misTareas';
const nuevaTarea = ref('')
const tareas = ref(cargarTareas())
const filtro = ref('todas')
const tareasExistentes = ref([])
const editandoId = ref(null)
const tituloEditado = ref('')
const confirmandoBorrarTodo = ref(false)
const cargando = ref(false)
const error = ref('')

// --- Reproductor y Catálogo Local 100% Funcional ---
const reproductorAudio = ref(null)
const reproduciendo = ref(false)
const pistaActual = ref(null)
const terminoBusqueda = ref('')

// Playlist con archivos MP3 reales alojados en servidores públicos directos para reproducción y descarga
const playlistMusica = ref([
  { id: 1, titulo: 'Lo-Fi Chill Study', artista: 'SoundHelix Audio 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, titulo: 'Ambient Space Beats', artista: 'SoundHelix Audio 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, titulo: 'Electronic Wave', artista: 'SoundHelix Audio 3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, titulo: 'Smooth Piano Flow', artista: 'SoundHelix Audio 4', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 5, titulo: 'Future Place Beats', artista: 'SoundHelix Audio 5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 6, titulo: 'Night Wave Plaza', artista: 'Plaza One Stream', url: 'https://radio.plaza.one/mp3' }
])

// Filtrar canciones según lo que escribas
const musicaFiltrada = computed(() => {
  if (!terminoBusqueda.value.trim()) return playlistMusica.value
  const query = terminoBusqueda.value.toLowerCase()
  return playlistMusica.value.filter(
    p => p.titulo.toLowerCase().includes(query) || p.artista.toLowerCase().includes(query)
  )
})

function reproducirPista(pista) {
  pistaActual.value = pista
  reproduciendo.value = true
  setTimeout(() => {
    if (reproductorAudio.value) {
      reproductorAudio.value.play().catch(e => {
        console.error("Error al reproducir audio:", e)
        reproduciendo.value = false
      })
    }
  }, 100)
}

function alternarMusica() {
  if (!reproductorAudio.value || !pistaActual.value) return
  if (reproduciendo.value) {
    reproductorAudio.value.pause()
    reproduciendo.value = false
  } else {
    reproductorAudio.value.play().then(() => {
      reproduciendo.value = true
    }).catch(e => {
      console.error("Error al reproducir audio:", e)
    })
  }
}

// --- Lógica de Tareas ---
const tareasFiltradas = computed(() => {
  if (filtro.value === 'pendientes') {
    return tareas.value.filter((t) => !t.completada)
  }
  if (filtro.value === 'completadas') {
    return tareas.value.filter((t) => t.completada)
  }
  return tareas.value
})

const totalPendientes = computed(() => {
  return tareas.value.filter((t) => !t.completada).length
})

const totalCompletadas = computed(() => {
  return tareas.value.filter((t) => t.completada).length
})

const cargandoId = ref(null)

async function cambiarEstado(id) {
  if (cargandoId.value !== null) return
  cargandoId.value = id
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const tarea = tareas.value.find((t) => t.id === id)
  if (tarea) {
    tarea.completada = !tarea.completada
  }
  cargandoId.value = null
}

function cargarTareas(){
  const datosGuardados = localStorage.getItem('misTareas');
  if(datosGuardados){
    return JSON.parse(datosGuardados);
  }
  return [];
}

watch(tareas, (nuevaTarea) => {
  localStorage.setItem("misTareas", JSON.stringify(nuevaTarea));
}, {
  deep: true
});

function importarTareas() {
  const tareasConvertidas = tareasExistentes.value.map(tarea => ({
    id: crypto.randomUUID(),
    titulo: tarea.title,
    completada: tarea.completed
  }))
  tareas.value.push(...tareasConvertidas)
  tareasExistentes.value = []
}

function eliminarTarea(id) {
  if (cargandoId.value !== null) return
  tareas.value = tareas.value.filter((t) => t.id !== id)
}

function eliminarTodasLasTareas() {
  tareas.value = []
  confirmandoBorrarTodo.value = false
}

function agregarTarea() {
  const titulo = nuevaTarea.value.trim()
  if (titulo === '') return

  const tarea = {
    id: crypto.randomUUID(),
    titulo: titulo,
    completada: false,
  }

  tareas.value.push(tarea)
  nuevaTarea.value = ''
}

function iniciarEdicion(tarea) {
  if (cargandoId.value !== null) return
  editandoId.value = tarea.id
  tituloEditado.value = tarea.titulo
}

function guardarCambio(id) {
  const tituloLimpio = tituloEditado.value.trim()
  if (tituloLimpio === '') return

  const tarea = tareas.value.find((t) => t.id === id)
  if (tarea) {
    tarea.titulo = tituloLimpio
  }
  cancelarCambio()
}

function cancelarCambio() {
  editandoId.value = null
  tituloEditado.value = ''
}

async function obtenerDatos(){
  cargando.value = true;
  error.value = '';

  try{
    const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
    const datos = await respuesta.json()
    tareasExistentes.value = datos;
  } catch (err){
    error.value = 'No fue posible recuperar las tareas';
    console.error(err)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <!-- Elemento de Audio HTML5 -->
  <audio
    ref="reproductorAudio"
    :src="pistaActual ? pistaActual.url : ''"
    preload="auto"
    @ended="reproduciendo = false"
  ></audio>

  <div class="max-w-sm mx-auto rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-2xl my-6">
    <div class="px-6 py-4">

      <!-- SECCIÓN REPRODUCTOR Y DESCARGA DE MÚSICA -->
      <div class="mb-5 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
        <div class="text-xs font-bold text-gray-800 flex items-center justify-between">
          <span>Reproductor y Descarga de Música</span>
          <span class="text-[10px] text-indigo-600 font-normal">Modo Directo</span>
        </div>

        <div class="flex gap-1.5">
          <input
            type="text"
            v-model="terminoBusqueda"
            placeholder="Filtrar canciones..."
            class="flex-1 border p-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Lista de canciones disponibles -->
        <div class="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          <div
            v-for="pista in musicaFiltrada"
            :key="pista.id"
            class="flex items-center justify-between p-1.5 bg-white border border-gray-100 rounded-lg text-[11px] hover:border-indigo-200 transition-all"
          >
            <div class="truncate pr-2 flex-1">
              <p class="font-semibold text-gray-800 truncate">{{ pista.titulo }}</p>
              <p class="text-[10px] text-gray-500 truncate">{{ pista.artista }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="reproducirPista(pista)"
                class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-1 rounded transition-all"
                title="Reproducir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <a
                :href="pista.url"
                target="_blank"
                download
                class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1 rounded transition-all"
                title="Descargar MP3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Reproductor activo -->
        <div v-if="pistaActual" class="pt-2 border-t border-gray-200 flex flex-col gap-1.5">
          <div class="text-[11px] font-semibold text-gray-700 truncate text-center">
            Reproduciendo: <span class="text-indigo-600">{{ pistaActual.titulo }}</span>
          </div>
          <div class="flex gap-1.5">
            <button
              @click="alternarMusica"
              class="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-[11px] font-medium py-1 px-2 rounded-lg transition-all"
            >
              {{ reproduciendo ? 'Pausar' : 'Reproducir' }}
            </button>
            <a
              :href="pistaActual.url"
              target="_blank"
              download
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium py-1 px-2 text-center rounded-lg transition-all block leading-5"
            >
              Descargar MP3
            </a>
          </div>
        </div>
      </div>

      <!-- GESTIÓN DE TAREAS API Y FILTROS -->
      <div class="mb-5 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <div class="flex gap-2">
          <button
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-2 rounded-lg text-xs transition-all disabled:opacity-50"
            @click="obtenerDatos()"
            :disabled="cargando"
          >
            {{ cargando ? 'Consultando...' : 'Consultar API' }}
          </button>
          <button
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-2 rounded-lg text-xs transition-all disabled:opacity-50"
            @click="importarTareas()"
            :disabled="tareasExistentes.length === 0"
          >
            Importar ({{ tareasExistentes.length }})
          </button>
        </div>
        <p v-if="error" class="text-[10px] text-red-500 text-center">{{ error }}</p>
      </div>

      <!-- Tareas Existentes de la API (Si las hay) -->
      <div v-if="tareasExistentes.length > 0" class="mb-5 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
        <h2 class="text-xs font-bold text-blue-900 mb-1.5">Tareas existentes de la API</h2>
        <ul class="space-y-1">
          <li v-for="tarea in tareasExistentes" :key="tarea.id" class="text-[11px] text-gray-700 flex justify-between">
            <span class="truncate pr-2">{{ tarea.title }}</span>
            <span :class="tarea.completed ? 'text-green-600' : 'text-orange-500'" class="font-semibold">
              {{ tarea.completed ? 'Completada' : 'Pendiente' }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Filtros -->
      <div class="mb-5 flex flex-wrap gap-2">
        <button
          v-for="opcion in [
            { valor: 'todas', texto: 'Todas' },
            { valor: 'pendientes', texto: 'Pendientes' },
            { valor: 'completadas', texto: 'Completadas' },
          ]"
          :key="opcion.valor"
          @click="filtro = opcion.valor"
          :class="[
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-95 shadow-sm',
            filtro === opcion.valor
              ? 'bg-blue-600 text-white shadow-blue-200 shadow-md ring-2 ring-blue-400/50'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md',
          ]"
        >
          {{ opcion.texto }}
        </button>
      </div>

      <h1 class="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 transition-colors duration-200">
        {{ titulo || 'Formulario de tareas' }}
      </h1>
      <p class="mb-4 text-center text-xs text-gray-500 font-medium">
        Pendientes: <span class="text-orange-500 font-bold">{{ totalPendientes }}</span> |
        Tareas completadas: <span class="text-blue-600 font-bold">{{ totalCompletadas }}</span>
      </p>

      <p v-if="tareas.length === 0" class="text-gray-400 italic text-center text-xs py-4 border-2 border-dashed border-gray-200 rounded-lg">
        No tienes tareas registradas
      </p>

      <ul class="space-y-2.5">
        <li
          v-for="tarea in tareasFiltradas"
          :key="tarea.id"
          class="p-2.5 border rounded-lg bg-gray-50 transition-all duration-200 hover:bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div v-if="editandoId === tarea.id" class="space-y-2 animate-fadeIn">
            <input
              type="text"
              v-model="tituloEditado"
              class="w-full border p-1.5 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Editar título..."
              @keyup.enter="guardarCambio(tarea.id)"
              @keyup.esc="cancelarCambio"
            />
            <div class="flex gap-1.5">
              <button
                @click="guardarCambio(tarea.id)"
                class="flex-1 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-semibold py-1 px-2 rounded transition-all shadow-sm"
              >
                Guardar
              </button>
              <button
                @click="cancelarCambio"
                class="flex-1 bg-gray-500 hover:bg-gray-600 active:scale-95 text-white text-xs font-semibold py-1 px-2 rounded transition-all shadow-sm"
              >
                Cancelar
              </button>
            </div>
          </div>

          <div v-else class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
              <div class="w-4 h-4 flex items-center justify-center shrink-0">
                <svg
                  v-if="cargandoId === tarea.id"
                  class="animate-spin w-4 h-4 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <input
                  v-else
                  type="checkbox"
                  :checked="tarea.completada"
                  @change="cambiarEstado(tarea.id)"
                  :disabled="cargandoId !== null"
                  class="w-4 h-4 cursor-pointer accent-blue-600 transition-transform active:scale-125"
                />
              </div>

              <span
                :class="{
                  'line-through text-gray-400': tarea.completada,
                  'text-gray-900 font-medium': !tarea.completada,
                }"
                class="text-xs truncate transition-all duration-200"
              >
                {{ tarea.titulo }}
              </span>
            </label>

            <span
              :class="tarea.completada ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'"
              class="text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded transition-colors">
              {{ tarea.completada ? 'Completada' : 'Pendiente' }}
            </span>

            <div class="flex items-center gap-1 shrink-0 ml-1">
              <button
                @click="iniciarEdicion(tarea)"
                :disabled="cargandoId !== null"
                title="Editar tarea"
                class="group p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-90 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <button
                @click="eliminarTarea(tarea.id)"
                :disabled="cargandoId !== null"
                title="Eliminar tarea"
                class="btn-basura group p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-90 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <form @submit.prevent="agregarTarea" class="px-6 pb-2">
      <input
        type="text"
        v-model="nuevaTarea"
        placeholder="Ingresa tu tarea pendiente"
        class="border p-2 rounded-lg w-full mb-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300"
      />
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] w-full text-white font-bold py-2 px-4 rounded-lg text-xs transition-all duration-200 shadow-md hover:shadow-blue-200 hover:shadow-lg"
      >
        Crear tarea
      </button>
    </form>

    <div v-if="tareas.length > 0" class="px-6 pb-4 pt-1">
      <button
        v-if="!confirmandoBorrarTodo"
        @click="confirmandoBorrarTodo = true"
        :disabled="cargandoId !== null"
        class="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border border-dashed border-red-200 hover:border-red-400 font-medium py-1.5 px-3 rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Eliminar todas las tareas
      </button>

      <div v-else class="p-2.5 bg-red-50 border border-red-200 rounded-lg animate-fadeIn space-y-2">
        <p class="text-xs text-red-700 font-medium text-center">¿Seguro que deseas eliminar todas las tareas?</p>
        <div class="flex gap-1.5">
          <button
            @click="eliminarTodasLasTareas"
            class="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold py-1 px-2 rounded transition-all shadow-sm"
          >
            Sí, borrar
          </button>
          <button
            @click="confirmandoBorrarTodo = false"
            class="flex-1 bg-gray-200 hover:bg-gray-300 active:scale-95 text-gray-700 text-xs font-semibold py-1 px-2 rounded transition-all shadow-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <p class="px-6 pb-4 text-[11px] text-gray-400 font-medium">Tareas registradas: {{ tareas.length }}</p>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

.btn-basura:hover svg {
  animation: bamboleo 0.3s ease-in-out infinite alternate;
}

@keyframes bamboleo {
  from {
    transform: rotate(-10deg) scale(1.1);
  }
  to {
    transform: rotate(10deg) scale(1.1);
  }
}
</style>
